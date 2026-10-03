import React from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { Bell, MessageSquare, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, lang } = useFamilyGuard();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'ar' ? 'سجل إشعارات جهاز الطفل' : 'Child Device Notifications Log'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'ar' 
              ? 'مستقبلة عبر خدمة Android NotificationListenerService الرسمية للتطبيقات المحددة'
              : 'Captured via official Android NotificationListenerService for monitored apps'}
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            {lang === 'ar' ? 'لا توجد إشعارات واردة حتى الآن' : 'No notification logs recorded'}
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex flex-wrap items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{notif.appName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({notif.packageName})</span>
                  </div>
                  <div className="text-slate-200 font-semibold mt-1">{notif.title}</div>
                  <div className="text-slate-400 mt-0.5 leading-relaxed">{notif.content}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] shrink-0">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{notif.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
