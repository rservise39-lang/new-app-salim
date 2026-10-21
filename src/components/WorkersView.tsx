import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectAttendanceView } from './ProjectAttendanceView';
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
    legacyWorkerDays,
    assignLegacyDaysToWeek,
    addAdvanceOrDeduction,
    deleteAdvanceOrDeduction,
    setShowNewWorkerModal,
    setShowNewAdvanceModal,
    confirmWeeklyPayout,
    formatCurrency,
    weeklySummary,
    workerDaysByWeek,
    getWeekKeyForOffset,
    getWeekRangeLabelForOffset,
    isWeekPaid,
    getPayoutForWeek,
    unsettledAdvancesForWeek,
    settleAdvance,
    markAdvanceUnsettled,
    weeklySummaryForWeek,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'payroll' | 'projectAttendance' | 'advances' | 'workersList'
  >('payroll');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // مفتاح الأسبوع الفعلي المختار (offset 0 = الأسبوع الحالي).
  const currentWeekKey = getWeekKeyForOffset(currentWeekOffset);
  const currentWeekLabel = getWeekRangeLabelForOffset(currentWeekOffset);
  const weekPaid = isWeekPaid(currentWeekKey);
  const payoutRecord = getPayoutForWeek(currentWeekKey);
  const weekSummary = weeklySummaryForWeek(currentWeekKey);
  const reviewableAdvances = unsettledAdvancesForWeek(currentWeekKey);

  // المرحلة الثانية المعدّلة: أيام الحضور القديمة غير محددة الأسبوع (للمراجعة).
  // تُعرض فقط عند الأسبوع الحالي (offset 0) لأنها بلا تاريخ موثوق.
  const legacyDays = currentWeekOffset === 0 ? legacyWorkerDays() : [];
  const [showLegacyPicker, setShowLegacyPicker] = useState(false);
  const [legacyPickOffset, setLegacyPickOffset] = useState(0);

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
      <div className="flex items-center p-1 bg-slate-100 rounded-2xl max-w-xl overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'payroll'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الحساب الأسبوعي
        </button>
        <button
          onClick={() => setActiveSubTab('projectAttendance')}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'projectAttendance'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          حضور المشاريع
        </button>
        <button
          onClick={() => setActiveSubTab('advances')}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'advances'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          السلف والخصومات ({advances.length})
        </button>
        <button
          onClick={() => setActiveSubTab('workersList')}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
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
                <span className="font-mono text-blue-700">{currentWeekLabel}</span>
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
              const weekDays = workerDaysByWeek[currentWeekKey] || {};
              // المرحلة الثانية المعدّلة: الأيام من الأسبوع المختار فقط.
              // لا fallback إلى workerDaysThisWeek (غير مؤكد) ولا إلى daysAssignedThisWeek
              // (افتراض محاسبي). عامل بلا أيام مسجلة هذا الأسبوع = 0.
              const days = weekDays[worker.id] !== undefined ? weekDays[worker.id] : 0;
              const gross = days * worker.dailyWage;

              // السلف والخصومات المرتبطة بهذا الأسبوع فقط (غير المسدّدة).
              // القديمة بلا weekKey لا تُخصم هنا؛ تُعرض للمراجعة في الأسفل.
              const workerAdvances = advances
                .filter(a =>
                  a.workerId === worker.id &&
                  a.type === 'سلفة' &&
                  a.settled !== true &&
                  a.weekKey === currentWeekKey
                )
                .reduce((acc, a) => acc + a.amount, 0);

              const workerDeductions = advances
                .filter(a =>
                  a.workerId === worker.id &&
                  a.type === 'خصم' &&
                  a.settled !== true &&
                  a.weekKey === currentWeekKey
                )
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
                {weekSummary.totalDaysWorked} يوم عمل مجمع
              </span>
            </h3>

            {weekPaid && payoutRecord && (
              <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/30 px-4 py-3 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>
                  تم صرف أجور هذا الأسبوع في {new Date(payoutRecord.paidAt).toLocaleString('ar-DZ')}.
                  الصافي المصروف: <strong className="font-mono">{formatCurrency(payoutRecord.totalNet)}</strong>.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-y border-white/10 py-3">
              <div>
                <span className="text-slate-400 block text-[11px]">إجمالي الأجور المستحقة</span>
                <span className="font-bold text-base font-mono text-white mt-1 block">
                  {formatCurrency(weekSummary.totalGrossWage)}
                </span>
              </div>
              <div>
                <span className="text-amber-400 block text-[11px]">إجمالي السلف (-)</span>
                <span className="font-bold text-base font-mono text-amber-300 mt-1 block">
                  {formatCurrency(weekSummary.totalAdvances)}
                </span>
              </div>
              <div>
                <span className="text-rose-400 block text-[11px]">إجمالي الخصومات (-)</span>
                <span className="font-bold text-base font-mono text-rose-300 mt-1 block">
                  {formatCurrency(weekSummary.totalDeductions)}
                </span>
              </div>
              <div>
                <span className="text-emerald-400 block text-[11px]">الصافي الواجب صرفه</span>
                <span className="font-black text-lg font-mono text-emerald-300 mt-1 block">
                  {formatCurrency(weekSummary.totalNetPayout)}
                </span>
              </div>
            </div>

            {/* مراجعة السلف القديمة غير المؤكدة (لها تاريخ لكن بلا علم «مسدّدة»).
                المرحلة الثانية المعدّلة: هذه السلف لن تُخصم تلقائيًا في الصرف؛ تسوية أو حذف فقط. */}
            {reviewableAdvances.length > 0 && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-400/30 px-4 py-3 space-y-2">
                <p className="text-amber-200 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  سلف/خصومات قديمة للمراجعة ({reviewableAdvances.length})
                </p>
                <p className="text-amber-200/80 text-[11px] leading-5">
                  هذه بنود بلا أسبوع محدد؛ لن تُخصم تلقائيًا. علّمها «مسدّدة» إن كانت قد صُرفت، أو احذفها إن كانت خاطئة. لخصمها أعِد إدخالها بتاريخ فيُسنَد لها أسبوع تلقائيًا.
                </p>
                <div className="space-y-2 pt-1">
                  {reviewableAdvances.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 bg-white/5 rounded-xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-white truncate">{item.workerName}</strong>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.type === 'سلفة' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {item.reason || 'بدون سبب'} • {item.date}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white text-xs shrink-0">
                        {formatCurrency(item.amount)}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => settleAdvance(item.id)}
                          title="تعليم كمسدّدة (لا تُخصم)"
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-600/40 hover:bg-slate-600/70 text-white transition-colors"
                        >
                          مسدّدة
                        </button>
                        <button
                          onClick={() => deleteAdvanceOrDeduction(item.id)}
                          title="حذف البند (بتأكيد)"
                          className="p-1 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* المرحلة الثانية المعدّلة: حضور قديم غير محدد الأسبوع — نقل يدوي فقط.
                يظهر هذا القسم فقط عند الأسبوع الحالي (offset 0) وعند وجود أيام قديمة > 0. */}
            {legacyDays.filter(ld => ld.days > 0).length > 0 && (
              <div className="rounded-2xl bg-orange-500/10 border border-orange-400/30 px-4 py-3 space-y-2">
                <p className="text-orange-200 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  حضور قديم غير محدد الأسبوع — للمراجعة
                </p>
                <p className="text-orange-200/80 text-[11px] leading-5">
                  أيام حضور محفوظة قبل تفعيل النظام الأسبوعي؛ لا تاريخ موثوقًا يحدد أسبوعها. لن تدخل الحساب تلقائيًا. انقر «نقل» لإسنادها يدويًا إلى الأسبوع الصحيح.
                </p>
                <div className="space-y-1.5 pt-1">
                  {legacyDays.filter(ld => ld.days > 0).map(({ workerId, days }) => {
                    const worker = workers.find(w => w.id === workerId);
                    if (!worker) return null;
                    return (
                      <div key={workerId} className="flex items-center justify-between gap-2 bg-white/5 rounded-xl px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <strong className="text-xs text-white truncate">{worker.name}</strong>
                          <div className="text-[10px] text-slate-400 mt-0.5">{days} يوم</div>
                        </div>
                        <button
                          onClick={() => setShowLegacyPicker(true)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-600/40 hover:bg-blue-600/70 text-white transition-colors shrink-0"
                        >
                          نقل إلى أسبوع
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* منتقي الأسبوع للنقل اليدوي */}
                {showLegacyPicker && (
                  <div className="mt-2 p-3 bg-white/5 rounded-xl border border-orange-300/20 space-y-2">
                    <p className="text-orange-100 text-[11px] font-bold">اختر الأسبوع الصحيح لنقل الأيام إليه:</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLegacyPickOffset(prev => prev - 1)}
                        className="p-1 rounded-lg hover:bg-white/10 text-white"
                        title="أسبوع سابق"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center text-[11px] text-white font-mono">
                        {getWeekRangeLabelForOffset(legacyPickOffset)}
                      </span>
                      <button
                        onClick={() => setLegacyPickOffset(prev => prev + 1)}
                        className="p-1 rounded-lg hover:bg-white/10 text-white"
                        title="أسبوع قادم"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={() => setShowLegacyPicker(false)}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-600/40 hover:bg-slate-600/70 text-white transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => {
                          const targetKey = getWeekKeyForOffset(legacyPickOffset);
                          assignLegacyDaysToWeek(targetKey);
                          setShowLegacyPicker(false);
                          setLegacyPickOffset(0);
                        }}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      >
                        تأكيد النقل إلى {getWeekRangeLabelForOffset(legacyPickOffset)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-300">
                {weekPaid
                  ? 'تم صرف هذا الأسبوع. التنقل بين الأسابيع لا يغيّر السجلات السابقة.'
                  : 'تأكيد الصرف يقوم بتسجيل الدفعة وتصفية المستحقات للأسبوع الجاري.'}
              </p>
              <button
                onClick={() => confirmWeeklyPayout(currentWeekKey, currentWeekLabel)}
                disabled={weekPaid || workers.length === 0}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{weekPaid ? 'تم صرف هذا الأسبوع' : 'تأكيد صرف الأجور للعمال'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: PROJECT ATTENDANCE TABLE */}
      {activeSubTab === 'projectAttendance' && <ProjectAttendanceView />}

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
