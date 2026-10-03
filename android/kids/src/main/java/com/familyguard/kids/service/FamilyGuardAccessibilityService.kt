package com.familyguard.kids.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import com.familyguard.kids.data.local.FamilyGuardDatabase
import com.familyguard.kids.ui.BlockOverlayActivity
import kotlinx.coroutines.*

class FamilyGuardAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var database: FamilyGuardDatabase

    private val systemWhitelistedPackages = hashSetOf(
        "com.android.systemui",
        "com.familyguard.kids",
        "com.android.dialer",
        "com.google.android.dialer",
        "com.samsung.android.dialer"
    )

    override fun onCreate() {
        super.onCreate()
        database = FamilyGuardDatabase.getInstance(this)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }

        val packageName = event.packageName?.toString() ?: return

        // Always allow system UI, emergency dialer, and FamilyGuard Kids itself
        if (systemWhitelistedPackages.contains(packageName)) {
            return
        }

        // Query Room Database asynchronously for instant local enforcement
        serviceScope.launch {
            try {
                val rule = database.appRuleDao().getRuleByPackage(packageName)
                if (rule != null) {
                    val isLimitExceeded = rule.dailyLimitMinutes != null && rule.usageTodayMinutes >= rule.dailyLimitMinutes
                    if (rule.isBlocked || isLimitExceeded) {
                        withContext(Dispatchers.Main) {
                            triggerBlockScreen(packageName, rule.name)
                        }
                    }
                }
            } catch (e: Exception) {
                // Room query fallback
            }
        }
    }

    private fun triggerBlockScreen(restrictedPackage: String, appName: String) {
        val intent = Intent(this, BlockOverlayActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            putExtra("EXTRA_PACKAGE_NAME", restrictedPackage)
            putExtra("EXTRA_APP_NAME", appName)
        }
        startActivity(intent)
    }

    override fun onInterrupt() {
        // Accessibility interrupted
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}
