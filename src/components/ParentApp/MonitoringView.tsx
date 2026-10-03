import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { 
  Tv, Camera, Mic, Play, Square, RefreshCw, 
  Zap, ZapOff, ShieldCheck, Eye, AlertCircle, Maximize2
} from 'lucide-react';

export const MonitoringView: React.FC = () => {
  const { 
    activeSession, 
    startMonitoringSession, 
    stopMonitoringSession, 
    activeChild, 
    lang 
  } = useFamilyGuard();

  const [monitoringType, setMonitoringType] = useState<'screen' | 'camera' | 'audio'>('screen');
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [flashOn, setFlashOn] = useState(false);
  const [quality, setQuality] = useState<'720p' | '1080p'>('720p');

  const isSessionActive = activeSession && activeSession.status === 'active';

  const handleStart = async () => {
    await startMonitoringSession(monitoringType, cameraFacing);
  };

  const handleStop = async () => {
    await stopMonitoringSession();
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ar' ? 'المراقبة الحية المصرح بها (شاشة، كاميرا، صوت)' : 'Authorized Live Monitoring'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'تعتمد رسمياً على MediaProjection وCameraX مع ظهور مؤشر الخصوصية الأخضر على جهاز الطفل'
              : 'Strictly built upon official Android MediaProjection & CameraX APIs with privacy indicators'}
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMonitoringType('screen')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              monitoringType === 'screen' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مشاركة الشاشة' : 'Live Screen'}</span>
          </button>
          <button
            onClick={() => setMonitoringType('camera')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              monitoringType === 'camera' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الكاميرا عن بعد' : 'Remote Camera'}</span>
          </button>
          <button
            onClick={() => setMonitoringType('audio')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              monitoringType === 'audio' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'صوت أحادي الاتجاه' : 'One-Way Audio'}</span>
          </button>
        </div>
      </div>

      {/* Main Monitoring Player Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6 text-xs">
          <div className="flex items-center gap-3">
            {isSessionActive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {lang === 'ar' ? 'جلسة بث مباشرة متصلة' : 'Live Stream Active'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-400 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                {lang === 'ar' ? 'متوقف حالياً' : 'Idle'}
              </span>
            )}

            {monitoringType === 'camera' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCameraFacing(f => f === 'front' ? 'back' : 'front')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{cameraFacing === 'front' ? 'الكاميرا الأمامية' : 'الكاميرا الخلفية'}</span>
                </button>
                <button
                  onClick={() => setFlashOn(!flashOn)}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 border ${
                    flashOn ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {flashOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
                  <span>{lang === 'ar' ? 'فلاش' : 'Flash'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-white text-xs px-2.5 py-1"
            >
              <option value="720p">720p HD</option>
              <option value="1080p">1080p Full HD</option>
            </select>

            {isSessionActive ? (
              <button
                onClick={handleStop}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-900/30"
              >
                <Square className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إنهاء الجلسة' : 'Stop Session'}</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-900/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'بدء الجلسة الآن' : 'Start Session'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Video / Stream Preview Surface */}
        <div className="relative w-full h-[360px] bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
          
          {isSessionActive ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              
              {/* Simulated Feed rendering */}
              {monitoringType === 'screen' && (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-48 h-72 bg-slate-950 border-2 border-indigo-500/40 rounded-3xl p-3 flex flex-col justify-between shadow-2xl relative">
                    <div className="h-4 bg-slate-900 rounded-full flex items-center justify-between px-2 text-[8px] text-slate-400">
                      <span>08:42</span>
                      <span className="text-emerald-400 font-bold">● Rec</span>
                    </div>
                    <div className="my-auto space-y-2">
                      <div className="w-full h-16 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center text-xs font-bold text-red-300">
                        YouTube Feed
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'ar' ? 'الطفل يتصفح قناة العلوم والرياضيات' : 'Browsing Educational Videos'}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full"></div>
                  </div>
                </div>
              )}

              {monitoringType === 'camera' && (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative">
                  <div className="absolute top-4 right-4 bg-slate-950/80 px-3 py-1 rounded-lg text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {cameraFacing === 'front' ? 'Front Lens (1080p)' : 'Back Lens (1080p)'}
                  </div>
                  <div className="w-64 h-64 rounded-full border-4 border-indigo-500/20 flex items-center justify-center bg-slate-950/50">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-indigo-400 mx-auto mb-2 animate-pulse" />
                      <div className="text-xs text-white font-bold">{lang === 'ar' ? 'بث الكاميرا نشط' : 'Camera Stream Live'}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'مع ظهور مؤشر الخصوصية لدى الطفل' : 'Privacy indicator visible on child phone'}</div>
                    </div>
                  </div>
                </div>
              )}

              {monitoringType === 'audio' && (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 h-16 mb-4">
                    {[40, 75, 100, 60, 90, 45, 80, 50, 70, 30].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="w-2 bg-indigo-500 rounded-full animate-pulse"
                      ></div>
                    ))}
                  </div>
                  <div className="text-xs text-white font-bold">{lang === 'ar' ? 'استماع مباشر للصوت المحيط' : 'One-Way Audio Active'}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'جودة صوتية نقية بتقنية PCM 48kHz' : 'Clean Audio via official Android AudioRecord'}</div>
                </div>
              )}

              {/* Watermark notice */}
              <div className="absolute bottom-3 left-4 text-[10px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded">
                FamilyGuard Protected Session • ID: {activeSession?.id.slice(0, 10)}
              </div>

            </div>
          ) : (
            <div className="text-center p-6 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-3">
                <Tv className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {lang === 'ar' ? 'الجلسة غير نشطة' : 'Stream is Offline'}
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {lang === 'ar'
                  ? 'اضغط على "بدء الجلسة الآن" لفتح اتصال آمن عبر WebRTC مع جهاز الطفل وفق الصلاحيات الممنوحة.'
                  : 'Click Start Session to open a secure peer connection with child device.'}
              </p>
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                {lang === 'ar' ? 'بدء الجلسة الآن' : 'Start Session'}
              </button>
            </div>
          )}

        </div>

        {/* Official Android Privacy & Legal Disclaimer */}
        <div className="mt-4 p-3.5 bg-slate-800/40 border border-slate-700/40 rounded-2xl flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {lang === 'ar'
              ? 'احتراماً لسياسات Google Play ونظام Android: لا يمكن تسجيل الكاميرا أو الشاشة سراً. يعرض جهاز الطفل دائماً إشعاراً ومؤشراً أخضر يوضح أن الجلسة نشطة ومصرح بها من الوالدين.'
              : 'Compliant with Google Play & Android 14 requirements: No stealth recording. Android always displays standard privacy green dots and notifications.'}
          </span>
        </div>

      </div>
    </div>
  );
};
