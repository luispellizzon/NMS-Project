# NeuroMind System (NMS) Web Application

A modern healthcare platform for early dementia risk screening, designed for healthcare professionals to monitor patients, view cognitive assessments, and leverage AI-powered diagnostics.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange?logo=firebase)](https://firebase.google.com/)
[![Test Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen)](./coverage)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### For Healthcare Professionals (Doctors)

- **Patient Dashboard** — Real-time overview of patient statistics, risk distributions, and geographic mapping
- **Patient Management** — Add, edit, assign, and monitor patients with comprehensive profiles
- **Risk Assessments** — View MMSE scores, cognitive tests, speech assessments, and memory evaluations
- **Clinical Notes** — Document clinical observations and assessment notes
- **PDF Reports** — Generate downloadable patient reports with risk analysis
- **AI Medical News** — Access AI-generated medical news relevant to dementia research
- **Appointment Tracking** — View upcoming and past patient appointments

### For Administrators

- **System Dashboard** — Monitor doctors, patients, assessments, and system health
- **User Management** — Create and manage doctor and admin accounts
- **Feedback System** — View patient/doctor feedback with rating analytics
- **Support Tickets** — Handle support requests with priority management
- **Data Export** — Export patient and assessment data (CSV/JSON)
- **Model Retraining** — Trigger AI model retraining with anonymized patient data

### Core Capabilities

- **Role-Based Access Control** — Separate portals for admins, doctors, and patients
- **Dark/Light Theme** — Full theme support with system preference detection
- **Responsive Design** — Optimized for desktop and tablet devices
- **Real-time Updates** — WebSocket integration for live data feeds
- **GDPR Compliance** — Consent-based data anonymization for ML training

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.1.0 with App Router |
| **UI Library** | React 19.1.0 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4.1.16 |
| **Animation** | Framer Motion 12.23 |
| **Charts** | Recharts 3.3.0 |
| **3D Graphics** | Three.js 0.180 |
| **PDF Generation** | @react-pdf/renderer 4.3.1 |
| **Authentication** | Firebase Auth |
| **Database** | Firebase Firestore |
| **Build Tool** | Turbopack |
| **Testing** | Vitest + Playwright |

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Firebase project with Firestore and Authentication enabled
- (Optional) AI backend service for news generation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NeuroMindSystem/NMS-Project.git
   cd NMS-Project/nms-web/nms-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth-routes)/            # Authentication pages
│   │   ├── signin/               # Sign in page
│   │   ├── signup/               # Registration page
│   │   └── forgot-password/      # Password reset
│   ├── admin/                    # Admin portal
│   │   ├── dashboard/            # Admin overview
│   │   ├── doctors/              # Doctor management
│   │   ├── admins/               # Admin user management
│   │   ├── feedback/             # System feedback
│   │   ├── support/              # Support tickets
│   │   └── data-export/          # Data export tools
│   ├── dashboard/                # Doctor dashboard
│   ├── patients/                 # Patient management
│   │   └── [id]/                 # Patient detail page
│   ├── settings/                 # User settings
│   ├── training/                 # Model retraining
│   └── api/                      # API routes
│       ├── admin/                # Admin endpoints
│       ├── anonymization/        # Data anonymization
│       └── model-retraining/     # ML model endpoints
│
├── components/
│   ├── auth/                     # Authentication forms
│   ├── layout/                   # Layout components
│   └── ui/
│       ├── common/               # Reusable UI components
│       ├── dashboard/            # Dashboard widgets
│       ├── patients/             # Patient management UI
│       ├── settings/             # Settings components
│       └── training/             # Retraining interface
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx           # Authentication state
│   └── ThemeProvider.tsx         # Theme management
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts             # Firebase initialization
│   │   └── services/             # Modular Firebase services
│   │       ├── auth-service.ts
│   │       ├── patient-service.ts
│   │       ├── doctor-service.ts
│   │       ├── assessment-service.ts
│   │       ├── admin-service.ts
│   │       ├── anonymization-service.ts
│   │       └── model-retraining-service.ts
│   └── services/
│       └── newsService.ts        # AI news integration
│
├── types/                        # TypeScript definitions
│   ├── patient.ts
│   ├── doctor.ts
│   ├── admin.ts
│   └── anonymization.ts
│
└── tests/                        # Test utilities and fixtures
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Service Integration (Optional)
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8002
NEXT_PUBLIC_NEWS_AUDIENCE=medical

# HuggingFace Integration (Optional - for model retraining)
NEXT_PUBLIC_HF_SPACE_URL=https://your-space.hf.space
NEXT_PUBLIC_HF_ADMIN_SECRET=your_secret

# Security
ENCRYPTION_KEY=your_32_character_encryption_key

# E2E Testing (Optional)
E2E_TEST_USER_EMAIL=test@example.com
E2E_TEST_USER_PASSWORD=testpassword123
```

## Available Scripts

### Development

```bash
npm run dev          # Start dev server with Turbopack (port 3000)
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing

```bash
# Unit Tests (Vitest)
npm test             # Run tests in watch mode
npm run test:ui      # Open Vitest browser UI
npm run test:coverage # Generate coverage report

# E2E Tests (Playwright)
npm run e2e          # Run all E2E tests
npm run e2e:ui       # Interactive UI mode
npm run e2e:headed   # Run with visible browser
npm run e2e:debug    # Debug mode

# Combined
npm run test:all     # Run unit tests + E2E tests
```

## Testing

### Unit Testing

- **Framework**: Vitest with React Testing Library
- **Environment**: jsdom
- **Coverage Threshold**: 80% (lines, functions, branches, statements)

Test files are co-located with components in `__tests__/` directories.

```bash
# Run specific test file
npm test -- src/components/auth/__tests__/SignInForm.test.tsx

# Run with coverage
npm run test:coverage
```

### E2E Testing

- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Port**: 3001 (avoids conflict with dev server)

```bash
# Run specific test
npm run e2e -- e2e/auth.spec.ts

# Debug specific test
npm run e2e:debug -- e2e/dashboard.spec.ts
```

## API Reference

### Anonymization Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/anonymization/eligible-patients` | List patients eligible for anonymization |
| `POST` | `/api/anonymization/anonymize` | Anonymize patient records |
| `GET` | `/api/anonymization/stats` | Get dataset statistics |

### Model Retraining Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/model-retraining/trigger` | Trigger model retraining |
| `GET` | `/api/model-retraining/history` | Get retraining history |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/admin/doctors` | Manage doctors |
| `GET/POST` | `/api/admin/admins` | Manage admin users |
| `GET` | `/api/admin/feedback` | View system feedback |
| `GET/PUT` | `/api/admin/support` | Manage support tickets |
| `POST` | `/api/admin/export` | Export data (CSV/JSON) |

## Architecture

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React UI      │────▶│  Firebase Auth   │────▶│   Firestore     │
│   Components    │     │   (Client SDK)   │     │   (Database)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                                │
         │              ┌──────────────────┐              │
         └─────────────▶│   Service Layer  │◀─────────────┘
                        │  (lib/firebase)  │
                        └──────────────────┘
                                 │
                        ┌──────────────────┐
                        │    API Routes    │
                        │  (Next.js API)   │
                        └──────────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
         ┌──────────────────┐       ┌──────────────────┐
         │   AI Backend     │       │   HuggingFace    │
         │ (News Service)   │       │   (ML Models)    │
         └──────────────────┘       └──────────────────┘
```

### Firestore Collections

| Collection | Description |
|------------|-------------|
| `users` | Patient and user profiles |
| `doctors` | Doctor profiles with subcollections |
| `risk_assessments` | Patient risk assessment data |
| `doctor_patient_relationships` | Doctor-patient mappings |
| `news_articles` | AI-generated medical news |
| `anonymized_patients` | De-identified data for ML |
| `model_retraining_logs` | Training workflow history |
| `feedback` | System feedback and ratings |
| `support_requests` | Support tickets |

### Authentication Flow

1. User signs in via Firebase Auth (email/password or OAuth)
2. `AuthContext` captures user state and role
3. `RoleGuard` component protects routes based on role
4. Services verify authentication before data operations

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest |
| Firefox | Latest |
| Safari | Latest |
| Edge | Latest |

## Security

- **Authentication**: Firebase Auth with OAuth support
- **Data Encryption**: AES-256 for sensitive audit trails
- **GDPR Compliance**: Explicit consent for data anonymization
- **Role-Based Access**: Admin, Doctor, Patient roles
- **Environment Secrets**: Sensitive keys in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm run test:all`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Use TypeScript strict mode
- Write tests for new features
- Maintain 80% code coverage

## Support

- **Issues**: [GitHub Issues](https://github.com/NeuroMindSystem/NMS-Project/issues)
- **Documentation**: [Wiki](https://github.com/NeuroMindSystem/NMS-Project/wiki)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**NeuroMind System** — Early Dementia Risk Screening Platform

Built with care for healthcare professionals
