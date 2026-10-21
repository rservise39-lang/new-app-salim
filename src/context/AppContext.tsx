
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  Project,
  Worker,
  AdvanceOrDeduction,
  Client,
  ClientOrderRequest,
  RoomMeasurement,
  MaterialItem,
  WeeklyPayoutRecord,
  WeeklyPayoutItem,
  ProjectAttendance,
} from '../types';

import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';

import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
export type AppTab =
  | 'dashboard'
  | 'projects'
  | 'workers'
  | 'calculator'
  | 'clients'
  | 'reports';

interface AppContextType {
  currentUser: User | null;
  authReady: boolean;

  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  projects: Project[];
  workers: Worker[];
  advances: AdvanceOrDeduction[];
  clients: Client[];
  requests: ClientOrderRequest[];
  rooms: RoomMeasurement[];

  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  isAvailableForWork: boolean;
  setIsAvailableForWork: (val: boolean) => void;

  userProfile: {
    name: string;
    role: string;
    phone: string;
    wilaya: string;
    rating: number;
    ratingCount: number;
    accountType: 'painter' | 'client';
  };

  setUserProfile: React.Dispatch<React.SetStateAction<any>>;

  // حضور أسبوعي بالمشروع (مفصول بحسب المشروع والأسبوع والعامل).
  projectAttendance: ProjectAttendance;
  getProjectAttendance: (
    projectId: string,
    weekKey: string
  ) => Record<string, number[]>;
  setProjectAttendanceCell: (
    projectId: string,
    weekKey: string,
    workerId: string,
    dayIndex: number,
    value: number
  ) => void;

  workerDaysThisWeek: Record<string, number>;
  setWorkerDays: (workerId: string, days: number) => void;

  // المرحلة الثانية المعدّلة: الحضور القديم غير محدد الأسبوع للمراجعة + نقل يدوي.
  legacyWorkerDays: () => { workerId: string; days: number }[];
  assignLegacyDaysToWeek: (
    targetWeekKey: string,
    workerIds?: string[]
  ) => void;

  // المرحلة الثانية: الحضور المفصول بحسب الأسبوع وسجل الصرف الأسبوعي.
  workerDaysByWeek: Record<string, Record<string, number>>;
  weeklyPayouts: WeeklyPayoutRecord[];
  getWeekKeyForOffset: (offset: number) => string;
  getWeekRangeLabelForOffset: (offset: number) => string;
  isWeekPaid: (weekKey: string) => boolean;
  getPayoutForWeek: (weekKey: string) => WeeklyPayoutRecord | undefined;
  // مراجعة السلف القديمة غير المؤكدة (لها تاريخ لكن بلا علم settled).
  unsettledAdvancesForWeek: (weekKey: string) => AdvanceOrDeduction[];
  settleAdvance: (advanceId: string) => void;
  markAdvanceUnsettled: (advanceId: string) => void;

  addAdvanceOrDeduction: (
    item: Omit<AdvanceOrDeduction, 'id'>
  ) => void;

  deleteAdvanceOrDeduction: (id: string) => void;
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  deleteWorker: (id: string) => void;
  confirmWeeklyPayout: (weekKey: string, weekLabel: string) => void;

 addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addMaterialToProject: (
    projectId: string,
    material: Omit<MaterialItem, 'id'>
  ) => void;

  deleteMaterialFromProject: (
    projectId: string,
    materialId: string
  ) => void;

  recordClientPayment: (projectId: string, amount: number) => void;

  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;

  addRoom: (room: Omit<RoomMeasurement, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<RoomMeasurement>) => void;
  deleteRoom: (id: string) => void;
  clearRooms: () => void;

  showNewProjectModal: boolean;
  setShowNewProjectModal: (show: boolean) => void;

  showNewWorkerModal: boolean;
  setShowNewWorkerModal: (show: boolean) => void;

  showNewAdvanceModal: boolean;
  setShowNewAdvanceModal: (show: boolean) => void;

  invoiceModalProject: Project | null;
  setInvoiceModalProject: (p: Project | null) => void;

  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;

  showPWAInstallModal: boolean;
  setShowPWAInstallModal: (show: boolean) => void;

  weeklySummary: {
    totalGrossWage: number;
    totalAdvances: number;
    totalDeductions: number;
    totalNetPayout: number;
    totalDaysWorked: number;
  };

  // المرحلة الثانية: ملخص أسبوع محدد (يُفلتر السلف بحسب الأسبوع).
  weeklySummaryForWeek: (weekKey: string) => {
    totalGrossWage: number;
    totalAdvances: number;
    totalDeductions: number;
    totalNetPayout: number;
    totalDaysWorked: number;
  };

  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | null>(null);

// مفاتيح التخزين القديمة محفوظة كما هي.
// البيانات الجديدة تُحفظ تحت مفتاح مستقل لكل حساب.
const STORAGE_KEYS = {
  PROJECTS: 'sabbaghi_projects_v1',
  WORKERS: 'sabbaghi_workers_v1',
  ADVANCES: 'sabbaghi_advances_v1',
  CLIENTS: 'sabbaghi_clients_v1',
  REQUESTS: 'sabbaghi_requests_v1',
  ROOMS: 'sabbaghi_rooms_v1',
  WORKER_DAYS: 'sabbaghi_worker_days_v1',
  // مفاتيح المرحلة الثانية: عزل الأجور بحسب الأسبوع وسجل الصرف.
  WORKER_DAYS_BY_WEEK: 'sabbaghi_worker_days_by_week_v1',
  WEEKLY_PAYOUTS: 'sabbaghi_weekly_payouts_v1',
  // حضور أسبوعي مفصول بحسب المشروع والأسبوع والعامل (السبت..الخميس).
  PROJECT_ATTENDANCE: 'sabbaghi_project_attendance_v1',
};

const getUserStorageKey = (key: string, uid: string) =>
  `${key}_user_${uid}`;

// أدوات الأسبوع الفعلي (لا تستخدم تاريخًا ثابتًا).
// أسبوع يبدأ يوم الاثنين حسب السياق الجزائري المعتاد.
const getISOWeekKey = (date: Date = new Date()): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // الأحد=0 -> 7
  d.setUTCDate(d.getUTCDate() + 4 - day); // الخميس من نفس أسبوع ISO
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

const getWeekKeyForOffset = (offset: number): string => {
  // الأسبوع الحالي = offset 0. نحسب بداية أسبوع ISO الحالي ثم نضيف offset*7 يومًا.
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + offset * 7);
  return getISOWeekKey(monday);
};

const getWeekRangeLabelForOffset = (offset: number): string => {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const format = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  return `من ${format(monday)} إلى ${format(sunday)}`;
};

export const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // المصادقة
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userDataReady, setUserDataReady] = useState(false);
  const [projectsReady, setProjectsReady] = useState(false);

  // التنقل
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedProjectId, setSelectedProjectId] =
    useState<string | null>(null);

  const [isAvailableForWork, setIsAvailableForWork] = useState(true);

  // بيانات الملف الشخصي الافتراضية
  const [userProfile, setUserProfile] = useState({
    name: '',
    role: 'صباغ',
    phone: '',
    wilaya: '',
    rating: 0,
    ratingCount: 0,
    accountType: 'painter' as 'painter' | 'client',
  });

  // جميع القوائم تبدأ فارغة.
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [advances, setAdvances] = useState<AdvanceOrDeduction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [requests, setRequests] = useState<ClientOrderRequest[]>([]);
  const [rooms, setRooms] = useState<RoomMeasurement[]>([]);

  const [workerDaysThisWeek, setWorkerDaysThisWeek] =
    useState<Record<string, number>>({});

  // المرحلة الثانية: حضور مفصول بحسب الأسبوع، وسجل صرف أسبوعي ثابت.
  // workerDaysByWeek: { [weekKey]: { [workerId]: days } }
  const [workerDaysByWeek, setWorkerDaysByWeek] = useState<
    Record<string, Record<string, number>>
  >({});
  const [weeklyPayouts, setWeeklyPayouts] = useState<WeeklyPayoutRecord[]>([]);
  // حضور بالمشروع: projectId -> weekKey -> workerId -> [السبت..الخميس]
  const [projectAttendance, setProjectAttendance] = useState<ProjectAttendance>(
    {}
  );

  // النوافذ المنبثقة
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewWorkerModal, setShowNewWorkerModal] = useState(false);
  const [showNewAdvanceModal, setShowNewAdvanceModal] = useState(false);

  const [invoiceModalProject, setInvoiceModalProject] =
    useState<Project | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPWAInstallModal, setShowPWAInstallModal] = useState(false);

  // متابعة تسجيل الدخول والخروج
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserDataReady(false);
      setCurrentUser(user);
      setAuthReady(true);
      setShowAuthModal(!user);
    });

    return unsubscribe;
  }, []);

  // استرجاع معلومات الحساب من Firestore عند تسجيل الدخول أو تحديث الصفحة.
  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    const loadUserProfile = async () => {
      if (!currentUser) {
        setUserProfile({
          name: '',
          role: 'صباغ',
          phone: '',
          wilaya: '',
          rating: 0,
          ratingCount: 0,
          accountType: 'painter',
        });
        return;
      }

      try {
        const profileRef = doc(db, 'users', currentUser.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (cancelled) return;

        const profile = profileSnapshot.exists()
          ? profileSnapshot.data()
          : {};

        setUserProfile((prev: any) => ({
          ...prev,
          name: profile.name || currentUser.displayName || '',
          email: profile.email || currentUser.email || '',
          phone: profile.phone || '',
          wilaya: profile.wilaya || '',
          role: profile.role || 'صباغ',
          accountType: profile.accountType === 'client' ? 'client' : 'painter',
          rating: profile.rating ?? 0,
          ratingCount: profile.ratingCount ?? 0,
        }));
      } catch (error) {
        console.error('[FIRESTORE] تعذر تحميل معلومات الحساب:', error);

        if (!cancelled) {
          setUserProfile((prev: any) => ({
            ...prev,
            name: currentUser.displayName || '',
            email: currentUser.email || '',
          }));
        }
      }
    };

    void loadUserProfile();

    return () => {
      cancelled = true;
    };
  }, [authReady, currentUser]);

  // تحميل بيانات الحساب الحالي فقط.
  // لا نقرأ مفاتيح التخزين العامة القديمة ولا نستورد البيانات التجريبية.

  // تحميل بيانات الحساب الحالي، مع تحميل المشاريع من Firestore
  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    setUserDataReady(false);
    setProjectsReady(false);

    if (!currentUser) {
      setProjects([]);
      setWorkers([]);
      setAdvances([]);
      setClients([]);
      setRequests([]);
      setRooms([]);
      setWorkerDaysThisWeek({});
      setProjectAttendance({});
      return;
    }

    const readUserData = <T,>(key: string, fallback: T): T => {
      try {
        const saved = localStorage.getItem(
          getUserStorageKey(key, currentUser.uid)
        );

        return saved === null ? fallback : (JSON.parse(saved) as T);
      } catch (error) {
        console.error('تعذر تحميل بيانات الحساب:', key, error);
        return fallback;
      }
    };

    // الاحتفاظ بنسخة المشاريع المحلية دون حذفها
    const localProjects = readUserData<Project[]>(
      STORAGE_KEYS.PROJECTS,
      []
    );

    // بقية الأقسام تستمر محليًا في هذه المرحلة
    setWorkers(readUserData<Worker[]>(STORAGE_KEYS.WORKERS, []));
    setAdvances(
      readUserData<AdvanceOrDeduction[]>(STORAGE_KEYS.ADVANCES, [])
    );
    setClients(readUserData<Client[]>(STORAGE_KEYS.CLIENTS, []));
    setRequests(
      readUserData<ClientOrderRequest[]>(STORAGE_KEYS.REQUESTS, [])
    );
    setRooms(readUserData<RoomMeasurement[]>(STORAGE_KEYS.ROOMS, []));
    setWorkerDaysThisWeek(
      readUserData<Record<string, number>>(
        STORAGE_KEYS.WORKER_DAYS,
        {}
      )
    );

    // المرحلة الثانية: تحميل الحضور المفصول بحسب الأسبوع وسجل الصرف.
    const daysByWeek = readUserData<Record<string, Record<string, number>>>(
      STORAGE_KEYS.WORKER_DAYS_BY_WEEK,
      {}
    );
    const payouts = readUserData<WeeklyPayoutRecord[]>(
      STORAGE_KEYS.WEEKLY_PAYOUTS,
      []
    );
    const projAtt = readUserData<ProjectAttendance>(
      STORAGE_KEYS.PROJECT_ATTENDANCE,
      {}
    );

    // ملاحظة أمان (المرحلة الثانية المعدّلة):
    // لا نُرحّل أيام الحضور القديمة (workerDaysThisWeek) تلقائيًا إلى أي أسبوع.
    // لا يوجد تاريخ موثوق يثبت الأسبوع الصحيح لتلك الأيام، وإسنادها للأسبوع الحالي
    // افتراض محاسبي غير مسموح. نبقيها محفوظة في مفتاحها القديم، ونعرضها للمراجعة
    // فقط عبر قسم «حضور غير محدد الأسبوع»، مع زر يدوي ينقلها إلى الأسبوع الذي يحدده المستخدم.
    setWorkerDaysByWeek(daysByWeek);

    setWeeklyPayouts(payouts);
    setProjectAttendance(projAtt);

    const loadProjects = async () => {
      try {
        const projectsRef = collection(
          db,
          'users',
          currentUser.uid,
          'projects'
        );

        const snapshot = await getDocs(projectsRef);

        if (cancelled) return;

        if (!snapshot.empty) {
          const cloudProjects = snapshot.docs.map(
            (projectDoc) => projectDoc.data() as Project
          );

          setProjects(cloudProjects);
        } else {
          // لا توجد مشاريع في السحابة: ننقل المحلية مرة واحدة
          if (localProjects.length > 0) {
            await Promise.all(
              localProjects.map((project) =>
                setDoc(
                  doc(
                    db,
                    'users',
                    currentUser.uid,
                    'projects',
                    project.id
                  ),
                  {
                    ...project,
                    ownerId: currentUser.uid,
                    updatedAt: serverTimestamp(),
                  }
                )
              )
            );
          }

          if (cancelled) return;

          setProjects(localProjects);
        }

        setProjectsReady(true);
      } catch (error) {
        console.error(
          '[FIRESTORE] تعذر تحميل المشاريع أو نقلها:',
          error
        );

        if (!cancelled) {
          // عرض النسخة المحلية دون الكتابة إلى السحابة عند فشل التحميل
          setProjects(localProjects);
          setProjectsReady(false);
        }
      } finally {
        if (!cancelled) {
          setUserDataReady(true);
        }
      }
    };

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [authReady, currentUser]);

  // حفظ البيانات في مفاتيح مستقلة لكل مستخدم.
  // لا نحفظ قبل اكتمال تحميل بيانات الحساب.

  // حفظ نسخة محلية، ومزامنة المشاريع مع Firestore
  useEffect(() => {
    if (!currentUser || !userDataReady || !projectsReady) return;

    // الاحتفاظ بالنسخة المحلية
    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.PROJECTS, currentUser.uid),
      JSON.stringify(projects)
    );

    const saveProjectsToFirestore = async () => {
      try {
        await Promise.all(
          projects.map((project) =>
            setDoc(
              doc(
                db,
                'users',
                currentUser.uid,
                'projects',
                project.id
              ),
              {
                ...project,
                ownerId: currentUser.uid,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            )
          )
        );
      } catch (error) {
        console.error('[FIRESTORE] تعذر حفظ المشاريع:', error);
      }
    };

    void saveProjectsToFirestore();
  }, [currentUser, userDataReady, projectsReady, projects]);


  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.WORKERS, currentUser.uid),
      JSON.stringify(workers)
    );
  }, [currentUser, userDataReady, workers]);

  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.ADVANCES, currentUser.uid),
      JSON.stringify(advances)
    );
  }, [currentUser, userDataReady, advances]);

  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.CLIENTS, currentUser.uid),
      JSON.stringify(clients)
    );
  }, [currentUser, userDataReady, clients]);

  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.REQUESTS, currentUser.uid),
      JSON.stringify(requests)
    );
  }, [currentUser, userDataReady, requests]);

  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.ROOMS, currentUser.uid),
      JSON.stringify(rooms)
    );
  }, [currentUser, userDataReady, rooms]);

  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.WORKER_DAYS, currentUser.uid),
      JSON.stringify(workerDaysThisWeek)
    );
  }, [currentUser, userDataReady, workerDaysThisWeek]);

  // المرحلة الثانية: حفظ الحضور المفصول بحسب الأسبوع وسجل الصرف. محلي فقط.
  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.WORKER_DAYS_BY_WEEK, currentUser.uid),
      JSON.stringify(workerDaysByWeek)
    );
  }, [currentUser, userDataReady, workerDaysByWeek]);

  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.WEEKLY_PAYOUTS, currentUser.uid),
      JSON.stringify(weeklyPayouts)
    );
  }, [currentUser, userDataReady, weeklyPayouts]);

  // حفظ حضور المشاريع مفصولًا بحسب المشروع والأسبوع والعامل. محلي فقط.
  useEffect(() => {
    if (!currentUser || !userDataReady) return;

    localStorage.setItem(
      getUserStorageKey(STORAGE_KEYS.PROJECT_ATTENDANCE, currentUser.uid),
      JSON.stringify(projectAttendance)
    );
  }, [currentUser, userDataReady, projectAttendance]);

  // تنسيق العملة
  const formatCurrency = (amount: number): string => {
    return Math.round(amount).toLocaleString('ar-DZ') + ' دج';
  };

  // أيام عمل العامل
  const setWorkerDays = (workerId: string, days: number) => {
    // المرحلة الثانية المعدّلة: اكتب فقط في خريطة الأسبوع المفصولة.
    // لا نكتب بعد الآن في workerDaysThisWeek (الدلو القديم) لتفادي خلط البيانات.
    const weekKey = getISOWeekKey();
    setWorkerDaysByWeek((prev) => ({
      ...prev,
      [weekKey]: {
        ...(prev[weekKey] || {}),
        [workerId]: Math.max(0, Math.min(7, days)),
      },
    }));
  };

  // المرحلة الثانية المعدّلة: قائمة العمال الذين لديهم أيام قديمة غير محددة الأسبوع
  // (محفوظة في workerDaysThisWeek قبل تفعيل النظام الأسبوعي) للمراجعة فقط.
  const legacyWorkerDays = (): { workerId: string; days: number }[] => {
    return Object.entries(workerDaysThisWeek)
      .filter(([, d]) => d !== undefined && d > 0)
      .map(([workerId, days]) => ({ workerId, days }));
  };

  // نقل أيام قديمة غير محددة الأسبوع إلى أسبوع محدد يدويًا (قرار المستخدم).
  // ينقل لكل عامل محدد (أو للجميع إن لم تُمرر قائمة) ثم يصفّر الدلو القديم لهؤلاء.
  // لا يحذف المفتاح القديم نهائيًا من localStorage حتى يبقى أثر للمراجعة؛
  // يكتفي بتصفيره لتفادي دخوله في حساب أسبوعين.
  const assignLegacyDaysToWeek = (
    targetWeekKey: string,
    workerIds?: string[]
  ) => {
    const ids =
      workerIds && workerIds.length > 0
        ? workerIds
        : Object.keys(workerDaysThisWeek);

    if (ids.length === 0) return;

    // 1) انسخ الأيام القديمة إلى الأسبوع المحدد (بدون استبدال أيام العمال الآخرين).
    setWorkerDaysByWeek((prev) => {
      const existing = prev[targetWeekKey] || {};
      const merged: Record<string, number> = { ...existing };
      ids.forEach((wid) => {
        const d = workerDaysThisWeek[wid];
        if (d !== undefined && d > 0) merged[wid] = d;
      });
      return { ...prev, [targetWeekKey]: merged };
    });

    // 2) صفّر الدلو القديم للعمال المنقولين فقط (نبقي سجل أنهم نُقلوا، لا نحذفهم).
    setWorkerDaysThisWeek((prev) => {
      const copy = { ...prev };
      ids.forEach((wid) => {
        copy[wid] = 0;
      });
      return copy;
    });
  };

  // أدوات الأسبوع المكشوفة للواجهة.
  const isWeekPaid = (weekKey: string): boolean =>
    weeklyPayouts.some((p) => p.weekKey === weekKey);

  const getPayoutForWeek = (
    weekKey: string
  ): WeeklyPayoutRecord | undefined =>
    weeklyPayouts.find((p) => p.weekKey === weekKey);

  // حضور أسبوعي بالمشروع (السبت..الخميس: 6 أيام).
  // مفصول تمامًا بحسب المشروع والأسبوع والعامل لمنع أي تداخل.
  const getProjectAttendance = (
    projectId: string,
    weekKey: string
  ): Record<string, number[]> => {
    return projectAttendance[projectId]?.[weekKey] || {};
  };

  const setProjectAttendanceCell = (
    projectId: string,
    weekKey: string,
    workerId: string,
    dayIndex: number,
    value: number
  ) => {
    if (!projectId || !weekKey || !workerId) return;
    if (dayIndex < 0 || dayIndex > 5) return;
    // القيم المسموحة فقط: 0 أو 0.5 أو 1.
    const sanitizedVal = value === 1 || value === 0.5 ? value : 0;

    // إعداد البنية الجديدة بشكل آمن
    const currentProj = projectAttendance[projectId] || {};
    const currentWeek = currentProj[weekKey] || {};
    const currentWorkerCells = currentWeek[workerId] || [0, 0, 0, 0, 0, 0];

    const nextWorkerCells = [...currentWorkerCells];
    // تأكد من أن المصفوفة تحتوي 6 عناصر
    while (nextWorkerCells.length < 6) nextWorkerCells.push(0);
    nextWorkerCells[dayIndex] = sanitizedVal;

    const nextState: ProjectAttendance = {
      ...projectAttendance,
      [projectId]: {
        ...currentProj,
        [weekKey]: {
          ...currentWeek,
          [workerId]: nextWorkerCells,
        },
      },
    };

    // كتابة localStorage أولاً لمنع النجاح الوهمي في الواجهة إن فشلت الكتابة.
    try {
      if (currentUser) {
        localStorage.setItem(
          getUserStorageKey(STORAGE_KEYS.PROJECT_ATTENDANCE, currentUser.uid),
          JSON.stringify(nextState)
        );
      }
      setProjectAttendance(nextState);
    } catch (error) {
      console.error('[ATTENDANCE] تعذر حفظ حضور المشروع:', error);
      alert('تعذر حفظ الحضور في التخزين المحلي. تحقق من سعة التخزين وحاول مرة أخرى.');
    }
  };

  // السلف غير المسددة لأسبوع معيّن (للمراجعة).
  // تشمل: السلف التي weekKey يساوي الأسبوع المطلوب، أو السلف القديمة التي لا
  // تحمل أي weekKey ولا settled (لا نخصمها تلقائيًا، تعرض للمراجعة فقط).
  const unsettledAdvancesForWeek = (
    weekKey: string
  ): AdvanceOrDeduction[] => {
    return advances.filter((a) => {
      if (a.settled === true) return false;
      if (a.weekKey) return a.weekKey === weekKey;
      // سلفة قديمة بلا weekKey: نعرضها للمراجعة في الأسبوع الحالي فقط (offset 0).
      return weekKey === getISOWeekKey();
    });
  };

  const settleAdvance = (advanceId: string) => {
    setAdvances((prev) =>
      prev.map((a) =>
        a.id === advanceId
          ? { ...a, settled: true, settledAt: new Date().toISOString() }
          : a
      )
    );
  };

  const markAdvanceUnsettled = (advanceId: string) => {
    setAdvances((prev) =>
      prev.map((a) =>
        a.id === advanceId
          ? { ...a, settled: false, settledAt: undefined }
          : a
      )
    );
  };

  // السلف والخصومات
  const addAdvanceOrDeduction = (
    item: Omit<AdvanceOrDeduction, 'id'>
  ) => {
    // المرحلة الثانية: اربط السلفة/الخصم بأسبوع تاريخها تلقائيًا.
    let weekKey: string | undefined;
    try {
      if (item.date) {
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
          weekKey = getISOWeekKey(d);
        }
      }
    } catch {
      weekKey = undefined;
    }

    const newItem: AdvanceOrDeduction = {
      ...item,
      id: 'adv_' + Date.now(),
      weekKey,
      settled: false,
    };

    setAdvances((prev) => [newItem, ...prev]);
  };

  const deleteAdvanceOrDeduction = (id: string) => {
    // المرحلة الثانية المعدّلة: لا حذف دون تأكيد. الحارس في الدالة نفسها لتفادي
    // تجاوزه من أي مستدعٍ، ولضمان عدم حذف سلفة/خصم بالخطأ.
    const target = advances.find((a) => a.id === id);
    if (!target) return;
    const label = target.type === 'سلفة' ? 'السلفة' : 'الخصم';
    const ok = window.confirm(
      `هل تريد حذف ${label} بقيمة ${Math.round(target.amount).toLocaleString('ar-DZ')} دج (${target.workerName})؟ لا يمكن التراجع عن الحذف.`
    );
    if (!ok) return;
    setAdvances((prev) => prev.filter((a) => a.id !== id));
  };

  // العمال
  const addWorker = (workerData: Omit<Worker, 'id'>) => {
    const newId = 'w_' + Date.now();

    const newWorker: Worker = {
      ...workerData,
      id: newId,
    };

    setWorkers((prev) => [...prev, newWorker]);

    // المرحلة الثانية المعدّلة: سجّل الأيام الافتراضية في الأسبوع الحالي ضمن
    // الخريطة المفصولة (workerDaysByWeek) فقط. لا نكتب في الدلو القديم لتفادي
    // ظهور العامل الجديد ضمن «الحضور غير محدد الأسبوع».
    const weekKey = getISOWeekKey();
    const defaultDays = workerData.daysAssignedThisWeek || 0;
    if (defaultDays > 0) {
      setWorkerDaysByWeek((prev) => ({
        ...prev,
        [weekKey]: {
          ...(prev[weekKey] || {}),
          [newId]: Math.max(0, Math.min(7, defaultDays)),
        },
      }));
    }
  };

  const deleteWorker = (id: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));

    // المرحلة الثانية المعدّلة: احذف العامل من خريطة الأسبوع المفصولة.
    // إن كانت له أيام في الدلو القديم، صفّرها هناك أيضًا (لا نحذف المفتاح لتفادي
    // فقدان أثر المراجعة، نصفّره فقط).
    setWorkerDaysByWeek((prev) => {
      const copy: Record<string, Record<string, number>> = {};
      Object.keys(prev).forEach((wk) => {
        const inner = { ...prev[wk] };
        delete inner[id];
        copy[wk] = inner;
      });
      return copy;
    });
    setWorkerDaysThisWeek((prev) => {
      if (prev[id] === undefined) return prev;
      return { ...prev, [id]: 0 };
    });
  };

  // مرجع لمنع النقر المتكرر على نفس الأسبوع أثناء تنفيذ الصرف (قبل إعادة التصيير).
  const payoutInProgressRef = React.useRef<string | null>(null);

  const confirmWeeklyPayout = (weekKey: string, weekLabel: string) => {
    // منع الصرف المكرر: حارسان متوازيان.
    // 1) منع نقرتين سريعتين قبل أن يُعاد تصيير الحالة (isWeekPaid).
    if (payoutInProgressRef.current === weekKey) {
      return;
    }
    // 2) الحارس المنطقي: إن وُجد سجل لنفس الأسبوع فلا تكرار.
    if (weeklyPayouts.some((p) => p.weekKey === weekKey)) {
      alert('تم صرف أجور هذا الأسبوع مسبقًا. لا يمكن تكرار الصرف.');
      return;
    }

    payoutInProgressRef.current = weekKey;

    // بنود سجل الصرف لكل عامل.
    // المرحلة الثانية المعدّلة: نستخدم فقط الأيام المسجلة صراحةً في الأسبوع
    // (workerDaysByWeek). لا نلجأ إلى workerDaysThisWeek (قديم غير مؤكد) ولا إلى
    // daysAssignedThisWeek (افتراض محاسبي بلا تاريخ موثوق). عامل بلا أيام مسجلة = 0 يوم.
    const weekDays = workerDaysByWeek[weekKey] || {};
    const items: WeeklyPayoutItem[] = workers.map((w) => {
      const days = weekDays[w.id] !== undefined ? weekDays[w.id] : 0;
      const gross = days * w.dailyWage;

      // المرحلة الثانية المعدّلة: لا نخصم السلف/الخصومات القديمة بلا weekKey.
      // تُعرض للمراجعة فقط عبر unsettledAdvancesForWeek (تسوية/حذف يدوي).
      // لخصمها يجب إعادة إدخالها بتاريخ فيُسنَد weekKey تلقائيًا.
      const advancesForWorker = advances
        .filter(
          (a) =>
            a.workerId === w.id &&
            a.type === 'سلفة' &&
            a.settled !== true &&
            a.weekKey === weekKey
        )
        .reduce((acc, a) => acc + a.amount, 0);

      const deductionsForWorker = advances
        .filter(
          (a) =>
            a.workerId === w.id &&
            a.type === 'خصم' &&
            a.settled !== true &&
            a.weekKey === weekKey
        )
        .reduce((acc, a) => acc + a.amount, 0);

      const net = gross - advancesForWorker - deductionsForWorker;

      return {
        workerId: w.id,
        workerName: w.name,
        dailyRate: w.dailyWage,
        daysWorked: days,
        grossWage: gross,
        advances: advancesForWorker,
        deductions: deductionsForWorker,
        netPayout: net,
      };
    });

    const totalGross = items.reduce((acc, i) => acc + i.grossWage, 0);
    const totalAdvances = items.reduce((acc, i) => acc + i.advances, 0);
    const totalDeductions = items.reduce((acc, i) => acc + i.deductions, 0);
    const totalNet = totalGross - totalAdvances - totalDeductions;

    const record: WeeklyPayoutRecord = {
      id: 'wp_' + weekKey,
      weekKey,
      weekLabel,
      paidAt: new Date().toISOString(),
      items,
      totalGross,
      totalAdvances,
      totalDeductions,
      totalNet,
    };

    // حفظ السجل أولًا. لا نصفّر الحضور ولا نغيّر حالة السلف إلا بعد نجاح الحفظ.
    try {
      // فحص مزدوج ضد التكرار: قد يكون سجل الأسبوع أُضيف بين النقرتين.
      if (weeklyPayouts.some((p) => p.weekKey === weekKey)) {
        payoutInProgressRef.current = null;
        alert('تم صرف أجور هذا الأسبوع مسبقًا. لا يمكن تكرار الصرف.');
        return;
      }

      const newPayouts = [record, ...weeklyPayouts];
      // كتابة localStorage أولًا؛ إن فشلت (QuotaExceeded...) نرمي قبل أي تغيير في الذاكرة.
      if (currentUser) {
        localStorage.setItem(
          getUserStorageKey(STORAGE_KEYS.WEEKLY_PAYOUTS, currentUser.uid),
          JSON.stringify(newPayouts)
        );
      }
      setWeeklyPayouts(newPayouts);

      // تعليم السلف/الخصومات المشمولة في هذا الصرف كمسدّدة (المرتبطة بـ weekKey فقط).
      const settledIds = new Set(
        advances
          .filter((a) => a.settled !== true && a.weekKey === weekKey)
          .map((a) => a.id)
      );
      if (settledIds.size > 0) {
        setAdvances((prev) =>
          prev.map((a) =>
            settledIds.has(a.id)
              ? { ...a, settled: true, settledAt: record.paidAt }
              : a
          )
        );
      }

      // تصفير أيام الأسبوع المصروف فقط (لا نلمس الأسابيع الأخرى ولا الدلو القديم).
      setWorkerDaysByWeek((prev) => {
        const copy = { ...prev };
        if (copy[weekKey]) {
          const cleared: Record<string, number> = {};
          Object.keys(copy[weekKey]).forEach((wid) => {
            cleared[wid] = 0;
          });
          copy[weekKey] = cleared;
        }
        return copy;
      });

      alert(`تم تأكيد صرف أجور الأسبوع (${weekLabel}) وحفظ السجل بنجاح.`);
    } catch (error) {
      // عند فشل الحفظ: لا نصفّر الحضور ولا نغيّر حالة السلف ولا نضيف السجل.
      console.error('[PAYROLL] تعذر حفظ سجل الصرف الأسبوعي:', error);
      alert('تعذر حفظ سجل الصرف. لم يتم تغيير الحضور أو حالة السلف. حاول مرة أخرى.');
    } finally {
      payoutInProgressRef.current = null;
    }
  };

  // المشاريع
 const addProject = async (
  projectData: Omit<Project, 'id'>
): Promise<void> => {
  if (!currentUser) {
    throw new Error('يجب تسجيل الدخول قبل حفظ المشروع.');
  }

  const newProject: Project = {
    ...projectData,
    id: `p_${Date.now()}`,
  };

  // حذف الحقول غير المعرّفة قبل إرسال البيانات إلى Firestore
  const cleanProject = JSON.parse(
    JSON.stringify(newProject)
  ) as Project;

  await setDoc(
    doc(db, 'users', currentUser.uid, 'projects', newProject.id),
    {
      ...cleanProject,
      ownerId: currentUser.uid,
      updatedAt: serverTimestamp(),
    }
  );

  // تحديث الواجهة بعد نجاح الحفظ السحابي
  setProjects((prev) => [newProject, ...prev]);
};

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };


const deleteProject = (id: string) => {
  setProjects((prev) => prev.filter((p) => p.id !== id));

  if (currentUser) {
    void deleteDoc(
      doc(db, 'users', currentUser.uid, 'projects', id)
    ).catch((error) => {
      console.error('[FIRESTORE] تعذر حذف المشروع:', error);
    });
  }

  if (selectedProjectId === id) {
    setSelectedProjectId(null);
  }
};
  const addMaterialToProject = (
    projectId: string,
    mat: Omit<MaterialItem, 'id'>
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;

        const newMat: MaterialItem = {
          ...mat,
          id: 'm_' + Date.now(),
        };

        return {
          ...p,
          materials: [...p.materials, newMat],
        };
      })
    );
  };

  const deleteMaterialFromProject = (
    projectId: string,
    materialId: string
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;

        return {
          ...p,
          materials: p.materials.filter((m) => m.id !== materialId),
        };
      })
    );
  };

  const recordClientPayment = (projectId: string, amount: number) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;

        return {
          ...p,
          paidAmount: (p.paidAmount || 0) + amount,
        };
      })
    );
  };

  // طلبات الزبائن
  const acceptRequest = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    const newProject: Project = {
      id: 'p_' + Date.now(),
      title: req.title,
      clientName: req.clientName,
      clientPhone: '+213 6XX XX XX XX',
      location: req.location,
      areaSqm: req.areaSqm,
      startDate: new Date().toISOString().split('T')[0],
      estimatedDays: 7,
      status: 'قيد التنفيذ',
      progress: 0,
      clientBudget: req.budgetOffer,
      paidAmount: 0,
      workTypes: [req.paintType],
      materials: [
        {
          id: 'm_auto_1',
          name: 'دهان أساس وجدران',
          quantity: Math.round(req.areaSqm * 0.25),
          unit: 'لتر',
          unitPrice: 550,
          category: 'دهانات',
        },
      ],
      workers: [
        {
          workerId: workers[0]?.id || 'w1',
          workerName: workers[0]?.name || 'صباغ أول',
          dailyRate: 2500,
          daysSpent: 0,
        },
      ],
      toolsAndTransportCost: 4000,
      otherExpensesCost: 2000,
      notes: req.notes,
    };

    setProjects((prev) => [newProject, ...prev]);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'مقبولة' } : r
      )
    );

    alert(`تم قبول طلب "${req.title}" وتحويله إلى المشاريع النشطة بنجاح!`);
  };

  const rejectRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'مرفوضة' } : r
      )
    );
  };

  // حساب المساحات والغرف
  const addRoom = (roomData: Omit<RoomMeasurement, 'id'>) => {
    const newRoom: RoomMeasurement = {
      ...roomData,
      id: 'r_' + Date.now(),
    };

    setRooms((prev) => [...prev, newRoom]);
  };

  const updateRoom = (id: string, updates: Partial<RoomMeasurement>) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const clearRooms = () => {
    setRooms([]);
  };

  // ملخص أجور الأسبوع — للأسبوع الحالي (توافقًا مع الاستخدام القديم).
  // ملاحظة: السلف القديمة بلا weekKey ولا settled لا تُخصم تلقائيًا هنا؛
  // تُعرض للمراجعة فقط عبر unsettledAdvancesForWeek. الخصم يتم فقط عند تأكيد الصرف.
  const weeklySummary = React.useMemo(() => {
    return weeklySummaryForWeekImpl(getISOWeekKey());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workers, workerDaysThisWeek, workerDaysByWeek, advances]);

  // ملخص أسبوع محدد: يفلتر السلف/الخصومات بحسب weekKey، ولا يشمل المسدّدة.
  const weeklySummaryForWeek = (weekKey: string) => {
    return weeklySummaryForWeekImpl(weekKey);
  };

  function weeklySummaryForWeekImpl(weekKey: string) {
    let totalGrossWage = 0;
    let totalAdvances = 0;
    let totalDeductions = 0;
    let totalDaysWorked = 0;

    // المرحلة الثانية المعدّلة: الأيام من الأسبوع المحدد فقط. لا fallback إلى
    // workerDaysThisWeek ولا إلى daysAssignedThisWeek (افتراضات بلا تاريخ موثوق).
    const weekDays = workerDaysByWeek[weekKey] || {};

    workers.forEach((w) => {
      const days = weekDays[w.id] !== undefined ? weekDays[w.id] : 0;

      totalDaysWorked += days;
      totalGrossWage += days * w.dailyWage;
    });

    // المرحلة الثانية المعدّلة: السلف/الخصومات المرتبطة بـ weekKey فقط.
    // القديمة بلا weekKey تُعرض للمراجعة ولا تدخل حساب الأجور تلقائيًا.
    advances.forEach((a) => {
      if (a.settled === true) return;
      if (a.weekKey !== weekKey) return;
      if (a.type === 'سلفة') {
        totalAdvances += a.amount;
      } else {
        totalDeductions += a.amount;
      }
    });

    const totalNetPayout =
      totalGrossWage - totalAdvances - totalDeductions;

    return {
      totalGrossWage,
      totalAdvances,
      totalDeductions,
      totalNetPayout,
      totalDaysWorked,
    };
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authReady,
        activeTab,
        setActiveTab,
        projects,
        workers,
        advances,
        clients,
        requests,
        rooms,
        selectedProjectId,
        setSelectedProjectId,
        isAvailableForWork,
        setIsAvailableForWork,
        userProfile,
        setUserProfile,
        projectAttendance,
        getProjectAttendance,
        setProjectAttendanceCell,
        workerDaysThisWeek,
        setWorkerDays,
        legacyWorkerDays,
        assignLegacyDaysToWeek,
        workerDaysByWeek,
        weeklyPayouts,
        getWeekKeyForOffset,
        getWeekRangeLabelForOffset,
        isWeekPaid,
        getPayoutForWeek,
        unsettledAdvancesForWeek,
        settleAdvance,
        markAdvanceUnsettled,
        weeklySummaryForWeek,
        addAdvanceOrDeduction,
        deleteAdvanceOrDeduction,
        addWorker,
        deleteWorker,
        confirmWeeklyPayout,
        addProject,
        updateProject,
        deleteProject,
        addMaterialToProject,
        deleteMaterialFromProject,
        recordClientPayment,
        acceptRequest,
        rejectRequest,
        addRoom,
        updateRoom,
        deleteRoom,
        clearRooms,
        showNewProjectModal,
        setShowNewProjectModal,
        showNewWorkerModal,
        setShowNewWorkerModal,
        showNewAdvanceModal,
        setShowNewAdvanceModal,
        invoiceModalProject,
        setInvoiceModalProject,
        showAuthModal,
        setShowAuthModal,
        showPWAInstallModal,
        setShowPWAInstallModal,
        weeklySummary,
        formatCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};
