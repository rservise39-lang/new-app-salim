import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SabbaghiLogo } from './SabbaghiLogo';
import { X, Printer, Download, Share2, CheckCircle2, MapPin, Phone, Calendar } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { invoiceModalProject, setInvoiceModalProject, formatCurrency, userProfile } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoiceModalProject) return null;

  const project = invoiceModalProject;

  // Financial calculations
  const totalMaterialsCost = project.materials.reduce((acc, m) => acc + (m.quantity * m.unitPrice), 0);
  const totalLaborCost = project.workers.reduce((acc, w) => acc + (w.dailyRate * w.daysSpent), 0);
  const toolsAndTransport = project.toolsAndTransportCost || 0;
  const otherExpenses = project.otherExpensesCost || 0;
  const totalCost = totalMaterialsCost + totalLaborCost + toolsAndTransport + otherExpenses;
  const agreedTotal = project.clientBudget;
  const paidAmount = project.paidAmount || 0;
  const remainingAmount = Math.max(0, agreedTotal - paidAmount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">كشف حساب وتكاليف الزبون (فاتورة)</span>
            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full text-white font-mono">
              #{project.id.slice(-6)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / PDF</span>
            </button>
            <button
              onClick={() => setInvoiceModalProject(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-800">
            <div className="flex items-center gap-3">
              <SabbaghiLogo size="sm" />
              <div>
                <h3 className="text-lg font-black text-blue-900 leading-tight">مؤسسة صباغي لأعمال الطلاء والديكور</h3>
                <p className="text-xs text-slate-500">حرفيون معتمدون في أعمال الدهان، الديكور والتشطيب الداخلي والخارجي</p>
              </div>
            </div>

            <div className="text-right sm:text-left text-xs text-slate-600 space-y-0.5">
              <div className="font-bold text-slate-900 text-sm">كشف حساب / عرض تكاليف</div>
              <div>التاريخ: <strong className="font-mono">{new Date().toLocaleDateString('ar-DZ')}</strong></div>
              <div>رقم الكشف: <strong className="font-mono">SBG-{project.id.slice(-6)}</strong></div>
            </div>
          </div>

          {/* Parties Info (Contractor & Client) */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block font-bold">معلومات الصباغ المشرف:</span>
              <strong className="text-sm font-black text-slate-900 block mt-0.5">{userProfile.name}</strong>
              <div className="text-slate-600 mt-1 space-y-0.5">
                <div>المهنة: {userProfile.role}</div>
                <div>الهاتف: <span className="font-mono">{userProfile.phone}</span></div>
                <div>المنطقة: {userProfile.wilaya}</div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block font-bold">معلومات الزبون / المشروع:</span>
              <strong className="text-sm font-black text-slate-900 block mt-0.5">{project.clientName}</strong>
              <div className="text-slate-600 mt-1 space-y-0.5">
                <div>المشروع: <strong>{project.title}</strong></div>
                <div>الموقع: {project.location}</div>
                <div>المساحة: <strong className="font-mono">{project.areaSqm} م²</strong></div>
              </div>
            </div>
          </div>

          {/* Itemized Materials Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800">
              أولاً: تكاليف المواد ومستلزمات الدهان
            </h4>
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2">البيان / المادة</th>
                  <th className="p-2 text-center">الكمية</th>
                  <th className="p-2 text-center">السعر الفردي</th>
                  <th className="p-2 text-left">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {project.materials.map((mat, idx) => (
                  <tr key={mat.id || idx}>
                    <td className="p-2 font-medium text-slate-800">{mat.name}</td>
                    <td className="p-2 text-center font-mono">{mat.quantity} {mat.unit}</td>
                    <td className="p-2 text-center font-mono">{formatCurrency(mat.unitPrice)}</td>
                    <td className="p-2 text-left font-bold font-mono text-slate-900">
                      {formatCurrency(mat.quantity * mat.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <td colSpan={3} className="p-2 text-slate-800">إجمالي المواد والمستلزمات:</td>
                  <td className="p-2 text-left font-mono text-blue-900">{formatCurrency(totalMaterialsCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Second: Labor & Expenses Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800">
              ثانياً: مصاريف اليد العاملة والخدمات اللوجستية
            </h4>
            <div className="border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">أجور اليد العاملة والتشطيب ({project.workers.length} عمال / صباغين):</span>
                <span className="font-mono font-bold">{formatCurrency(totalLaborCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">أدوات العمل، التغطية ومصاريف النقل:</span>
                <span className="font-mono font-bold">{formatCurrency(toolsAndTransport)}</span>
              </div>
              {otherExpenses > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">مصاريف طارئة ومستلزمات أخرى:</span>
                  <span className="font-mono font-bold">{formatCurrency(otherExpenses)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Final Financial Totals (Matching Mockup 6) */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-700">
              <span>التكلفة الفعلية المقدرة:</span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(totalCost)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-400">المبلغ الإجمالي المتفق عليه مع الزبون:</span>
              <span className="text-2xl font-black font-mono text-amber-400">{formatCurrency(agreedTotal)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block">الدفعة المستلمة (المدفوع):</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="text-left">
                <span className="text-slate-400 block">المبلغ المتبقي للدفع:</span>
                <span className="font-bold font-mono text-rose-300 text-sm">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signature & Seal */}
          <div className="pt-4 flex items-end justify-between text-xs text-slate-600 border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-800">ملاحظات وشروط الضمان:</p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                نضمن جودة الطلاء ونظافة موقع العمل بعد الانتهاء. جميع المواد المستعملة مطابقة لمعايير الجودة ومقاومة الرطوبة.
              </p>
            </div>

            <div className="text-center p-3 border-2 border-dashed border-blue-300 rounded-2xl min-w-[140px]">
              <span className="text-[10px] text-blue-700 font-bold block mb-4">ختم وتوقيع الصباغ</span>
              <span className="font-black text-blue-900 font-mono text-sm tracking-wider">صـبـاغـي ✓</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            جاهز للطباعة أو الحفظ كملف PDF
          </span>
          <button
            onClick={() => setInvoiceModalProject(null)}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
