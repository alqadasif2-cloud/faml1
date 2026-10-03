package com.familyguard.core.network

import com.familyguard.core.model.*
import retrofit2.Response
import retrofit2.http.*

interface FamilyGuardApiService {

    @POST("api/auth/register")
    suspend fun register(
        @Body request: Map<String, String>
    ): Response<Map<String, String>>

    @POST("api/auth/login")
    suspend fun login(
        @Body request: Map<String, String>
    ): Response<Map<String, String>>

    @GET("api/children")
    suspend fun getChildren(): Response<Map<String, List<Child>>>

    @POST("api/children")
    suspend fun createChild(
        @Body payload: Map<String, String>
    ): Response<Map<String, Child>>

    @POST("api/pairing/generate")
    suspend fun generatePairingCode(
        @Body payload: Map<String, String>
    ): Response<Map<String, String>>

    @POST("api/pairing/verify")
    suspend fun verifyPairing(
        @Body payload: PairingRequest
    ): Response<PairingResponse>

    @POST("api/device/heartbeat")
    suspend fun sendHeartbeat(
        @Body payload: HeartbeatRequest
    ): Response<Map<String, Boolean>>

    @POST("api/location/update")
    suspend fun sendLocationUpdate(
        @Body payload: LocationPayload
    ): Response<Map<String, Boolean>>

    @GET("api/location/{childId}")
    suspend fun getLiveLocation(
        @Path("childId") childId: String
    ): Response<Map<String, LocationPayload>>

    @GET("api/location/{childId}/history")
    suspend fun getLocationHistory(
        @Path("childId") childId: String
    ): Response<Map<String, List<LocationPayload>>>

    @GET("api/apps/{childId}")
    suspend fun getInstalledApps(
        @Path("childId") childId: String
    ): Response<Map<String, List<AppRule>>>

    @POST("api/apps/rule")
    suspend fun updateAppRule(
        @Body rule: Map<String, String>
    ): Response<Map<String, Boolean>>

    @POST("api/device/usage-sync")
    suspend fun syncUsageStats(
        @Body payload: UsageStatsSyncPayload
    ): Response<Map<String, Boolean>>

    @POST("api/devices/{childId}/instant-block")
    suspend fun toggleInstantBlock(
        @Path("childId") childId: String,
        @Body payload: Map<String, Boolean>
    ): Response<Map<String, Boolean>>

    @POST("api/alerts/sos")
    suspend fun sendSosEmergency(
        @Body payload: LocationPayload
    ): Response<Map<String, Boolean>>

    @GET("api/alerts/{childId}")
    suspend fun getAlerts(
        @Path("childId") childId: String
    ): Response<Map<String, List<AlertNotification>>>

    @POST("api/device/notifications")
    suspend fun uploadNotificationLog(
        @Body payload: NotificationLogPayload
    ): Response<Map<String, Boolean>>

    @POST("api/webrtc/signal")
    suspend fun sendWebRtcSignal(
        @Body payload: WebRtcSignalPayload
    ): Response<Map<String, Boolean>>

    @GET("api/webrtc/signals/{sessionId}")
    suspend fun getWebRtcSignals(
        @Path("sessionId") sessionId: String,
        @Query("peer") peer: String
    ): Response<Map<String, List<WebRtcSignalPayload>>>
}
