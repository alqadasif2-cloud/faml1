import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { Moon, BookOpen, Clock, Plus, CheckCircle2, Shield } from 'lucide-react';

export const DowntimeScheduleView: React.FC = () => {
  const { downtimes, lang } = useFamilyGuard();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ar' ? 'جدول أوقات النوم والدراسة (Downtime)' : 'Downtime & Sleep Schedules'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar' 
              ? 'تطبيق القفل التلقائي خلال ساعات النوم والدراسة مع إتاحة التطبيقات الضرورية فقط'
              : 'Automatically restricts device during bedtime and study hours'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {downtimes.map((dt) => (
          <div key={dt.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  {dt.name.includes('نوم') || dt.name.includes('Sleep') ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{dt.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{dt.startTime} → {dt.endTime}</span>
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                {lang === 'ar' ? 'مفعّل تلقائياً ✓' : 'Active'}
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-xs">
              <div className="font-semibold text-slate-200 mb-2">
                {lang === 'ar' ? 'التطبيقات المسموح بها دائماً أثناء هذا الوقت:' : 'Always Allowed Apps:'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-slate-700 rounded-lg text-slate-300 text-[11px]">
                  📞 {lang === 'ar' ? 'الهاتف والطوارئ' : 'Emergency Phone'}
                </span>
                <span className="px-2.5 py-1 bg-slate-700 rounded-lg text-slate-300 text-[11px]">
                  💬 {lang === 'ar' ? 'واتساب العائلة' : 'WhatsApp'}
                </span>
                <span className="px-2.5 py-1 bg-slate-700 rounded-lg text-slate-300 text-[11px]">
                  🔢 {lang === 'ar' ? 'الآلة الحاسبة' : 'Calculator'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ar' ? 'الأيام المطبقة: من الأحد إلى الخميس' : 'Applies: Sunday - Thursday'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
