package com.familyguard.kids.service

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.familyguard.core.model.NotificationLogPayload
import com.familyguard.core.network.FamilyGuardApiClient
import com.familyguard.core.security.EncryptedPrefsManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class FamilyGuardNotificationListener : NotificationListenerService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO)
    private lateinit var prefsManager: EncryptedPrefsManager

    private val monitoredPackages = hashSetOf(
        "com.whatsapp",
        "org.telegram.messenger",
        "com.instagram.android",
        "com.google.android.youtube",
        "com.snapchat.android"
    )

    override fun onCreate() {
        super.onCreate()
        prefsManager = EncryptedPrefsManager(this)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val pkg = sbn.packageName ?: return
        if (!monitoredPackages.contains(pkg)) return

        val extras = sbn.notification.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString() ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""

        if (title.isBlank() && text.isBlank()) return

        val childId = prefsManager.getChildId() ?: "child_1"

        serviceScope.launch {
            try {
                FamilyGuardApiClient.service.uploadNotificationLog(
                    NotificationLogPayload(
                        childId = childId,
                        packageName = pkg,
                        appName = getAppNameForPackage(pkg),
                        title = title,
                        content = text
                    )
                )
            } catch (e: Exception) {
                // Offline fallback
            }
        }
    }

    private fun getAppNameForPackage(pkg: String): String {
        return try {
            val pm = packageManager
            val info = pm.getApplicationInfo(pkg, 0)
            pm.getApplicationLabel(info).toString()
        } catch (e: Exception) {
            when (pkg) {
                "com.whatsapp" -> "WhatsApp"
                "org.telegram.messenger" -> "Telegram"
                "com.instagram.android" -> "Instagram"
                "com.google.android.youtube" -> "YouTube"
                else -> pkg
            }
        }
    }
}
