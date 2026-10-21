
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { X, ArrowRight, Eye, EyeOff } from 'lucide-react';

import { auth, db } from '../firebase';
import { useApp } from '../context/AppContext';
import { SabbaghiLogo } from './SabbaghiLogo';

type AuthStep = 'choice' | 'login' | 'register_painter' | 'register_success';
type AccountRole = 'painter' | 'client';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, setUserProfile } = useApp();

  const [authStep, setAuthStep] = useState<AuthStep>('choice');
  const [selectedRole, setSelectedRole] = useState<AccountRole>('painter');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wilaya, setWilaya] = useState('الجزائر العاصمة');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const closeModal = () => {
    setShowAuthModal(false);
    clearMessages();
  };

  const getFirebaseError = (error: unknown): string => {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error
        ? String(error.code)
        : '';

    switch (code) {
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صحيح.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل من قبل.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.';
      case 'auth/too-many-requests':
        return 'محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.';
      case 'auth/network-request-failed':
        return 'تعذر الاتصال بالإنترنت. تحقق من الاتصال وحاول مجددًا.';
      case 'permission-denied':
      case 'firestore/permission-denied':
        return 'تم إنشاء حساب Firebase، لكن قواعد Firestore لا تسمح بحفظ بياناته.';
      default:
        return error instanceof Error
          ? `تعذر إكمال العملية: ${error.message}`
          : 'حدث خطأ غير متوقع. حاول مرة أخرى.';
    }
  };

  // تسجيل الدخول
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password) {
      setErrorMessage('أدخل البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const firebaseUser = credential.user;
      console.log('[AUTH] تم إنشاء حساب:', firebaseUser.uid);
      console.log('[FIRESTORE] بدء حفظ بيانات المستخدم...');

      setUserProfile((prev: any) => ({
        ...prev,
        name: firebaseUser.displayName || prev.name,
        email: firebaseUser.email || email.trim().toLowerCase(),
        role:
          selectedRole === 'painter'
            ? 'صباغ محترف'
            : 'زبون',
        accountType: selectedRole,
      }));

      setShowAuthModal(false);
      setAuthStep('choice');
      setPassword('');
    } catch (error) {
      setErrorMessage(getFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // إنشاء حساب صباغ وحفظ ملفه في Firestore
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();

    if (!fullName.trim()) {
      setErrorMessage('أدخل الاسم الكامل.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('أدخل البريد الإلكتروني.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.');
      return;
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const firebaseUser = credential.user;

      // تحديث اسم المستخدم في Firebase Authentication
      await updateProfile(firebaseUser, {
        displayName: fullName.trim(),
      });

      // حفظ معلومات الحساب في مستند خاص بمعرّف المستخدم
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {
          uid: firebaseUser.uid,
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          wilaya,
          role: 'صباغ محترف',
          accountType: 'painter',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }

      );
          console.log('[FIRESTORE] تم حفظ بيانات المستخدم بنجاح:', firebaseUser.uid);
      setUserProfile((prev: any) => ({
        ...prev,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        wilaya,
        role: 'صباغ محترف',
        accountType: 'painter',
      }));

      setSuccessMessage(
        'تم إنشاء الحساب وحفظ بياناته بنجاح.'
      );
      setAuthStep('register_success');
    } catch (error) {
      setErrorMessage(getFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // استعادة كلمة المرور
  const handlePasswordReset = async () => {
    clearMessages();

    if (!email.trim()) {
      setErrorMessage(
        'أدخل بريدك الإلكتروني أولًا لاستعادة كلمة المرور.'
      );
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim().toLowerCase()
      );

      setSuccessMessage(
        'أرسلنا رابط استعادة كلمة المرور إلى بريدك الإلكتروني.'
      );
    } catch (error) {
      console.error('[PASSWORD RESET ERROR]', error);
      setErrorMessage(getFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  if (!showAuthModal) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      dir="rtl"
      onClick={closeModal}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="إغلاق"
          className="absolute left-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={22} />
        </button>

        <div className="mb-6 flex flex-col items-center pt-3">
          <SabbaghiLogo />

          <h2 className="mt-4 text-2xl font-extrabold text-[#123B66]">
            {authStep === 'choice' && 'مرحبًا بك في صباغي'}
            {authStep === 'login' && 'تسجيل الدخول'}
            {authStep === 'register_painter' && 'إنشاء حساب صباغ'}
            {authStep === 'register_success' && 'تم إنشاء الحساب'}
          </h2>

          <p className="mt-2 text-center text-sm leading-6 text-slate-500">
            {authStep === 'choice' &&
              'اختر نوع الحساب للمتابعة'}
            {authStep === 'login' &&
              'أدخل بياناتك للوصول إلى حسابك'}
            {authStep === 'register_painter' &&
              'أنشئ حسابك وابدأ إدارة أعمالك'}
            {authStep === 'register_success' &&
              'أصبح حسابك جاهزًا للمتابعة'}
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-700"
          >
            {successMessage}
          </div>
        )}

        {authStep === 'choice' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('painter');
                setAuthStep('login');
                clearMessages();
              }}
              className="flex w-full items-center gap-4 rounded-2xl border-2 border-[#F4C430] bg-amber-50 p-4 text-right transition hover:bg-amber-100"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F4C430] text-xl">
                🎨
              </span>
              <span className="flex-1">
                <span className="block font-bold text-[#123B66]">
                  صباغ
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  إدارة المشاريع والعمال والأجور
                </span>
              </span>
              <ArrowRight size={20} className="text-[#123B66]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('client');
                setAuthStep('login');
                clearMessages();
              }}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-right transition hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🏠
              </span>
              <span className="flex-1">
                <span className="block font-bold text-[#123B66]">
                  زبون
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  متابعة طلبات خدمات الصباغة
                </span>
              </span>
              <ArrowRight size={20} className="text-[#123B66]" />
            </button>

            <p className="pt-2 text-center text-sm text-slate-500">
              ليس لديك حساب؟
              {' '}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('painter');
                  setAuthStep('register_painter');
                  clearMessages();
                }}
                className="font-bold text-[#2F80C9] hover:underline"
              >
                سجّل كصباغ
              </button>
            </p>
          </div>
        )}

        {authStep === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                البريد الإلكتروني
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left outline-none transition focus:border-[#2F80C9] focus:ring-2 focus:ring-blue-100"
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-12 text-left outline-none transition focus:border-[#2F80C9] focus:ring-2 focus:ring-blue-100"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              <div className="mt-2 text-left">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePasswordReset}
                  className="text-sm font-semibold text-[#2F80C9] hover:underline disabled:opacity-50"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#123B66] px-4 py-3 font-bold text-white transition hover:bg-[#0d2e50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthStep('choice');
                clearMessages();
              }}
              className="w-full py-2 text-sm text-slate-500 hover:text-[#123B66]"
            >
              رجوع لاختيار نوع الحساب
            </button>
          </form>
        )}

        {authStep === 'register_painter' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                الاسم الكامل
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#2F80C9] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="register-phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                رقم الهاتف
              </label>
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05 أو 06 أو 07..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#2F80C9] focus:ring-2 focus:ring-blue-100"
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                البريد الإلكتروني
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left outline-none transition focus:border-[#2F80C9] focus:ring-2 focus:ring-blue-100"
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor="register-wilaya"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                الولاية
              </label>
              <input
                id="register-wilaya"
                type="text"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                placeholder="أدخل ولايتك"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#2F80C9] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-12 text-left outline-none transition focus:border-[#2F80C9] focus:ring-2 focus:ring-blue-100"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#F4C430] px-4 py-3 font-bold text-[#123B66] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب صباغ'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthStep('login');
                clearMessages();
              }}
              className="w-full py-2 text-sm text-slate-500 hover:text-[#123B66]"
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </button>
          </form>
        )}

        {authStep === 'register_success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAuthModal(false);
                setAuthStep('choice');
                clearMessages();
              }}
              className="w-full rounded-xl bg-[#123B66] px-4 py-3 font-bold text-white transition hover:bg-[#0d2e50]"
            >
              متابعة إلى التطبيق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
