import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { FamilyGuardLogo } from '../common/FamilyGuardLogo';
import { 
  ShieldCheck, AlertTriangle, Lock, Unlock, Wifi, Battery, 
  Smartphone, Settings, Radio, Bell, Eye, EyeOff, Camera, 
  Mic, CheckCircle2, ChevronRight, X, ArrowLeft, RefreshCw, Send,
  Tv, MessageSquare, Chrome, Gamepad2, PhoneCall
} from 'lucide-react';

export const ChildDeviceSimulator: React.FC = () => {
  const { 
    activeChild, 
    activeDevice, 
    triggerSosAlert, 
    activeSession, 
    stopMonitoringSession,
    apps,
    verifyPairingCode,
    lang
  } = useFamilyGuard();

  const [activeTab, setActiveTab] = useState<'app' | 'launcher' | 'permissions' | 'pairing'>('app');
  const [pairingInput, setPairingInput] = useState<string>('');
  const [pairingSuccess, setPairingSuccess] = useState<boolean>(false);
  const [pairingError, setPairingError] = useState<string>('');
  const [blockedAppPopup, setBlockedAppPopup] = useState<string | null>(null);
  const [sosSentSuccess, setSosSentSuccess] = useState<boolean>(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [permissionRequestedSuccess, setPermissionRequestedSuccess] = useState<boolean>(false);

  // Permission toggles
  const [permissionsState, setPermissionsState] = useState({
    location: true,
    backgroundLocation: true,
    notifications: true,
    notificationAccess: true,
    usageAccess: true,
    accessibility: true,
    camera: true,
    microphone: true,
    screenCapture: true,
  });

  const isInstantBlocked = activeDevice?.isInstantBlocked ?? false;

  const handleAppLaunch = (appName: string, pkgName: string) => {
    if (isInstantBlocked) {
      setBlockedAppPopup(appName);
      return;
    }

    const appRule = apps.find(a => a.packageName === pkgName);
    if (appRule?.isBlocked || (appRule?.dailyLimitMinutes && appRule.usageTodayMinutes >= appRule.dailyLimitMinutes)) {
      setBlockedAppPopup(appName);
    } else {
      alert(`[محاكاة نظام أندرويد] تم تشغيل تطبيق ${appName} بشكل طبيعي`);
    }
  };

  const handlePairingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPairingError('');
    if (pairingInput.trim().length !== 6) {
      setPairingError('رمز الاقتران يجب أن يتكون من 6 أرقام');
      return;
    }
    const success = await verifyPairingCode(pairingInput.trim());
    if (success) {
      setPairingSuccess(true);
      setTimeout(() => {
        setPairingSuccess(false);
        setActiveTab('app');
      }, 1500);
    } else {
      setPairingError('رمز الاقتران غير صحيح أو انتهت صلاحيته');
    }
  };

  const handleSosClick = async () => {
    if (!activeChild) return;
    await triggerSosAlert(activeChild.id);
    setSosSentSuccess(true);
    setTimeout(() => setSosSentSuccess(false), 3000);
  };

  const handleRequestTime = () => {
    setIsRequestingPermission(true);
    setTimeout(() => {
      setIsRequestingPermission(false);
      setPermissionRequestedSuccess(true);
      setTimeout(() => {
        setPermissionRequestedSuccess(false);
        setBlockedAppPopup(null);
      }, 2000);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Device Mode Switcher bar */}
      <div className="flex items-center gap-1.5 p-1.5 mb-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs backdrop-blur-md">
        <button
          onClick={() => setActiveTab('app')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'app'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'ar' ? 'تطبيق FamilyGuard Kids' : 'FamilyGuard Kids App'}
        </button>
        <button
          onClick={() => setActiveTab('launcher')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'launcher'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'ar' ? 'نظام أندرويد (اختبار التطبيقات)' : 'Android Launcher'}
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'permissions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'ar' ? 'الصلاحيات' : 'Permissions'}
        </button>
        <button
          onClick={() => setActiveTab('pairing')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'pairing'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'ar' ? 'ربط كود' : 'Pairing'}
        </button>
      </div>

      {/* Realistic Android Hardware Frame */}
      <div className="relative w-[340px] h-[670px] bg-slate-950 border-[9px] border-slate-800 rounded-[48px] shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-700/50">
        
        {/* Android Punch Hole Camera */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full border border-slate-800"></div>
        </div>

        {/* Android Status Bar */}
        <div className="h-7 bg-slate-950/80 backdrop-blur-md px-5 flex items-center justify-between text-[11px] text-slate-300 font-medium z-40 select-none">
          <span>08:42</span>
          
          <div className="flex items-center gap-2">
            {/* Android Privacy Indicator (Green dot) */}
            {activeSession && activeSession.status === 'active' && (
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full text-[9px] font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {activeSession.type === 'camera' ? 'كاميرا' : activeSession.type === 'screen' ? 'شاشة' : 'صوت'}
              </span>
            )}
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1 text-[10px]">
              <span>{activeDevice?.battery || 78}%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Main Phone Content Screen */}
        <div className="flex-1 overflow-y-auto relative bg-slate-900 text-slate-100 flex flex-col">

          {/* ACTIVE LIVE PRIVACY SESSION BANNER */}
          {activeSession && activeSession.status === 'active' && (
            <div className="bg-emerald-600 text-white p-2.5 text-xs flex items-center justify-between shadow-lg sticky top-0 z-30 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                <span className="font-bold">
                  {lang === 'ar' ? 'جلسة مراقبة نشطة مع الوالد' : 'Active Parent Session'}
                </span>
              </div>
              <button
                onClick={stopMonitoringSession}
                className="bg-black/30 hover:bg-black/50 text-[10px] px-2 py-0.5 rounded text-white font-medium"
              >
                {lang === 'ar' ? 'إنهاء' : 'Stop'}
              </button>
            </div>
          )}

          {/* INSTANT LOCK OVERLAY (WHEN PARENT PRESSES 'BLOCK NOW') */}
          {isInstantBlocked && (
            <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-rose-900/60 border-2 border-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-900/50 animate-bounce">
                <Lock className="w-10 h-10 text-rose-300" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                {lang === 'ar' ? 'الجهاز مقفل حالياً' : 'Device Locked'}
              </h3>
              <p className="text-xs text-rose-200 mb-6 leading-relaxed">
                {lang === 'ar'
                  ? 'تم تطبيق القفل الفوري من قبل الوالد عبر تطبيق FamilyGuard Parent. يرجى التحدث مع والدك لفتح الجهاز.'
                  : 'Instant lock applied by your parent via FamilyGuard Parent.'}
              </p>
              
              <div className="w-full bg-rose-900/40 border border-rose-700/50 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-100 mb-4">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ar' ? 'مكالمات الطوارئ متاحة دائماً' : 'Emergency Calls Available'}</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">999 / 911</span>
              </div>

              <button
                onClick={handleSosClick}
                className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-xl text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {lang === 'ar' ? 'إرسال نداء استغاثة (SOS)' : 'Send SOS Alert'}
              </button>
            </div>
          )}

          {/* BLOCKED APP MODAL (OVERLAY ACTIVITY) */}
          {blockedAppPopup && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="mb-3">
                <FamilyGuardLogo size={68} rounded={true} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {lang === 'ar' ? `تطبيق ${blockedAppPopup} مقيّد` : `${blockedAppPopup} is Restricted`}
              </h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                {lang === 'ar' 
                  ? 'هذا التطبيق مقيد بواسطة FamilyGuard لتجاوز الحد اليومي أو بسبب قواعد الدراسة والنوم.'
                  : 'This application is restricted by FamilyGuard parental policies.'}
              </p>


              {permissionRequestedSuccess ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تم إرسال طلبك للوالد بنجاح' : 'Permission request sent to parent'}</span>
                </div>
              ) : (
                <button
                  onClick={handleRequestTime}
                  disabled={isRequestingPermission}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-2 transition-all"
                >
                  {isRequestingPermission ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{lang === 'ar' ? 'طلب وقت إضافي (Request Permission)' : 'Request Permission'}</span>
                </button>
              )}

              <button
                onClick={() => setBlockedAppPopup(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                {lang === 'ar' ? 'الرجوع للخلف' : 'Go Back'}
              </button>
            </div>
          )}

          {/* TAB 1: KIDS HOME SCREEN */}
          {activeTab === 'app' && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              
              {/* Header Card */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-center">
                <div className="mb-3 flex justify-center">
                  <FamilyGuardLogo size={72} rounded={true} />
                </div>
                <h2 className="text-base font-bold text-white">
                  {lang === 'ar' ? 'مرحباً في FamilyGuard Kids' : 'Welcome to FamilyGuard Kids'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'ar' ? 'الجهاز مرتبط بعائلة: عبدالله المنصور' : 'Connected to: Al-Mansoor Family'}
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[11px] font-semibold mt-2.5 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {lang === 'ar' ? 'الحماية نشطة ✓' : 'Protected ✓'}
                </div>
              </div>


              {/* Central Big SOS Button */}
              <div className="my-6 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping"></div>
                  <button
                    onClick={handleSosClick}
                    className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex flex-col items-center justify-center shadow-xl shadow-red-900/50 hover:scale-105 active:scale-95 transition-all border-4 border-white/20"
                  >
                    <AlertTriangle className="w-12 h-12 mb-1" />
                    <span className="text-2xl font-black tracking-wider">SOS</span>
                    <span className="text-[11px] text-white/90 font-medium">
                      {lang === 'ar' ? 'نداء استغاثة طارئ' : 'Emergency Alert'}
                    </span>
                  </button>
                </div>

                {sosSentSuccess && (
                  <div className="mt-3 px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تم إرسال إشعار الطوارئ فوراً إلى الوالد!' : 'SOS Alert sent to parent!'}</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 text-center max-w-[240px] mt-4">
                  {lang === 'ar'
                    ? 'اضغط زر SOS في أي حالة طارئة لبث موقعك الدقيق فورياً لهاتف الوالد.'
                    : 'Press SOS in emergencies to transmit your live location immediately.'}
                </p>
              </div>

              {/* Status and Transparency Footer */}
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-[11px] text-slate-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'يعمل التطبيق بشفافية كاملة وفق معايير Android الرسمية لحمايتك دون أي برمجيات خفية.'
                    : 'Transparent parental safety complying with official Android APIs.'}
                </span>
              </div>

            </div>
          )}

          {/* TAB 2: SIMULATED ANDROID LAUNCHER (TEST APP RESTRICTIONS) */}
          {activeTab === 'launcher' && (
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs text-slate-400 mb-3 text-center">
                {lang === 'ar' ? 'اضغط على التطبيقات لتجربة الحظر والتقييد المباشر' : 'Tap apps to test live parental restriction'}
              </div>

              <div className="grid grid-cols-3 gap-4 p-2">
                
                {/* FamilyGuard Kids App Icon */}
                <button
                  onClick={() => setActiveTab('app')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/60 active:scale-95 transition-all ring-1 ring-blue-500/30"
                >
                  <FamilyGuardLogo size={56} rounded={true} />
                  <span className="text-[11px] font-bold text-blue-300">FamilyGuard</span>
                </button>

                {/* YouTube */}
                <button
                  onClick={() => handleAppLaunch('YouTube', 'com.google.android.youtube')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/60 active:scale-95 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-md">
                    <Tv className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">YouTube</span>
                </button>


                {/* TikTok (Blocked) */}
                <button
                  onClick={() => handleAppLaunch('TikTok', 'com.zhiliaoapp.musically')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/60 active:scale-95 transition-all relative"
                >
                  <div className="w-14 h-14 rounded-2xl bg-black border border-slate-800 flex items-center justify-center shadow-md">
                    <span className="text-xl font-black text-rose-500">♪</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">TikTok</span>
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                </button>

                {/* Roblox */}
                <button
                  onClick={() => handleAppLaunch('Roblox', 'com.roblox.client')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/60 active:scale-95 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md">
                    <Gamepad2 className="w-7 h-7 text-amber-400" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">Roblox</span>
                </button>

                {/* Google Chrome */}
                <button
                  onClick={() => handleAppLaunch('Google Chrome', 'com.android.chrome')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/60 active:scale-95 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-md">
                    <Chrome className="w-7 h-7 text-slate-900" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">Chrome</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleAppLaunch('WhatsApp', 'com.whatsapp')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/60 active:scale-95 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">WhatsApp</span>
                </button>

                {/* Phone Dialer */}
                <button
                  onClick={() => alert('[محاكاة أندرويد] تطبيق الاتصال متاح دائماً لحالات الطوارئ')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800/60 active:scale-95 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
                    <PhoneCall className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">{lang === 'ar' ? 'الهاتف' : 'Phone'}</span>
                </button>

              </div>

              {/* Info Note */}
              <div className="mt-auto p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-[11px] text-slate-400">
                💡 <span className="font-semibold text-slate-200">{lang === 'ar' ? 'تجربة حية:' : 'Live Test:'}</span> {lang === 'ar' ? 'عند قفل TikTok في لوحة الوالد، حاول الضغط عليه هنا وشاهد شاشة القفل الفورية.' : 'Block TikTok on Parent Dashboard and try opening it here.'}
              </div>
            </div>
          )}

          {/* TAB 3: PERMISSIONS MANAGER */}
          {activeTab === 'permissions' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-2 text-xs">
              <div className="mb-2">
                <h3 className="font-bold text-sm text-white">
                  {lang === 'ar' ? 'إدارة الصلاحيات الرسمية' : 'Required Permissions'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'طلب صلاحيات أندرويد بشكل تدريجي وشفاف' : 'Gradual, transparent Android permission manager'}
                </p>
              </div>

              {[
                { key: 'location', title: 'الموقع الجغرافي (Location)', desc: 'لمعرفة مكان الطفل في حالات الطوارئ وتتبع المسار' },
                { key: 'backgroundLocation', title: 'الموقع في الخلفية (Background Location)', desc: 'لتحديث الموقع حتى عند إغلاق التطبيق' },
                { key: 'usageAccess', title: 'الوصول لبيانات الاستخدام (Usage Access)', desc: 'لحساب وقت الشاشة ومدة استخدام التطبيقات' },
                { key: 'accessibility', title: 'إمكانية الوصول (Accessibility Service)', desc: 'لتطبيق قيود حظر التطبيقات وجدول النوم تلقائياً' },
                { key: 'notificationAccess', title: 'قراءة الإشعارات (Notification Access)', desc: 'لمزامنة إشعارات التطبيقات المختارة مع الوالد' },
                { key: 'camera', title: 'الكاميرا (Camera)', desc: 'لبث الكاميرا المصرح بها مع ظهور مؤشر الخصوصية' },
                { key: 'microphone', title: 'الميكروفون (Microphone)', desc: 'لبث الصوت أحادي الاتجاه عند الحاجة' },
                { key: 'screenCapture', title: 'مشاركة الشاشة (Screen Capture)', desc: 'عبر MediaProjection API الرسمية بموافقة مسبقة' }
              ].map((perm) => {
                const isGranted = (permissionsState as any)[perm.key];
                return (
                  <div key={perm.key} className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
                    <div className="pr-2 flex-1">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{perm.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{perm.desc}</p>
                    </div>
                    <button
                      onClick={() => setPermissionsState(prev => ({ ...prev, [perm.key]: !isGranted }))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                        isGranted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isGranted ? (lang === 'ar' ? 'ممنوحة ✓' : 'Granted') : (lang === 'ar' ? 'طلب إذن' : 'Request')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: PAIRING CODE INPUT */}
          {activeTab === 'pairing' && (
            <div className="p-4 flex-1 flex flex-col justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center mb-3">
                <Radio className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {lang === 'ar' ? 'ربط جهاز الطفل' : 'Pair Child Device'}
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                {lang === 'ar' 
                  ? 'أدخل رمز الاقتران المكون من 6 أرقام المعروض في تطبيق الوالد'
                  : 'Enter the 6-digit pairing code shown in Parent App'}
              </p>

              <form onSubmit={handlePairingSubmit} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  value={pairingInput}
                  onChange={(e) => setPairingInput(e.target.value)}
                  placeholder="483921"
                  className="w-full text-center tracking-[12px] font-mono text-2xl py-3 px-4 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />

                {pairingError && (
                  <p className="text-xs text-rose-400">{pairingError}</p>
                )}

                {pairingSuccess && (
                  <p className="text-xs text-emerald-400 font-bold">
                    {lang === 'ar' ? 'تم ربط الجهاز بنجاح! جاري التفعيل...' : 'Device paired successfully!'}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  {lang === 'ar' ? 'تأكيد الربط والاقتران' : 'Confirm & Pair Device'}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Android Navigation Bar (Gestures/Buttons) */}
        <div className="h-6 bg-slate-950 flex items-center justify-center">
          <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
        </div>

      </div>
    </div>
  );
};
