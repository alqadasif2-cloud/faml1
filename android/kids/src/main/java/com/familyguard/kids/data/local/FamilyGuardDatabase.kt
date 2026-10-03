package com.familyguard.kids.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [AppRuleEntity::class], version = 1, exportSchema = false)
abstract class FamilyGuardDatabase : RoomDatabase() {

    abstract fun appRuleDao(): AppRuleDao

    companion object {
        @Volatile
        private var INSTANCE: FamilyGuardDatabase? = null

        fun getInstance(context: Context): FamilyGuardDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    FamilyGuardDatabase::class.java,
                    "familyguard_kids_offline.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
