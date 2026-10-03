import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { FileText, Download, TrendingDown, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { lang, activeChild } = useFamilyGuard();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const handleExport = () => {
    alert(`[FamilyGuard] تم تجهيز تقرير ${period === 'daily' ? 'اليوم' : period === 'weekly' ? 'الأسبوع' : 'الشهر'} بصيغة PDF وتنزيله بنجاح.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ar' ? 'التقارير الشاملة لنشاط الطفل' : 'Comprehensive Activity Reports'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar' 
              ? 'ملخص تفصيلي يجمع وقت الشاشة، الأماكن التي تمت زيارتها، والتنبيهات المكتشفة'
              : 'Detailed summary of screen time, places visited, and alerts'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'يومي' : 'Daily'}
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

          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              {lang === 'ar' ? `تقرير نشاط: ${activeChild?.name || 'أحمد'}` : `Activity Report: ${activeChild?.name || 'Ahmed'}`}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {period === 'daily' ? '02 October 2026' : period === 'weekly' ? '26 Sep - 02 Oct 2026' : 'October 2026'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'معدل أمان ممتاز (94%)' : 'Excellent Safety Score (94%)'}</span>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div className="text-xs text-slate-400">{lang === 'ar' ? 'إجمالي وقت الشاشة' : 'Total Screen Time'}</div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {period === 'daily' ? '5h 21m' : period === 'weekly' ? '37h 20m' : '149h 10m'}
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'انخفاض بنسبة 12% عن الفترة السابقة' : '12% decrease'}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div className="text-xs text-slate-400">{lang === 'ar' ? 'محاولات فتح تطبيقات محظورة' : 'Blocked App Attempts'}</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">8 {lang === 'ar' ? 'مرات' : 'times'}</div>
            <div className="text-[11px] text-slate-400 mt-2">{lang === 'ar' ? 'تم الحظر التلقائي بنجاح 100%' : '100% blocked successfully'}</div>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div className="text-xs text-slate-400">{lang === 'ar' ? 'الالتزام بأوقات النوم والدراسة' : 'Downtime Adherence'}</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">98%</div>
            <div className="text-[11px] text-slate-400 mt-2">{lang === 'ar' ? 'تم القفل التلقائي في الموعد' : 'Locked on schedule'}</div>
          </div>
        </div>

        {/* Categories breakdown in Report */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-white mb-3">{lang === 'ar' ? 'توزيع الاستخدام حسب الفئات:' : 'Usage by Category:'}</h4>
          <div className="space-y-3">
            {[
              { name: 'فيديوهات وترفيه (YouTube)', percentage: 42, color: 'bg-red-500' },
              { name: 'تطبيقات تعليمية ومدرسية (Google Meet / Classroom)', percentage: 25, color: 'bg-emerald-500' },
              { name: 'تواصل اجتماعي (WhatsApp)', percentage: 20, color: 'bg-blue-500' },
              { name: 'ألعاب (Roblox)', percentage: 13, color: 'bg-amber-500' }
            ].map((cat, i) => (
              <div key={i} className="text-xs">
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{cat.name}</span>
                  <span className="font-mono font-bold text-white">{cat.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${cat.percentage}%` }} className={`h-full ${cat.color} rounded-full`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
