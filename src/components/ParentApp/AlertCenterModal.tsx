import React from 'react';
import { useFamilyGuard } from '../../context/FamilyGuardContext';
import { 
  X, Bell, AlertTriangle, Battery, Navigation, 
  Lock, Eye, CheckCircle2, Clock, Check
} from 'lucide-react';

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({ isOpen, onClose }) => {
  const { alerts, markAlertAsRead, lang } = useFamilyGuard();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative max-h-[85vh] flex flex-col text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'ar' ? 'مركز التنبيهات الفورية (Alert Center)' : 'Alert Center'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'تنبيهات الطوارئ، الجيوفينس، والبطارية ومحاولات التطبيقات' : 'Instant notifications & safety triggers'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {lang === 'ar' ? 'لا توجد تنبيهات جديدة حالياً' : 'No alerts recorded'}
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  alert.severity === 'critical'
                    ? 'bg-red-950/30 border-red-500/40 text-red-200'
                    : alert.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-200'
                } ${!alert.read ? 'ring-1 ring-indigo-500/50' : 'opacity-85'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === 'critical'
                      ? 'bg-red-500 text-white'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-indigo-500 text-white'
                  }`}>
                    {alert.type === 'sos' && <AlertTriangle className="w-4 h-4" />}
                    {alert.type === 'low_battery' && <Battery className="w-4 h-4" />}
                    {(alert.type === 'geofence_enter' || alert.type === 'geofence_exit') && <Navigation className="w-4 h-4" />}
                    {alert.type === 'app_blocked_attempt' && <Lock className="w-4 h-4" />}
                    {alert.type === 'monitoring_started' && <Eye className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{alert.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({alert.childName})</span>
                    </div>
                    <p className="text-xs mt-1 text-slate-300 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-mono">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>

                {!alert.read && (
                  <button
                    onClick={() => markAlertAsRead(alert.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all shrink-0"
                    title={lang === 'ar' ? 'تعيين كمقروء' : 'Mark as read'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
