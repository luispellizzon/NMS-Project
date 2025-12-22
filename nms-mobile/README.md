# NeuroMind System - Mobile App

An Android application for early dementia risk screening that combines cognitive assessments, speech analysis, memory tests, and health questionnaires with AI-powered risk prediction.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Firebase Setup](#firebase-setup)
- [API Integrations](#api-integrations)
- [Testing](#testing)
- [Building](#building)
- [Contributing](#contributing)
- [License](#license)

## Overview

NeuroMind System (NMS) Mobile is part of a comprehensive healthcare solution designed to help identify early signs of cognitive decline. The app guides users through a series of validated assessments and uses machine learning to provide dementia risk predictions.

### Key Capabilities

- Multi-stage cognitive assessment workflow
- Speech recording and AI-powered transcription analysis
- Visual-spatial reasoning tests with drawing analysis
- Memory recall testing
- Health and lifestyle risk factor questionnaire
- Caregiver mode for managing multiple patients
- Secure communication with healthcare professionals
- Payment integration for premium features

## Features

### Assessment Modules

| Module | Description |
|--------|-------------|
| **Risk Questionnaire** | Comprehensive health and lifestyle assessment covering smoking, alcohol use, physical activity, nutrition, sleep quality, family history, and chronic conditions |
| **Speech Assessment** | Audio-recorded verbal fluency tasks with AI transcription and linguistic analysis |
| **Memory Test** | Short-term memory evaluation through sequence recall exercises |
| **Cognitive Tests** | Visual-spatial assessments including clock drawing, cube copying, trail making, and animal naming tasks |

### Additional Features

- **Dashboard** - Personalized home screen with assessment progress tracking
- **Results View** - Detailed breakdown of assessment scores and risk levels
- **Health News** - AI-generated educational articles about cognitive health
- **Contact Doctor** - Direct communication channel with healthcare providers
- **Support System** - In-app support request submission and history tracking
- **Managed Mode** - Caregiver functionality to supervise multiple patient accounts

### User Roles

- **Patient** - Primary users completing assessments
- **Caregiver** - Users managing assessments for family members or dependents
- **Healthcare Professional** - Medical staff reviewing patient data (via web portal)

## Requirements

### Development Environment

- Android Studio Hedgehog (2023.1.1) or later
- JDK 11 or higher
- Kotlin 1.9+

### Device Requirements

- **Minimum SDK**: 33 (Android 13)
- **Target SDK**: 36 (Android 16)
- Microphone access for speech assessment
- Internet connectivity

### Backend Services

- Firebase project with Authentication, Firestore, and Storage enabled
- NMS AI Backend service (for transcription and news generation)
- HuggingFace Gradio Space (for ML predictions)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/NeuroMindSystem/NMS-Project.git
cd NMS-Project/nms-mobile
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Add an Android app with package name `com.example.nms_mobile`
3. Download `google-services.json` and place it in `app/`
4. Enable the following Firebase services:
   - Authentication (Email/Password, Google, Facebook, Apple)
   - Cloud Firestore
   - Cloud Storage
   - App Check

### 3. Local Properties

Create `local.properties` in the project root with:

```properties
sdk.dir=/path/to/Android/sdk

# Stripe Configuration (optional - for payment features)
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_BASE_URL=http://your-stripe-backend:8000
```

### 4. Open in Android Studio

1. Open Android Studio
2. Select "Open an existing project"
3. Navigate to the `nms-mobile` directory
4. Wait for Gradle sync to complete

### 5. Run the App

- Connect an Android device or start an emulator (API 33+)
- Click "Run" or press `Shift + F10`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STRIPE_PUBLISHABLE_KEY` | Stripe API publishable key | - |
| `STRIPE_BASE_URL` | Stripe backend server URL | `http://192.168.0.90:8000` |

### API Endpoints

Configure in the respective API client files:

| Service | File | Default URL |
|---------|------|-------------|
| Transcription API | `TranscriptionApiClient.kt` | `http://10.0.2.2:8001` |
| News API | `Newsapiclient.kt` | `http://10.0.2.2:8002` |
| HuggingFace Prediction | `HuggingFaceApi.kt` | `https://JDrizzle-nms-project.hf.space` |

> Note: `10.0.2.2` is the Android emulator's alias for the host machine's localhost.

## Project Structure

```
nms-mobile/
├── app/
│   ├── src/main/java/com/example/nms_mobile/
│   │   ├── api/                    # External API clients
│   │   │   ├── HuggingFaceApi.kt   # ML prediction service
│   │   │   ├── TranscriptionApiClient.kt
│   │   │   └── Newsapiclient.kt
│   │   │
│   │   ├── auth/                   # Authentication state management
│   │   │   ├── Auth.kt
│   │   │   └── AuthLocal.kt
│   │   │
│   │   ├── data/                   # Repositories and data models
│   │   │   ├── AuthRepository.kt
│   │   │   ├── FirestoreRepository.kt
│   │   │   ├── PatientRepository.kt
│   │   │   ├── CognitiveRepository.kt
│   │   │   ├── SpeechAssessmentRepository.kt
│   │   │   ├── MemoryTestRepository.kt
│   │   │   └── SupportRequest.kt
│   │   │
│   │   ├── navigation/             # App navigation
│   │   │   ├── AppNavigation.kt
│   │   │   ├── Screen.kt
│   │   │   └── routes/Route.kt
│   │   │
│   │   ├── services/               # Android services
│   │   │   ├── AudioRecorderService.kt
│   │   │   ├── AudioPlayerService.kt
│   │   │   └── TTSManager.kt
│   │   │
│   │   ├── ui/                     # Composable UI
│   │   │   ├── components/         # Reusable components
│   │   │   ├── feature/            # Feature modules
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── questionnaire/
│   │   │   │   ├── speech/
│   │   │   │   ├── memory/
│   │   │   │   ├── cognitive/
│   │   │   │   ├── results/
│   │   │   │   ├── support/
│   │   │   │   └── ...
│   │   │   ├── Theme.kt
│   │   │   ├── Color.kt
│   │   │   └── Type.kt
│   │   │
│   │   ├── utils/                  # Utilities
│   │   │   ├── OpenCvAnalyzer.kt
│   │   │   └── KeyLoader.kt
│   │   │
│   │   ├── MainActivity.kt
│   │   └── MyApplication.kt
│   │
│   ├── build.gradle.kts
│   └── google-services.json
│
├── build.gradle.kts
└── settings.gradle.kts
```

## Architecture

### Design Pattern

The app follows **MVI (Model-View-Intent)** architecture with:

- **Jetpack Compose** for declarative UI
- **StateFlow** for reactive state management
- **Singleton Repositories** for data access
- **ViewModels** for business logic

### Data Flow

```
User Action → ViewModel → Repository → Firebase/API
                ↓
            StateFlow
                ↓
         Composable UI
```

### Key Components

| Layer | Components |
|-------|------------|
| **UI** | Composable Screens, Theme, Components |
| **ViewModel** | State management, Business logic |
| **Repository** | Data operations, API calls |
| **Data** | Firebase, REST APIs, Local storage |

## Firebase Setup

### Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users` | User profiles and assessment progress |
| `users/{uid}/risk_assessment` | Questionnaire responses |
| `users/{uid}/cognitive_assessments` | Cognitive test results |
| `users/{uid}/memory_assessment` | Memory test scores |
| `support_requests` | User support tickets |
| `feedback` | App feedback submissions |
| `news_articles` | Health news content |

### Storage Buckets

| Path | Content |
|------|---------|
| `speech_audio/{userId}/` | Speech assessment recordings |
| `cognitive_drawings/{userId}/` | Drawing test images |

### Authentication Providers

Enable the following in Firebase Console > Authentication:

- Email/Password
- Google
- Facebook
- Apple

### Security Rules

Ensure Firestore and Storage rules are configured to:
- Allow authenticated users to read/write their own data
- Restrict cross-user data access
- Protect sensitive health information

## API Integrations

### HuggingFace ML Service

**Purpose**: Dementia risk prediction based on assessment data

**Endpoint**: `https://JDrizzle-nms-project.hf.space/gradio_api/call/predict_severity`

**Input**: MMSE score + questionnaire responses
**Output**: Risk level prediction

### Transcription Service

**Purpose**: Speech-to-text conversion and linguistic analysis

**Endpoints**:
- `POST /process-assessment` - Process complete assessment
- `POST /transcribe-from-url` - Transcribe audio file

### News Generation Service

**Purpose**: Generate health-related educational content

**Endpoints**:
- `POST /generate-news` - Generate news articles
- `GET /health` - Service health check

## Testing

### Unit Tests

Located in `app/src/test/java/`

```bash
./gradlew test
```

### Instrumented Tests

Located in `app/src/androidTest/java/`

```bash
./gradlew connectedAndroidTest
```

### Test Coverage

Current test coverage includes:
- ViewModel unit tests with mocked repositories
- UI component tests using Compose testing APIs
- Integration tests for critical user flows

## Building

### Debug Build

```bash
./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`

### Release Build

1. Create a keystore file for signing
2. Configure signing in `app/build.gradle.kts`
3. Run:

```bash
./gradlew assembleRelease
```

### Build Variants

| Variant | Purpose |
|---------|---------|
| `debug` | Development with debug logging |
| `release` | Production build with ProGuard |

## Dependencies

### Core Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| Jetpack Compose | BOM 2024 | UI framework |
| Firebase | BOM 33.7.0 | Backend services |
| Retrofit | 2.9.0 | HTTP client |
| OkHttp | 4.12.0 | Network layer |
| Moshi | 1.15.1 | JSON parsing |
| OpenCV | 4.10.0 | Image analysis |
| Stripe | 22.5.0 | Payments |

### Full dependency list available in `app/build.gradle.kts`

## Permissions

The app requires the following permissions:

| Permission | Purpose |
|------------|---------|
| `RECORD_AUDIO` | Speech assessment recording |
| `INTERNET` | API and Firebase connectivity |
| `ACCESS_NETWORK_STATE` | Network status checks |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow [Kotlin coding conventions](https://kotlinlang.org/docs/coding-conventions.html)
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed

## Support

For issues and feature requests, please use the GitHub Issues page or the in-app support feature.

## License

This project is proprietary software. All rights reserved.

---

**NeuroMind System** - Early Detection. Better Outcomes.

Version 1.0.0
