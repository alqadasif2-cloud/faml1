import React, { useState, useEffect } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { FamilyGuardLogo } from '../common/FamilyGuardLogo';
import { X, QrCode, Smartphone, Clock, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';

export const AddDeviceModal: React.FC = () => {

  const { 
    isPairingModalOpen, 
    setIsPairingModalOpen, 
    pairingCode, 
    activeChild, 
    generatePairingCode,
    lang 
  } = useFamilyGuard();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (!isPairingModalOpen) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPairingModalOpen]);

  if (!isPairingModalOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopy = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 text-xs">
        
        {/* Close Button */}
        <button
          onClick={() => setIsPairingModalOpen(false)}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mb-3 flex justify-center">
            <FamilyGuardLogo size={64} rounded={true} />
          </div>
          <h3 className="text-lg font-bold text-white">
            {lang === 'ar' ? 'ربط جهاز طفل جديد' : 'Pair New Child Device'}
          </h3>

          <p className="text-slate-400 mt-1">
            {lang === 'ar' 
              ? `إضافة جهاز جديد لملف الطفل: ${activeChild?.name || 'أحمد'}`
              : `Pairing device for: ${activeChild?.name || 'Ahmed'}`}
          </p>
        </div>

        {/* Pairing Code Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center mb-5 relative overflow-hidden">
          <div className="text-slate-400 text-[11px] mb-2 font-medium">
            {lang === 'ar' ? 'رمز الاقتران المؤقت (Pairing Code)' : 'Temporary Pairing Code'}
          </div>
          
          <div className="font-mono text-3xl font-black text-indigo-400 tracking-[8px] my-2 select-all">
            {pairingCode || '483921'}
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-all"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ الرمز' : 'Copy')}</span>
            </button>
          </div>

          <div className="text-[11px] text-amber-400/90 font-mono mt-3 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {lang === 'ar' ? 'صلاحية الرمز تنتهي خلال:' : 'Expires in:'} {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>
        </div>

        {/* QR Code representation */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center mb-5 flex flex-col items-center">
          <div className="w-36 h-36 bg-white p-2.5 rounded-xl shadow-inner flex items-center justify-center">
            {/* Visual SVG QR pattern */}
            <div className="w-full h-full border-2 border-slate-900 grid grid-cols-5 gap-1 p-1 bg-white">
              <div className="bg-black"></div>
              <div className="bg-black"></div>
              <div></div>
              <div className="bg-black"></div>
              <div className="bg-black"></div>
              <div className="bg-black"></div>
              <div></div>
              <div className="bg-black"></div>
              <div></div>
              <div className="bg-black"></div>
              <div></div>
              <div className="bg-black"></div>
              <div className="bg-black"></div>
              <div className="bg-black"></div>
              <div></div>
              <div className="bg-black"></div>
              <div></div>
              <div className="bg-black"></div>
              <div></div>
              <div className="bg-black"></div>
              <div className="bg-black"></div>
              <div className="bg-black"></div>
              <div></div>
              <div className="bg-black"></div>
              <div className="bg-black"></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            {lang === 'ar' ? 'أو امسح رمز الـ QR عبر كاميرا تطبيق الطفل' : 'Or scan QR code from Child app'}
          </span>
        </div>

        {/* 3 Steps instructions */}
        <div className="space-y-2 text-slate-300 text-[11px] mb-6">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
            <span>{lang === 'ar' ? 'ثبّت تطبيق FamilyGuard Kids على هاتف طفلك الأندرويد' : 'Install FamilyGuard Kids on child phone'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
            <span>{lang === 'ar' ? 'افتح التطبيق واختر "ربط كود"، ثم أدخل الرمز أعلاه' : 'Open app, choose Pair Code, and enter code'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
            <span>{lang === 'ar' ? 'وافق على الصلاحيات الرسمية لبدء الحماية الفورية' : 'Grant required permissions to start'}</span>
          </div>
        </div>

        <button
          onClick={() => setIsPairingModalOpen(false)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
        >
          {lang === 'ar' ? 'تم، إغلاق النافذة' : 'Done, Close'}
        </button>

      </div>
    </div>
  );
};
