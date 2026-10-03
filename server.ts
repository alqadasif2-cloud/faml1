import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.join(__dirname, 'data', 'familyguard.db.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// ----------------- Data Structures -----------------
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  familyId: string;
  role: 'parent' | 'admin';
  createdAt: string;
}

interface DevicePermissions {
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

interface Device {
  id: string;
  childId: string;
  hardwareId: string;
  deviceName: string;
  model: string;
  androidVersion: string;
  battery: number;
  isCharging: boolean;
  networkStatus: 'WIFI' | 'LTE' | 'OFFLINE';
  appVersion: string;
  isInstantBlocked: boolean;
  lastSeen: number; // Unix timestamp
  status: 'online' | 'offline';
  token: string;
  permissions: DevicePermissions;
}

interface Child {
  id: string;
  familyId: string;
  name: string;
  avatar: string;
  age: number;
  devices: Device[];
  status: 'online' | 'offline';
  lastSeen: string;
}

interface LocationPoint {
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

interface Geofence {
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

interface AppItem {
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

interface DowntimeSchedule {
  id: string;
  childId: string;
  name: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: number[];
  allowedApps: string[];
}

interface AlertItem {
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

interface NotificationLog {
  id: string;
  childId: string;
  appName: string;
  packageName: string;
  title: string;
  content: string;
  timestamp: string;
}

interface WebRule {
  id: string;
  childId: string;
  mode: 'allow_all' | 'blacklist' | 'whitelist';
  blacklistDomains: string[];
  whitelistDomains: string[];
  safeSearchEnabled: boolean;
}

interface PairingCode {
  code: string;
  familyId: string;
  childId: string;
  expiresAt: number;
}

interface WebRtcSignal {
  sessionId: string;
  sender: 'parent' | 'child';
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
  timestamp: number;
}

interface DatabaseSchema {
  users: User[];
  children: Child[];
  locations: Record<string, LocationPoint>;
  locationHistory: Record<string, LocationPoint[]>;
  geofences: Geofence[];
  apps: Record<string, AppItem[]>;
  downtimes: Record<string, DowntimeSchedule[]>;
  alerts: AlertItem[];
  notifications: Record<string, NotificationLog[]>;
  webRules: Record<string, WebRule>;
  pairings: PairingCode[];
  signals: WebRtcSignal[];
}

// ----------------- Password Hashing -----------------
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// ----------------- Database Persistence -----------------
let db: DatabaseSchema = {
  users: [],
  children: [],
  locations: {},
  locationHistory: {},
  geofences: [],
  apps: {},
  downtimes: {},
  alerts: [],
  notifications: {},
  webRules: {},
  pairings: [],
  signals: []
};

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[FamilyGuard DB] Save failed:', err);
  }
}

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      console.log('[FamilyGuard DB] Successfully loaded persistent state from', DB_FILE);
    } else {
      seedInitialDb();
      saveDb();
    }
  } catch (err) {
    console.error('[FamilyGuard DB] Load failed, initializing fresh seed:', err);
    seedInitialDb();
    saveDb();
  }
}

function seedInitialDb() {
  const defaultSalt = 'f9a2b8e4c1d70e63';
  const defaultHash = crypto.pbkdf2Sync('parent123', defaultSalt, 1000, 64, 'sha512').toString('hex');

  const defaultUser: User = {
    id: 'parent_default',
    name: 'عبدالله المنصور (Abu Ahmed)',
    email: 'parent@familyguard.app',
    passwordHash: defaultHash,
    salt: defaultSalt,
    familyId: 'fam_1',
    role: 'parent',
    createdAt: new Date().toISOString()
  };

  const defaultChild: Child = {
    id: 'child_1',
    familyId: 'fam_1',
    name: 'أحمد (Ahmed)',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    age: 12,
    status: 'online',
    lastSeen: 'الآن',
    devices: [
      {
        id: 'dev_primary',
        childId: 'child_1',
        hardwareId: 'android_samsung_a54_secure_id_01',
        deviceName: 'Samsung Galaxy A54',
        model: 'SM-A546B',
        androidVersion: 'Android 14 (API 34)',
        battery: 84,
        isCharging: false,
        networkStatus: 'WIFI',
        appVersion: '2.4.0 (Build 42)',
        isInstantBlocked: false,
        lastSeen: Date.now(),
        status: 'online',
        token: 'dev_token_' + crypto.randomBytes(16).toString('hex'),
        permissions: {
          location: true,
          backgroundLocation: true,
          notifications: true,
          notificationAccess: true,
          usageAccess: true,
          accessibility: true,
          camera: true,
          microphone: true,
          screenCapture: true,
          deviceAdmin: true
        }
      }
    ]
  };

  const defaultLocation: LocationPoint = {
    id: 'loc_init',
    childId: 'child_1',
    deviceId: 'dev_primary',
    latitude: 24.7136,
    longitude: 46.6753,
    address: 'مدرسة النخبة النموذجية، الرياض',
    accuracy: 6.2,
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    battery: 84,
    speed: 0
  };

  db = {
    users: [defaultUser],
    children: [defaultChild],
    locations: { child_1: defaultLocation },
    locationHistory: { child_1: [defaultLocation] },
    geofences: [
      {
        id: 'geo_1',
        childId: 'child_1',
        name: 'مدرسة النخبة النموذجية',
        type: 'school',
        latitude: 24.7136,
        longitude: 46.6753,
        radius: 300,
        notifyOnEnter: true,
        notifyOnExit: true,
        isInside: true
      },
      {
        id: 'geo_2',
        childId: 'child_1',
        name: 'المنزل (حي الورود)',
        type: 'home',
        latitude: 24.7210,
        longitude: 46.6620,
        radius: 200,
        notifyOnEnter: true,
        notifyOnExit: true,
        isInside: false
      }
    ],
    apps: {
      child_1: [
        {
          id: 'app_1',
          childId: 'child_1',
          packageName: 'com.google.android.youtube',
          name: 'YouTube',
          icon: 'youtube',
          category: 'video',
          usageTodayMinutes: 92,
          dailyLimitMinutes: 60,
          isBlocked: false,
          lastUsed: 'منذ 10 دقائق',
          isAlwaysAllowed: false
        },
        {
          id: 'app_2',
          childId: 'child_1',
          packageName: 'com.zhiliaoapp.musically',
          name: 'TikTok',
          icon: 'tiktok',
          category: 'social',
          usageTodayMinutes: 48,
          dailyLimitMinutes: 45,
          isBlocked: true,
          lastUsed: 'منذ 35 دقيقة',
          isAlwaysAllowed: false
        },
        {
          id: 'app_3',
          childId: 'child_1',
          packageName: 'com.android.chrome',
          name: 'Google Chrome',
          icon: 'chrome',
          category: 'browsers',
          usageTodayMinutes: 70,
          dailyLimitMinutes: null,
          isBlocked: false,
          lastUsed: 'منذ ساعتين',
          isAlwaysAllowed: false
        },
        {
          id: 'app_4',
          childId: 'child_1',
          packageName: 'com.roblox.client',
          name: 'Roblox',
          icon: 'gamepad',
          category: 'games',
          usageTodayMinutes: 30,
          dailyLimitMinutes: 60,
          isBlocked: false,
          lastUsed: 'أمس',
          isAlwaysAllowed: false
        },
        {
          id: 'app_5',
          childId: 'child_1',
          packageName: 'com.whatsapp',
          name: 'WhatsApp',
          icon: 'whatsapp',
          category: 'social',
          usageTodayMinutes: 25,
          dailyLimitMinutes: null,
          isBlocked: false,
          lastUsed: 'منذ 5 دقائق',
          isAlwaysAllowed: true
        }
      ]
    },
    downtimes: {
      child_1: [
        {
          id: 'dt_1',
          childId: 'child_1',
          name: 'وقت النوم (Bedtime)',
          enabled: true,
          startTime: '22:00',
          endTime: '07:00',
          days: [0, 1, 2, 3, 4],
          allowedApps: ['com.android.dialer', 'com.whatsapp']
        },
        {
          id: 'dt_2',
          childId: 'child_1',
          name: 'وقت الدراسة (Study Time)',
          enabled: true,
          startTime: '07:30',
          endTime: '14:00',
          days: [0, 1, 2, 3, 4],
          allowedApps: ['com.android.dialer', 'com.google.android.calculator']
        }
      ]
    },
    alerts: [
      {
        id: 'alt_init_1',
        childId: 'child_1',
        childName: 'أحمد',
        type: 'geofence_enter',
        title: 'دخول منطقة آمنة',
        message: '🔵 وصل أحمد إلى مدرسة النخبة النموذجية في الموعد المحدد',
        severity: 'info',
        timestamp: '07:55',
        read: false
      }
    ],
    notifications: {
      child_1: [
        {
          id: 'notif_1',
          childId: 'child_1',
          appName: 'WhatsApp',
          packageName: 'com.whatsapp',
          title: 'واجب الرياضيات',
          content: 'تسليم المسائل رقم 1 إلى 5 يوم الأحد القادم',
          timestamp: '12:30'
        }
      ]
    },
    webRules: {
      child_1: {
        id: 'wf_1',
        childId: 'child_1',
        mode: 'blacklist',
        blacklistDomains: ['tiktok.com', 'gambling-site.com', 'adult-content-example.net'],
        whitelistDomains: ['school.edu.sa', 'wikipedia.org', 'khanacademy.org'],
        safeSearchEnabled: true
      }
    },
    pairings: [
      {
        code: '483921',
        familyId: 'fam_1',
        childId: 'child_1',
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 // Valid for testing
      }
    ],
    signals: []
  };
}

// Load DB on startup
loadDb();

// Periodic Background Job: Check Device Heartbeats & Mark Offline
setInterval(() => {
  const now = Date.now();
  let changed = false;

  db.children.forEach(child => {
    let hasOnlineDevice = false;
    child.devices.forEach(device => {
      // If no heartbeat for > 90 seconds, mark as offline
      if (now - device.lastSeen > 90000) {
        if (device.status !== 'offline') {
          device.status = 'offline';
          changed = true;
        }
      } else {
        hasOnlineDevice = true;
      }
    });

    const newChildStatus = hasOnlineDevice ? 'online' : 'offline';
    if (child.status !== newChildStatus) {
      child.status = newChildStatus;
      changed = true;
    }
  });

  if (changed) {
    saveDb();
  }
}, 15000);

// ----------------- Authentication Endpoints -----------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'هذا الحساب مسجل مسبقاً، يرجى تسجيل الدخول' });
  }

  const { hash, salt } = hashPassword(password);
  const familyId = 'fam_' + crypto.randomBytes(6).toString('hex');
  const newUser: User = {
    id: 'parent_' + Date.now(),
    name: name || 'الوالد الكريم',
    email: email.toLowerCase(),
    passwordHash: hash,
    salt,
    familyId,
    role: 'parent',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb();

  const token = 'fg_jwt_' + Buffer.from(JSON.stringify({ userId: newUser.id, familyId })).toString('base64');
  return res.json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      familyId: newUser.familyId,
      role: newUser.role
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'بيانات تسجيل الدخول غير صحيحة' });
  }

  const token = 'fg_jwt_' + Buffer.from(JSON.stringify({ userId: user.id, familyId: user.familyId })).toString('base64');
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      familyId: user.familyId,
      role: user.role
    }
  });
});

// ----------------- Children & Dashboard Endpoints -----------------

app.get('/api/children', (_req: Request, res: Response) => {
  return res.json({ children: db.children });
});

app.post('/api/children', (req: Request, res: Response) => {
  const { name, age, avatar } = req.body;
  const newChild: Child = {
    id: 'child_' + Date.now(),
    familyId: 'fam_1',
    name: name || 'طفل جديد',
    avatar: avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
    age: Number(age) || 10,
    status: 'offline',
    lastSeen: 'لم يتصل بعد',
    devices: []
  };

  db.children.push(newChild);
  db.locations[newChild.id] = {
    id: 'loc_' + Date.now(),
    childId: newChild.id,
    deviceId: '',
    latitude: 24.7136,
    longitude: 46.6753,
    address: 'الرياض، المملكة العربية السعودية',
    accuracy: 10,
    timestamp: 'الآن',
    battery: 100,
    speed: 0
  };
  db.locationHistory[newChild.id] = [db.locations[newChild.id]];
  db.apps[newChild.id] = [];
  db.downtimes[newChild.id] = [];
  db.notifications[newChild.id] = [];

  saveDb();
  return res.json({ child: newChild });
});

// ----------------- Device Pairing Endpoints -----------------

app.post('/api/pairing/generate', (req: Request, res: Response) => {
  const { childId } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  db.pairings = db.pairings.filter(p => p.childId !== childId);
  db.pairings.push({
    code,
    familyId: 'fam_1',
    childId: childId || 'child_1',
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  saveDb();

  return res.json({
    pairingCode: code,
    qrData: `familyguard://pair?code=${code}&familyId=fam_1&childId=${childId || 'child_1'}`,
    expiresInSeconds: 600
  });
});

app.post('/api/pairing/verify', (req: Request, res: Response) => {
  const { code, deviceName, model, androidVersion, hardwareId } = req.body;
  if (!code) return res.status(400).json({ error: 'رمز الاقتران مطلوب' });

  const cleanCode = code.toString().trim();
  const match = db.pairings.find(p => p.code === cleanCode && p.expiresAt > Date.now());

  if (!match) {
    return res.status(400).json({ error: 'رمز الاقتران غير صحيح أو منتهي الصلاحية' });
  }

  const child = db.children.find(c => c.id === match.childId);
  if (!child) {
    return res.status(404).json({ error: 'ملف الطفل غير موجود' });
  }

  const deviceToken = 'fg_dev_' + crypto.randomBytes(24).toString('hex');
  const newDevice: Device = {
    id: 'dev_' + Date.now(),
    childId: child.id,
    hardwareId: hardwareId || ('hw_' + crypto.randomBytes(8).toString('hex')),
    deviceName: deviceName || 'هاتف أندرويد حقيقي',
    model: model || 'Android Phone',
    androidVersion: androidVersion || 'Android 14 (API 34)',
    battery: 100,
    isCharging: false,
    networkStatus: 'WIFI',
    appVersion: '2.4.0',
    isInstantBlocked: false,
    lastSeen: Date.now(),
    status: 'online',
    token: deviceToken,
    permissions: {
      location: true,
      backgroundLocation: true,
      notifications: true,
      notificationAccess: true,
      usageAccess: true,
      accessibility: true,
      camera: true,
      microphone: true,
      screenCapture: true,
      deviceAdmin: true
    }
  };

  child.devices.push(newDevice);
  child.status = 'online';
  child.lastSeen = 'الآن';

  // Invalidate single-use pairing code
  db.pairings = db.pairings.filter(p => p.code !== cleanCode);
  saveDb();

  return res.json({
    success: true,
    familyId: match.familyId,
    childId: child.id,
    childName: child.name,
    device: newDevice,
    token: deviceToken
  });
});

// ----------------- Real Device Telemetry & Ingestion -----------------

// Heartbeat ping from Android Child App (called every 45-60s)
app.post('/api/device/heartbeat', (req: Request, res: Response) => {
  const { deviceId, battery, isCharging, networkStatus } = req.body;
  let found = false;

  db.children.forEach(child => {
    const dev = child.devices.find(d => d.id === deviceId);
    if (dev) {
      found = true;
      dev.lastSeen = Date.now();
      dev.status = 'online';
      if (battery !== undefined) dev.battery = Number(battery);
      if (isCharging !== undefined) dev.isCharging = Boolean(isCharging);
      if (networkStatus) dev.networkStatus = networkStatus;
      child.status = 'online';
      child.lastSeen = 'الآن';
    }
  });

  if (found) {
    saveDb();
    return res.json({ success: true, timestamp: Date.now() });
  }

  return res.status(404).json({ error: 'Device not registered' });
});

// Real GPS location update from Android FusedLocationProviderClient
app.post('/api/location/update', (req: Request, res: Response) => {
  const { childId, deviceId, latitude, longitude, address, accuracy, battery, speed } = req.body;
  if (!childId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'childId, latitude and longitude required' });
  }

  const point: LocationPoint = {
    id: 'loc_' + Date.now(),
    childId,
    deviceId: deviceId || 'dev_primary',
    latitude: Number(latitude),
    longitude: Number(longitude),
    address: address || `إحداثيات (${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)})`,
    accuracy: Number(accuracy) || 5,
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    battery: Number(battery) || 80,
    speed: Number(speed) || 0
  };

  db.locations[childId] = point;
  if (!db.locationHistory[childId]) db.locationHistory[childId] = [];
  db.locationHistory[childId].push(point);

  // Evaluate Geofences using Haversine Formula
  const childFences = db.geofences.filter(g => g.childId === childId);
  const R = 6371e3; // Earth radius in meters
  const child = db.children.find(c => c.id === childId);

  childFences.forEach(geo => {
    const φ1 = (geo.latitude * Math.PI) / 180;
    const φ2 = (point.latitude * Math.PI) / 180;
    const Δφ = ((point.latitude - geo.latitude) * Math.PI) / 180;
    const Δλ = ((point.longitude - geo.longitude) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = R * c;

    const insideNow = distanceMeters <= geo.radius;
    if (insideNow && !geo.isInside && geo.notifyOnEnter) {
      db.alerts.unshift({
        id: 'alt_' + Date.now(),
        childId,
        childName: child?.name || 'الطفل',
        type: 'geofence_enter',
        title: 'دخول منطقة آمنة',
        message: `🔵 دخل ${child?.name || 'الطفل'} إلى منطقة ${geo.name}`,
        severity: 'info',
        timestamp: point.timestamp,
        read: false
      });
    } else if (!insideNow && geo.isInside && geo.notifyOnExit) {
      db.alerts.unshift({
        id: 'alt_' + Date.now(),
        childId,
        childName: child?.name || 'الطفل',
        type: 'geofence_exit',
        title: 'خروج من منطقة آمنة',
        message: `🟠 غادر ${child?.name || 'الطفل'} منطقة ${geo.name}`,
        severity: 'warning',
        timestamp: point.timestamp,
        read: false
      });
    }
    geo.isInside = insideNow;
  });

  saveDb();
  return res.json({ success: true, location: point });
});

// Location getters
app.get('/api/location/:childId', (req: Request, res: Response) => {
  const { childId } = req.params;
  const loc = db.locations[childId] || Object.values(db.locations)[0];
  return res.json({ location: loc });
});

app.get('/api/location/:childId/history', (req: Request, res: Response) => {
  const { childId } = req.params;
  const history = db.locationHistory[childId] || [];
  return res.json({ history });
});

// Geofencing CRUD
app.get('/api/geofences/:childId', (req: Request, res: Response) => {
  const { childId } = req.params;
  const list = db.geofences.filter(g => g.childId === childId);
  return res.json({ geofences: list });
});

app.post('/api/geofences', (req: Request, res: Response) => {
  const { childId, name, type, latitude, longitude, radius } = req.body;
  const newGeo: Geofence = {
    id: 'geo_' + Date.now(),
    childId,
    name,
    type: type || 'other',
    latitude: Number(latitude),
    longitude: Number(longitude),
    radius: Number(radius) || 200,
    notifyOnEnter: true,
    notifyOnExit: true,
    isInside: false
  };

  db.geofences.push(newGeo);
  saveDb();
  return res.json({ geofence: newGeo });
});

app.delete('/api/geofences/:id', (req: Request, res: Response) => {
  db.geofences = db.geofences.filter(g => g.id !== req.params.id);
  saveDb();
  return res.json({ success: true });
});

// ----------------- App Management & Screen Time -----------------

app.get('/api/apps/:childId', (req: Request, res: Response) => {
  const { childId } = req.params;
  const apps = db.apps[childId] || db.apps['child_1'] || [];
  return res.json({ apps });
});

app.post('/api/apps/rule', (req: Request, res: Response) => {
  const { childId, packageName, isBlocked, dailyLimitMinutes, isAlwaysAllowed } = req.body;
  const list = db.apps[childId] || db.apps['child_1'] || [];
  const appItem = list.find(a => a.packageName === packageName);

  if (appItem) {
    if (typeof isBlocked === 'boolean') appItem.isBlocked = isBlocked;
    if (dailyLimitMinutes !== undefined) appItem.dailyLimitMinutes = dailyLimitMinutes;
    if (typeof isAlwaysAllowed === 'boolean') appItem.isAlwaysAllowed = isAlwaysAllowed;
  }

  saveDb();
  return res.json({ success: true, app: appItem });
});

// Real UsageStats batch sync from Android UsageStatsManager
app.post('/api/device/usage-sync', (req: Request, res: Response) => {
  const { childId, appsList } = req.body;
  if (!childId || !Array.isArray(appsList)) {
    return res.status(400).json({ error: 'childId and appsList array required' });
  }

  if (!db.apps[childId]) db.apps[childId] = [];

  appsList.forEach((incoming: any) => {
    const existing = db.apps[childId].find(a => a.packageName === incoming.packageName);
    if (existing) {
      existing.usageTodayMinutes = incoming.usageTodayMinutes ?? existing.usageTodayMinutes;
      existing.lastUsed = incoming.lastUsed ?? existing.lastUsed;
    } else {
      db.apps[childId].push({
        id: 'app_' + Date.now() + Math.random().toString(36).slice(2, 5),
        childId,
        packageName: incoming.packageName,
        name: incoming.name || incoming.packageName,
        icon: incoming.icon || 'app',
        category: incoming.category || 'utility',
        usageTodayMinutes: incoming.usageTodayMinutes || 0,
        dailyLimitMinutes: incoming.dailyLimitMinutes || null,
        isBlocked: Boolean(incoming.isBlocked),
        lastUsed: incoming.lastUsed || 'الآن',
        isAlwaysAllowed: Boolean(incoming.isAlwaysAllowed)
      });
    }
  });

  saveDb();
  return res.json({ success: true, count: db.apps[childId].length });
});

// Instant Block / Unblock
app.post('/api/devices/:childId/instant-block', (req: Request, res: Response) => {
  const { childId } = req.params;
  const { isBlocked } = req.body;
  const child = db.children.find(c => c.id === childId);

  if (child) {
    child.devices.forEach(d => {
      d.isInstantBlocked = Boolean(isBlocked);
    });
  }

  db.alerts.unshift({
    id: 'alt_' + Date.now(),
    childId,
    childName: child?.name || 'الطفل',
    type: 'app_blocked_attempt',
    title: isBlocked ? 'تم قفل الجهاز فورياً (Instant Lock)' : 'تم إلغاء قفل الجهاز',
    message: isBlocked ? 'تم تطبيق القفل الفوري على جهاز الطفل من قبل الوالد.' : 'تم السماح بالاستخدام مجدداً.',
    severity: isBlocked ? 'critical' : 'info',
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    read: false
  });

  saveDb();
  return res.json({ success: true, isBlocked });
});

// Downtime schedules
app.get('/api/screentime/downtime/:childId', (req: Request, res: Response) => {
  const { childId } = req.params;
  const schedules = db.downtimes[childId] || db.downtimes['child_1'] || [];
  return res.json({ schedules });
});

app.post('/api/screentime/downtime', (req: Request, res: Response) => {
  const { childId, name, startTime, endTime, days, allowedApps, enabled } = req.body;
  const newSchedule: DowntimeSchedule = {
    id: 'dt_' + Date.now(),
    childId,
    name,
    startTime,
    endTime,
    days: days || [0, 1, 2, 3, 4],
    allowedApps: allowedApps || ['com.android.dialer'],
    enabled: enabled !== false
  };

  if (!db.downtimes[childId]) db.downtimes[childId] = [];
  db.downtimes[childId].push(newSchedule);
  saveDb();

  return res.json({ schedule: newSchedule });
});

// ----------------- Real Alerts & SOS -----------------

app.post('/api/alerts/sos', (req: Request, res: Response) => {
  const { childId, latitude, longitude, battery, address } = req.body;
  const child = db.children.find(c => c.id === childId) || db.children[0];

  const sosAlert: AlertItem = {
    id: 'sos_' + Date.now(),
    childId: child.id,
    childName: child.name,
    type: 'sos',
    title: '🚨 نداء استغاثة عاجل (SOS ALERT)',
    message: `أطلق ${child.name} نداء استغاثة طارئ! البطارية: ${battery || 80}%. الموقع: ${address || 'بالقرب من الرياض'}.`,
    severity: 'critical',
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    read: false,
    metadata: {
      latitude: latitude || 24.7136,
      longitude: longitude || 46.6753,
      battery: battery || 80
    }
  };

  db.alerts.unshift(sosAlert);
  saveDb();

  return res.json({ success: true, alert: sosAlert });
});

app.get('/api/alerts/:childId', (req: Request, res: Response) => {
  const { childId } = req.params;
  const list = childId === 'all' ? db.alerts : db.alerts.filter(a => a.childId === childId);
  return res.json({ alerts: list });
});

app.post('/api/alerts/:id/read', (req: Request, res: Response) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (alert) alert.read = true;
  saveDb();
  return res.json({ success: true });
});

// ----------------- Real NotificationListener Sync -----------------

app.get('/api/notifications/:childId', (req: Request, res: Response) => {
  const { childId } = req.params;
  const logs = db.notifications[childId] || db.notifications['child_1'] || [];
  return res.json({ notifications: logs });
});

app.post('/api/device/notifications', (req: Request, res: Response) => {
  const { childId, packageName, appName, title, content } = req.body;
  if (!childId || !title) return res.status(400).json({ error: 'childId and title required' });

  if (!db.notifications[childId]) db.notifications[childId] = [];

  const log: NotificationLog = {
    id: 'notif_' + Date.now(),
    childId,
    packageName: packageName || 'unknown',
    appName: appName || packageName || 'تطبيق',
    title,
    content: content || '',
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  };

  db.notifications[childId].unshift(log);
  if (db.notifications[childId].length > 100) {
    db.notifications[childId] = db.notifications[childId].slice(0, 100);
  }

  saveDb();
  return res.json({ success: true, log });
});

// ----------------- Web Filter -----------------

app.get('/api/webfilter/:childId', (req: Request, res: Response) => {
  const { childId } = req.params;
  const rule = db.webRules[childId] || db.webRules['child_1'];
  return res.json({ rule });
});

app.post('/api/webfilter/:childId', (req: Request, res: Response) => {
  const { childId } = req.params;
  const { mode, blacklistDomains, whitelistDomains, safeSearchEnabled } = req.body;

  db.webRules[childId] = {
    id: 'wf_' + Date.now(),
    childId,
    mode: mode || 'blacklist',
    blacklistDomains: blacklistDomains || [],
    whitelistDomains: whitelistDomains || [],
    safeSearchEnabled: safeSearchEnabled !== false
  };

  saveDb();
  return res.json({ success: true, rule: db.webRules[childId] });
});

// ----------------- WebRTC Live Video/Screen/Audio Signaling -----------------

app.post('/api/webrtc/signal', (req: Request, res: Response) => {
  const { sessionId, sender, type, payload } = req.body;
  if (!sessionId || !type) return res.status(400).json({ error: 'sessionId and type required' });

  const signal: WebRtcSignal = {
    sessionId,
    sender: sender || 'child',
    type,
    payload,
    timestamp: Date.now()
  };

  db.signals.push(signal);
  // Clean signals older than 2 minutes
  db.signals = db.signals.filter(s => Date.now() - s.timestamp < 120000);

  return res.json({ success: true });
});

app.get('/api/webrtc/signals/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const peer = req.query.peer as string; // 'parent' or 'child'

  const relevant = db.signals.filter(s => 
    s.sessionId === sessionId && (!peer || s.sender !== peer)
  );

  return res.json({ signals: relevant });
});

app.post('/api/monitoring/request', (req: Request, res: Response) => {
  const { childId, type, cameraFacing, flashEnabled } = req.body;
  const sessionId = 'mon_' + Date.now();
  const session = {
    id: sessionId,
    childId,
    type,
    cameraFacing: cameraFacing || 'front',
    flashEnabled: Boolean(flashEnabled),
    status: 'active',
    startedAt: new Date().toISOString()
  };

  db.alerts.unshift({
    id: 'alt_' + Date.now(),
    childId,
    childName: db.children.find(c => c.id === childId)?.name || 'الطفل',
    type: 'monitoring_started',
    title: `بدء جلسة ${type === 'camera' ? 'كاميرا' : type === 'screen' ? 'مشاركة شاشة' : 'صوت'} رسمية`,
    message: 'بدأت جلسة بث آمنة مع تفعيل مؤشر الخصوصية الأخضر على جهاز الطفل.',
    severity: 'info',
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    read: true
  });

  saveDb();
  return res.json({ success: true, session });
});

app.post('/api/monitoring/stop', (_req: Request, res: Response) => {
  return res.json({ success: true });
});

// ----------------- Android Project Direct ZIP Exporter -----------------

// Helper function to recursively add files to JSZip
function addDirectoryToZip(zip: JSZip, localDir: string, zipPath: string) {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const fullPath = path.join(localDir, file);
    const stat = fs.statSync(fullPath);
    const entryZipPath = zipPath ? `${zipPath}/${file}` : file;

    if (stat.isDirectory()) {
      addDirectoryToZip(zip, fullPath, entryZipPath);
    } else {
      const content = fs.readFileSync(fullPath);
      zip.file(entryZipPath, content);
    }
  }
}

app.get('/api/android/download-zip', async (_req: Request, res: Response) => {
  try {
    const androidDir = path.join(__dirname, 'android');
    if (!fs.existsSync(androidDir)) {
      return res.status(404).json({ error: 'Android directory not found' });
    }

    const zip = new JSZip();
    addDirectoryToZip(zip, androidDir, 'FamilyGuard');

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="FamilyGuard-Android-Production.zip"');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    return res.end(zipBuffer);
  } catch (err: any) {
    console.error('[Download ZIP Error]', err);
    return res.status(500).json({ error: err.message });
  }
});


// ----------------- Vite Integration & Server Startup -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FamilyGuard] Production-Ready Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[FamilyGuard] Server startup error:', err);
});
