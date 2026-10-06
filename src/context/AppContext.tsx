import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Worker, AdvanceOrDeduction, Client, ClientOrderRequest, RoomMeasurement, MaterialItem } from '../types';
import { INITIAL_WORKERS, INITIAL_PROJECTS, INITIAL_ADVANCES, INITIAL_CLIENTS, INITIAL_REQUESTS, SAMPLE_ROOMS } from '../data/initialData';

export type AppTab = 'dashboard' | 'projects' | 'workers' | 'calculator' | 'clients' | 'reports';

interface AppContextType {
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

  // Workers payroll actions
  workerDaysThisWeek: Record<string, number>;
  setWorkerDays: (workerId: string, days: number) => void;
  addAdvanceOrDeduction: (item: Omit<AdvanceOrDeduction, 'id'>) => void;
  deleteAdvanceOrDeduction: (id: string) => void;
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  deleteWorker: (id: string) => void;
  confirmWeeklyPayout: () => void;

  // Project management actions
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMaterialToProject: (projectId: string, material: Omit<MaterialItem, 'id'>) => void;
  deleteMaterialFromProject: (projectId: string, materialId: string) => void;
  recordClientPayment: (projectId: string, amount: number) => void;

  // Requests
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;

  // Calculator & Rooms
  addRoom: (room: Omit<RoomMeasurement, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<RoomMeasurement>) => void;
  deleteRoom: (id: string) => void;
  clearRooms: () => void;

  // Modals & UI helpers
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

  // Global calculations
  weeklySummary: {
    totalGrossWage: number;
    totalAdvances: number;
    totalDeductions: number;
    totalNetPayout: number;
    totalDaysWorked: number;
  };
  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  PROJECTS: 'sabbaghi_projects_v1',
  WORKERS: 'sabbaghi_workers_v1',
  ADVANCES: 'sabbaghi_advances_v1',
  CLIENTS: 'sabbaghi_clients_v1',
  REQUESTS: 'sabbaghi_requests_v1',
  ROOMS: 'sabbaghi_rooms_v1',
  WORKER_DAYS: 'sabbaghi_worker_days_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAvailableForWork, setIsAvailableForWork] = useState(true);

  const [userProfile, setUserProfile] = useState({
    name: 'أحمد سعيد',
    role: 'صباغ محترف',
    phone: '+213 661 23 45 67',
    wilaya: 'الجزائر العاصمة',
    rating: 4.8,
    ratingCount: 32,
    accountType: 'painter' as 'painter' | 'client'
  });

  // Load from local storage or initial data
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKERS);
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [advances, setAdvances] = useState<AdvanceOrDeduction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADVANCES);
    return saved ? JSON.parse(saved) : INITIAL_ADVANCES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [requests, setRequests] = useState<ClientOrderRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [rooms, setRooms] = useState<RoomMeasurement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return saved ? JSON.parse(saved) : SAMPLE_ROOMS;
  });

  const [workerDaysThisWeek, setWorkerDaysThisWeek] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKER_DAYS);
    if (saved) return JSON.parse(saved);
    const initialMap: Record<string, number> = {};
    INITIAL_WORKERS.forEach(w => {
      initialMap[w.id] = w.daysAssignedThisWeek;
    });
    return initialMap;
  });

  // Modals state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewWorkerModal, setShowNewWorkerModal] = useState(false);
  const [showNewAdvanceModal, setShowNewAdvanceModal] = useState(false);
  const [invoiceModalProject, setInvoiceModalProject] = useState<Project | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPWAInstallModal, setShowPWAInstallModal] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKER_DAYS, JSON.stringify(workerDaysThisWeek));
  }, [workerDaysThisWeek]);

  // Helpers
  const formatCurrency = (amount: number): string => {
    return Math.round(amount).toLocaleString('ar-DZ') + ' دج';
  };

  const setWorkerDays = (workerId: string, days: number) => {
    setWorkerDaysThisWeek(prev => ({
      ...prev,
      [workerId]: Math.max(0, Math.min(7, days))
    }));
  };

  const addAdvanceOrDeduction = (item: Omit<AdvanceOrDeduction, 'id'>) => {
    const newItem: AdvanceOrDeduction = {
      ...item,
      id: 'adv_' + Date.now()
    };
    setAdvances(prev => [newItem, ...prev]);
  };

  const deleteAdvanceOrDeduction = (id: string) => {
    setAdvances(prev => prev.filter(a => a.id !== id));
  };

  const addWorker = (workerData: Omit<Worker, 'id'>) => {
    const newId = 'w_' + Date.now();
    const newWorker: Worker = {
      ...workerData,
      id: newId
    };
    setWorkers(prev => [...prev, newWorker]);
    setWorkerDaysThisWeek(prev => ({
      ...prev,
      [newId]: workerData.daysAssignedThisWeek || 5
    }));
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    setWorkerDaysThisWeek(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const confirmWeeklyPayout = () => {
    // Alert or confirmation
    alert('تم تأكيد صرف أجور الأسبوع بنجاح وحفظ السجل المالي!');
  };

  // Projects actions
  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: 'p_' + Date.now()
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);
  };

  const addMaterialToProject = (projectId: string, mat: Omit<MaterialItem, 'id'>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newMat: MaterialItem = { ...mat, id: 'm_' + Date.now() };
      return {
        ...p,
        materials: [...p.materials, newMat]
      };
    }));
  };

  const deleteMaterialFromProject = (projectId: string, materialId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        materials: p.materials.filter(m => m.id !== materialId)
      };
    }));
  };

  const recordClientPayment = (projectId: string, amount: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        paidAmount: (p.paidAmount || 0) + amount
      };
    }));
  };

  // Requests
  const acceptRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // Convert request to an active project
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
        { id: 'm_auto_1', name: 'دهان أساس وجدران', quantity: Math.round(req.areaSqm * 0.25), unit: 'لتر', unitPrice: 550, category: 'دهانات' }
      ],
      workers: [
        { workerId: workers[0]?.id || 'w1', workerName: workers[0]?.name || 'صباغ أول', dailyRate: 2500, daysSpent: 0 }
      ],
      toolsAndTransportCost: 4000,
      otherExpensesCost: 2000,
      notes: req.notes
    };

    setProjects(prev => [newProject, ...prev]);
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'مقبولة' } : r));
    alert(`تم قبول طلب "${req.title}" وتحويله إلى المشاريع النشطة بنجاح!`);
  };

  const rejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'مرفوضة' } : r));
  };

  // Rooms
  const addRoom = (roomData: Omit<RoomMeasurement, 'id'>) => {
    const newRoom: RoomMeasurement = {
      ...roomData,
      id: 'r_' + Date.now()
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const updateRoom = (id: string, updates: Partial<RoomMeasurement>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const clearRooms = () => {
    setRooms([]);
  };

  // Weekly payroll summary calculations
  const weeklySummary = React.useMemo(() => {
    let totalGrossWage = 0;
    let totalAdvances = 0;
    let totalDeductions = 0;
    let totalDaysWorked = 0;

    workers.forEach(w => {
      const days = workerDaysThisWeek[w.id] !== undefined ? workerDaysThisWeek[w.id] : w.daysAssignedThisWeek;
      totalDaysWorked += days;
      totalGrossWage += days * w.dailyWage;
    });

    advances.forEach(a => {
      if (a.type === 'سلفة') {
        totalAdvances += a.amount;
      } else {
        totalDeductions += a.amount;
      }
    });

    const totalNetPayout = totalGrossWage - totalAdvances - totalDeductions;

    return {
      totalGrossWage,
      totalAdvances,
      totalDeductions,
      totalNetPayout,
      totalDaysWorked
    };
  }, [workers, workerDaysThisWeek, advances]);

  return (
    <AppContext.Provider
      value={{
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
        workerDaysThisWeek,
        setWorkerDays,
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
        formatCurrency
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
