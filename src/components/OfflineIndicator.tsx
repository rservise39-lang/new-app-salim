import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur-sm px-3.5 py-2 text-xs font-bold text-white shadow-lg border border-amber-400 animate-bounce">
      <WifiOff className="w-4 h-4 text-white" />
      <span>وضع عدم الاتصال — البيانات المخزنة متاحة وتعمل بنجاح</span>
    </div>
  );
};
