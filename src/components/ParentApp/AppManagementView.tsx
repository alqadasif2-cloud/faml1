import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { 
  ShieldCheck, Lock, Unlock, Clock, AlertTriangle, 
  CheckCircle2, Plus, Sliders, Check, X
} from 'lucide-react';

export const AppManagementView: React.FC = () => {
  const { apps, updateAppRule, lang } = useFamilyGuard();
  const [editingAppPkg, setEditingAppPkg] = useState<string | null>(null);
  const [selectedLimitMins, setSelectedLimitMins] = useState<number>(60);

  const handleToggleBlock = async (packageName: string, currentBlocked: boolean) => {
    await updateAppRule(packageName, !currentBlocked);
  };

  const handleSaveLimit = async (packageName: string) => {
    await updateAppRule(packageName, undefined, selectedLimitMins);
    setEditingAppPkg(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ar' ? 'إدارة وحظر التطبيقات وتحديد الحدود اليومية' : 'App Limits & Blocking'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar' 
              ? 'تطبيق القواعد الفورية على جهاز الطفل حتى عند انقطاع الإنترنت عبر كاش محلي'
              : 'Enforced instantly on child device via local Accessibility & Policy engine'}
          </p>
        </div>
      </div>

      {/* Installed Apps Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app) => {
          const isOverLimit = app.dailyLimitMinutes && app.usageTodayMinutes >= app.dailyLimitMinutes;

          return (
            <div 
              key={app.id}
              className={`p-5 rounded-3xl border transition-all text-xs flex flex-col justify-between ${
                app.isBlocked || isOverLimit
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-white">
                      {app.name.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{app.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{app.packageName}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    app.isBlocked
                      ? 'bg-rose-500 text-white'
                      : isOverLimit
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {app.isBlocked 
                      ? (lang === 'ar' ? 'محظور تماماً' : 'Blocked') 
                      : isOverLimit 
                      ? (lang === 'ar' ? 'تجاوز الحد' : 'Limit Reached') 
                      : (lang === 'ar' ? 'متاح للاستخدام' : 'Allowed')}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 py-2 border-y border-slate-800/80 my-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'الاستخدام اليوم:' : "Today's Usage:"}</span>
                    <span className="font-mono font-bold text-white">
                      {Math.floor(app.usageTodayMinutes / 60)}h {app.usageTodayMinutes % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'الحد اليومي المحدد:' : 'Daily Limit:'}</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {app.dailyLimitMinutes ? `${app.dailyLimitMinutes} ${lang === 'ar' ? 'دقيقة/يوم' : 'min/day'}` : (lang === 'ar' ? 'غير محدود' : 'Unlimited')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                {/* Limit setter */}
                {editingAppPkg === app.packageName ? (
                  <div className="flex items-center gap-2 w-full mt-2 p-2 bg-slate-800 rounded-xl">
                    <select
                      value={selectedLimitMins}
                      onChange={(e) => setSelectedLimitMins(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-lg text-white text-xs px-2 py-1"
                    >
                      <option value={30}>30 دقيقة/يوم</option>
                      <option value={45}>45 دقيقة/يوم</option>
                      <option value={60}>ساعة واحدة/يوم</option>
                      <option value={90}>ساعة ونصف/يوم</option>
                      <option value={120}>ساعتان/يوم</option>
                    </select>
                    <button
                      onClick={() => handleSaveLimit(app.packageName)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
                    >
                      {lang === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingAppPkg(null)}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedLimitMins(app.dailyLimitMinutes || 60);
                      setEditingAppPkg(app.packageName);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'ar' ? 'تعديل الحد الزمني' : 'Set Limit'}</span>
                  </button>
                )}

                {/* Instant block toggle */}
                <button
                  onClick={() => handleToggleBlock(app.packageName, app.isBlocked)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    app.isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {app.isBlocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'إلغاء الحظر' : 'Unblock'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'حظر فوري' : 'Block App'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
