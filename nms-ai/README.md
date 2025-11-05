# 📌 NMS-AI: The NeuroMind System AI Backend

This repository contains the backend microservices for the NeuroMind System (NMS). It provides an event-driven AI engine that processes patient inputs (speech, questionnaires, etc.) to generate dementia risk assessments and reports.

---

## 🏛️ System Architecture

The backend is built on a microservice architecture, orchestrated with Docker Compose. The services communicate asynchronously by reacting to data changes in a central Firebase/Firestore database.

### Services

*   **`Transcription Service`**: A standalone FastAPI service responsible for running the Whisper model. It listens for requests, downloads audio from a provided URL, and updates a Firestore document with the transcribed text.
*   **`Backend Service`**: (In Development) A Flask/CrewAI service that will be triggered after transcription is complete. It will handle risk calculation, report generation, and news aggregation.

---

## ✨ Features

-   **Speech-to-Text Processing**: High-accuracy transcription via OpenAI's Whisper model.
-   **Containerized Services**: Isolated and reproducible environments using Docker.
-   **Event-Driven & Scalable**: Decoupled services that can be scaled independently.
-   **Risk Prediction & Reporting**: (In Development) Utilizes ML models and CrewAI agents.

---

## 🛠️ Tech Stack

-   **Language**: Python 3.11
-   **API Framework**: FastAPI
-   **AI / ML**: OpenAI Whisper
-   **Database**: Google Firestore (via Firebase Admin SDK)
-   **Orchestration**: Docker & Docker Compose

---

## 🚀 Getting Started (Local Development)

Follow these steps to get the AI backend running on your local machine.

### Prerequisites

*   [Git](https://git-scm.com/downloads)
*   [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)
*   [Python](https://www.python.org/downloads/) (for running local test scripts)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd nms-ai
```

### 2. Set Up Firebase Credentials

This is a critical step. The services need credentials to communicate with your Firebase project.

1.  Generate a private key file from your Firebase project console:
    *   **Project Settings > Service accounts > Generate new private key**.
2.  Rename the downloaded JSON file to `serviceAccountKey.json`.
3.  Place this file inside the `services/transcription/` directory. The final path should be: `services/transcription/serviceAccountKey.json`.

> **🔒 SECURITY WARNING:** The `serviceAccountKey.json` file grants administrative access to your Firebase project. It is already listed in `.gitignore` and **must never be committed to version control.**

### 3. Build and Run the Services

Use Docker Compose to build the images and start the containers.

```bash
docker-compose up --build
```

*   `--build`: Forces Docker to rebuild the images using the latest changes in your `Dockerfile`.
*   To run in the background (detached mode), use `docker-compose up --build -d`.

### 4. Verify the Service is Running

Check the Docker logs. Once the transcription service is ready, you will see a log line similar to this:
`INFO: Uvicorn running on http://0.0.0.0:8000`

You can also visit the health check endpoint in your browser: **[http://localhost:8001/health](http://localhost:8001/health)**. You should see `{"status":"ok",...}`.

---

## 🧪 Running the Local Test

A script is provided to simulate a trigger and test the transcription service.

1.  **Prepare Test Data in Firebase:**
    *   **Storage**: Upload a sample audio file (`.mp3`, `.m4a`, etc.). Copy its **Download URL**.
    *   **Firestore**: Create a new document in the `speech_assessments` collection. Add a field `audioUrl` and paste the URL. Set the `status` field to `pending`. Copy the auto-generated **Document ID**.

2.  **Update the Test Script:**
    *   Open the `test_transcription.py` file at the root of the project.
    *   Replace the placeholder values for `DOCUMENT_ID` and `AUDIO_URL` with the ones you just copied.

3.  **Execute the Script:**
    Run the script from your terminal:
```bash
python test_transcription.py
```

4.  **Check the Results:**
    *   The script will confirm a `200` status.
    *   Watch the Docker logs to see the service process the request.
    *   Check your Firestore document. The `status` will change to `transcribed` and a `transcription` field will be added with the transcribed text.
