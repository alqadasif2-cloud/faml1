import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Child, Device, LocationPoint, Geofence, AppItem, DowntimeSchedule, AlertItem, NotificationLog, WebRule, MonitoringSession } from '../types';

interface FamilyGuardContextType {
  childrenList: Child[];
  activeChild: Child | null;
  setActiveChildId: (id: string) => void;
  activeDevice: Device | null;
  location: LocationPoint | null;
  locationHistory: LocationPoint[];
  geofences: Geofence[];
  apps: AppItem[];
  downtimes: DowntimeSchedule[];
  alerts: AlertItem[];
  notifications: NotificationLog[];
  webFilter: WebRule | null;
  activeSession: MonitoringSession | null;
  isLoading: boolean;
  pairingCode: string | null;
  pairingQr: string | null;
  isPairingModalOpen: boolean;
  setIsPairingModalOpen: (open: boolean) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  
  // Actions
  toggleInstantBlock: (childId: string) => Promise<void>;
  updateAppRule: (packageName: string, isBlocked?: boolean, dailyLimit?: number | null) => Promise<void>;
  generatePairingCode: (childId: string) => Promise<void>;
  verifyPairingCode: (code: string) => Promise<boolean>;
  triggerSosAlert: (childId: string) => Promise<void>;
  updateChildLocation: (lat: number, lng: number, address?: string) => Promise<void>;
  startMonitoringSession: (type: 'camera' | 'screen' | 'audio', cameraFacing?: 'front' | 'back') => Promise<void>;
  stopMonitoringSession: () => Promise<void>;
  addGeofence: (geo: Partial<Geofence>) => Promise<void>;
  deleteGeofence: (id: string) => Promise<void>;
  markAlertAsRead: (id: string) => Promise<void>;
  updateWebFilter: (mode: 'allow_all' | 'blacklist' | 'whitelist', blacklist: string[], whitelist: string[]) => Promise<void>;
  activeSosAlert: AlertItem | null;
  dismissSosAlert: () => void;
}

const FamilyGuardContext = createContext<FamilyGuardContextType | undefined>(undefined);

// Web Audio API beep sound for SOS alerts
function playEmergencySound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Ignore audio errors
  }
}

export const FamilyGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>('child_1');
  const [location, setLocation] = useState<LocationPoint | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [downtimes, setDowntimes] = useState<DowntimeSchedule[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [webFilter, setWebFilter] = useState<WebRule | null>(null);
  const [activeSession, setActiveSession] = useState<MonitoringSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingQr, setPairingQr] = useState<string | null>(null);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeSosAlert, setActiveSosAlert] = useState<AlertItem | null>(null);

  const activeChild = childrenList.find(c => c.id === activeChildId) || childrenList[0] || null;
  const activeDevice = activeChild?.devices[0] || null;

  // Fetch initial state from API
  const refreshAllData = useCallback(async () => {
    try {
      const [resChildren, resAlerts] = await Promise.all([
        fetch('/api/children').then(r => r.json()),
        fetch('/api/alerts/all').then(r => r.json())
      ]);

      if (resChildren.children) {
        setChildrenList(resChildren.children);
      }
      if (resAlerts.alerts) {
        setAlerts(resAlerts.alerts);
      }
    } catch (e) {
      console.error('Error fetching initial data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Fetch child-specific data whenever active child changes
  const fetchChildData = useCallback(async (childId: string) => {
    try {
      const [resLoc, resHistory, resGeos, resApps, resDown, resNotifs, resWeb] = await Promise.all([
        fetch(`/api/location/${childId}`).then(r => r.json()),
        fetch(`/api/location/${childId}/history`).then(r => r.json()),
        fetch(`/api/geofences/${childId}`).then(r => r.json()),
        fetch(`/api/apps/${childId}`).then(r => r.json()),
        fetch(`/api/screentime/downtime/${childId}`).then(r => r.json()),
        fetch(`/api/notifications/${childId}`).then(r => r.json()),
        fetch(`/api/webfilter/${childId}`).then(r => r.json())
      ]);

      if (resLoc.location) setLocation(resLoc.location);
      if (resHistory.history) setLocationHistory(resHistory.history);
      if (resGeos.geofences) setGeofences(resGeos.geofences);
      if (resApps.apps) setApps(resApps.apps);
      if (resDown.schedules) setDowntimes(resDown.schedules);
      if (resNotifs.notifications) setNotifications(resNotifs.notifications);
      if (resWeb.rule) setWebFilter(resWeb.rule);
    } catch (e) {
      console.error('Error fetching child details:', e);
    }
  }, []);

  useEffect(() => {
    if (activeChildId) {
      fetchChildData(activeChildId);
    }
  }, [activeChildId, fetchChildData]);

  // Actions
  const toggleInstantBlock = async (childId: string) => {
    const isCurrentlyBlocked = activeDevice?.isInstantBlocked ?? false;
    const nextState = !isCurrentlyBlocked;

    // Optimistic update
    setChildrenList(prev => prev.map(c => {
      if (c.id === childId) {
        return {
          ...c,
          devices: c.devices.map(d => ({ ...d, isInstantBlocked: nextState }))
        };
      }
      return c;
    }));

    try {
      await fetch(`/api/devices/${childId}/instant-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: nextState })
      });
      // Refresh alerts
      const res = await fetch(`/api/alerts/${childId}`).then(r => r.json());
      if (res.alerts) setAlerts(res.alerts);
    } catch (e) {
      console.error('Error toggling instant block:', e);
    }
  };

  const updateAppRule = async (packageName: string, isBlocked?: boolean, dailyLimitMinutes?: number | null) => {
    setApps(prev => prev.map(a => {
      if (a.packageName === packageName) {
        return {
          ...a,
          isBlocked: isBlocked !== undefined ? isBlocked : a.isBlocked,
          dailyLimitMinutes: dailyLimitMinutes !== undefined ? dailyLimitMinutes : a.dailyLimitMinutes
        };
      }
      return a;
    }));

    try {
      await fetch('/api/apps/rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: activeChildId,
          packageName,
          isBlocked,
          dailyLimitMinutes
        })
      });
    } catch (e) {
      console.error('Error updating app rule:', e);
    }
  };

  const generatePairingCode = async (childId: string) => {
    try {
      const res = await fetch('/api/pairing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId })
      }).then(r => r.json());

      if (res.pairingCode) {
        setPairingCode(res.pairingCode);
        setPairingQr(res.qrData);
        setIsPairingModalOpen(true);
      }
    } catch (e) {
      console.error('Error generating pairing code:', e);
    }
  };

  const verifyPairingCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/pairing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          deviceName: 'Galaxy Device',
          model: 'SM-G998B',
          androidVersion: 'Android 14 (API 34)'
        })
      }).then(r => r.json());

      if (res.success) {
        await refreshAllData();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error verifying pairing code:', e);
      return false;
    }
  };

  const triggerSosAlert = async (childId: string) => {
    playEmergencySound();
    try {
      const res = await fetch('/api/alerts/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          latitude: location?.latitude || 24.7136,
          longitude: location?.longitude || 46.6753,
          battery: activeDevice?.battery || 78,
          address: location?.address || 'موقع الطفل الحالي'
        })
      }).then(r => r.json());

      if (res.alert) {
        setActiveSosAlert(res.alert);
        setAlerts(prev => [res.alert, ...prev]);
      }
    } catch (e) {
      console.error('Error triggering SOS:', e);
    }
  };

  const updateChildLocation = async (latitude: number, longitude: number, address?: string) => {
    try {
      const res = await fetch('/api/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: activeChildId,
          latitude,
          longitude,
          address: address || `موقع محدث (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          accuracy: 5,
          battery: activeDevice?.battery || 78,
          speed: 12
        })
      }).then(r => r.json());

      if (res.location) {
        setLocation(res.location);
        setLocationHistory(prev => [...prev, res.location]);
        // Refresh alerts in case geofence was entered/exited
        const alertRes = await fetch(`/api/alerts/${activeChildId}`).then(r => r.json());
        if (alertRes.alerts) setAlerts(alertRes.alerts);
      }
    } catch (e) {
      console.error('Error updating location:', e);
    }
  };

  const startMonitoringSession = async (type: 'camera' | 'screen' | 'audio', cameraFacing?: 'front' | 'back') => {
    try {
      const res = await fetch('/api/monitoring/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: activeChildId,
          type,
          cameraFacing: cameraFacing || 'front',
          flashEnabled: false
        })
      }).then(r => r.json());

      if (res.session) {
        setActiveSession(res.session);
      }
    } catch (e) {
      console.error('Error starting monitoring session:', e);
    }
  };

  const stopMonitoringSession = async () => {
    if (!activeSession) return;
    try {
      await fetch('/api/monitoring/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id })
      });
      setActiveSession(null);
    } catch (e) {
      console.error('Error stopping monitoring:', e);
    }
  };

  const addGeofence = async (geo: Partial<Geofence>) => {
    try {
      const res = await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: activeChildId,
          name: geo.name || 'منطقة جديدة',
          type: geo.type || 'other',
          latitude: geo.latitude || location?.latitude || 24.7136,
          longitude: geo.longitude || location?.longitude || 46.6753,
          radius: geo.radius || 250
        })
      }).then(r => r.json());

      if (res.geofence) {
        setGeofences(prev => [...prev, res.geofence]);
      }
    } catch (e) {
      console.error('Error adding geofence:', e);
    }
  };

  const deleteGeofence = async (id: string) => {
    try {
      await fetch(`/api/geofences/${id}`, { method: 'DELETE' });
      setGeofences(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      console.error('Error deleting geofence:', e);
    }
  };

  const markAlertAsRead = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/read`, { method: 'POST' });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch (e) {
      console.error('Error marking alert as read:', e);
    }
  };

  const updateWebFilter = async (mode: 'allow_all' | 'blacklist' | 'whitelist', blacklist: string[], whitelist: string[]) => {
    try {
      const res = await fetch(`/api/webfilter/${activeChildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          blacklistDomains: blacklist,
          whitelistDomains: whitelist,
          safeSearchEnabled: true
        })
      }).then(r => r.json());

      if (res.rule) setWebFilter(res.rule);
    } catch (e) {
      console.error('Error updating web filter:', e);
    }
  };

  const dismissSosAlert = () => {
    setActiveSosAlert(null);
  };

  return (
    <FamilyGuardContext.Provider
      value={{
        childrenList,
        activeChild,
        setActiveChildId,
        activeDevice,
        location,
        locationHistory,
        geofences,
        apps,
        downtimes,
        alerts,
        notifications,
        webFilter,
        activeSession,
        isLoading,
        pairingCode,
        pairingQr,
        isPairingModalOpen,
        setIsPairingModalOpen,
        lang,
        setLang,
        isDarkMode,
        setIsDarkMode,
        toggleInstantBlock,
        updateAppRule,
        generatePairingCode,
        verifyPairingCode,
        triggerSosAlert,
        updateChildLocation,
        startMonitoringSession,
        stopMonitoringSession,
        addGeofence,
        deleteGeofence,
        markAlertAsRead,
        updateWebFilter,
        activeSosAlert,
        dismissSosAlert
      }}
    >
      {children}
    </FamilyGuardContext.Provider>
  );
};

export const useFamilyGuard = () => {
  const context = useContext(FamilyGuardContext);
  if (!context) {
    throw new Error('useFamilyGuard must be used within a FamilyGuardProvider');
  }
  return context;
};
