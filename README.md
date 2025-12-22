# NeuroMind System (NMS)

A comprehensive healthcare platform for **early dementia risk screening**, combining mobile assessments, web-based clinical dashboards, and AI-powered diagnostics.

[![Mobile](https://img.shields.io/badge/Android-Kotlin-green?logo=android)](./nms-mobile)
[![Web](https://img.shields.io/badge/Next.js-16.1.0-black?logo=next.js)](./nms-web)
[![AI](https://img.shields.io/badge/Python-3.11-blue?logo=python)](./nms-ai)
[![Firebase](https://img.shields.io/badge/Firebase-Functions-orange?logo=firebase)](./firebase)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

## Overview

NMS enables early detection of dementia risk through:
- **Mobile App** — Patient self-assessments (cognitive tests, speech analysis, memory exercises)
- **Web Portal** — Healthcare professional dashboard for monitoring patients
- **AI Backend** — Speech transcription, news curation, and ML-based risk prediction
- **Firebase** — Secure authentication and real-time data synchronization

## Repository Structure

```
NMS-Project/
├── nms-mobile/          # Android app (Kotlin/Jetpack Compose)
├── nms-web/             # Web portal for healthcare professionals
│   └── nms-web-app/     # Next.js 16 + React 19 application
├── firebase/            # Firebase Cloud Functions backend
│   └── functions/       # TypeScript serverless functions
├── nms-ai/              # Python AI microservices
│   ├── services/
│   │   ├── agents/      # CrewAI news & risk assessment (Port 8002)
│   │   ├── transcription/  # Whisper speech-to-text (Port 8001)
│   │   └── payment/     # Stripe payment integration
│   └── lifestyle_model/ # TensorFlow risk prediction (Port 7860)
├── CLAUDE.md            # AI development guidance
└── README.md            # This file
```

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Mobile** | Kotlin, Jetpack Compose, Firebase SDK, OpenCV |
| **Web** | Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts |
| **Backend** | Firebase Cloud Functions, TypeScript, Node.js 22 |
| **AI/ML** | Python 3.11, FastAPI, CrewAI, OpenAI Whisper, TensorFlow |
| **LLM** | Google Gemini, Groq (Kimi K2), Ollama (Llama 3.2) |
| **Database** | Firebase Firestore, Firebase Storage |
| **DevOps** | Docker, Docker Compose, Firebase Emulator |

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Python 3.11+
- Docker and Docker Compose
- Android Studio (for mobile development)
- Firebase CLI (`npm install -g firebase-tools`)

### 1. Clone the Repository

```bash
git clone https://github.com/NeuroMindSystem/NMS-Project.git
cd NMS-Project
```

### 2. Start Firebase Emulator

```bash
cd firebase/functions
npm install
npm run build
firebase emulators:start --only functions
```

### 3. Start AI Backend

```bash
cd nms-ai
# Configure environment variables (see nms-ai/README.md)
docker-compose up --build
```

### 4. Start Web Application

```bash
cd nms-web/nms-web-app
npm install
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials
npm run dev
```

### 5. Run Mobile App

Open `nms-mobile/` in Android Studio and run on emulator or device.

## Components

### Mobile App (`nms-mobile/`)

Android application for patients and caregivers to complete dementia risk assessments.

**Features:**
- Risk Questionnaire (health/lifestyle assessment)
- Speech Assessment (AI-powered transcription analysis)
- Memory Tests (sequence recall exercises)
- Cognitive Tests (clock drawing, cube copying, trail making, animal naming)
- Progress Dashboard
- Contact Doctor functionality
- Support Request system

**Tech:** Kotlin, Jetpack Compose, Firebase SDK

```bash
cd nms-mobile
./gradlew assembleDebug    # Build debug APK
./gradlew test             # Run unit tests
```

[View Mobile README](./nms-mobile/README.md)

---

### Web Portal (`nms-web/nms-web-app/`)

Next.js application for healthcare professionals to monitor patients and manage assessments.

**Features:**
- Patient Dashboard with risk analytics
- Geographic distribution mapping
- PDF Report generation
- AI-generated medical news feed
- Model retraining interface
- Admin panel for user management

**Tech:** Next.js 16, React 19, TypeScript, Tailwind CSS

```bash
cd nms-web/nms-web-app
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm test             # Unit tests (Vitest)
npm run e2e          # E2E tests (Playwright)
```

[View Web README](./nms-web/nms-web-app/README.md)

---

### Firebase Functions (`firebase/functions/`)

Serverless backend functions for authentication and data processing.

**Functions:**
- `login` — User authentication
- `register` — New user registration

**Tech:** TypeScript, Node.js 22, Firebase Cloud Functions

```bash
cd firebase/functions
npm run build                              # Compile TypeScript
firebase emulators:start --only functions  # Local development
npm run deploy                             # Deploy to Firebase
```

[View Firebase README](./firebase/README.md)

---

### AI Backend (`nms-ai/`)

Python microservices for AI-powered features.

**Services:**

| Service | Port | Purpose |
|---------|------|---------|
| Transcription | 8001 | Whisper speech-to-text |
| Agents | 8002 | CrewAI news curation & risk assessment |
| Lifestyle Model | 7860 | TensorFlow dementia risk prediction |
| Ollama | 11434 | Local LLM hosting (optional) |

**Tech:** Python 3.11, FastAPI, CrewAI, TensorFlow, Docker

```bash
cd nms-ai
docker-compose up --build    # Start all services
docker-compose logs -f       # View logs
```

[View AI README](./nms-ai/README.md)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌─────────────────────────────┐   │
│  │   Mobile App    │              │       Web Portal            │   │
│  │ (Android/Kotlin)│              │   (Next.js/React)           │   │
│  └────────┬────────┘              └──────────────┬──────────────┘   │
└───────────┼──────────────────────────────────────┼──────────────────┘
            │                                      │
            ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FIREBASE                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│  │   Auth       │  │  Firestore   │  │   Cloud Functions       │   │
│  │              │  │  (Database)  │  │   (login, register)     │   │
│  └──────────────┘  └──────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
            │                                      │
            ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       AI BACKEND                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │
│  │ Transcription │  │    Agents     │  │   Lifestyle Model     │   │
│  │ (Whisper)     │  │  (CrewAI)     │  │   (TensorFlow)        │   │
│  │   :8001       │  │    :8002      │  │      :7860            │   │
│  └───────────────┘  └───────────────┘  └───────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│              ┌─────────────────────────────┐                        │
│              │     LLM Providers           │                        │
│              │  Gemini | Groq | Ollama     │                        │
│              └─────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Firestore Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles and roles |
| `risk_assessments` | Patient assessment data |
| `doctor_patient_relationships` | Doctor-patient links |
| `news_articles` | AI-generated medical news |
| `medical_news` | Professional research articles |
| `patient_news` | Patient-friendly articles |
| `anonymized_patients` | De-identified data for ML training |
| `model_retraining_logs` | Training workflow history |
| `support_requests` | Patient support tickets |
| `feedback` | User feedback and ratings |

## Environment Setup

### Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Download service account key for AI backend
4. Configure environment variables in each component

### Required API Keys

| Service | Environment Variable | Required For |
|---------|---------------------|--------------|
| Firebase | `NEXT_PUBLIC_FIREBASE_*` | All components |
| Google Gemini | `GEMINI_API_KEY` | AI news generation |
| Groq | `GROQ_API_KEY` | Alternative LLM |
| Stripe | `STRIPE_PUBLISHABLE_KEY` | Payment features |

See individual component READMEs for detailed environment setup.

## Development

### Running Tests

```bash
# Web (Vitest + Playwright)
cd nms-web/nms-web-app
npm test                 # Unit tests
npm run test:coverage    # Coverage report
npm run e2e              # E2E tests

# Firebase Functions (Jest)
cd firebase/functions
npm test

# Mobile (JUnit)
cd nms-mobile
./gradlew test
./gradlew connectedAndroidTest
```

### Code Style

- **Web**: ESLint + TypeScript strict mode
- **Mobile**: Kotlin coding conventions
- **AI**: PEP 8 + Black formatter
- **Firebase**: ESLint + TypeScript

## Deployment

### Web App
Deploy to Vercel or any Node.js hosting platform.

### Firebase Functions
```bash
cd firebase/functions
npm run deploy
```

### AI Backend
Deploy Docker containers to any container orchestration platform (GCP Cloud Run, AWS ECS, etc.).

### Mobile App
Build and publish to Google Play Store via Android Studio.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes in the appropriate component directory
4. Run tests for affected components
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Branch Strategy

- `main` — Production-ready code
- `develop` — Integration branch
- `feature/*` — Feature branches
- `mobile`, `web`, `ai-backend`, `firebase` — Component-specific branches

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/NeuroMindSystem/NMS-Project/issues)
- **Documentation**: Component-specific READMEs in each directory

---

**NeuroMind System** — Early Dementia Risk Screening Platform

Built with care for healthcare
