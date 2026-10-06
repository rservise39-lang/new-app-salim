import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserCheck, 
  Phone, 
  MapPin, 
  Plus, 
  Clock, 
  Check, 
  X, 
  MessageSquare, 
  Calendar, 
  Paintbrush, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const {
    clients,
    requests,
    acceptRequest,
    rejectRequest,
    formatCurrency,
    setActiveTab,
    setSelectedProjectId,
    projects
  } = useApp();

  const [activeTab, setActiveClientsTab] = useState<'requests' | 'directory'>('requests');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  const pendingRequests = requests.filter(r => r.status === 'قيد الانتظار');

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <span>الزبائن والطلبات الجديدة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            استقبال طلبات الزبائن، معاينة عروض العمل، ودليل العملاء الدائمين
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveClientsTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'requests' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <span>طلبات الزبائن</span>
            {pendingRequests.length > 0 && (
              <span className="mr-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveClientsTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'directory' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            دليل الزبائن ({clients.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: CLIENT REQUESTS (Matching Mockup 7) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              الطلبات الواردة من منصة صباغي ({requests.length})
            </h3>
            <span className="text-xs text-slate-500">
              يمكنك قبول الطلب لتحويله مباشرة إلى مشروع نشط
            </span>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'قيد الانتظار' ? 'bg-amber-100 text-amber-900' :
                        req.status === 'مقبولة' ? 'bg-emerald-100 text-emerald-900' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{req.timeAgo}</span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 mt-1">
                      {req.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
                      <span>صاحب الطلب: <strong>{req.clientName}</strong></span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {req.location}
                      </span>
                      <span>المساحة: <strong>{req.areaSqm} م²</strong></span>
                    </div>
                  </div>

                  <div className="text-left shrink-0 bg-blue-50/70 p-2.5 rounded-2xl border border-blue-200/60">
                    <span className="text-[10px] text-slate-500 block">الميزانية المعروضة</span>
                    <span className="text-base font-black font-mono text-blue-900">
                      {formatCurrency(req.budgetOffer)}
                    </span>
                  </div>
                </div>

                {/* Request details info pills */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Paintbrush className="w-3.5 h-3.5 text-blue-600" />
                    <span>نوع العمل: <strong>{req.paintType}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>تاريخ التنفيذ المفضل: <strong>{req.preferredDate}</strong></span>
                  </div>
                  <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                    ملاحظات الزبون: {req.notes}
                  </div>
                </div>

                {/* Actions */}
                {req.status === 'قيد الانتظار' ? (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      تخطي الطلب
                    </button>
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>قبول الطلب وبدء المشروع</span>
                    </button>
                  </div>
                ) : req.status === 'مقبولة' ? (
                  <div className="pt-1 flex items-center justify-between text-xs text-emerald-700 font-bold">
                    <span>✓ تم قبول هذا الطلب وهو الآن مدرج في مشاريعك النشطة</span>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="text-blue-600 underline"
                    >
                      الذهاب للمشاريع
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: CLIENTS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              قائمة العملاء الدائمين
            </h3>
            <button
              onClick={() => setShowAddClientForm(!showAddClientForm)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{client.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{client.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    {client.totalProjects} مشاريع
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.address}</span>
                  </div>
                  {client.notes && (
                    <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-xl">
                      {client.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>اتصال</span>
                  </a>
                  <a
                    href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
