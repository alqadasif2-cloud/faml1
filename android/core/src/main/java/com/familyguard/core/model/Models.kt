package com.familyguard.core.model

import kotlinx.serialization.Serializable

@Serializable
data class Child(
    val id: String,
    val familyId: String,
    val name: String,
    val avatar: String,
    val age: Int,
    val status: String,
    val lastSeen: String,
    val devices: List<Device> = emptyList()
)

@Serializable
data class Device(
    val id: String,
    val childId: String,
    val hardwareId: String = "",
    val deviceName: String,
    val model: String,
    val androidVersion: String,
    val battery: Int,
    val isCharging: Boolean = false,
    val networkStatus: String = "WIFI",
    val appVersion: String,
    val isInstantBlocked: Boolean = false,
    val lastSync: String = "",
    val permissions: DevicePermissions = DevicePermissions()
)

@Serializable
data class DevicePermissions(
    val location: Boolean = false,
    val backgroundLocation: Boolean = false,
    val notifications: Boolean = false,
    val notificationAccess: Boolean = false,
    val usageAccess: Boolean = false,
    val accessibility: Boolean = false,
    val camera: Boolean = false,
    val microphone: Boolean = false,
    val screenCapture: Boolean = false,
    val deviceAdmin: Boolean = false
)

@Serializable
data class LocationPayload(
    val childId: String,
    val deviceId: String = "",
    val latitude: Double,
    val longitude: Double,
    val address: String = "",
    val accuracy: Float = 0f,
    val battery: Int = 100,
    val speed: Float = 0f,
    val timestamp: String = ""
)

@Serializable
data class GeofenceRule(
    val id: String,
    val childId: String,
    val name: String,
    val type: String,
    val latitude: Double,
    val longitude: Double,
    val radius: Double,
    val notifyOnEnter: Boolean = true,
    val notifyOnExit: Boolean = true,
    val isInside: Boolean = false
)

@Serializable
data class AppRule(
    val packageName: String,
    val name: String,
    val category: String = "utility",
    val usageTodayMinutes: Int = 0,
    val dailyLimitMinutes: Int? = null,
    val isBlocked: Boolean = false,
    val isAlwaysAllowed: Boolean = false,
    val lastUsed: String = ""
)

@Serializable
data class AlertNotification(
    val id: String,
    val childId: String,
    val childName: String,
    val type: String,
    val title: String,
    val message: String,
    val severity: String,
    val timestamp: String,
    val read: Boolean = false
)

@Serializable
data class PairingRequest(
    val code: String,
    val deviceName: String,
    val model: String,
    val androidVersion: String,
    val hardwareId: String = ""
)

@Serializable
data class PairingResponse(
    val success: Boolean,
    val familyId: String,
    val childId: String,
    val childName: String,
    val token: String,
    val device: Device? = null
)

@Serializable
data class HeartbeatRequest(
    val deviceId: String,
    val battery: Int,
    val isCharging: Boolean,
    val networkStatus: String
)

@Serializable
data class UsageStatsSyncPayload(
    val childId: String,
    val appsList: List<AppRule>
)

@Serializable
data class NotificationLogPayload(
    val childId: String,
    val packageName: String,
    val appName: String,
    val title: String,
    val content: String
)

@Serializable
data class WebRtcSignalPayload(
    val sessionId: String,
    val sender: String, // "parent" or "child"
    val type: String, // "offer", "answer", "candidate"
    val payload: String // Serialized SDP or candidate JSON
)
