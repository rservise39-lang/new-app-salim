import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  Smartphone, 
  Download, 
  Share2, 
  PlusSquare, 
  CheckCircle, 
  X, 
  QrCode, 
  Copy, 
  ExternalLink, 
  Check, 
  Sparkles,
  Zap,
  WifiOff
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'auto' | 'android' | 'ios' | 'desktop'>('auto');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const currentTab = activeDeviceTab === 'auto' 
    ? (isIOS ? 'ios' : 'android')
    : activeDeviceTab;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Branding */}
        <div className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-6 pb-7">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-lg shadow-blue-950/30 flex items-center justify-center shrink-0">
              <img 
                src="/pwa-192x192.png" 
                alt="شعار صباغي" 
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  // Fallback if image not rendered yet
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-blue-950 text-xs font-black mb-1">
                <Sparkles className="w-3 h-3" />
                تطبيق الويب التقدمي PWA
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                حفظ تطبيق صباغي على الهاتف
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                تثبيت سريع بدون متجر وبدون استهلاك للذاكرة
              </p>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Already installed banner */}
          {isInstalled && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-sm">
                <p className="font-bold">التطبيق مثبت بالفعل على جهازك!</p>
                <p className="text-xs text-emerald-700 mt-0.5">يمكنك تشغيله الآن مباشرة من الشاشة الرئيسية لهاتفك كأي تطبيق رسمي.</p>
              </div>
            </div>
          )}

          {/* Quick 1-Click Install Button if supported by current browser (Android / Chrome / Edge) */}
          {isInstallable && !isInstalled && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-blue-600" />
                    متصفحك يدعم التثبيت الفوري
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    اضغط أدناه لتثبيت أيقونة التطبيق مباشرة على شاشتك
                  </p>
                </div>
                <button
                  onClick={handleDirectInstall}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  تثبيت الآن بنقرة واحدة
                </button>
              </div>
            </div>
          )}

          {/* Device Tabs Selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">
              اختر نوع هاتفك لعرض طريقة الحفظ:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveDeviceTab('android')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentTab === 'android'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🤖 أندرويد</span>
              </button>
              <button
                onClick={() => setActiveDeviceTab('ios')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentTab === 'ios'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🍏 آيفون (iOS)</span>
              </button>
              <button
                onClick={() => setActiveDeviceTab('desktop')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentTab === 'desktop'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>💻 من الحاسوب</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Android Instructions */}
          {currentTab === 'android' && (
            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                خطوات الحفظ على هواتف أندرويد (Google Chrome):
              </h4>
              <ol className="space-y-3 text-xs text-slate-700 pr-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    افتح القائمة في أعلى المتصفح بالضغط على زر النقاط الثلاث 
                    <span className="inline-block px-1.5 py-0.5 mx-1 font-mono font-bold bg-white rounded border border-slate-300">⋮</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    اختر خيار <strong className="text-blue-700">"تثبيت التطبيق"</strong> أو <strong className="text-blue-700">"الإضافة إلى الشاشة الرئيسية"</strong> (Add to Home screen).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    اضغط على <strong className="text-slate-900">"تثبيت" (Install)</strong> لتأكيد الإضافة. ستظهر أيقونة صباغي مباشرة على شاشة هاتفك!
                  </div>
                </li>
              </ol>

              {isInstallable && (
                <button
                  onClick={handleDirectInstall}
                  className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  جرّب التثبيت التلقائي الآن
                </button>
              )}
            </div>
          )}

          {/* Tab 2: iOS Instructions */}
          {currentTab === 'ios' && (
            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                خطوات الحفظ على آيفون وآيباد (متصفح Safari):
              </h4>
              <ol className="space-y-3 text-xs text-slate-700 pr-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    في متصفح Safari، اضغط على زر <strong className="text-blue-700">المشاركة (Share)</strong> 
                    <span className="inline-flex items-center justify-center p-1 mx-1 bg-white rounded border border-slate-300 align-middle">
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    </span>
                    في أسفل أو أعلى الشاشة.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    مرر للأسفل واضغط على خيار 
                    <strong className="text-blue-700 mx-1">"إضافة إلى الصفحة الرئيسية"</strong>
                    <span className="inline-flex items-center justify-center p-1 mx-1 bg-white rounded border border-slate-300 align-middle">
                      <PlusSquare className="w-3.5 h-3.5 text-slate-700" />
                    </span>
                    (Add to Home Screen).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    اضغط على <strong className="text-slate-900">"إضافة" (Add)</strong> في أعلى الزاوية. ستتم إضافة أيقونة صباغي إلى هاتفك كأي تطبيق.
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Tab 3: Desktop / QR Code Sharing */}
          {currentTab === 'desktop' && (
            <div className="space-y-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  هل تتصفح من جهاز الكمبيوتر؟
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  امسح الرابط بكاميرا هاتفك أو انسخ الرابط لفتحه في هاتفك مباشرة وتثبيته:
                </p>
              </div>

              {/* QR Code Container */}
              <div className="inline-block p-3 bg-white rounded-2xl border border-slate-200 shadow-sm mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}`}
                  alt="QR Code"
                  className="w-36 h-36 mx-auto"
                />
                <span className="text-[11px] text-slate-500 block mt-2 font-medium">
                  امسح بالكاميرا لفتح التطبيق على هاتفك
                </span>
              </div>

              {/* Copy URL */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="text-xs text-slate-600 bg-transparent flex-1 outline-none px-2 font-mono truncate"
                  dir="ltr"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Advantages of PWA */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 mb-2.5">
              مميزات تثبيت تطبيق صباغي:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>تشغيل فوري وسريع بملء الشاشة</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <WifiOff className="w-4 h-4 text-blue-500 shrink-0" />
                <span>يعمل بدون إنترنت (Offline)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>أيقونة خاصة على الشاشة الرئيسية</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Download className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>خفيف جداً ولا يستهلك ذاكرة الهاتف</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
