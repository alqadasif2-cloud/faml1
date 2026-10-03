import React, { useState } from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { Globe, Shield, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const WebFilterView: React.FC = () => {
  const { webFilter, updateWebFilter, lang } = useFamilyGuard();
  const [mode, setMode] = useState<'allow_all' | 'blacklist' | 'whitelist'>(webFilter?.mode || 'blacklist');
  const [blacklist, setBlacklist] = useState<string[]>(webFilter?.blacklistDomains || ['tiktok.com', 'gambling-site.com', 'adult-content-example.net']);
  const [whitelist, setWhitelist] = useState<string[]>(webFilter?.whitelistDomains || ['school.edu.sa', 'wikipedia.org', 'khanacademy.org']);
  const [newDomain, setNewDomain] = useState('');

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const clean = newDomain.trim().toLowerCase();
    if (mode === 'blacklist') {
      const updated = [...blacklist, clean];
      setBlacklist(updated);
      updateWebFilter(mode, updated, whitelist);
    } else if (mode === 'whitelist') {
      const updated = [...whitelist, clean];
      setWhitelist(updated);
      updateWebFilter(mode, blacklist, updated);
    }
    setNewDomain('');
  };

  const handleRemoveDomain = (domain: string, isBlacklist: boolean) => {
    if (isBlacklist) {
      const updated = blacklist.filter(d => d !== domain);
      setBlacklist(updated);
      updateWebFilter(mode, updated, whitelist);
    } else {
      const updated = whitelist.filter(d => d !== domain);
      setWhitelist(updated);
      updateWebFilter(mode, blacklist, updated);
    }
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    updateWebFilter(newMode, blacklist, whitelist);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ar' ? 'التحكم بالمواقع وتصفية المحتوى (Website Control)' : 'Website Control & Filtering'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'تعتمد رسمياً على Android VpnService كفلتر محلي للـ DNS على الجهاز دون إرسال البيانات لطرف ثالث'
              : 'Implemented using official Android VpnService for on-device DNS blocking'}
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => handleModeChange('allow_all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'allow_all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'السماح للكل' : 'Allow All'}
          </button>
          <button
            onClick={() => handleModeChange('blacklist')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'blacklist' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'القائمة السوداء (حظر)' : 'Blacklist'}
          </button>
          <button
            onClick={() => handleModeChange('whitelist')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'whitelist' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'القائمة البيضاء (سماح فقط)' : 'Whitelist'}
          </button>
        </div>
      </div>

      {/* Technical Architecture Explain */}
      <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl text-xs text-indigo-200 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-white">
            {lang === 'ar' ? 'آلية التنفيذ الرسمية على أندرويد (Official Android VpnService):' : 'Official Android VpnService Architecture:'}
          </span>
          <p className="mt-1 text-slate-300">
            {lang === 'ar'
              ? 'نظراً لأن نظام Android الحديث يمنع التطبيقات العادية من التلاعب بمتصفح Chrome مباشرة، يعتمد FamilyGuard على خدمة Android VpnService المحلية كخادم DNS محلي يعمل بنسبة 100% داخل هاتف الطفل بدون خوادم خارجية، مما يضمن أقصى درجات الخصوصية والسرعة دون استهلاك بطارية.'
              : 'Uses Android VpnService as an on-device local loopback DNS filter without external proxying.'}
          </p>
        </div>
      </div>

      {/* Domain Editor */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">
          {mode === 'blacklist' 
            ? (lang === 'ar' ? 'إضافة نطاق للقائمة السوداء (يتم حظره فوراً)' : 'Add domain to Blacklist')
            : (lang === 'ar' ? 'إضافة نطاق للقائمة البيضاء (يسمح به فقط)' : 'Add domain to Whitelist')}
        </h3>

        <form onSubmit={handleAddDomain} className="flex gap-2">
          <input
            type="text"
            placeholder="مثال: example.com, badsite.org"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="flex-1 py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة' : 'Add'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 mb-3">
            {lang === 'ar' ? 'النطاقات المسجلة حالياً:' : 'Configured Domains:'}
          </h4>

          <div className="flex flex-wrap gap-2">
            {(mode === 'blacklist' ? blacklist : whitelist).map((domain) => (
              <span
                key={domain}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 flex items-center gap-2"
              >
                <span>{domain}</span>
                <button
                  onClick={() => handleRemoveDomain(domain, mode === 'blacklist')}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
