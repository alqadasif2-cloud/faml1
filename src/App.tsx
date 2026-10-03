import React, { useState } from 'react';
import { FamilyGuardProvider, useFamilyGuard } from './context/FamilyGuardContext';
import { ParentDashboard } from './components/ParentApp/ParentDashboard';
import { ChildDeviceSimulator } from './components/ChildApp/ChildDeviceSimulator';
import { AndroidCodeExplorer } from './components/CodeExplorer/AndroidCodeExplorer';
import { AlertCenterModal } from './components/ParentApp/AlertCenterModal';
import { AddDeviceModal } from './components/ParentApp/AddDeviceModal';
import { FamilyGuardLogo } from './components/common/FamilyGuardLogo';
import { SplashScreen } from './components/common/SplashScreen';
import { AuthModal } from './components/auth/AuthModal';
import { 
  Terminal, Globe, MonitorSmartphone, User, LogIn, Sparkles
} from 'lucide-react';

function FamilyGuardAppContent() {
  const { lang, setLang } = useFamilyGuard();
  const [mainView, setMainView] = useState<'simulator' | 'codebase'>('simulator');
  const [simulatorLayout, setSimulatorLayout] = useState<'dual' | 'parent_only' | 'child_only'>('dual');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>({ name: 'عبدالله المنصور' });

  return (
    <>
      {/* Official App Startup Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${lang === 'ar' ? 'font-tajawal' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        {/* Top Application Navbar */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand with Official Shield Logo */}
          <div className="flex items-center gap-3">
            <FamilyGuardLogo size={42} rounded={true} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">FamilyGuard</h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                  Android Native
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'منظومة الرقابة الأبوية الذكية المتكاملة لنظام أندرويد' : 'Comprehensive Android Parental Control Ecosystem'}
              </p>
            </div>
          </div>

          {/* View Switcher: Interactive Dual Device Simulator VS Kotlin Codebase */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setMainView('simulator')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                mainView === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MonitorSmartphone className="w-4 h-4" />
              <span>{lang === 'ar' ? 'المحاكي المباشر (Live Simulator)' : 'Live Simulator'}</span>
            </button>

            <button
              onClick={() => setMainView('codebase')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                mainView === 'codebase'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>{lang === 'ar' ? 'كود أندرويد الكامل (Kotlin Source Code)' : 'Android Source Code'}</span>
            </button>
          </div>

          {/* Tools & Controls: Auth, Splash preview, Language toggle */}
          <div className="flex items-center gap-2.5">
            {/* Splash preview button */}
            <button
              onClick={() => setShowSplash(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition-all"
              title="معاينة شاشة البداية"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'ar' ? 'شاشة البداية' : 'Splash'}</span>
            </button>

            {/* Account / Login Button */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>{currentUser?.name ? currentUser.name.split(' ')[0] : (lang === 'ar' ? 'تسجيل الدخول' : 'Login')}</span>
            </button>

            {mainView === 'simulator' && (
              <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setSimulatorLayout('dual')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    simulatorLayout === 'dual' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? 'شاشتان معاً' : 'Dual Screen'}
                </button>
                <button
                  onClick={() => setSimulatorLayout('parent_only')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    simulatorLayout === 'parent_only' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? 'الوالد فقط' : 'Parent'}
                </button>
                <button
                  onClick={() => setSimulatorLayout('child_only')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    simulatorLayout === 'child_only' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? 'الطفل فقط' : 'Child'}
                </button>
              </div>
            )}

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>

        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {mainView === 'simulator' ? (
            <div className="space-y-8">
              
              {/* Live Dual Device Interactive Showcase */}
              {simulatorLayout === 'dual' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* Left (8 cols): Parent App Dashboard */}
                  <div className="xl:col-span-8 space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="font-bold text-white">
                          {lang === 'ar' ? 'تطبيق الوالد (FamilyGuard Parent)' : 'Parent App (FamilyGuard Parent)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {lang === 'ar' ? 'لوحة القيادة والتحكم بجميع أجهزة الأطفال' : 'Multi-device parental control console'}
                      </span>
                    </div>

                    <ParentDashboard onOpenAlerts={() => setIsAlertsOpen(true)} />
                  </div>

                  {/* Right (4 cols): Child Android Phone Simulator */}
                  <div className="xl:col-span-4 sticky top-24 space-y-4">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="font-bold text-white">
                          {lang === 'ar' ? 'جهاز الطفل (FamilyGuard Kids)' : 'Child Device (FamilyGuard Kids)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Galaxy S24 (Android 14)
                      </span>
                    </div>

                    <ChildDeviceSimulator />

                    <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 leading-relaxed text-center">
                      ✨ <span className="font-bold text-slate-200">{lang === 'ar' ? 'تجربة تفاعلية مباشرة:' : 'Interactive Sync:'}</span> {lang === 'ar' ? 'اضغط زر SOS في هاتف الطفل لمشاهدة التنبيه الفوري في لوحة الوالد، أو اضغط "قفل الجهاز فورياً" في لوحة الوالد لمشاهدة قفل هاتف الطفل فوراً!' : 'Press SOS on child phone or click Instant Block on parent dashboard to see real-time sync!'}
                    </div>
                  </div>

                </div>
              )}

              {simulatorLayout === 'parent_only' && (
                <div className="max-w-5xl mx-auto">
                  <ParentDashboard onOpenAlerts={() => setIsAlertsOpen(true)} />
                </div>
              )}

              {simulatorLayout === 'child_only' && (
                <div className="max-w-md mx-auto flex flex-col items-center">
                  <ChildDeviceSimulator />
                </div>
              )}

            </div>
          ) : (
            <AndroidCodeExplorer />
          )}
        </main>

        {/* Global Modals */}
        <AlertCenterModal
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
        />

        <AddDeviceModal />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(data) => {
            setCurrentUser(data.user);
          }}
        />

      </div>
    </>
  );
}

export default function App() {
  return (
    <FamilyGuardProvider>
      <FamilyGuardAppContent />
    </FamilyGuardProvider>
  );
}

