package com.familyguard.kids.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface AppRuleDao {

    @Query("SELECT * FROM app_rules")
    fun getAllRules(): Flow<List<AppRuleEntity>>

    @Query("SELECT * FROM app_rules WHERE packageName = :pkg LIMIT 1")
    suspend fun getRuleByPackage(pkg: String): AppRuleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertRule(rule: AppRuleEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertRules(rules: List<AppRuleEntity>)

    @Query("DELETE FROM app_rules")
    suspend fun clearRules()
}
