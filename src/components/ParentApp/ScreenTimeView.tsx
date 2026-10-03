import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { 
  Clock, BarChart3, TrendingUp, ShieldAlert, CheckCircle2, 
  Smartphone, Calendar, PieChart, Layers
} from 'lucide-react';

export const ScreenTimeView: React.FC = () => {
  const { apps, activeChild, lang } = useFamilyGuard();
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly'>('today');

  const totalMinutes = apps.reduce((acc, curr) => acc + curr.usageTodayMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Chart data simulation
  const weeklyDays = [
    { day: 'السبت (Sat)', minutes: 310, height: '70%' },
    { day: 'الأحد (Sun)', minutes: 260, height: '58%' },
    { day: 'الإثنين (Mon)', minutes: 340, height: '76%' },
    { day: 'الثلاثاء (Tue)', minutes: 295, height: '65%' },
    { day: 'الأربعاء (Wed)', minutes: totalMinutes, height: '72%', isToday: true },
    { day: 'الخميس (Thu)', minutes: 410, height: '92%' },
    { day: 'الجمعة (Fri)', minutes: 450, height: '100%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Period Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ar' ? 'إحصائيات وقت الشاشة ومعدل الاستخدام' : 'Screen Time Analytics'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar' 
              ? 'مستخرجة مباشرة عبر Android UsageStatsManager الرسمي'
              : 'Directly synchronized via Android UsageStatsManager API'}
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              period === 'today' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'اليوم' : 'Today'}
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              period === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'أسبوعي' : 'Weekly'}
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              period === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'شهري' : 'Monthly'}
          </button>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs text-indigo-300 font-semibold mb-1">
            {lang === 'ar' ? 'إجمالي وقت الشاشة اليوم' : "Today's Total Screen Time"}
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {totalHours} <span className="text-sm font-normal text-slate-400">{lang === 'ar' ? 'ساعة' : 'h'}</span> {remainingMinutes} <span className="text-sm font-normal text-slate-400">{lang === 'ar' ? 'دقيقة' : 'm'}</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-3 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'أقل بنسبة 14% مقارنة بالأمس' : '14% less than yesterday'}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">
            {lang === 'ar' ? 'أكثر التطبيقات استهلاكاً' : 'Most Used App'}
          </div>
          <div className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
            <span>YouTube</span>
            <span className="text-xs font-normal text-rose-400 font-mono">1h 32m</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            {lang === 'ar' ? 'تجاوز الحد الموصى به بمقدار 32 دقيقة' : 'Exceeded recommended limit'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">
            {lang === 'ar' ? 'حالة الالتزام بجدول النوم' : 'Bedtime Compliance'}
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            <span>98% {lang === 'ar' ? 'ملتزم' : 'On Track'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            {lang === 'ar' ? 'تم إغلاق الجهاز تلقائياً في 22:00' : 'Automated lock at 22:00'}
          </p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white">{lang === 'ar' ? 'مخطط الاستخدام الأسبوعي' : 'Weekly Usage Trend'}</h3>
            <p className="text-xs text-slate-400">{lang === 'ar' ? 'ساعات الاستخدام اليومية خلال الـ 7 أيام الماضية' : 'Daily screen hours'}</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{lang === 'ar' ? 'المعدل: 5.2 ساعة/يوم' : 'Avg: 5.2 h/day'}</span>
        </div>

        {/* Bar chart representation */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
          {weeklyDays.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.floor(item.minutes / 60)}h {item.minutes % 60}m
              </span>
              <div
                style={{ height: item.height }}
                className={`w-full max-w-[42px] rounded-t-xl transition-all ${
                  item.isToday
                    ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              ></div>
              <span className={`text-[10px] truncate max-w-[48px] ${item.isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                {item.day.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Per App Breakdown List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">{lang === 'ar' ? 'تفصيل استهلاك التطبيقات اليوم' : "Today's App Breakdown"}</h3>

        <div className="space-y-4">
          {apps.map((app) => {
            const percentage = Math.min(100, Math.round((app.usageTodayMinutes / (totalMinutes || 1)) * 100));
            const hours = Math.floor(app.usageTodayMinutes / 60);
            const mins = app.usageTodayMinutes % 60;

            return (
              <div key={app.id} className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white">
                    {app.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{app.name}</span>
                      {app.isBlocked && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                          {lang === 'ar' ? 'محظور' : 'Blocked'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'ar' ? 'آخر استخدام:' : 'Last used:'} {app.lastUsed}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress bar */}
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>{percentage}%</span>
                      <span>{app.dailyLimitMinutes ? `${Math.floor(app.dailyLimitMinutes / 60)}h limit` : 'unlimited'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${app.isBlocked ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      ></div>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-white text-sm">
                    {hours > 0 ? `${hours}h ` : ''}{mins}m
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
