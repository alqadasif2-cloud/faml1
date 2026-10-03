import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { LocationMapView } from './LocationMapView';
import { ScreenTimeView } from './ScreenTimeView';
import { AppManagementView } from './AppManagementView';
import { DowntimeScheduleView } from './DowntimeScheduleView';
import { MonitoringView } from './MonitoringView';
import { NotificationsView } from './NotificationsView';
import { WebFilterView } from './WebFilterView';
import { ReportsView } from './ReportsView';
import { 
  Users, UserPlus, Shield, Lock, Unlock, Battery, 
  MapPin, Clock, AlertTriangle, Bell, Smartphone, 
  CheckCircle2, ChevronRight, BarChart2, Tv, Globe, Moon
} from 'lucide-react';

interface ParentDashboardProps {
  onOpenAlerts: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onOpenAlerts }) => {
  const { 
    childrenList, 
    activeChild, 
    setActiveChildId, 
    activeDevice, 
    location, 
    toggleInstantBlock, 
    setIsPairingModalOpen, 
    generatePairingCode,
    alerts,
    activeSosAlert,
    dismissSosAlert,
    lang 
  } = useFamilyGuard();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'location' | 'screentime' | 'apps' | 'downtime' | 'monitoring' | 'notifications' | 'webfilter' | 'reports'
  >('overview');

  const isInstantBlocked = activeDevice?.isInstantBlocked ?? false;
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      
      {/* SOS EMERGENCY BANNER IF ACTIVE */}
      {activeSosAlert && (
        <div className="bg-red-600 text-white p-4 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-black text-sm">
                {lang === 'ar' ? '🚨 نداء استغاثة عاجل (SOS ALERT)' : '🚨 CRITICAL SOS ALERT'}
              </div>
              <div className="text-xs text-white/90 mt-0.5">
                {activeSosAlert.message}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('location')}
              className="px-4 py-2 bg-white text-red-600 font-bold rounded-xl text-xs shadow-md"
            >
              {lang === 'ar' ? 'عرض الموقع فوراً على الخريطة' : 'View Live Location'}
            </button>
            <button
              onClick={dismissSosAlert}
              className="px-3 py-2 bg-red-800 hover:bg-red-900 text-white font-medium rounded-xl text-xs"
            >
              {lang === 'ar' ? 'إغلاق التنبيه' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      {/* Top Bar: Children Selector & Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Child Profiles Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {childrenList.map((child) => {
            const isSelected = activeChild?.id === child.id;
            return (
              <button
                key={child.id}
                onClick={() => setActiveChildId(child.id)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-xs text-right ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="relative">
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <span className={`absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    child.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}></span>
                </div>

                <div className="pr-1 text-right">
                  <div className="font-bold">{child.name}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {child.status === 'online' ? (lang === 'ar' ? 'متصل الآن ●' : 'Online ●') : (lang === 'ar' ? 'غير متصل' : 'Offline')}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add Child Device Button */}
          <button
            onClick={() => {
              if (activeChild) generatePairingCode(activeChild.id);
            }}
            className="px-3.5 py-2.5 rounded-2xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-indigo-400 flex items-center gap-2 text-xs font-semibold transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'ar' ? '+ إضافة جهاز طفل' : '+ Add Child Device'}</span>
          </button>
        </div>

        {/* Instant Block & Alert Center Buttons */}
        <div className="flex items-center gap-3">
          {/* BLOCK NOW Button */}
          <button
            onClick={() => {
              if (activeChild) toggleInstantBlock(activeChild.id);
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              isInstantBlocked
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/50 animate-pulse'
                : 'bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-500/40'
            }`}
          >
            {isInstantBlocked ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إلغاء القفل الفوري (UNBLOCK)' : 'UNBLOCK DEVICE'}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-rose-400" />
                <span>{lang === 'ar' ? 'قفل الجهاز فورياً (BLOCK NOW)' : 'BLOCK NOW'}</span>
              </>
            )}
          </button>

          {/* Alert Center Trigger */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition-all border border-slate-700"
            title="Alert Center"
          >
            <Bell className="w-5 h-5 text-indigo-400" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-bold rounded-full text-[10px] flex items-center justify-center animate-bounce">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-800">
        {[
          { id: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: Shield },
          { id: 'location', label: lang === 'ar' ? 'الموقع والجيوفينس' : 'Location', icon: MapPin },
          { id: 'screentime', label: lang === 'ar' ? 'وقت الشاشة' : 'Screen Time', icon: Clock },
          { id: 'apps', label: lang === 'ar' ? 'إدارة التطبيقات' : 'Apps', icon: Smartphone },
          { id: 'downtime', label: lang === 'ar' ? 'أوقات النوم' : 'Downtime', icon: Moon },
          { id: 'monitoring', label: lang === 'ar' ? 'المراقبة الحية' : 'Live Monitor', icon: Tv },
          { id: 'notifications', label: lang === 'ar' ? 'سجل الإشعارات' : 'Notifications', icon: Bell },
          { id: 'webfilter', label: lang === 'ar' ? 'تصفية المواقع' : 'Web Filter', icon: Globe },
          { id: 'reports', label: lang === 'ar' ? 'التقارير' : 'Reports', icon: BarChart2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT RENDERING */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Quick Snapshot Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Status & Battery */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{lang === 'ar' ? 'حالة الجهاز والبطارية' : 'Device & Battery'}</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {activeChild?.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="my-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg font-mono">
                  {activeDevice?.battery || 78}%
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{activeDevice?.deviceName || 'Samsung Galaxy A54'}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{activeDevice?.androidVersion || 'Android 14'}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'آخر مزامنة:' : 'Last sync:'} {activeDevice?.lastSync || 'الآن'}
              </div>
            </div>

            {/* Current Location */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{lang === 'ar' ? 'الموقع الحالي' : 'Live Location'}</span>
                <button
                  onClick={() => setActiveTab('location')}
                  className="text-indigo-400 hover:underline text-[11px]"
                >
                  {lang === 'ar' ? 'فتح الخريطة →' : 'Map →'}
                </button>
              </div>
              <div className="my-3">
                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{location?.address || 'مدرسة النخبة النموذجية'}</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  {lang === 'ar' ? 'داخل منطقة: المدرسة (School)' : 'Inside Geofence: School'}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                ±{location?.accuracy || 8.5}m • {location?.timestamp || 'الآن'}
              </div>
            </div>

            {/* Today Screen Time */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{lang === 'ar' ? 'وقت الشاشة اليوم' : 'Today Screen Time'}</span>
                <button
                  onClick={() => setActiveTab('screentime')}
                  className="text-indigo-400 hover:underline text-[11px]"
                >
                  {lang === 'ar' ? 'التفاصيل →' : 'Details →'}
                </button>
              </div>
              <div className="my-3">
                <div className="text-2xl font-black text-white font-mono">5h 21m</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  YouTube (1h 32m) • Chrome (1h 10m)
                </div>
              </div>
              <div className="text-[11px] text-emerald-400">
                {lang === 'ar' ? 'ضمن المعدل الطبيعي المسموح به' : 'Within normal limits'}
              </div>
            </div>

            {/* Protection Security status */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{lang === 'ar' ? 'مستوى الحماية' : 'Protection Level'}</span>
                <span className="text-emerald-400 font-bold font-mono">100% Active</span>
              </div>
              <div className="my-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">FamilyGuard Core</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">Foreground Service Active</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                {isInstantBlocked ? (
                  <span className="text-rose-400 font-bold">{lang === 'ar' ? 'الجهاز مقفل فوري 🔒' : 'Instant Lock Active'}</span>
                ) : (
                  <span>{lang === 'ar' ? 'قواعد الأمان مطبقة محلياً ✓' : 'Local policies enforced'}</span>
                )}
              </div>
            </div>

          </div>

          {/* Quick Subview: Live Location Map preview */}
          <LocationMapView />

        </div>
      )}

      {activeTab === 'location' && <LocationMapView />}
      {activeTab === 'screentime' && <ScreenTimeView />}
      {activeTab === 'apps' && <AppManagementView />}
      {activeTab === 'downtime' && <DowntimeScheduleView />}
      {activeTab === 'monitoring' && <MonitoringView />}
      {activeTab === 'notifications' && <NotificationsView />}
      {activeTab === 'webfilter' && <WebFilterView />}
      {activeTab === 'reports' && <ReportsView />}

    </div>
  );
};
