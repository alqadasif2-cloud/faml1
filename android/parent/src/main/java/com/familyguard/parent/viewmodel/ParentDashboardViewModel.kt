package com.familyguard.parent.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.familyguard.core.model.*
import com.familyguard.core.network.FamilyGuardApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardUiState(
    val isLoading: Boolean = true,
    val children: List<Child> = emptyList(),
    val selectedChild: Child? = null,
    val liveLocation: LocationPayload? = null,
    val locationHistory: List<LocationPayload> = emptyList(),
    val geofences: List<GeofenceRule> = emptyList(),
    val apps: List<AppRule> = emptyList(),
    val alerts: List<AlertNotification> = emptyList(),
    val activePairingCode: String? = null,
    val isInstantBlocked: Boolean = false,
    val isStreaming: Boolean = false,
    val errorMessage: String? = null
)

class ParentDashboardViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val res = FamilyGuardApiClient.service.getChildren()
                if (res.isSuccessful && res.body() != null) {
                    val list = res.body()!!["children"] ?: emptyList()
                    val active = list.firstOrNull()
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        children = list,
                        selectedChild = active,
                        isInstantBlocked = active?.devices?.firstOrNull()?.isInstantBlocked ?: false
                    )
                    active?.id?.let { selectChild(it) }
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = "فشل تحميل البيانات")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.localizedMessage)
            }
        }
    }

    fun selectChild(childId: String) {
        val child = _uiState.value.children.find { it.id == childId } ?: return
        _uiState.value = _uiState.value.copy(selectedChild = child)

        viewModelScope.launch {
            try {
                // Fetch Location
                val locRes = FamilyGuardApiClient.service.getLiveLocation(childId)
                val loc = locRes.body()?.get("location")

                // Fetch Location History
                val histRes = FamilyGuardApiClient.service.getLocationHistory(childId)
                val hist = histRes.body()?.get("history") ?: emptyList()

                // Fetch Apps
                val appsRes = FamilyGuardApiClient.service.getInstalledApps(childId)
                val appsList = appsRes.body()?.get("apps") ?: emptyList()

                // Fetch Alerts
                val alertsRes = FamilyGuardApiClient.service.getAlerts(childId)
                val alertsList = alertsRes.body()?.get("alerts") ?: emptyList()

                _uiState.value = _uiState.value.copy(
                    liveLocation = loc,
                    locationHistory = hist,
                    apps = appsList,
                    alerts = alertsList
                )
            } catch (e: Exception) {
                // Keep current state on network error
            }
        }
    }

    fun toggleInstantBlock() {
        val child = _uiState.value.selectedChild ?: return
        val nextState = !_uiState.value.isInstantBlocked
        _uiState.value = _uiState.value.copy(isInstantBlocked = nextState)

        viewModelScope.launch {
            try {
                FamilyGuardApiClient.service.toggleInstantBlock(child.id, mapOf("isBlocked" to nextState))
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isInstantBlocked = !nextState)
            }
        }
    }

    fun generatePairingCode() {
        val child = _uiState.value.selectedChild ?: return
        viewModelScope.launch {
            try {
                val res = FamilyGuardApiClient.service.generatePairingCode(mapOf("childId" to child.id))
                val code = res.body()?.get("pairingCode")
                _uiState.value = _uiState.value.copy(activePairingCode = code)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(errorMessage = "تعذر إنشاء رمز الاقتران")
            }
        }
    }

    fun toggleAppBlock(packageName: String, currentBlocked: Boolean) {
        val child = _uiState.value.selectedChild ?: return
        viewModelScope.launch {
            try {
                FamilyGuardApiClient.service.updateAppRule(
                    mapOf(
                        "childId" to child.id,
                        "packageName" to packageName,
                        "isBlocked" to (!currentBlocked).toString()
                    )
                )
                // Refresh apps
                val appsRes = FamilyGuardApiClient.service.getInstalledApps(child.id)
                val appsList = appsRes.body()?.get("apps") ?: emptyList()
                _uiState.value = _uiState.value.copy(apps = appsList)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(errorMessage = "تعذر تحديث إعداد التطبيق")
            }
        }
    }

    fun startWebRtcSession(type: String) {
        val child = _uiState.value.selectedChild ?: return
        _uiState.value = _uiState.value.copy(isStreaming = true)
        viewModelScope.launch {
            try {
                FamilyGuardApiClient.service.sendWebRtcSignal(
                    WebRtcSignalPayload(
                        sessionId = "sess_" + System.currentTimeMillis(),
                        sender = "parent",
                        type = "offer",
                        payload = "{\"streamType\":\"$type\",\"childId\":\"${child.id}\"}"
                    )
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isStreaming = false)
            }
        }
    }

    fun stopWebRtcSession() {
        _uiState.value = _uiState.value.copy(isStreaming = false)
    }
}
