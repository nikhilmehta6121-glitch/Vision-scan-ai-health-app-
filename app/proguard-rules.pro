# Add project specific ProGuard rules here.
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.healthy.ai.data.model.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn androidx.**
-dontoptimize
-dontobfuscate
