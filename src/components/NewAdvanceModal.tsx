import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const NewAdvanceModal: React.FC = () => {
  const { showNewAdvanceModal, setShowNewAdvanceModal, addAdvanceOrDeduction, workers } = useApp();

  const [workerId, setWorkerId] = useState(workers[0]?.id || '');
  const [type, setType] = useState<'سلفة' | 'خصم'>('سلفة');
  const [amount, setAmount] = useState(1000);
  const [reason, setReason] = useState('مصاريف شخصية مستعجلة');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!showNewAdvanceModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find(w => w.id === workerId);
    if (!worker || !amount) return;

    addAdvanceOrDeduction({
      workerId: worker.id,
      workerName: worker.name,
      type,
      amount: Number(amount),
      date,
      reason
    });

    setShowNewAdvanceModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">تسجيل سلفة نقدية أو خصم</h3>
          </div>
          <button
            onClick={() => setShowNewAdvanceModal(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('سلفة')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'سلفة' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>سلفة نقدية (-)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('خصم')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'خصم' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>خصم / غياب (-)</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">اختر العامل المستفيد *</label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-blue-500"
            >
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role} - أجر {w.dailyWage} دج)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ (دج) *</label>
              <input
                type="number"
                step="500"
                min="100"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">سبب السلفة أو الخصم</label>
            <input
              type="text"
              placeholder="مثال: سلفة لمصاريف طبية / غياب يوم الثلاثاء"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-blue-500"
            />
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            💡 سيتم خصم هذا المبلغ تلقائياً من الأجر الأسبوعي للعامل عند تصفية الأجور.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowNewAdvanceModal(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              تسجيل وحفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
