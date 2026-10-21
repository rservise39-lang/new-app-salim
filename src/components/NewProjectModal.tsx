import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Briefcase, Plus } from 'lucide-react';

type PricingType = 'daily' | 'sqm' | 'fixed';

export const NewProjectModal: React.FC = () => {
  const {
    showNewProjectModal,
    setShowNewProjectModal,
    addProject,
    workers,
  } = useApp();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+213 6');
  const [location, setLocation] = useState('الجزائر العاصمة');
  const [areaSqm, setAreaSqm] = useState(100);
  const [estimatedDays, setEstimatedDays] = useState(7);
  const [dailyRate, setDailyRate] = useState(3000);
  const [pricePerSqm, setPricePerSqm] = useState(500);
  const [fixedBudget, setFixedBudget] = useState(90000);
  const [pricingType, setPricingType] = useState<PricingType>('daily');
  const [propertyType, setPropertyType] = useState('شقة سكنية');
  const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState('');

  const clientBudget =
    pricingType === 'daily'
      ? dailyRate * estimatedDays
      : pricingType === 'sqm'
        ? areaSqm * pricePerSqm
        : fixedBudget;

  if (!showNewProjectModal) return null;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (saving) return;

  if (!title.trim() || !clientName.trim()) {
    setSaveError('يرجى إدخال اسم المشروع واسم العميل.');
    return;
  }

  if (
    !Number.isFinite(clientBudget) ||
    clientBudget < 0 ||
    !Number.isFinite(areaSqm) ||
    areaSqm < 0 ||
    !Number.isFinite(estimatedDays) ||
    estimatedDays < 1
  ) {
    setSaveError('تحقق من المساحة والمدة والميزانية المدخلة.');
    return;
  }

  setSaving(true);
  setSaveError('');

  try {
    await addProject({
      title: title.trim(),
      clientName: clientName.trim(),
      clientPhone,
      location,
      areaSqm: Number(areaSqm),
      startDate: new Date().toISOString().split('T')[0],
      estimatedDays: Number(estimatedDays),
      status: 'قيد التنفيذ',
      progress: 0,
      clientBudget: Number(clientBudget),
      pricingType,
      ...(pricingType === 'daily'
        ? { dailyRate: Number(dailyRate) }
        : {}),
      ...(pricingType === 'sqm'
        ? { pricePerSqm: Number(pricePerSqm) }
        : {}),
      paidAmount: 0,
      propertyType,
      workTypes: ['دهان الجدران', 'دهان السقف', 'معجون وصنفرة'],
      materials: [
        {
          id: 'm_auto_1',
          name: 'دهان أساس وجدران',
          quantity: Math.ceil(areaSqm * 0.2),
          unit: 'لتر',
          unitPrice: 600,
          category: 'دهانات',
        },
        {
          id: 'm_auto_2',
          name: 'معجون حوائط تسوية',
          quantity: 20,
          unit: 'كغ',
          unitPrice: 150,
          category: 'معجون وتحضير',
        },
        {
          id: 'm_auto_3',
          name: 'فرش ورولات ومعدات',
          quantity: 1,
          unit: 'مجموعة',
          unitPrice: 4000,
          category: 'أدوات وفراشي',
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
      notes: '',
    });

    setShowNewProjectModal(false);
    setTitle('');
    setClientName('');
    setClientPhone('+213 6');
    setAreaSqm(100);
    setEstimatedDays(7);
    setDailyRate(3000);
    setPricePerSqm(500);
    setFixedBudget(90000);
    setPricingType('daily');
    setPropertyType('شقة سكنية');
  } catch (error) {
    console.error('[PROJECT] تعذر حفظ المشروع:', error);
    setSaveError(
      error instanceof Error
        ? `تعذر حفظ المشروع: ${error.message}`
        : 'تعذر حفظ المشروع. تحقق من الاتصال والصلاحيات ثم حاول مجددًا.'
    );
  } finally {
    setSaving(false);
  }
};


  const inputClass =
    'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-blue-500';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">إضافة مشروع صباغة جديد</h3>
          </div>

          <button
            type="button"
            onClick={() => setShowNewProjectModal(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              اسم المشروع *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: تجديد شقة سكنية - بئر خادم"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                اسم العميل *
              </label>
              <input
                type="text"
                required
                placeholder="اسم الزبون"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                رقم الهاتف
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              الموقع / الولاية
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              طريقة حساب أجرة المشروع *
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'daily', label: 'باليومية' },
                { value: 'sqm', label: 'بالمتر المربع' },
                { value: 'fixed', label: 'مبلغ إجمالي' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPricingType(option.value as PricingType)}
                  className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                    pricingType === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {pricingType === 'daily' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  تكلفة اليوم (دج)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  مدة التنفيذ (أيام)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={estimatedDays}
                  onChange={(e) =>
                    setEstimatedDays(Math.max(1, Number(e.target.value)))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {pricingType === 'sqm' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    المساحة (م²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={areaSqm}
                    onChange={(e) => setAreaSqm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    سعر المتر (دج)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={pricePerSqm}
                    onChange={(e) => setPricePerSqm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {pricingType === 'fixed' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                المبلغ المتفق عليه (دج)
              </label>
              <input
                type="number"
                min="0"
                required
                value={fixedBudget}
                onChange={(e) => setFixedBudget(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          )}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-bold text-blue-800 mb-1">
              الميزانية المتفق عليها
            </div>
            <div className="text-2xl font-black text-blue-900">
              {clientBudget.toLocaleString('ar-DZ')} دج
            </div>
            <div className="text-xs text-blue-700 mt-1">
              {pricingType === 'daily'
                ? `${dailyRate.toLocaleString('ar-DZ')} × ${estimatedDays} أيام`
                : pricingType === 'sqm'
                  ? `${areaSqm} م² × ${pricePerSqm.toLocaleString('ar-DZ')} دج`
                  : 'المبلغ الذي أدخلته مباشرة'}
            </div>
          </div>

          {pricingType !== 'daily' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                مدة التنفيذ المقدرة (أيام)
              </label>
              <input
                type="number"
                min="1"
                value={estimatedDays}
                onChange={(e) =>
                  setEstimatedDays(Math.max(1, Number(e.target.value)))
                }
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              نوع العقار
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={inputClass}
            >
              <option value="شقة سكنية">شقة سكنية</option>
              <option value="منزل">منزل</option>
              <option value="فيلا">فيلا</option>
              <option value="محل تجاري">محل تجاري</option>
              <option value="مكتب">مكتب</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowNewProjectModal(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>حفظ وبدء المشروع</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
