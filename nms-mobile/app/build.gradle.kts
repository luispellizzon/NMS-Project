plugins {
    id("com.android.application")
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.services)
}

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
    // AndroidX Core
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    // Compose BOM
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.foundation)

    // Material Design
    implementation(libs.material)
    implementation("androidx.compose.material:material:1.9.4")
    implementation("androidx.compose.material:material-icons-extended")

    // Navigation
    implementation(libs.androidx.navigation.runtime.ktx)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.compose.ui.text)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)

    // ========================================
    // FIREBASE (BOM approach - CLEANED)
    // ========================================
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-functions")
    implementation("com.google.firebase:firebase-storage")  // ← Solo una vez
    implementation("com.google.firebase:firebase-appcheck-playintegrity:17.1.1")
    // Firebase AppCheck
    implementation("com.google.firebase:firebase-appcheck-playintegrity:18.0.0")
// o si usas debug
    implementation("com.google.firebase:firebase-appcheck-debug:18.0.0")
    // Google Sign-In (Optional)
    implementation(libs.play.services.auth)

    // Coroutines (for Firebase + Compose interop)
    implementation(libs.kotlinx.coroutines.android)

    // Lifecycle Compose helper (for collectAsStateWithLifecycle)
    implementation(libs.androidx.lifecycle.runtime.compose)

    // OkHttp for HTTP calls
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

// Retrofit (if you're using a Retrofit-based client)
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    // If you're using Retrofit with Moshi converter:
    implementation("com.squareup.retrofit2:converter-moshi:2.9.0")

    // providers
    implementation("com.facebook.android:facebook-login:16.2.0")
    implementation("com.google.android.gms:play-services-auth:21.3.0")

    //OpenCV
    implementation("org.opencv:opencv:4.12.0")
}