import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoomMeasurement, MaterialItem, Project } from '../types';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Check, 
  FileText, 
  Sparkles, 
  Maximize2, 
  Layers, 
  DollarSign, 
  AlertCircle,
  Paintbrush
} from 'lucide-react';

export const CostCalculatorView: React.FC = () => {
  const { 
    rooms, 
    addRoom, 
    deleteRoom, 
    clearRooms, 
    formatCurrency, 
    setInvoiceModalProject,
    addProject,
    workers 
  } = useApp();

  // Active step inside calculator
  const [calcStep, setCalcStep] = useState<'area' | 'materials' | 'labor' | 'final'>('area');

  // New Room Input state
  const [roomType, setRoomType] = useState<'غرفة' | 'صالون' | 'بلكون' | 'مطبخ' | 'حمام'>('غرفة');
  const [roomName, setRoomName] = useState('غرفة النوم');
  const [lengthM, setLengthM] = useState<number>(5.0);
  const [widthM, setWidthM] = useState<number>(4.0);
  const [heightM, setHeightM] = useState<number>(2.8);
  const [includeCeiling, setIncludeCeiling] = useState(true);
  const [doorsDeduction, setDoorsDeduction] = useState<number>(2.0);
  const [windowsDeduction, setWindowsDeduction] = useState<number>(1.5);

  // Client Quote & Pricing Settings
  const [clientName, setClientName] = useState('السيد / زبون جديد');
  const [clientPhone, setClientPhone] = useState('+213 6XX XX XX XX');
  const [projectLocation, setProjectLocation] = useState('الجزائر العاصمة');
  const [projectTitle, setProjectTitle] = useState('مشروع دهان شقة سكنية');

  // Materials for this quote
  const [quoteMaterials, setQuoteMaterials] = useState<MaterialItem[]>([
    { id: 'qm1', name: 'دهان فينيل مائي أبيض (سطل 20 لتر)', quantity: 2, unit: 'سطل', unitPrice: 4500, category: 'دهانات' },
    { id: 'qm2', name: 'معجون أكرليك تسوية الحوائط (10 كغ)', quantity: 4, unit: 'كغ', unitPrice: 850, category: 'معجون وتحضير' },
    { id: 'qm3', name: 'برايمر أساس شفاف مائي (5 لتر)', quantity: 2, unit: 'لتر', unitPrice: 1600, category: 'دهانات' },
    { id: 'qm4', name: 'أدوات تغطية وفرش ورولات وشريط لاصق', quantity: 1, unit: 'مجموعة', unitPrice: 5000, category: 'أدوات وفراشي' }
  ]);

  // Labor & Days calculation
  const [estimatedWorkersCount, setEstimatedWorkersCount] = useState(2);
  const [estimatedWorkDays, setEstimatedWorkDays] = useState(4);
  const [averageDailyWage, setAverageDailyWage] = useState(2500);

  // Profit margin & Client advance
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(25); // 25% profit
  const [clientPaidAdvance, setClientPaidAdvance] = useState<number>(30000); // 30,000 دج

  // Room area calculations
  const calculateRoomNetArea = (r: { lengthM: number; widthM: number; heightM: number; includeCeiling: boolean; doorsDeductionM2: number; windowsDeductionM2: number }) => {
    const wallsArea = 2 * (r.lengthM + r.widthM) * r.heightM;
    const ceilingArea = r.includeCeiling ? (r.lengthM * r.widthM) : 0;
    const grossArea = wallsArea + ceilingArea;
    const deductions = (r.doorsDeductionM2 || 0) + (r.windowsDeductionM2 || 0);
    return Math.max(0, grossArea - deductions);
  };

  const totalCalculatedNetArea = rooms.reduce((acc, r) => acc + calculateRoomNetArea(r), 0);

  // Financial aggregates
  const totalMaterialsCost = quoteMaterials.reduce((acc, m) => acc + (m.quantity * m.unitPrice), 0);
  const totalLaborCost = estimatedWorkersCount * estimatedWorkDays * averageDailyWage;
  const transportAndToolsCost = 4000;
  const totalDirectCost = totalMaterialsCost + totalLaborCost + transportAndToolsCost;

  // Final Quote Price with profit margin
  const calculatedProfitAmount = Math.round(totalDirectCost * (profitMarginPercent / 100));
  const suggestedClientBudget = totalDirectCost + calculatedProfitAmount;
  const remainingOnClient = Math.max(0, suggestedClientBudget - clientPaidAdvance);

  // Estimated Paint Requirement (Rule of thumb: 1 Liter coats ~9-10 sqm in 2 coats)
  const estimatedPaintLiters = Math.ceil(totalCalculatedNetArea / 8);

  const handleAddRoom = () => {
    addRoom({
      name: `${roomName} (${roomType})`,
      type: roomType,
      lengthM: Number(lengthM),
      widthM: Number(widthM),
      heightM: Number(heightM),
      doorsDeductionM2: Number(doorsDeduction),
      windowsDeductionM2: Number(windowsDeduction),
      includeCeiling
    });
  };

  const handleAddMaterialItem = () => {
    const newItem: MaterialItem = {
      id: 'qm_' + Date.now(),
      name: 'مادة إضافية',
      quantity: 1,
      unit: 'قطعة',
      unitPrice: 1000,
      category: 'أخرى'
    };
    setQuoteMaterials(prev => [...prev, newItem]);
  };

  const handleUpdateMaterial = (id: string, updates: Partial<MaterialItem>) => {
    setQuoteMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleDeleteMaterial = (id: string) => {
    setQuoteMaterials(prev => prev.filter(m => m.id !== id));
  };

  // Convert current calculation into an Official Printable Invoice & Project
  const handleGenerateInvoice = () => {
    const quoteProject: Project = {
      id: 'quote_' + Date.now(),
      title: projectTitle,
      clientName: clientName,
      clientPhone: clientPhone,
      location: projectLocation,
      areaSqm: Math.round(totalCalculatedNetArea),
      startDate: new Date().toISOString().split('T')[0],
      estimatedDays: estimatedWorkDays,
      status: 'قيد التنفيذ',
      progress: 25,
      clientBudget: suggestedClientBudget,
      paidAmount: clientPaidAdvance,
      workTypes: ['دهان جدران وأسقف بالمتر المربع', 'معجون وصنفرة طبقتين'],
      materials: quoteMaterials,
      workers: [
        { workerId: 'w1', workerName: 'صباغ أول', dailyRate: averageDailyWage, daysSpent: estimatedWorkDays }
      ],
      toolsAndTransportCost: transportAndToolsCost,
      otherExpensesCost: 2000,
      notes: `تم حساب المساحة الصافية بدقة ${Math.round(totalCalculatedNetArea)} م² متضمنة ${rooms.length} غرف ومساحات.`
    };

    setInvoiceModalProject(quoteProject);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <span>حاسبة المساحة وتكاليف الزبائن</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            حساب مسطحات الدهان بدقة، تقدير السلع والعمالة، وإعداد كشف حساب احترافي للزبون
          </p>
        </div>

        <button
          onClick={handleGenerateInvoice}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <FileText className="w-4 h-4" />
          <span>إصدار كشف حساب / فاتورة</span>
        </button>
      </div>

      {/* Step Tabs */}
      <div className="grid grid-cols-4 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setCalcStep('area')}
          className={`py-2 rounded-xl transition-all ${
            calcStep === 'area' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          1. حساب المساحة (م²)
        </button>
        <button
          onClick={() => setCalcStep('materials')}
          className={`py-2 rounded-xl transition-all ${
            calcStep === 'materials' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          2. تكلفة المواد ({formatCurrency(totalMaterialsCost)})
        </button>
        <button
          onClick={() => setCalcStep('labor')}
          className={`py-2 rounded-xl transition-all ${
            calcStep === 'labor' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          3. أجور العمال ({formatCurrency(totalLaborCost)})
        </button>
        <button
          onClick={() => setCalcStep('final')}
          className={`py-2 rounded-xl transition-all ${
            calcStep === 'final' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          4. الحساب النهائي
        </button>
      </div>

      {/* STEP 1: ROOM & AREA CALCULATOR (Matching Mockup 6) */}
      {calcStep === 'area' && (
        <div className="space-y-4">
          {/* Add Room Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              <span>قياس أبعاد الغرفة / المساحة</span>
              <span className="text-xs text-emerald-600 font-semibold">خطوة بحساب المتر المربع</span>
            </h3>

            {/* Room Type Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {(['غرفة', 'صالون', 'بلكون', 'مطبخ', 'حمام'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setRoomType(type);
                    setRoomName(type === 'غرفة' ? 'غرفة النوم' : type);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    roomType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Dimension Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">الطول (متر)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={lengthM}
                  onChange={(e) => setLengthM(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">العرض (متر)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={widthM}
                  onChange={(e) => setWidthM(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">الارتفاع (متر)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={heightM}
                  onChange={(e) => setHeightM(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-blue-500"
                />
              </div>
            </div>

            {/* Deductions (Doors & Windows) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  طرح الأبواب (م² مخصومة من المساحة)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={doorsDeduction}
                  onChange={(e) => setDoorsDeduction(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  طرح النوافذ (م² مخصومة من المساحة)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={windowsDeduction}
                  onChange={(e) => setWindowsDeduction(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-blue-500"
                />
              </div>
            </div>

            {/* Include Ceiling Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeCeiling}
                onChange={(e) => setIncludeCeiling(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>تضمين مساحة السقف في الحساب (+ {widthM * lengthM} م²)</span>
            </label>

            {/* Preview of this room's net area */}
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-amber-900 font-bold block">المساحة الصافية لهذه الغرفة:</span>
                <span className="text-xs text-amber-700">بعد خصم الأبواب والنوافذ</span>
              </div>
              <span className="text-xl font-black font-mono text-amber-900">
                {calculateRoomNetArea({ lengthM, widthM, heightM, includeCeiling, doorsDeductionM2: doorsDeduction, windowsDeductionM2: windowsDeduction }).toFixed(2)} م²
              </span>
            </div>

            <button
              onClick={handleAddRoom}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة هذه الغرفة إلى جدول القياسات</span>
            </button>
          </div>

          {/* List of Added Rooms */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-800">
                الغرف المضافة للقياس ({rooms.length})
              </h4>
              {rooms.length > 0 && (
                <button
                  onClick={clearRooms}
                  className="text-xs text-rose-600 hover:underline"
                >
                  مسح جميع الغرف
                </button>
              )}
            </div>

            {rooms.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                لا توجد غرف مضافة حتى الآن. قم بإدخال أبعاد الغرفة واضغط "إضافة".
              </div>
            ) : (
              <div className="space-y-2">
                {rooms.map((room) => {
                  const net = calculateRoomNetArea(room);
                  return (
                    <div
                      key={room.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-slate-800">{room.name}</strong>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                            {room.lengthM} × {room.widthM} م (ارتفاع {room.heightM}م)
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          خصم أبواب ونوافذ: {(room.doorsDeductionM2 || 0) + (room.windowsDeductionM2 || 0)} م²
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <span className="text-xs text-slate-400 block">الصافي</span>
                          <span className="text-base font-black font-mono text-emerald-600">
                            {net.toFixed(2)} م²
                          </span>
                        </div>
                        <button
                          onClick={() => deleteRoom(room.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total Net Area & Paint Requirements Overview */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-emerald-100 font-semibold block">إجمالي المساحة الصافية للدهان:</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono">{totalCalculatedNetArea.toFixed(1)}</span>
                <span className="text-sm font-bold text-emerald-200">متر مربع (م²)</span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                الكمية التقريبية المطلوبة: <strong>حوالي {estimatedPaintLiters} لتر دهان</strong> (وجهين)
              </p>
            </div>

            <button
              onClick={() => setCalcStep('materials')}
              className="px-5 py-2.5 bg-white text-emerald-800 font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-emerald-50 transition-all self-stretch sm:self-auto text-center"
            >
              الانتقال إلى تسعير المواد ←
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MATERIALS PRICING (Matching Mockup 6) */}
      {calcStep === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                المواد والمستلزمات المقدرة للمشروع
              </h3>
              <p className="text-xs text-slate-500">
                أدخل كميات وأسعار الدهانات واللوازم لحساب التكلفة الإجمالية
              </p>
            </div>
            <button
              onClick={handleAddMaterialItem}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مادة</span>
            </button>
          </div>

          <div className="space-y-3">
            {quoteMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={mat.name}
                    onChange={(e) => handleUpdateMaterial(mat.id, { name: e.target.value })}
                    className="font-bold text-slate-900 text-sm bg-transparent border-b border-dashed border-slate-300 focus:outline-hidden focus:border-blue-500 flex-1 py-1"
                  />
                  <button
                    onClick={() => handleDeleteMaterial(mat.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">الكمية</label>
                    <input
                      type="number"
                      min="1"
                      value={mat.quantity}
                      onChange={(e) => handleUpdateMaterial(mat.id, { quantity: Math.max(1, parseFloat(e.target.value) || 1) })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">السعر الفردي (دج)</label>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={mat.unitPrice}
                      onChange={(e) => handleUpdateMaterial(mat.id, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div className="text-left flex flex-col justify-end">
                    <span className="text-[10px] text-slate-400 block">الإجمالي</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {formatCurrency(mat.quantity * mat.unitPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">إجمالي تكلفة المواد:</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {formatCurrency(totalMaterialsCost)}
              </span>
            </div>
            <button
              onClick={() => setCalcStep('labor')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
            >
              التالي: حساب العمالة ←
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LABOR COST CALCULATION */}
      {calcStep === 'labor' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              تقدير أيام وأجور اليد العاملة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">عدد العمال المطلوبين</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={estimatedWorkersCount}
                  onChange={(e) => setEstimatedWorkersCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">أيام العمل المتوقعة</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={estimatedWorkDays}
                  onChange={(e) => setEstimatedWorkDays(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">متوسط الأجر اليومي للعامل (دج)</label>
                <input
                  type="number"
                  step="100"
                  min="500"
                  value={averageDailyWage}
                  onChange={(e) => setAverageDailyWage(parseInt(e.target.value) || 2000)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-sm"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">
                  إجمالي أجور العمال ({estimatedWorkersCount} عمال × {estimatedWorkDays} أيام × {averageDailyWage} دج):
                </span>
                <span className="text-xs text-blue-600 mt-0.5 block">
                  تضاف مباشرة إلى تكاليف المشروع للزبون
                </span>
              </div>
              <span className="text-2xl font-black font-mono text-blue-900">
                {formatCurrency(totalLaborCost)}
              </span>
            </div>

            <button
              onClick={() => setCalcStep('final')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
            >
              الانتقال إلى الحساب النهائي وعرض السعر للزبون ←
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FINAL STATEMENT & CLIENT QUOTATION (Matching Mockup 6) */}
      {calcStep === 'final' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              الحساب النهائي وعرض السعر للزبون
            </h3>

            {/* Client & Project Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">اسم الزبون / العميل</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">عنوان وموقع المشروع</label>
                <input
                  type="text"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">مسمى المشروع</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>

            {/* Detailed Cost Breakdown Table (Matching Screen 6) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">تكلفة المواد والمستلزمات:</span>
                <span className="font-bold font-mono text-slate-800">{formatCurrency(totalMaterialsCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">أجور العمال واليد العاملة:</span>
                <span className="font-bold font-mono text-slate-800">{formatCurrency(totalLaborCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">مصاريف النقل والأدوات:</span>
                <span className="font-bold font-mono text-slate-800">{formatCurrency(transportAndToolsCost)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
                <span className="text-slate-900">إجمالي التكلفة المباشرة:</span>
                <span className="font-mono text-slate-900">{formatCurrency(totalDirectCost)}</span>
              </div>
            </div>

            {/* Profit Margin & Advance Setting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <label className="text-xs font-bold text-amber-900 block mb-1">
                  نسبة هامش الربح للصباغ (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={profitMarginPercent}
                    onChange={(e) => setProfitMarginPercent(parseInt(e.target.value) || 0)}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <span className="font-black text-amber-900 font-mono text-sm w-12 text-left">
                    {profitMarginPercent}%
                  </span>
                </div>
                <span className="text-[11px] text-amber-700 block mt-1">
                  الربح الصافي: <strong>{formatCurrency(calculatedProfitAmount)}</strong>
                </span>
              </div>

              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200">
                <label className="text-xs font-bold text-blue-900 block mb-1">
                  الدفعة المقدمة (المستلمة من الزبون)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={clientPaidAdvance}
                  onChange={(e) => setClientPaidAdvance(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-xl font-mono font-bold text-blue-900 text-sm"
                />
                <span className="text-[11px] text-blue-700 block mt-1">
                  المتبقي على الزبون: <strong>{formatCurrency(remainingOnClient)}</strong>
                </span>
              </div>
            </div>

            {/* Total Agreed / Client Quote Display */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-blue-200 block">المبلغ الإجمالي المعروض على الزبون:</span>
                <span className="text-3xl font-black font-mono text-amber-400 block mt-1">
                  {formatCurrency(suggestedClientBudget)}
                </span>
                <div className="flex items-center gap-3 mt-1 text-xs text-blue-200">
                  <span>المدفوع: {formatCurrency(clientPaidAdvance)}</span>
                  <span>•</span>
                  <span>المتبقي: {formatCurrency(remainingOnClient)}</span>
                </div>
              </div>

              <button
                onClick={handleGenerateInvoice}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5 stroke-[2.5]" />
                <span>معاينة كشف الحساب والطباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
