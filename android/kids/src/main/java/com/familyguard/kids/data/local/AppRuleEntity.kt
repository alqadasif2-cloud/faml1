package com.familyguard.kids.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "app_rules")
data class AppRuleEntity(
    @PrimaryKey
    val packageName: String,
    val name: String,
    val isBlocked: Boolean,
    val dailyLimitMinutes: Int?,
    val usageTodayMinutes: Int,
    val isAlwaysAllowed: Boolean,
    val lastUpdated: Long = System.currentTimeMillis()
)
