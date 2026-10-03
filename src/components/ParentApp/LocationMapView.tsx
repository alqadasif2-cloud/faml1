import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { 
  MapPin, Navigation, History, Shield, Plus, Trash2, 
  Battery, Clock, Compass, AlertCircle, CheckCircle2, Play
} from 'lucide-react';

export const LocationMapView: React.FC = () => {
  const { 
    location, 
    locationHistory, 
    geofences, 
    addGeofence, 
    deleteGeofence, 
    updateChildLocation, 
    activeChild,
    lang 
  } = useFamilyGuard();

  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'geofences'>('live');
  const [newFenceName, setNewFenceName] = useState('');
  const [newFenceRadius, setNewFenceRadius] = useState(250);
  const [isSimulating, setIsSimulating] = useState(false);

  // Quick preset waypoints to test Geofence detection live
  const waypoints = [
    { name: 'مدرسة النخبة (داخل نطاق المدرسة)', lat: 24.7136, lng: 46.6753, address: 'مدرسة النخبة النموذجية، الرياض' },
    { name: 'طريق الملك عبدالله (في حافلة المدرسة)', lat: 24.7180, lng: 46.6690, address: 'طريق الملك عبدالله، الرياض' },
    { name: 'المنزل - حي الورود (داخل نطاق المنزل)', lat: 24.7210, lng: 46.6620, address: 'المنزل - شارع الورود 14، الرياض' },
    { name: 'مركز الألعاب والترفيه (خارج النطاق)', lat: 24.7300, lng: 46.6500, address: 'مجمع الترفيه والمولات، الرياض' }
  ];

  const handleSimulateMove = async (wp: typeof waypoints[0]) => {
    setIsSimulating(true);
    await updateChildLocation(wp.lat, wp.lng, wp.address);
    setTimeout(() => setIsSimulating(false), 500);
  };

  const handleCreateGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFenceName.trim()) return;
    await addGeofence({
      name: newFenceName,
      type: 'other',
      latitude: location?.latitude || 24.7136,
      longitude: location?.longitude || 46.6753,
      radius: newFenceRadius,
    });
    setNewFenceName('');
  };

  return (
    <div className="space-y-6">
      {/* View Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ar' ? 'الموقع الجغرافي المباشر وتتبع المسار' : 'Live GPS & Route History'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar' 
              ? 'تتبع فوري عالي الدقة يعتمد على Android FusedLocationProviderClient الرسمي'
              : 'High precision tracking using Android FusedLocationProviderClient'}
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'live' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'الموقع المباشر' : 'Live Map'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'سجل المسار' : 'History Log'}
          </button>
          <button
            onClick={() => setActiveTab('geofences')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'geofences' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'المناطق الآمنة (Geofence)' : 'Geofences'}
          </button>
        </div>
      </div>

      {/* Simulator Quick Action Bar */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-300">
          <Play className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold">{lang === 'ar' ? 'محاكاة حركة الطفل لاختبار الجيوفينس:' : 'Simulate Child Movement:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {waypoints.map((wp, i) => (
            <button
              key={i}
              onClick={() => handleSimulateMove(wp)}
              disabled={isSimulating}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 rounded-lg text-slate-200 hover:text-white transition-all text-xs font-medium"
            >
              {wp.name}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: LIVE MAP CANVAS */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Interactive Map Visualizer */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between min-h-[380px] relative overflow-hidden shadow-xl">
            {/* Map styling grid representation */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Map Header Overlay */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  {lang === 'ar' ? 'مباشر الآن' : 'Live Now'}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">
                  {lang === 'ar' ? 'الدقة:' : 'Accuracy:'} ±{location?.accuracy || 8.5} {lang === 'ar' ? 'متر' : 'm'}
                </span>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{location?.timestamp || 'الآن'}</span>
              </div>
            </div>

            {/* Map Center Display Simulation */}
            <div className="relative z-10 my-10 flex flex-col items-center justify-center">
              
              {/* Geofence Circles */}
              <div className="relative flex items-center justify-center">
                <div className="w-56 h-56 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center animate-pulse">
                  <div className="w-36 h-36 rounded-full bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center">
                    
                    {/* Child Pin */}
                    <div className="relative group cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 border-2 border-white shadow-xl shadow-indigo-600/50 flex items-center justify-center text-white font-bold text-base hover:scale-110 transition-transform">
                        {activeChild?.name.slice(0, 2) || 'أح'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] text-white font-bold">
                        ✓
                      </div>

                      {/* Tooltip on pin */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap shadow-lg">
                        {activeChild?.name}: {location?.address?.slice(0, 22) || 'الرياض'}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* Location Address Details Bar */}
            <div className="relative z-10 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    {location?.address || 'مدرسة النخبة النموذجية، الرياض'}
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                    {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">{lang === 'ar' ? 'السرعة الحالية' : 'Current Speed'}</div>
                  <div className="text-white font-bold font-mono">{location?.speed || 0} كم/س</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">{lang === 'ar' ? 'البطارية' : 'Battery'}</div>
                  <div className="text-emerald-400 font-bold font-mono">{location?.battery || 78}%</div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Location Stats & Active Zones */}
          <div className="space-y-4">
            
            {/* Zone Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ar' ? 'حالة المناطق الآمنة النشطة' : 'Active Safe Zones'}</span>
              </h3>

              <div className="space-y-2.5">
                {geofences.map((geo) => (
                  <div 
                    key={geo.id} 
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      geo.isInside 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{geo.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {lang === 'ar' ? 'نصف القطر:' : 'Radius:'} {geo.radius} {lang === 'ar' ? 'متر' : 'm'}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      geo.isInside ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {geo.isInside 
                        ? (lang === 'ar' ? 'الطفل متواجد هنا ✓' : 'Inside Zone') 
                        : (lang === 'ar' ? 'خارج النطاق' : 'Outside')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Battery & Hardware Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-xs space-y-3">
              <div className="font-bold text-white text-sm flex items-center justify-between">
                <span>{lang === 'ar' ? 'صحة تتبع الجهاز' : 'Device Telemetry'}</span>
                <span className="text-emerald-400 font-mono">100% OK</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>GPS Hardware:</span>
                <span className="font-semibold text-white">Fused Location (High)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Background Location:</span>
                <span className="font-semibold text-emerald-400">Granted ✓</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Battery Optimization:</span>
                <span className="font-semibold text-emerald-400">Whitelisted ✓</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: TIMELINE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">{lang === 'ar' ? 'سجل تحركات اليوم بالتسلسل الزمني' : "Today's Movement Timeline"}</h3>
            <p className="text-xs text-slate-400">{lang === 'ar' ? 'مسار الطفل المحفوظ من الصباح الباكر حتى اللحظة' : 'Recorded breadcrumbs path'}</p>
          </div>

          <div className="relative pl-6 pr-6 border-r-2 border-slate-800 space-y-6">
            {locationHistory.map((point, index) => (
              <div key={point.id || index} className="relative flex items-start gap-4">
                <div className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex-1 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{point.address}</div>
                    <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                      {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300 text-xs">
                    <span className="flex items-center gap-1 font-mono text-indigo-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {point.timestamp}
                    </span>
                    <span className="font-mono text-slate-400">
                      {point.speed > 0 ? `${point.speed} كم/س` : (lang === 'ar' ? 'متوقف' : 'Stationary')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GEOFENCE MANAGER */}
      {activeTab === 'geofences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Geofence Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-2">{lang === 'ar' ? 'إنشاء منطقة آمنة جديدة' : 'Add New Safe Zone'}</h3>
            <p className="text-xs text-slate-400 mb-4">{lang === 'ar' ? 'تلقي تنبيهات فورية عند دخول أو مغادرة الطفل للمنطقة' : 'Instant notifications on enter/exit'}</p>

            <form onSubmit={handleCreateGeofence} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">{lang === 'ar' ? 'اسم المنطقة' : 'Zone Name'}</label>
                <input
                  type="text"
                  placeholder="مثال: نادي التايكوندو، منزل الجدة"
                  value={newFenceName}
                  onChange={(e) => setNewFenceName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{lang === 'ar' ? 'نصف قطر الدائرة (بالأمتار)' : 'Radius (meters)'}</span>
                  <span className="font-mono text-indigo-400 font-bold">{newFenceRadius} م</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={newFenceRadius}
                  onChange={(e) => setNewFenceRadius(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ المنطقة الآمنة' : 'Save Safe Zone'}</span>
              </button>
            </form>
          </div>

          {/* Existing Geofences List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-2">{lang === 'ar' ? 'المناطق الجغرافية المحفوظة' : 'Configured Geofences'}</h3>
            <p className="text-xs text-slate-400 mb-4">{lang === 'ar' ? 'قائمة المناطق المراقبة حالياً' : 'Currently active boundaries'}</p>

            <div className="space-y-3">
              {geofences.map((geo) => (
                <div key={geo.id} className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{geo.name}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {geo.radius} {lang === 'ar' ? 'متر' : 'm'} • {geo.notifyOnEnter ? 'تنبيه دخول' : ''} {geo.notifyOnExit ? '• تنبيه خروج' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGeofence(geo.id)}
                    className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
