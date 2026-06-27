package com.myreactnativeapp

import android.os.Build
import android.app.ActivityManager
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class SecurityCheckModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SecurityCheck"
    }

    @ReactMethod
    fun checkDeviceSecurity(promise: Promise) {
        try {
            val isInsecure = isDeviceCompromised()
            val result: WritableMap = Arguments.createMap()
            result.putBoolean("isInsecure", isInsecure)
            result.putString("type", getCompromiseType())
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SECURITY_CHECK_ERROR", e.message)
        }
    }

    private fun isDeviceCompromised(): Boolean {
        return isDeviceRooted() || isRunningInEmulator()
    }

    private fun isDeviceRooted(): Boolean {
        val paths = arrayOf(
            "/system/app/Superuser.apk",
            "/system/xbin/su",
            "/system/bin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su",
            "/su/bin/su"
        )

        for (path in paths) {
            if (java.io.File(path).exists()) {
                return true
            }
        }

        return checkForSuBinary()
    }

    private fun checkForSuBinary(): Boolean {
        val process = try {
            Runtime.getRuntime().exec("which su")
        } catch (e: Exception) {
            return false
        }

        val reader = java.io.BufferedReader(java.io.InputStreamReader(process.inputStream))
        val line = reader.readLine()
        return !line.isNullOrEmpty()
    }

    private fun isRunningInEmulator(): Boolean {
        // Check for known emulator properties
        return (Build.FINGERPRINT.startsWith("generic") ||
                Build.FINGERPRINT.startsWith("unknown") ||
                Build.MODEL.contains("google_sdk") ||
                Build.MODEL.contains("Emulator") ||
                Build.MODEL.contains("Android SDK") ||
                Build.MANUFACTURER.contains("Genymotion") ||
                (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")) ||
                "QC_REFERENCE" == Build.BOARD ||
                getEmulatorProperty())
    }

    private fun getEmulatorProperty(): Boolean {
        return try {
            val properties = Runtime.getRuntime().exec("getprop ro.kernel.qemu").inputStream
                .bufferedReader().use { it.readText() }
            properties.contains("1")
        } catch (e: Exception) {
            false
        }
    }

    private fun getCompromiseType(): String {
        return when {
            isDeviceRooted() -> "rooted"
            isRunningInEmulator() -> "emulator"
            else -> "secure"
        }
    }
}
