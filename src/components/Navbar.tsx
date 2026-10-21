
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';
import { SabbaghiLogo } from './SabbaghiLogo';
import {
  Bell,
  ChevronDown,
  CheckCircle2,
  Smartphone,
  Check,
  LogOut,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const Navbar: React.FC = () => {
  const {
    isAvailableForWork,
    setIsAvailableForWork,
    userProfile,
    requests,
    setActiveTab,
    setShowAuthModal,
    setShowPWAInstallModal,
  } = useApp();

  const { isInstalled } = usePWAInstall();

  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'قيد الانتظار'
  ).length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowAuthModal(true);
    } catch (error) {
      console.error('[AUTH] تعذر تسجيل الخروج:', error);
      window.alert('تعذر تسجيل الخروج. تحقق من الاتصال وحاول مرة أخرى.');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* الشعار والهوية */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 text-right group transition-transform active:scale-95"
            title="الرئيسية"
          >
            <SabbaghiLogo size="sm" />
            <div className="hidden sm:block">
              <span className="text-xs text-blue-600 font-semibold block leading-tight">
                منصة الصباغة الذكية
              </span>
              <span className="text-[11px] text-slate-400">
                حساب الأجور والتكاليف
              </span>
            </div>
          </button>
        </div>

        {/* حالة توفر الصباغ للعمل */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isAvailableForWork ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400" />
              )}
            </span>

            <span className="text-xs font-semibold text-slate-700 hidden md:inline">
              {isAvailableForWork
                ? 'متوفر لاستقبال طلبات جديدة'
                : 'مشغول حالياً بالمشاريع'}
            </span>

            <button
              type="button"
              onClick={() => setIsAvailableForWork(!isAvailableForWork)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isAvailableForWork ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              title="تغيير حالة التوفر"
              aria-label="تغيير حالة التوفر"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  isAvailableForWork ? 'translate-x-0' : '-translate-x-4'
                }`}
              />
            </button>
          </div>
        </div>

        {/* التثبيت والإشعارات والحساب والخروج */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* تثبيت التطبيق على الهاتف */}
          <button
            type="button"
            onClick={() => setShowPWAInstallModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isInstalled
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 active:scale-95'
            }`}
            title="حفظ وتثبيت التطبيق على الهاتف"
          >
            {isInstalled ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">مثبت بالهاتف</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-300" />
                <span className="inline">احفظ على الهاتف</span>
              </>
            )}
          </button>

          {/* الإشعارات والطلبات */}
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="الطلبات والإشعارات"
            aria-label="الطلبات والإشعارات"
          >
            <Bell className="w-5 h-5" />
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {/* معلومات الحساب */}
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all text-right"
            title="معلومات الحساب"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-xs text-xs">
              <span className="flex items-center justify-center">👷</span>
            </div>

            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                {userProfile.name}
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
              </div>
              <div className="text-[10px] text-amber-600 font-medium">
                ★ {userProfile.rating} ({userProfile.ratingCount} تقييم)
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* تسجيل الخروج من Firebase */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white p-2 text-rose-600 transition hover:bg-rose-50 sm:px-3"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden text-sm font-semibold sm:inline">
              خروج
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
