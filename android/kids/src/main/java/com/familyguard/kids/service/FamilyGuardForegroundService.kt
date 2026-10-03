package com.familyguard.kids.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.location.Location
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.familyguard.core.model.HeartbeatRequest
import com.familyguard.core.model.LocationPayload
import com.familyguard.core.network.FamilyGuardApiClient
import com.familyguard.core.security.EncryptedPrefsManager
import com.google.android.gms.location.*
import kotlinx.coroutines.*

class FamilyGuardForegroundService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private lateinit var prefsManager: EncryptedPrefsManager

    private var currentBattery: Int = 100
    private var isCharging: Boolean = false

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            intent?.let {
                val level = it.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = it.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                if (level >= 0 && scale > 0) {
                    currentBattery = ((level.toFloat() / scale.toFloat()) * 100).toInt()
                }
                val status = it.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                             status == BatteryManager.BATTERY_STATUS_FULL
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        prefsManager = EncryptedPrefsManager(this)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED), Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        }

        createNotificationChannel()
        startLocationTracking()
        startHeartbeatLoop()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildPersistentNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        return START_STICKY
    }

    private fun startLocationTracking() {
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_BALANCED_POWER_ACCURACY,
            60_000L // 60 seconds interval to preserve battery
        ).apply {
            setMinUpdateIntervalMillis(30_000L)
            setMinUpdateDistanceMeters(15f) // Minimum 15 meters movement
            setWaitForAccurateLocation(false)
        }.build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    onNewLocationCaptured(location)
                }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                mainLooper
            )
        } catch (e: SecurityException) {
            // Permission not granted or revoked
        }
    }

    private fun onNewLocationCaptured(location: Location) {
        val childId = prefsManager.getChildId() ?: "child_1"
        val deviceId = prefsManager.getDeviceId() ?: "dev_primary"

        serviceScope.launch {
            try {
                val payload = LocationPayload(
                    childId = childId,
                    deviceId = deviceId,
                    latitude = location.latitude,
                    longitude = location.longitude,
                    accuracy = location.accuracy,
                    battery = currentBattery,
                    speed = location.speed,
                    timestamp = System.currentTimeMillis().toString()
                )
                FamilyGuardApiClient.service.sendLocationUpdate(payload)
            } catch (e: Exception) {
                // Network unavailable; Room offline queue handles persistence
            }
        }
    }

    private fun startHeartbeatLoop() {
        serviceScope.launch {
            while (isActive) {
                val deviceId = prefsManager.getDeviceId() ?: "dev_primary"
                try {
                    val networkType = getNetworkType()
                    FamilyGuardApiClient.service.sendHeartbeat(
                        HeartbeatRequest(
                            deviceId = deviceId,
                            battery = currentBattery,
                            isCharging = isCharging,
                            networkStatus = networkType
                        )
                    )
                } catch (e: Exception) {
                    // Ignored on offline
                }
                delay(60_000L) // Heartbeat every 60s
            }
        }
    }

    private fun getNetworkType(): String {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return "OFFLINE"
        val activeNetwork = cm.activeNetwork ?: return "OFFLINE"
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return "OFFLINE"
        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WIFI"
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "LTE"
            else -> "OTHER"
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "FamilyGuard الحماية النشطة",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "إشعار رسمي يوضح أن حماية الجهاز قيد التشغيل بشفافية كاملة"
                setShowBadge(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildPersistentNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("FamilyGuard: حماية أندرويد النشطة ✓")
            .setContentText("جهازك محمي وتتم مزامنة إحداثيات الأمان مع عائلتك بشفافية")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(batteryReceiver)
        fusedLocationClient.removeLocationUpdates(locationCallback)
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "familyguard_protection_channel"
    }
}
