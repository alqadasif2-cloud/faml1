import React, { useState } from 'react';
import { FamilyGuardLogo } from '../common/FamilyGuardLogo';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('parent@familyguard.app');
  const [password, setPassword] = useState('parent123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const body = isLoginMode 
        ? { email: email.trim(), password }
        : { name: name.trim() || 'الوالد الكريم', email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشلت عملية المصادقة');
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 text-xs">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header with Official Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <FamilyGuardLogo size={80} rounded={true} />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            FamilyGuard Parent
          </h2>
          <p className="text-slate-400 mt-1">
            {isLoginMode ? 'تسجيل الدخول إلى حساب العائلة' : 'إنشاء حساب عائلي جديد'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              isLoginMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              !isLoginMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLoginMode && (
            <div>
              <label className="block text-slate-300 mb-1 font-medium">اسم الوالد / ولي الأمر</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="عبدالله المنصور"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1 font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="email"
                required
                placeholder="parent@familyguard.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs text-left"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span>جاري المعالجة...</span>
            ) : (
              <>
                <span>{isLoginMode ? 'دخول فوري إلى لوحة التحكم' : 'إنشاء الحساب وبدء الحماية'}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
          <span>حساب تجريبي افتراضي جاهز: </span>
          <span className="text-indigo-300 font-mono">parent@familyguard.app / parent123</span>
        </div>

      </div>
    </div>
  );
};
