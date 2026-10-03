# Kids Application ProGuard Rules
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Room Database
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao interface * { *; }
-keepclassmembers class * extends androidx.room.RoomDatabase {
    <methods>;
}

# CameraX
-keep class androidx.camera.** { *; }
-dontwarn androidx.camera.**

# WebRTC & Stream
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**
-keep class io.getstream.** { *; }
-dontwarn io.getstream.**

# WorkManager
-keep class * extends androidx.work.Worker { *; }
-keep class * extends androidx.work.ListenableWorker { *; }

# Google Play Services Location
-keep class com.google.android.gms.location.** { *; }
-dontwarn com.google.android.gms.**
