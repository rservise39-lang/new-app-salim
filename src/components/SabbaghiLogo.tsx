import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const SabbaghiLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-xl', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', sub: 'text-[11px]' },
    lg: { icon: 'w-16 h-16', text: 'text-4xl', sub: 'text-sm' },
    xl: { icon: 'w-24 h-24', text: 'text-5xl', sub: 'text-base' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Splash Paint Decorative Backing */}
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize.icon} drop-shadow-sm transition-transform duration-300 hover:scale-105`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Paint splash marks */}
          <path
            d="M20 30 C 15 15, 45 5, 65 15 C 85 25, 95 55, 80 75 C 65 95, 30 95, 18 80 C 5 65, 5 45, 20 30 Z"
            fill="#FEF08A"
            className="opacity-70"
          />
          <path
            d="M30 20 C 40 10, 70 8, 85 25 C 95 40, 90 70, 75 85 C 60 95, 35 90, 25 75 C 15 60, 20 30, 30 20 Z"
            fill="#BAE6FD"
            className="opacity-60"
          />
          
          {/* House Silhouette */}
          <path
            d="M50 16 L82 42 L74 42 L74 74 L26 74 L26 42 L18 42 Z"
            fill="#1E40AF"
          />
          {/* House Roof Accent */}
          <path
            d="M50 12 L86 42 L80 47 L50 22 L20 47 L14 42 Z"
            fill="#1E3A8A"
          />
          {/* Window in House */}
          <rect x="42" y="28" width="6" height="6" fill="#60A5FA" rx="1" />
          <rect x="52" y="28" width="6" height="6" fill="#60A5FA" rx="1" />
          <rect x="42" y="38" width="6" height="6" fill="#60A5FA" rx="1" />
          <rect x="52" y="38" width="6" height="6" fill="#60A5FA" rx="1" />

          {/* Paint Roller (Diagonal over house) */}
          <g transform="rotate(-25 50 55)">
            {/* Roller Cylinder */}
            <rect x="28" y="44" width="44" height="15" rx="4" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            {/* Wet paint stripe on roller */}
            <rect x="33" y="48" width="34" height="6" rx="2" fill="#FDE68A" />
            {/* Roller Metal Frame */}
            <path
              d="M72 52 L78 52 L78 68 L50 68 L50 78"
              stroke="#1E3A8A"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Roller Handle */}
            <rect x="45" y="78" width="10" height="20" rx="3" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* Brand Text */}
      <h1 className={`font-black tracking-tight text-blue-900 ${currentSize.text} leading-none mt-1`}>
        صباغي
      </h1>
      
      {showSubtitle && (
        <p className={`text-slate-500 font-medium ${currentSize.sub} tracking-normal text-center mt-1`}>
          مشاريعك .. بألوان أفضل
        </p>
      )}
    </div>
  );
};
