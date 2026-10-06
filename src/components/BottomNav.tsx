import React from 'react';
import { useApp, AppTab } from '../context/AppContext';
import { Home, Briefcase, Users, Calculator, UserCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, requests } = useApp();
  const pendingRequestsCount = requests.filter(r => r.status === 'قيد الانتظار').length;

  const navItems: { tab: AppTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'dashboard', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
    { tab: 'projects', label: 'المشاريع', icon: <Briefcase className="w-5 h-5" /> },
    { tab: 'workers', label: 'العمال', icon: <Users className="w-5 h-5" /> },
    { tab: 'calculator', label: 'حاسبة التكاليف', icon: <Calculator className="w-5 h-5" /> },
    { tab: 'clients', label: 'الزبائن', icon: <UserCheck className="w-5 h-5" />, badge: pendingRequestsCount }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`relative flex flex-col items-center justify-center py-1 transition-all duration-150 min-h-[44px] ${
                isActive ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'font-bold text-blue-600' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
