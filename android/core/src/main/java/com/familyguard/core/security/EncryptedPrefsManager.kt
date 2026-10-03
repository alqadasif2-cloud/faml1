package com.familyguard.core.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class EncryptedPrefsManager(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        PREFS_FILENAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveAuthToken(token: String) {
        sharedPreferences.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }

    fun getAuthToken(): String? {
        return sharedPreferences.getString(KEY_AUTH_TOKEN, null)
    }

    fun saveDeviceId(deviceId: String) {
        sharedPreferences.edit().putString(KEY_DEVICE_ID, deviceId).apply()
    }

    fun getDeviceId(): String? {
        return sharedPreferences.getString(KEY_DEVICE_ID, null)
    }

    fun saveChildId(childId: String) {
        sharedPreferences.edit().putString(KEY_CHILD_ID, childId).apply()
    }

    fun getChildId(): String? {
        return sharedPreferences.getString(KEY_CHILD_ID, null)
    }

    fun clearAll() {
        sharedPreferences.edit().clear().apply()
    }

    companion object {
        private const val PREFS_FILENAME = "familyguard_secure_prefs"
        private const val KEY_AUTH_TOKEN = "key_auth_token"
        private const val KEY_DEVICE_ID = "key_device_id"
        private const val KEY_CHILD_ID = "key_child_id"
    }
}
