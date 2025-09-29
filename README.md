# NeuroMind System (NMS) – Early Dementia Risk Screening

This is a group project (Year 3, 2025) to develop **NeuroMind System (NMS)**, a healthcare solution for early dementia risk screening. The system combines **mobile**, **web**, and **AI components**, connected via **Firebase**.

---

## 🚀 System Components

1. **nms-mobile** – Android app for patients/caregivers

   - Collects questionnaire responses, speech recordings, and cognitive tests.
   - Displays dementia risk score and provides patient-friendly interface.

2. **nms-web** – Web portal for healthcare professionals

   - Patient dashboards, risk score visualizations, and reports.
   - Secure login for medical staff.

3. **nms-ai** – AI backend (Python, ML, Agents)

   - Speech-to-text, questionnaire analysis, cognitive test scoring.
   - CrewAI/AutoGen agents to summarize risk and retrieve dementia-related news.

4. **firebase** – Central backend
   - Firestore (users' data & patients results).
   - Storage (speech/audio recordings).
   - Authentication (patients, doctors and caregivers).
   - Cloud Functions (integration with AI backend) - TO BE DECIDED.

---

## 🏗️ Tech Stack

- **Mobile**: Android Studio (Kotlin/Java), Firebase SDK
- **Web**: React (frontend), Node.js (backend if needed), Firebase Hosting
- **Backend/AI**: Python (FastAPI/Flask), CrewAI/AutoGe, -- MODEL TO BE DECIDED (TensorFlow?) --
- **Database**: Firebase Firestore
- **Payments**: Stripe / PayPal (sandbox) -- TO BE DECIDED --
- **Deployment**: Firebase Hosting & Functions, Docker + Cloud Run for AI -- TO BE DECIDED --

---

## 📂 Repository Structure
nms-system/
│── nms-mobile/ # Android Studio project
│── nms-web/ # Web portal (React + Node backend)
│── firebase/ # Firebase config + functions
│── nms-ai/ # Python AI backend
│── config/ # Shared configs (env, Firebase admin keys)
│── docs/ # Documentation, diagrams
│── tests/ # Testing (mobile, web, ai)

---

## 👥 Team Roles
- Member 1 → Mobile app  
- Member 2 → Web frontend  
- Member 3 → Firebase / Node.js backend  
- Member 4 → AI backend  

---

## 🔧 Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/nms-system.git
   cd nms-system
   ```