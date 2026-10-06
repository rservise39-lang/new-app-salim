import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Calculator, 
  FileText, 
  Package, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  ChevronLeft,
  CheckCircle2,
  Smartphone,
  Download,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const DashboardView: React.FC = () => {
  const {
    projects,
    workers,
    clients,
    requests,
    setActiveTab,
    setSelectedProjectId,
    setShowNewProjectModal,
    setShowNewWorkerModal,
    setShowPWAInstallModal,
    formatCurrency,
    weeklySummary,
    userProfile
  } = useApp();
  const { isInstalled, isInstallable, install } = usePWAInstall();

  // Financial aggregates
  const totalAgreedRevenue = projects.reduce((acc, p) => acc + (p.clientBudget || 0), 0);
  const totalPaidRevenue = projects.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  
  // Total expenses across projects:
  const totalProjectsExpenses = projects.reduce((acc, p) => {
    const matCost = p.materials.reduce((mAcc, m) => mAcc + (m.quantity * m.unitPrice), 0);
    const workerCost = p.workers.reduce((wAcc, w) => wAcc + (w.dailyRate * w.daysSpent), 0);
    return acc + matCost + workerCost + (p.toolsAndTransportCost || 0) + (p.otherExpensesCost || 0);
  }, 0);

  const totalNetProfit = totalAgreedRevenue - totalProjectsExpenses;

  const activeProjects = projects.filter(p => p.status === 'قيد التنفيذ');
  const pendingRequests = requests.filter(r => r.status === 'قيد الانتظار');

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Welcome & Motivational Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 shadow-md">
        {/* Decorative corner paint brush effect */}
        <div className="absolute top-0 left-0 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl -translate-x-12 -translate-y-12 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-44 h-44 bg-sky-400/20 rounded-full blur-3xl translate-x-16 translate-y-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-medium text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>صباغي .. مشاريعك بألوان أفضل</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              مرحباً {userProfile.name} 🎨
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-lg leading-relaxed">
              تحكم كامل في حساب أجور عمالك، تكاليف المواد والمشاريع، وإصدار كشوف حساب فورية لزبائنك بالدينار الجزائري.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>مشروع جديد</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-xs transition-all active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>حاسبة التسعير</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save to Phone / PWA Quick Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 border border-blue-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-400/20">
            <Smartphone className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">
                {isInstalled ? 'تطبيق صباغي مثبت على هاتفك' : 'احفظ تطبيق صباغي على هاتفك المحمول'}
              </h3>
              {isInstalled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  مثبت
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  ⚡ بدون تحميل
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              {isInstalled 
                ? 'التطبيق جاهز للعمل من شاشتك الرئيسية بدون الحاجة لفتح المتصفح وبدون إنترنت.' 
                : 'أضف أيقونة التطبيق لشاشة هاتفك الرئيسية لتسجيل حساباتك وحساب أجور عمالك في أي ورشة بدون إنترنت.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {isInstallable && !isInstalled ? (
            <button
              onClick={() => install()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت الآن بنقرة</span>
            </button>
          ) : null}
          <button
            onClick={() => setShowPWAInstallModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-amber-300" />
            <span>{isInstalled ? 'تفاصيل التثبيت' : 'طريقة الحفظ على الهاتف'}</span>
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards (Matching Screen 4 & 5) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Workers & Wages */}
        <div 
          onClick={() => setActiveTab('workers')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">العمال</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">{workers.length}</span>
            <span className="text-xs text-slate-500">عمال</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">أجور الأسبوع:</span>
            <span className="font-bold text-blue-600 font-mono tabular-nums">
              {formatCurrency(weeklySummary.totalGrossWage)}
            </span>
          </div>
        </div>

        {/* Projects Active */}
        <div 
          onClick={() => setActiveTab('projects')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">المشاريع</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">{projects.length}</span>
            <span className="text-xs text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded-sm">
              {activeProjects.length} نشطة
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">المداخيل:</span>
            <span className="font-bold text-slate-800 font-mono tabular-nums">
              {formatCurrency(totalAgreedRevenue)}
            </span>
          </div>
        </div>

        {/* Net Profit */}
        <div 
          onClick={() => setActiveTab('projects')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-emerald-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">الربح الصافي التقديري</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tabular-nums">
              {formatCurrency(totalNetProfit)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">هامش الربح:</span>
            <span className="font-bold text-emerald-600 font-mono tabular-nums">
              {totalAgreedRevenue > 0 ? Math.round((totalNetProfit / totalAgreedRevenue) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Clients & Requests */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-purple-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">العملاء والطلبات</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">{clients.length}</span>
            <span className="text-xs text-slate-500">زبائن</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">طلبات جديدة:</span>
            <span className="font-bold text-rose-600 font-mono tabular-nums">
              {pendingRequests.length} طلبات
            </span>
          </div>
        </div>
      </div>

      {/* 6 Quick Action Cards (From Screen 6 in Mockups) */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
          <span>الخدمات والعمليات السريعة</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTab('workers')}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-amber-500/10 border border-amber-200 hover:bg-amber-500/20 transition-all text-slate-800"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center mb-2 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm">حساب أجور العمال</span>
            <span className="text-[10px] text-slate-500 mt-0.5">تسجيل الأيام، السلف والصافي</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-200 hover:bg-emerald-500/20 transition-all text-slate-800"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm">حساب المساحة (م²)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">خصم الأبواب والنوافذ والدهان</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-rose-500/10 border border-rose-200 hover:bg-rose-500/20 transition-all text-slate-800"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center mb-2 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm">تكاليف المواد والسلع</span>
            <span className="text-[10px] text-slate-500 mt-0.5">دهان، معجون، برايمر، أدوات</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-blue-500/10 border border-blue-200 hover:bg-blue-500/20 transition-all text-slate-800"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm">مشاريع الزبائن</span>
            <span className="text-[10px] text-slate-500 mt-0.5">تفاصيل التكاليف ونسب الإنجاز</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-200 hover:bg-indigo-500/20 transition-all text-slate-800"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm">الحساب النهائي للزبون</span>
            <span className="text-[10px] text-slate-500 mt-0.5">المدفوع، المتبقي وهامش الربح</span>
          </button>

          <button
            onClick={() => {
              if (projects[0]) {
                setSelectedProjectId(projects[0].id);
                setActiveTab('projects');
              }
            }}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-sky-500/10 border border-sky-200 hover:bg-sky-500/20 transition-all text-slate-800"
          >
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs sm:text-sm">كشوف حساب وفواتير</span>
            <span className="text-[10px] text-slate-500 mt-0.5">تصدير وطباعة كشف حساب معتمد</span>
          </button>
        </div>
      </div>

      {/* Ongoing Projects Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>المشاريع الحالية</span>
            <span className="text-xs font-normal text-slate-500">({projects.length} مشاريع)</span>
          </h3>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {projects.slice(0, 3).map((project) => {
            // Calculate project financial breakdown
            const matCost = project.materials.reduce((acc, m) => acc + (m.quantity * m.unitPrice), 0);
            const workerCost = project.workers.reduce((acc, w) => acc + (w.dailyRate * w.daysSpent), 0);
            const totalProjectCost = matCost + workerCost + (project.toolsAndTransportCost || 0) + (project.otherExpensesCost || 0);
            const netProfit = project.clientBudget - totalProjectCost;

            return (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setActiveTab('projects');
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        project.status === 'قيد التنفيذ' ? 'bg-amber-100 text-amber-800' :
                        project.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {project.status}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {project.title}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                      <span>العميل: <strong className="text-slate-700">{project.clientName}</strong></span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {project.location}
                      </span>
                      <span>المساحة: <strong>{project.areaSqm} م²</strong></span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs text-slate-400 block">الميزانية المتفق عليها</span>
                    <span className="text-sm sm:text-base font-black text-blue-700 font-mono tabular-nums">
                      {formatCurrency(project.clientBudget)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">نسبة الإنجاز</span>
                    <span className="font-bold text-slate-700 font-mono tabular-nums">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        project.progress >= 100 ? 'bg-emerald-500' :
                        project.progress >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Micro Cost Summary */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-slate-600">
                    <span>التكلفة: <strong className="text-slate-800 font-mono">{formatCurrency(totalProjectCost)}</strong></span>
                    <span>الربح الصافي: <strong className="text-emerald-600 font-mono">{formatCurrency(netProfit)}</strong></span>
                  </div>
                  <span className="text-blue-600 font-bold flex items-center gap-0.5">
                    تفاصيل التكاليف والربح
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h4 className="font-bold text-amber-900 text-sm">
                لديك {pendingRequests.length} طلبات جديدة من الزبائن بانتظار الموافقة!
              </h4>
            </div>
            <button
              onClick={() => setActiveTab('clients')}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs"
            >
              مراجعة الطلبات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
