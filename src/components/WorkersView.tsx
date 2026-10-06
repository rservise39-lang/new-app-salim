import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Plus, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  DollarSign, 
  AlertCircle, 
  Trash2, 
  Phone, 
  Check, 
  Wallet,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';

export const WorkersView: React.FC = () => {
  const {
    workers,
    advances,
    workerDaysThisWeek,
    setWorkerDays,
    addAdvanceOrDeduction,
    deleteAdvanceOrDeduction,
    setShowNewWorkerModal,
    setShowNewAdvanceModal,
    confirmWeeklyPayout,
    formatCurrency,
    weeklySummary
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'payroll' | 'advances' | 'workersList'>('payroll');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Helper date for current week in Algerian context
  const getWeekRange = (offset: number) => {
    const baseDate = new Date(2025, 7, 10); // Aug 10, 2025
    baseDate.setDate(baseDate.getDate() + offset * 7);
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + 6);

    const format = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    return `من ${format(baseDate)} إلى ${format(endDate)}`;
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>أجور العمال وإدارة الفريق</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            حساب الأجر اليومي، أيام العمل، السلف والخصومات وصافي الأجور الأسبوعية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewAdvanceModal(true)}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-all flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4 text-amber-600" />
            <span>إضافة سلفة / خصم</span>
          </button>
          <button
            onClick={() => setShowNewWorkerModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة عامل</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Clean Segmented Bar) */}
      <div className="flex items-center p-1 bg-slate-100 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'payroll'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الحساب الأسبوعي للأجور
        </button>
        <button
          onClick={() => setActiveSubTab('advances')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'advances'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          السلف والخصومات ({advances.length})
        </button>
        <button
          onClick={() => setActiveSubTab('workersList')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'workersList'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          قائمة العمال ({workers.length})
        </button>
      </div>

      {/* VIEW 1: WEEKLY PAYROLL TABLE */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-4">
          {/* Week Navigator */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between shadow-xs">
            <button
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              title="الأسبوع السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-center">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs sm:text-sm text-slate-800">
                {currentWeekOffset === 0 ? 'الأسبوع الحالي' : `أسبوع (${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset})`}
                {' : '}
                <span className="font-mono text-blue-700">{getWeekRange(currentWeekOffset)}</span>
              </span>
            </div>

            <button
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              title="الأسبوع القادم"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Payroll Cards / Table */}
          <div className="space-y-3">
            {workers.map((worker) => {
              const days = workerDaysThisWeek[worker.id] !== undefined ? workerDaysThisWeek[worker.id] : worker.daysAssignedThisWeek;
              const gross = days * worker.dailyWage;
              
              // Calculate advances & deductions for this worker
              const workerAdvances = advances
                .filter(a => a.workerId === worker.id && a.type === 'سلفة')
                .reduce((acc, a) => acc + a.amount, 0);

              const workerDeductions = advances
                .filter(a => a.workerId === worker.id && a.type === 'خصم')
                .reduce((acc, a) => acc + a.amount, 0);

              const netWage = gross - workerAdvances - workerDeductions;

              return (
                <div
                  key={worker.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center shrink-0">
                        {worker.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {worker.name}
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {worker.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>الأجر اليومي: <strong className="text-slate-800 font-mono">{formatCurrency(worker.dailyWage)}</strong></span>
                          <span>•</span>
                          <span>الهاتف: {worker.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Net Wage Display Badge */}
                    <div className="text-right sm:text-left bg-emerald-50/80 px-3 py-2 rounded-xl border border-emerald-200/70">
                      <span className="text-[10px] text-emerald-700 font-semibold block">الصافي المستحق</span>
                      <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
                        {formatCurrency(netWage)}
                      </span>
                    </div>
                  </div>

                  {/* Wage Calculation Controls */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
                    {/* Days Worked Controls */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 block text-[10px] mb-1">أيام العمل هذا الأسبوع</span>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setWorkerDays(worker.id, days - 1)}
                          disabled={days <= 0}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-black text-base font-mono text-blue-900">{days} أيام</span>
                        <button
                          onClick={() => setWorkerDays(worker.id, days + 1)}
                          disabled={days >= 7}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Gross Wage */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex flex-col justify-center">
                      <span className="text-slate-500 text-[10px] block">الأجر الإجمالي ({days} × {worker.dailyWage})</span>
                      <span className="font-bold text-slate-900 text-sm font-mono tabular-nums mt-1">
                        {formatCurrency(gross)}
                      </span>
                    </div>

                    {/* Advances */}
                    <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 flex flex-col justify-center">
                      <span className="text-amber-700 text-[10px] block">السلف المسحوبة (-)</span>
                      <span className="font-bold text-amber-800 text-sm font-mono tabular-nums mt-1">
                        {formatCurrency(workerAdvances)}
                      </span>
                    </div>

                    {/* Deductions */}
                    <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-200/60 flex flex-col justify-center">
                      <span className="text-rose-700 text-[10px] block">الخصومات / غياب (-)</span>
                      <span className="font-bold text-rose-800 text-sm font-mono tabular-nums mt-1">
                        {formatCurrency(workerDeductions)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly Payout Final Summary Box */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-3xl shadow-lg space-y-4">
            <h3 className="font-bold text-base flex items-center justify-between text-blue-200">
              <span className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                ملخص الصرف الأسبوعي
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-300 font-mono">
                {weeklySummary.totalDaysWorked} يوم عمل مجمع
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-y border-white/10 py-3">
              <div>
                <span className="text-slate-400 block text-[11px]">إجمالي الأجور المستحقة</span>
                <span className="font-bold text-base font-mono text-white mt-1 block">
                  {formatCurrency(weeklySummary.totalGrossWage)}
                </span>
              </div>
              <div>
                <span className="text-amber-400 block text-[11px]">إجمالي السلف (-)</span>
                <span className="font-bold text-base font-mono text-amber-300 mt-1 block">
                  {formatCurrency(weeklySummary.totalAdvances)}
                </span>
              </div>
              <div>
                <span className="text-rose-400 block text-[11px]">إجمالي الخصومات (-)</span>
                <span className="font-bold text-base font-mono text-rose-300 mt-1 block">
                  {formatCurrency(weeklySummary.totalDeductions)}
                </span>
              </div>
              <div>
                <span className="text-emerald-400 block text-[11px]">الصافي الواجب صرفه</span>
                <span className="font-black text-lg font-mono text-emerald-300 mt-1 block">
                  {formatCurrency(weeklySummary.totalNetPayout)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-300">
                تأكيد الصرف يقوم بتسجيل الدفعة وتصفية المستحقات للأسبوع الجاري.
              </p>
              <button
                onClick={confirmWeeklyPayout}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>تأكيد صرف الأجور للعمال</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ADVANCES & DEDUCTIONS MANAGEMENT */}
      {activeSubTab === 'advances' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              سجل السلف والخصومات
            </h3>
            <button
              onClick={() => setShowNewAdvanceModal(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سلفة جديدة</span>
            </button>
          </div>

          {advances.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-bold">لا توجد سلف أو خصومات مسجلة حالياً</p>
              <p className="text-slate-400 text-xs mt-1">يمكنك تسجيل أي سلفة نقدية لأحد العمال لخصمها تلقائياً من الأجر الأسبوعي</p>
            </div>
          ) : (
            <div className="space-y-2">
              {advances.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'سلفة' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.type === 'سلفة' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-900">{item.workerName}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'سلفة' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>السبب: {item.reason || 'بدون سبب محدد'}</span>
                        <span>•</span>
                        <span>التاريخ: {item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                      {formatCurrency(item.amount)}
                    </span>
                    <button
                      onClick={() => deleteAdvanceOrDeduction(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: WORKERS DIRECTORY */}
      {activeSubTab === 'workersList' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              قائمة العمال والمهارات ({workers.length})
            </h3>
            <button
              onClick={() => setShowNewWorkerModal(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عامل جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white font-black text-base flex items-center justify-center shadow-xs">
                      👷
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{worker.name}</h4>
                      <p className="text-xs text-blue-700 font-semibold">{worker.role}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{worker.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {worker.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">الأجر اليومي:</span>
                  <span className="font-bold text-blue-900 font-mono text-sm">
                    {formatCurrency(worker.dailyWage)} / يوم
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
