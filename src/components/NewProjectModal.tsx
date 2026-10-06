import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Briefcase, Plus } from 'lucide-react';

export const NewProjectModal: React.FC = () => {
  const { showNewProjectModal, setShowNewProjectModal, addProject, workers } = useApp();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+213 6');
  const [location, setLocation] = useState('الجزائر العاصمة');
  const [areaSqm, setAreaSqm] = useState(100);
  const [clientBudget, setClientBudget] = useState(90000);
  const [estimatedDays, setEstimatedDays] = useState(7);
  const [propertyType, setPropertyType] = useState('شقة سكنية');

  if (!showNewProjectModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    addProject({
      title,
      clientName,
      clientPhone,
      location,
      areaSqm: Number(areaSqm),
      startDate: new Date().toISOString().split('T')[0],
      estimatedDays: Number(estimatedDays),
      status: 'قيد التنفيذ',
      progress: 0,
      clientBudget: Number(clientBudget),
      paidAmount: 0,
      propertyType,
      workTypes: ['دهان الجدران', 'دهان السقف', 'معجون وصنفرة'],
      materials: [
        { id: 'm_auto_1', name: 'دهان أساس وجدران', quantity: Math.ceil(areaSqm * 0.2), unit: 'لتر', unitPrice: 600, category: 'دهانات' },
        { id: 'm_auto_2', name: 'معجون حوائط تسوية', quantity: 20, unit: 'كغ', unitPrice: 150, category: 'معجون وتحضير' },
        { id: 'm_auto_3', name: 'فرش ورولات ومعدات', quantity: 1, unit: 'مجموعة', unitPrice: 4000, category: 'أدوات وفراشي' }
      ],
      workers: [
        { workerId: workers[0]?.id || 'w1', workerName: workers[0]?.name || 'صباغ أول', dailyRate: 2500, daysSpent: 0 }
      ],
      toolsAndTransportCost: 4000,
      otherExpensesCost: 2000,
      notes: ''
    });

    setShowNewProjectModal(false);
    // Reset form
    setTitle('');
    setClientName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">إضافة مشروع صباغة جديد</h3>
          </div>
          <button
            onClick={() => setShowNewProjectModal(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">اسم المشروع *</label>
            <input
              type="text"
              required
              placeholder="مثال: تجديد شقة سكنية - بئر خادم"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">اسم العميل *</label>
              <input
                type="text"
                required
                placeholder="اسم الزبون"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الموقع / الولاية</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">المساحة (م²)</label>
              <input
                type="number"
                min="10"
                value={areaSqm}
                onChange={(e) => setAreaSqm(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الميزانية المتفق عليها (دج)</label>
              <input
                type="number"
                step="1000"
                value={clientBudget}
                onChange={(e) => setClientBudget(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-blue-900 focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">مدة التنفيذ المقدرة (أيام)</label>
              <input
                type="number"
                min="1"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-blue-500"
              />
            </div>
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
