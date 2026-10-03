import React, { useEffect, useState } from 'react';
import { FamilyGuardLogo } from './FamilyGuardLogo';
import { ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  appName?: string;
  subtitle?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  appName = 'FamilyGuard',
  subtitle = 'نظام الرقابة الأبوية الذكي لنظام أندرويد',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 400);
          return 100;
        }
        return prev + 12;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-[#06173a] to-slate-950 flex flex-col items-center justify-between p-8 text-center select-none animate-in fade-in duration-300">
      
      {/* Top Branding Pill */}
      <div className="pt-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Android Production Edition</span>
        </span>
      </div>

      {/* Main Center Logo & Title */}
      <div className="flex flex-col items-center gap-5 -mt-10">
        {/* Logo Container with Ambient Glow */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative">
            <FamilyGuardLogo size={130} rounded={true} />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
            {appName}
          </h1>
          <p className="text-xs text-blue-200/80 font-medium max-w-xs leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Privacy Tag */}
      <div className="w-full max-w-xs space-y-3 pb-6">
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>جاري تهيئة خدمات الأمان...</span>
          <span className="text-blue-400 font-bold">{progress}%</span>
        </div>
      </div>

    </div>
  );
};
