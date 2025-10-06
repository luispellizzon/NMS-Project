# NMS Project — Firebase Cloud Functions Setup

This folder contains the **Firebase backend** for the NMS project.  
It includes callable Cloud Functions, such as:

- **login** and **registration** : Web and Mobile apps can use for authentication and testing.
- MORE FEATURES STILL IN PROGRESS...

---

## Overview

You don’t need to deploy these functions — we use the **Firebase Emulator** for local testing.

Your role is to:

- Pull the latest code from the **develop** branch
- Set up Firebase locally
- Add the `.env` file (sent privately)
- Run the emulator to connect your app

---

## Getting Started

### 1️⃣ Pull updates from `develop` branch

Make sure you’re on the `develop` branch and on the project root folder:

```bash
git fetch origin develop
git checkout develop
git pull origin develop
```

### 2️⃣ Install Firebase dependencies if not installed yet

```bash
cd firebase/functions
npm install
```

### 3️⃣ Add the `.env` file

Create a new file called `.env` inside `firebase/functions` folder and copy the environment settings inside the file.

### 4️⃣ Checkout to your working branch

Once `develop` branch is updated, switch back to your working branch:

```bash
git checkout -b <web, mobile, firebase, ai>
```

### 5️⃣ Start Firebase Emulator

To test your Web or Mobile app with Firebase backend, first run the emulator to start a server.

```bash
firebase emulators:start --only functions
```

You will get endpoints like the following:

```bash
http://localhost:5001/nms-app-4aa89/us-central1/login
http://localhost:5001/nms-app-4aa89/us-central1/register
```

## Examples for Next.js APP

### 1️⃣ Using Firebase SDK - Next.js APP

```bash
npm install firebase
```

### 2️⃣ Create a firebaseClient.ts helper

```typescript
// firebaseClient.ts
import {initializeApp} from "firebase/app";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// connect to emulator in dev mode
if (process.env.NODE_ENV === "development") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export {functions, httpsCallable};
```

### 2️⃣ Call cloud functions inside the web app

```typescript
import {functions, httpsCallable} from "../firebaseClient";

export async function handleLogin(email: string, password: string) {
  const login = httpsCallable(functions, "login");
  const result = await login({email, password});
  console.log("Login result:", result.data);
}

export async function handleRegister(email: string, password: string) {
  const register = httpsCallable(functions, "register");
  const result = await register({email, password});
  console.log("Register result:", result.data);
}
```

## Examples for Kotlin/Java

### 1️⃣ Using Firebase SDK - Gradle dependency

To install Firebase SDK - Refer to: [text](https://firebase.google.com/docs/android/setup)
To call cloud functions - Refer to: [text](https://firebase.google.com/docs/functions/callable#android)
