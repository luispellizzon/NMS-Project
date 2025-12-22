
import com.android.build.gradle.internal.cxx.configure.gradleLocalProperties

plugins {
    id("com.android.application")
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.services)
}

val STRIPE_WEBHOOK_URL = gradleLocalProperties(rootDir, providers).getProperty("STRIPE_WEBHOOK_URL")
val STRIPE_PUBLISHABLE_KEY = gradleLocalProperties(rootDir, providers).getProperty("STRIPE_PUBLISHABLE_KEY")
val STRIPE_BASE_URL = gradleLocalProperties(rootDir, providers).getProperty("STRIPE_BASE_URL", "http://192.168.0.90:8000")

android {
    namespace = "com.example.nms_mobile"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.nms_mobile"
        minSdk = 33
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        resValue("string", "STRIPE_WEBHOOK_URL", "\"" + STRIPE_WEBHOOK_URL + "\"" )
        resValue("string", "STRIPE_PUBLISHABLE_KEY", "\"" +STRIPE_PUBLISHABLE_KEY + "\"" )
        resValue("string", "STRIPE_BASE_URL", "\"" + STRIPE_BASE_URL + "\"" )
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }

    buildFeatures {
        compose = true
        viewBinding = true
    }


}

dependencies {
    // ========================================
    // ANDROIDX CORE
    // ========================================
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    // ========================================
    // COMPOSE
    // ========================================
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.foundation)

    // Material Design
    implementation(libs.material)
    implementation("androidx.compose.material:material:1.7.6")
    implementation("androidx.compose.material:material-icons-extended:1.7.6")

    // ========================================
    // NAVIGATION
    // ========================================
    implementation(libs.androidx.navigation.runtime.ktx)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.compose.ui.text)

    // ========================================
    // FIREBASE (BOM approach)
    // ========================================
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-functions")
    implementation("com.google.firebase:firebase-storage")
    implementation("com.google.firebase:firebase-appcheck-playintegrity")
    implementation("com.google.firebase:firebase-appcheck-debug")

    // ========================================
    // GOOGLE SERVICES & SOCIAL LOGIN
    // ========================================
    implementation(libs.play.services.auth)
    implementation("com.google.android.gms:play-services-auth:21.3.0")
    implementation("com.facebook.android:facebook-login:18.1.3")

    // ========================================
    // COROUTINES
    // ========================================
    implementation(libs.kotlinx.coroutines.android)

    // ========================================
    // NETWORKING (Retrofit + OkHttp + Moshi)
    // ========================================
    // OkHttp - compatible with Kotlin 2.2.21
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Retrofit - using stable 2.9.0 (3.0.0 doesn't exist yet)
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.9.0")

    // Moshi for JSON parsing
    implementation("com.squareup.moshi:moshi:1.15.1")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.1")

    // ========================================
    // UI ENHANCEMENTS
    // ========================================
    // SwipeRefresh (for pull-to-refresh)
    implementation("com.google.accompanist:accompanist-swiperefresh:0.34.0")

    // ========================================
    // COMPUTER VISION
    // ========================================
    implementation("org.opencv:opencv:4.10.0")
    implementation(libs.androidx.compose.runtime)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.foundation)

    // ========================================
    // TESTING
    // ========================================
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)


    // Stripe Android SDK
    implementation("com.stripe:stripe-android:22.5.0")
    // Include the financial connections SDK to support US bank account as a payment method
    implementation("com.stripe:financial-connections:22.5.0")
}