plugins {
    // you can keep both styles, but consistency is nicer:
    id("com.android.application")
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.services)   // or id("com.google.gms.google-services")
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
    kotlinOptions { jvmTarget = "11" }

    buildFeatures {
        compose = true
        viewBinding = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.material)
    implementation(libs.androidx.navigation.runtime.ktx)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.compose.foundation)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)

    implementation("androidx.compose.material:material:1.9.4")
    implementation("androidx.compose.material:material-icons-extended")

    // --- Firebase via BOM (from catalog) ---
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth.ktx)

    // Optional if you’ll read/write roles or call functions:
    implementation(libs.firebase.firestore.ktx)
    implementation(libs.firebase.functions.ktx)

    // Optional Google Sign-In:
    implementation(libs.play.services.auth)

    // Coroutines (good for Firebase + Compose interop):
    implementation(libs.kotlinx.coroutines.android)

    // Optional lifecycle compose helper (for collectAsStateWithLifecycle):
    implementation(libs.androidx.lifecycle.runtime.compose)
}
