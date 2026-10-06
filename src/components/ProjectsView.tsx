import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, MaterialItem } from '../types';
import { 
  Briefcase, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  PieChart, 
  DollarSign, 
  Users, 
  Package, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  ArrowLeft,
  Coins
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    setShowNewProjectModal,
    addMaterialToProject,
    deleteMaterialFromProject,
    recordClientPayment,
    updateProject,
    deleteProject,
    formatCurrency,
    setInvoiceModalProject
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  // New Material inline form for active project
  const [newMatName, setNewMatName] = useState('');
  const [newMatQty, setNewMatQty] = useState(1);
  const [newMatPrice, setNewMatPrice] = useState(1000);
  const [newMatUnit, setNewMatUnit] = useState<MaterialItem['unit']>('لتر');

  // Client payment recording
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  const filteredProjects = projects.filter(p => {
    const matchesStatus = filterStatus === 'الكل' || p.status === filterStatus;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAddMaterial = (projectId: string) => {
    if (!newMatName.trim()) return;
    addMaterialToProject(projectId, {
      name: newMatName,
      quantity: Number(newMatQty),
      unitPrice: Number(newMatPrice),
      unit: newMatUnit,
      category: 'دهانات'
    });
    setNewMatName('');
    setNewMatQty(1);
  };

  const handleAddPayment = (projectId: string) => {
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) return;
    recordClientPayment(projectId, amt);
    setPaymentAmount('');
    setShowPaymentForm(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* If a project is selected, show Deep Detail View (Matching Mockup 4 & 5) */}
      {selectedProject ? (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Bar for Selected Project */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              <span>العودة لجميع المشاريع</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInvoiceModalProject(selectedProject)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>كشف حساب الزبون</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`هل أنت متأكد من حذف مشروع "${selectedProject.title}"؟`)) {
                    deleteProject(selectedProject.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="حذف المشروع"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Project Header Info Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedProject.status === 'قيد التنفيذ' ? 'bg-amber-100 text-amber-800' :
                    selectedProject.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedProject.status}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedProject.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                  <span>العميل: <strong className="text-slate-800">{selectedProject.clientName}</strong></span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedProject.location}
                  </span>
                  <span>المساحة: <strong>{selectedProject.areaSqm} م²</strong></span>
                  <span>المدة المقدرة: <strong>{selectedProject.estimatedDays} أيام</strong></span>
                </div>
              </div>

              {/* Agreed Budget on Client */}
              <div className="text-right sm:text-left bg-blue-50/70 p-3 rounded-2xl border border-blue-200/80">
                <span className="text-[10px] text-blue-700 font-semibold block">الميزانية المتفق عليها</span>
                <span className="text-xl font-black font-mono text-blue-900">
                  {formatCurrency(selectedProject.clientBudget)}
                </span>
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">نسبة تقدم المشروع:</span>
                <span className="font-mono font-bold text-blue-600">{selectedProject.progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedProject.progress}
                onChange={(e) => updateProject(selectedProject.id, { 
                  progress: parseInt(e.target.value) || 0,
                  status: parseInt(e.target.value) === 100 ? 'مكتمل' : 'قيد التنفيذ'
                })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* FINANCIAL SUMMARY & COST BREAKDOWN (Matching Mockup 4) */}
          {(() => {
            const matCost = selectedProject.materials.reduce((acc, m) => acc + (m.quantity * m.unitPrice), 0);
            const workerCost = selectedProject.workers.reduce((acc, w) => acc + (w.dailyRate * w.daysSpent), 0);
            const toolsCost = selectedProject.toolsAndTransportCost || 0;
            const otherCost = selectedProject.otherExpensesCost || 0;
            const totalProjectCost = matCost + workerCost + toolsCost + otherCost;
            const netProfit = selectedProject.clientBudget - totalProjectCost;
            const profitPercentage = selectedProject.clientBudget > 0 
              ? Math.round((netProfit / selectedProject.clientBudget) * 100) 
              : 0;

            // Percentage of costs
            const workerPercent = totalProjectCost > 0 ? Math.round((workerCost / totalProjectCost) * 100) : 0;
            const matPercent = totalProjectCost > 0 ? Math.round((matCost / totalProjectCost) * 100) : 0;
            const toolsPercent = totalProjectCost > 0 ? Math.round((toolsCost / totalProjectCost) * 100) : 0;
            const otherPercent = totalProjectCost > 0 ? Math.max(0, 100 - workerPercent - matPercent - toolsPercent) : 0;

            const remainingOnClient = Math.max(0, selectedProject.clientBudget - (selectedProject.paidAmount || 0));

            return (
              <div className="space-y-4">
                {/* Cost & Profit Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 block">التكلفة الإجمالية للمشروع:</span>
                    <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
                      {formatCurrency(totalProjectCost)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">تشمل المواد، أجور العمال، النقل والمعدات</span>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                    <span className="text-xs text-emerald-800 font-semibold block">الربح الصافي للصباغ:</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black font-mono text-emerald-700">
                        {formatCurrency(netProfit)}
                      </span>
                      <span className="text-xs font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-mono">
                        {profitPercentage}% هامش
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 mt-1 block">الميزانية المتفق عليها ناقص مجموع التكاليف</span>
                  </div>
                </div>

                {/* Visual Cost Distribution Bar (Matching Screen 4) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
                    <span>توزيع التكاليف على عناصر المشروع</span>
                    <span className="text-xs font-mono text-slate-500">{formatCurrency(totalProjectCost)}</span>
                  </h4>

                  {/* Multi-colored bar representation */}
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${workerPercent}%` }} className="bg-blue-600 h-full" title={`أجور العمال: ${workerPercent}%`} />
                    <div style={{ width: `${matPercent}%` }} className="bg-amber-500 h-full" title={`المواد: ${matPercent}%`} />
                    <div style={{ width: `${toolsPercent}%` }} className="bg-emerald-500 h-full" title={`النقل والأدوات: ${toolsPercent}%`} />
                    <div style={{ width: `${otherPercent}%` }} className="bg-slate-400 h-full" title={`أخرى: ${otherPercent}%`} />
                  </div>

                  {/* Legend matching mockup */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                      <div>
                        <span className="text-slate-500 block text-[10px]">أجور العمال ({workerPercent}%)</span>
                        <strong className="font-mono text-slate-900">{formatCurrency(workerCost)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <span className="text-slate-500 block text-[10px]">المواد والمستلزمات ({matPercent}%)</span>
                        <strong className="font-mono text-slate-900">{formatCurrency(matCost)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <span className="text-slate-500 block text-[10px]">الأدوات والنقل ({toolsPercent}%)</span>
                        <strong className="font-mono text-slate-900">{formatCurrency(toolsCost)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                      <div>
                        <span className="text-slate-500 block text-[10px]">مصاريف أخرى ({otherPercent}%)</span>
                        <strong className="font-mono text-slate-900">{formatCurrency(otherCost)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Payments Box */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block">حالة دفعات الزبون:</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-slate-800">
                        المدفوع: <strong className="text-emerald-600 font-mono">{formatCurrency(selectedProject.paidAmount || 0)}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-sm font-bold text-slate-800">
                        المتبقي: <strong className="text-rose-600 font-mono">{formatCurrency(remainingOnClient)}</strong>
                      </span>
                    </div>
                  </div>

                  <div>
                    {showPaymentForm ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="المبلغ بالدينار"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono w-32"
                        />
                        <button
                          onClick={() => handleAddPayment(selectedProject.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => setShowPaymentForm(false)}
                          className="px-2 py-1.5 text-slate-400 text-xs"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowPaymentForm(true)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Coins className="w-4 h-4 text-emerald-600" />
                        <span>تسجيل دفعة من الزبون</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section: Materials Used in this Project (Matching Screen 4) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span>المواد والمستلزمات المستخدمة</span>
                    </h4>
                    <span className="text-xs font-mono font-bold text-amber-800">
                      {formatCurrency(matCost)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedProject.materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900 block">{mat.name}</strong>
                          <span className="text-slate-500 font-mono">
                            {mat.quantity} {mat.unit} × {formatCurrency(mat.unitPrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {formatCurrency(mat.quantity * mat.unitPrice)}
                          </span>
                          <button
                            onClick={() => deleteMaterialFromProject(selectedProject.id, mat.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Material Inline Form */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="اسم المادة (دهان، معجون...)"
                      value={newMatName}
                      onChange={(e) => setNewMatName(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:col-span-2"
                    />
                    <input
                      type="number"
                      placeholder="الكمية"
                      min="1"
                      value={newMatQty}
                      onChange={(e) => setNewMatQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <input
                      type="number"
                      placeholder="السعر (دج)"
                      step="100"
                      value={newMatPrice}
                      onChange={(e) => setNewMatPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <button
                      onClick={() => handleAddMaterial(selectedProject.id)}
                      className="sm:col-span-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة المادة للتكلفة</span>
                    </button>
                  </div>
                </div>

                {/* Section: Assigned Workers in this Project (Matching Screen 4) */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>العمال المكلفون بالمشروع</span>
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-900">
                      {formatCurrency(workerCost)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedProject.workers.map((w, idx) => (
                      <div
                        key={w.workerId || idx}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                            👷
                          </div>
                          <div>
                            <strong className="text-slate-900 block">{w.workerName}</strong>
                            <span className="text-slate-500 font-mono">
                              الأجر اليومي: {formatCurrency(w.dailyRate)} • {w.daysSpent} أيام عمل
                            </span>
                          </div>
                        </div>

                        <div className="text-left font-mono font-bold text-blue-900 text-sm">
                          {formatCurrency(w.dailyRate * w.daysSpent)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* PROJECTS LIST VIEW (Matching Mockup 4 & 5) */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <span>إدارة مشاريع الصباغة</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة التكاليف، أجور العمال، ونسب إنجاز المشاريع
              </p>
            </div>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>مشروع جديد</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="ابحث عن مشروع أو عميل أو موقع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-blue-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['الكل', 'قيد التنفيذ', 'مكتمل', 'معلق'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Cards List */}
          <div className="space-y-3">
            {filteredProjects.map((project) => {
              const matCost = project.materials.reduce((acc, m) => acc + (m.quantity * m.unitPrice), 0);
              const workerCost = project.workers.reduce((acc, w) => acc + (w.dailyRate * w.daysSpent), 0);
              const totalCost = matCost + workerCost + (project.toolsAndTransportCost || 0) + (project.otherExpensesCost || 0);
              const netProfit = project.clientBudget - totalCost;

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          project.status === 'قيد التنفيذ' ? 'bg-amber-100 text-amber-800' :
                          project.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {project.title}
                        </h3>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>الزبون: <strong className="text-slate-800">{project.clientName}</strong></span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {project.location}
                        </span>
                        <span>المساحة: {project.areaSqm} م²</span>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-[10px] text-slate-400 block">الميزانية</span>
                      <span className="text-sm sm:text-base font-black font-mono text-blue-900">
                        {formatCurrency(project.clientBudget)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">الإنجاز: {project.progress}%</span>
                      <span className="text-slate-500">الربح الصافي: <strong className="text-emerald-600 font-mono">{formatCurrency(netProfit)}</strong></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          project.progress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Action Indicator */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">التكلفة الإجمالية: <strong className="font-mono text-slate-800">{formatCurrency(totalCost)}</strong></span>
                    <span className="text-blue-600 font-bold flex items-center gap-1">
                      <span>عرض تفاصيل التكاليف والعمال</span>
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
