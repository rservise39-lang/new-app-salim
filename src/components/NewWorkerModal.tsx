import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserPlus } from 'lucide-react';

export const NewWorkerModal: React.FC = () => {
  const { showNewWorkerModal, setShowNewWorkerModal, addWorker } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+213 6');
  const [dailyWage, setDailyWage] = useState(2500);
  const [role, setRole] = useState('صباغ محترف');
  const [daysAssigned, setDaysAssigned] = useState(5);

  if (!showNewWorkerModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addWorker({
      name,
      phone,
      dailyWage: Number(dailyWage),
      role,
      status: 'نشط',
      daysAssignedThisWeek: Number(daysAssigned)
    });

    setShowNewWorkerModal(false);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">إضافة عامل / صباغ جديد</h3>
          </div>
          <button
            onClick={() => setShowNewWorkerModal(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">اسم العامل بالكامل *</label>
            <input
              type="text"
              required
              placeholder="مثال: كمال بوزيد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">رقم الهاتف</label>
            <input
              type="text"
              placeholder="+213 6XX XX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الأجر اليومي (دج) *</label>
              <input
                type="number"
                step="100"
                min="500"
                value={dailyWage}
                onChange={(e) => setDailyWage(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-blue-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الصفة / التخصص</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-blue-500"
              >
                <option value="صباغ محترف">صباغ محترف</option>
                <option value="صباغ ديكور">صباغ ديكور</option>
                <option value="فني معجون وصنفرة">فني معجون وصنفرة</option>
                <option value="مساعد صباغ">مساعد صباغ</option>
                <option value="مساعد تحضير وتنظيف">مساعد تحضير وتنظيف</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">أيام العمل المبدئية بالأسبوع</label>
            <input
              type="number"
              min="1"
              max="7"
              value={daysAssigned}
              onChange={(e) => setDaysAssigned(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowNewWorkerModal(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة العامل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
