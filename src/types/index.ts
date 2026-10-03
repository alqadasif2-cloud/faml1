export interface DevicePermissions {
  location: boolean;
  backgroundLocation: boolean;
  notifications: boolean;
  notificationAccess: boolean;
  usageAccess: boolean;
  accessibility: boolean;
  camera: boolean;
  microphone: boolean;
  screenCapture: boolean;
  deviceAdmin: boolean;
}

export interface Device {
  id: string;
  childId: string;
  deviceName: string;
  model: string;
  androidVersion: string;
  battery: number;
  isCharging: boolean;
  networkStatus: 'WIFI' | 'LTE' | 'OFFLINE';
  appVersion: string;
  isInstantBlocked: boolean;
  lastSync: string;
  permissions: DevicePermissions;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  avatar: string;
  age: number;
  devices: Device[];
  status: 'online' | 'offline';
  lastSeen: string;
}

export interface LocationPoint {
  id: string;
  childId: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
  timestamp: string;
  battery: number;
  speed: number;
}

export interface Geofence {
  id: string;
  childId: string;
  name: string;
  type: 'school' | 'home' | 'work' | 'other';
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
  isInside: boolean;
}

export interface AppItem {
  id: string;
  childId: string;
  packageName: string;
  name: string;
  icon: string;
  category: 'social' | 'games' | 'video' | 'browsers' | 'education' | 'utility';
  usageTodayMinutes: number;
  dailyLimitMinutes: number | null;
  isBlocked: boolean;
  lastUsed: string;
  isAlwaysAllowed: boolean;
}

export interface DowntimeSchedule {
  id: string;
  childId: string;
  name: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: number[];
  allowedApps: string[];
}

export interface AlertItem {
  id: string;
  childId: string;
  childName: string;
  type: 'sos' | 'low_battery' | 'geofence_enter' | 'geofence_exit' | 'app_blocked_attempt' | 'permission_revoked' | 'monitoring_started' | 'offline';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationLog {
  id: string;
  childId: string;
  appName: string;
  packageName: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface WebRule {
  id: string;
  childId: string;
  mode: 'allow_all' | 'blacklist' | 'whitelist';
  blacklistDomains: string[];
  whitelistDomains: string[];
  safeSearchEnabled: boolean;
}

export interface MonitoringSession {
  id: string;
  childId: string;
  type: 'camera' | 'screen' | 'audio';
  cameraFacing?: 'front' | 'back';
  flashEnabled?: boolean;
  status: 'requesting' | 'active' | 'denied' | 'stopped';
  startedAt: string;
}
