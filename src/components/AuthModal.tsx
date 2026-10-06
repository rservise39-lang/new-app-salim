import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SabbaghiLogo } from './SabbaghiLogo';
import { X, CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck, UserCheck, Lock } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, userProfile, setUserProfile } = useApp();

  const [authStep, setAuthStep] = useState<'choose_type' | 'login' | 'register_painter' | 'register_success'>('choose_type');
  const [selectedRole, setSelectedRole] = useState<'painter' | 'client'>('painter');

  // Form states
  const [fullName, setFullName] = useState('أحمد سعيد');
  const [phone, setPhone] = useState('0661234567');
  const [email, setEmail] = useState('ahmed.sabbagh@mail.com');
  const [password, setPassword] = useState('••••••••');
  const [wilaya, setWilaya] = useState('الجزائر العاصمة');
  const [experienceYears, setExperienceYears] = useState('5');

  if (!showAuthModal) return null;

  const handleSelectRole = (role: 'painter' | 'client') => {
    setSelectedRole(role);
    setAuthStep(role === 'painter' ? 'register_painter' : 'login');
  };

  const handleCompleteRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile((prev: any) => ({
      ...prev,
      name: fullName,
      phone: phone.startsWith('+213') ? phone : '+213 ' + phone,
      wilaya: wilaya,
      accountType: selectedRole,
      role: selectedRole === 'painter' ? 'صباغ محترف' : 'زبون معتمد'
    }));
    setAuthStep('register_success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 relative animate-fadeIn my-6">
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 left-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: CHOOSE ACCOUNT TYPE (Matching Mockup 3) */}
        {authStep === 'choose_type' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center pt-2">
              <SabbaghiLogo size="md" showSubtitle={false} />
              <h2 className="text-2xl font-black text-slate-900 mt-3">اختر نوع الحساب</h2>
              <p className="text-xs text-slate-500 mt-1">
                لبدء رحلتك معنا، الرجاء اختيار نوع الحساب المناسب لك
              </p>
            </div>

            <div className="space-y-3">
              {/* Option A: Painter / Worker */}
              <button
                onClick={() => handleSelectRole('painter')}
                className="w-full text-right p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 hover:bg-amber-100/50 transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                    <span>صبّاغ / عامل</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[210px]">
                    إذا كنت صباغاً أو عاملاً في مجال الدهان، قم بإنشاء حسابك لإدارة مشاريعك وحساب أجورك.
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  👷
                </div>
              </button>

              {/* Option B: Client */}
              <button
                onClick={() => handleSelectRole('client')}
                className="w-full text-right p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/40 hover:bg-blue-100/40 transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                    <span>زبون / صاحب منزل</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[210px]">
                    إذا كنت ترغب في طلب خدمة صباغة، حساب تكلفة دهان شقتك وطلب صباغين محترفين.
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  🏠
                </div>
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">لديك حساب بالفعل؟ </span>
              <button
                onClick={() => setAuthStep('login')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOGIN (Matching Mockup 1 & 7) */}
        {authStep === 'login' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center">
              <SabbaghiLogo size="md" />
              <h2 className="text-2xl font-black text-slate-900 mt-3">تسجيل الدخول</h2>
              <p className="text-xs text-slate-500 mt-1">مرحباً بك من جديد، سجل دخولك للمتابعة</p>
            </div>

            <form onSubmit={handleCompleteRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم الهاتف أو البريد الإلكتروني *</label>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <span className="px-3 py-2 bg-slate-100 text-slate-600 font-mono text-xs border-l border-slate-200 flex items-center">
                    +213
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="6X XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-slate-900 font-mono text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">كلمة المرور *</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('يمكنك استعادة كلمة المرور عبر رمز SMS'); }} className="text-[11px] text-blue-600 hover:underline">
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" defaultChecked className="rounded text-blue-600" />
                <label htmlFor="remember" className="text-slate-600 font-medium cursor-pointer">
                  تذكرني على هذا الجهاز
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all mt-2"
              >
                تسجيل الدخول
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">ليس لديك حساب؟ </span>
              <button
                onClick={() => setAuthStep('choose_type')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REGISTER PAINTER (Matching Mockup 1 & 7) */}
        {authStep === 'register_painter' && (
          <div className="p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="text-center">
              <SabbaghiLogo size="sm" />
              <h2 className="text-xl font-black text-slate-900 mt-2">إنشاء حساب صبّاغ / عامل</h2>
              <p className="text-xs text-slate-500 mt-0.5">انضم إلى منصة صباغي وابدأ باستقبال الطلبات</p>
            </div>

            <form onSubmit={handleCompleteRegister} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم الهاتف *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المنطقة / الولاية *</label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="الجزائر العاصمة">16 - الجزائر العاصمة</option>
                    <option value="وهران">31 - وهران</option>
                    <option value="قسنطينة">25 - قسنطينة</option>
                    <option value="البليدة">09 - البليدة</option>
                    <option value="سيدي بلعباس">22 - سيدي بلعباس</option>
                    <option value="تيبازة">42 - تيبازة</option>
                    <option value="بومرداس">35 - بومرداس</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">سنوات الخبرة</label>
                  <input
                    type="number"
                    min="1"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>إنشاء الحساب</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS REGISTRATION (Matching Mockup 1 & 3) */}
        {authStep === 'register_success' && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="pt-2">
              <SabbaghiLogo size="md" />
            </div>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-xs">
              ✓
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">تم إنشاء حسابك بنجاح!</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                أهلاً بك في منصة صباغي. يمكنك الآن البدء في استقبال الطلبات وحساب أجور عمالك وتكاليف المشاريع.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-400 block">نوع الحساب:</span>
              <strong className="text-sm font-bold text-slate-800">
                {selectedRole === 'painter' ? 'صباغ / مقاول دهان' : 'زبون / طالب خدمة'}
              </strong>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              الذهاب إلى لوحة التحكم الرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
