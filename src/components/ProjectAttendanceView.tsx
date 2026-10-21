import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  UserCheck,
  Briefcase,
  Users,
} from 'lucide-react';

// أيام الأسبوع العملية بالترتيب المطلوب (السبت .. الخميس). 6 أيام فقط.
const ATTENDANCE_DAYS = [
  'السبت',
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
] as const;

// تدوير قيمة الخلية بالترتيب المطلوب: 1 -> 0.5 -> 0 -> 1.
function nextAttendanceValue(current: number): number {
  if (current === 1) return 0.5;
  if (current === 0.5) return 0;
  return 1; // 0 أو غير محدد -> 1
}

// أسبوع يبدأ يوم السبت وينتهي يوم الخميس (6 أيام عمل).
// مفتاح الأسبوع = تاريخ السبت بصيغة YYYY-MM-DD، مستقل عن مفاتيح ISO الأسبوعية
// القديمة المستخدمة في نظام الأجور العام، لمنع اختلاط الحضور بين النظامين.
function getSaturdayStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // الأحد=0 .. السبت=6
  const diff = (day - 6 + 7) % 7; // السبت=0، الأحد=6، الاثنين=5، الثلاثاء=4، الأربعاء=3، الخميس=2، الجمعة=1
  d.setDate(d.getDate() - diff);
  return d;
}

function formatSaturdayKey(saturday: Date): string {
  const y = saturday.getFullYear();
  const m = String(saturday.getMonth() + 1).padStart(2, '0');
  const d = String(saturday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatShortDate(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function getWeekDates(saturday: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);
    return d;
  });
}

function getWeekLabel(saturday: Date): string {
  const thu = new Date(saturday);
  thu.setDate(saturday.getDate() + 5);
  return `من ${formatShortDate(saturday)} إلى ${formatShortDate(thu)}`;
}

function cellDisplay(v: number): string {
  if (v === 1) return '1';
  if (v === 0.5) return '0.5';
  return '0';
}

function cellClass(v: number): string {
  if (v === 1) return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
  if (v === 0.5) return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
  return 'bg-slate-100 text-slate-400 hover:bg-slate-200';
}

// عرض المجموع كرقم فقط دون كلمة «يوم»: 5 أو 4.5.
function formatTotal(t: number): string {
  return Number.isInteger(t) ? String(t) : t.toFixed(1);
}

const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-300">
    {icon && <div className="mx-auto mb-2 text-slate-400">{icon}</div>}
    <p className="text-slate-600 text-sm font-bold">{title}</p>
    {subtitle && (
      <p className="text-slate-400 text-xs mt-1 leading-5">{subtitle}</p>
    )}
  </div>
);

export const ProjectAttendanceView: React.FC = () => {
  const {
    projects,
    clients,
    workers,
    getProjectAttendance,
    setProjectAttendanceCell,
    formatCurrency,
  } = useApp();

  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [weekOffset, setWeekOffset] = useState(0);

  // قائمة الزبائن: اتحاد أسماء الزبائن من الدليل ومن المشاريع، لضمان وصول كل
  // مشروع إلى الشاشة حتى إن لم يكن صاحبه مدرجًا في دليل الزبائن.
  const clientNames = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.clientName && p.clientName.trim()) set.add(p.clientName.trim());
    });
    clients.forEach((c) => {
      if (c.name && c.name.trim()) set.add(c.name.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [projects, clients]);

  // مشاريع الزبون المختار فقط (منع اختلاط المشاريع بين الزبائن).
  const clientProjects = useMemo(() => {
    if (!selectedClient) return [];
    return projects.filter(
      (p) => (p.clientName || '').trim() === selectedClient
    );
  }, [projects, selectedClient]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return clientProjects.find((p) => p.id === selectedProjectId) || null;
  }, [clientProjects, selectedProjectId]);

  // أسبوع الحضور (يبدأ السبت). مستقل عن نظام ISO الأسبوعي القديم.
  const baseSaturday = useMemo(() => getSaturdayStart(new Date()), []);
  const weekSaturday = useMemo(() => {
    const d = new Date(baseSaturday);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [baseSaturday, weekOffset]);

  const weekKey = formatSaturdayKey(weekSaturday);
  const weekLabel = getWeekLabel(weekSaturday);
  const weekDates = getWeekDates(weekSaturday);

  // حضور الأسبوع الحالي للمشروع المختار (يُقرأ من التخزين الحالي).
  const weekAttendance = selectedProjectId
    ? getProjectAttendance(selectedProjectId, weekKey)
    : {};

  // إعادة ضبط الاختيار إن أصبح غير صالح (حذف زبون/مشروع من مكان آخر).
  useEffect(() => {
    if (selectedClient && !clientNames.includes(selectedClient)) {
      setSelectedClient(null);
      setSelectedProjectId(null);
    }
  }, [selectedClient, clientNames]);

  useEffect(() => {
    if (
      selectedProjectId &&
      !clientProjects.some((p) => p.id === selectedProjectId)
    ) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId, clientProjects]);

  // العمال المكلفون بالمشروع (من بيانات المشروع نفسه، لا من القائمة العامة).
  const projectWorkers = useMemo(
    () => selectedProject?.workers || [],
    [selectedProject]
  );

  // العمال الذين تنقصهم أجرة يومية صحيحة في ملفهم (للتنبيه فقط، دون اختراع قيمة).
  const missingWageWorkers = useMemo(() => {
    return projectWorkers.filter((pw) => {
      const w = workers.find((x) => x.id === pw.workerId);
      return !w || !w.dailyWage || w.dailyWage <= 0;
    });
  }, [projectWorkers, workers]);

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* الترويسة */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <span>حضور العمال الأسبوعي بالمشروع</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          اختر الزبون ثم المشروع ثم الأسبوع لتسجيل حضور العمال وحساب الأجر الإجمالي
        </p>
      </div>

      {/* الخطوة 1: اختيار الزبون */}
      {clientNames.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-9 h-9" />}
          title="لا يوجد زبائن أو مشاريع بعد"
          subtitle="أضف زبونًا من قسم الزبائن أو أنشئ مشروعًا أولًا لتسجيل الحضور."
        />
      ) : (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center">
              1
            </span>
            اختر الزبون
          </label>
          <select
            value={selectedClient ?? ''}
            onChange={(e) => {
              setSelectedClient(e.target.value || null);
              setSelectedProjectId(null);
              setWeekOffset(0);
            }}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-blue-500"
          >
            <option value="" disabled>
              — اختر الزبون —
            </option>
            {clientNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* الخطوة 2: اختيار المشروع (مشاريع الزبون المختار فقط) */}
      {selectedClient && (
        <>
          {clientProjects.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="w-9 h-9" />}
              title="هذا الزبون لا يملك مشاريع بعد"
              subtitle="أنشئ مشروعًا لهذا الزبون أولًا لتسجيل الحضور."
            />
          ) : (
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center">
                  2
                </span>
                اختر المشروع
              </label>
              <select
                value={selectedProjectId ?? ''}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value || null);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-blue-500"
              >
                <option value="" disabled>
                  — اختر المشروع —
                </option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {/* الخطوة 3: اختيار الأسبوع ثم جدول الحضور */}
      {selectedClient && selectedProject && (
        <>
          {/* منتقي الأسبوع */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              title="الأسبوع السابق"
              aria-label="الأسبوع السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-[11px] text-slate-500">
                {weekOffset === 0
                  ? 'الأسبوع الحالي'
                  : weekOffset > 0
                    ? `بعد ${weekOffset} أسبوع`
                    : `قبل ${-weekOffset} أسبوع`}
              </div>
              <div className="font-bold text-sm text-slate-800 font-mono">
                {weekLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              title="الأسبوع التالي"
              aria-label="الأسبوع التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* العمال المكلفون بالمشروع */}
          {projectWorkers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-9 h-9" />}
              title="هذا المشروع لا يملك عمالًا بعد"
              subtitle="أضف عمالًا لهذا المشروع أولًا لتسجيل الحضور."
            />
          ) : (
            <>
              {/* تنبيه الأجرة الناقصة */}
              {missingWageWorkers.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                  <span>
                    العمال التاليون بحاجة لتحديد الأجر اليومي في ملفهم قبل حساب
                    الأجر الإجمالي:
                    <strong className="font-bold">
                      {' '}
                      {missingWageWorkers.map((w) => w.workerName).join('، ')}
                    </strong>
                  </span>
                </div>
              )}

              {/* جدول الحضور */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
                <table className="border-separate border-spacing-0 text-center">
                  <thead>
                    <tr>
                      <th className="sticky right-0 top-0 z-30 bg-white px-2 py-2 border-b border-l border-slate-200 min-w-[76px]">
                        <span className="block text-[10px] text-slate-400 font-bold">
                          اليوم / العامل
                        </span>
                      </th>
                      {projectWorkers.map((pw) => {
                        const w = workers.find((x) => x.id === pw.workerId);
                        const name = w?.name || pw.workerName;
                        return (
                          <th
                            key={pw.workerId || pw.workerName}
                            className="sticky top-0 z-20 bg-white px-2 py-2 border-b border-slate-200 min-w-[64px] max-w-[92px]"
                          >
                            <span
                              className="block font-bold text-slate-800 text-xs truncate"
                              title={name}
                            >
                              {name}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {ATTENDANCE_DAYS.map((day, dayIdx) => (
                      <tr key={day}>
                        <td className="sticky right-0 z-10 bg-white px-2 py-1.5 border-b border-l border-slate-200 text-right min-w-[76px]">
                          <span className="block font-bold text-slate-700 text-[11px]">
                            {day}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {formatShortDate(weekDates[dayIdx])}
                          </span>
                        </td>
                        {projectWorkers.map((pw) => {
                          const cells = weekAttendance[pw.workerId] || [
                            0, 0, 0, 0, 0, 0,
                          ];
                          const value = cells[dayIdx] || 0;
                          return (
                            <td
                              key={pw.workerId || pw.workerName}
                              className="p-1 border-b border-slate-100"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setProjectAttendanceCell(
                                    selectedProject.id,
                                    weekKey,
                                    pw.workerId,
                                    dayIdx,
                                    nextAttendanceValue(value)
                                  )
                                }
                                className={`w-11 h-11 rounded-lg font-black text-sm transition active:scale-95 ${cellClass(
                                  value
                                )}`}
                                aria-label={`${day} ${formatShortDate(
                                  weekDates[dayIdx]
                                )} - ${pw.workerName}`}
                              >
                                {cellDisplay(value)}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* صف المجموع (بعد الخميس مباشرة، داخل الجدول) */}
                    <tr>
                      <td className="sticky right-0 z-10 bg-white px-2 py-2 border-l border-slate-200 text-right">
                        <span className="block font-bold text-slate-800 text-[11px]">
                          المجموع
                        </span>
                      </td>
                      {projectWorkers.map((pw) => {
                        const cells = weekAttendance[pw.workerId] || [
                          0, 0, 0, 0, 0, 0,
                        ];
                        const total = cells.reduce(
                          (acc, v) => acc + (v || 0),
                          0
                        );
                        return (
                          <td
                            key={pw.workerId || pw.workerName}
                            className="p-2 border-t-2 border-slate-200"
                          >
                            <span className="font-black text-slate-900 text-sm font-mono block">
                              {formatTotal(total)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* صف الأجر الإجمالي (تحت المجموع مباشرة) */}
                    <tr>
                      <td className="sticky right-0 z-10 bg-white px-2 py-2 border-l border-slate-200 text-right">
                        <span className="block font-bold text-emerald-700 text-[11px]">
                          الأجر الإجمالي
                        </span>
                      </td>
                      {projectWorkers.map((pw) => {
                        const w = workers.find((x) => x.id === pw.workerId);
                        const wage = w?.dailyWage ?? 0;
                        const hasWage = wage > 0;
                        const cells = weekAttendance[pw.workerId] || [
                          0, 0, 0, 0, 0, 0,
                        ];
                        const total = cells.reduce(
                          (acc, v) => acc + (v || 0),
                          0
                        );
                        const gross = total * wage;
                        return (
                          <td
                            key={pw.workerId || pw.workerName}
                            className="p-2 border-t border-slate-100"
                          >
                            {hasWage ? (
                              <span className="font-black text-emerald-700 text-sm font-mono block leading-tight">
                                {formatCurrency(gross)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-bold block leading-tight">
                                تحديد الأجرة
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* تلميح التبديل */}
              <p className="text-[11px] text-slate-400 text-center px-2 leading-5">
                اضغط الخلية لتبديل القيمة: يوم كامل (1) ← نصف يوم (0.5) ← غياب
                (0). لا تُحفظ أية أجرة داخل الجدول؛ يُحسب الأجر الإجمالي تلقائيًا
                من ملف العامل.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
};
