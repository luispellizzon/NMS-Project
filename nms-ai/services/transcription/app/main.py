import os
import torch
import whisper
import httpx
import tempfile
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, HttpUrl

# --- Firebase Admin SDK Initialization ---
from firebase_admin import credentials, initialize_app, firestore

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Get the path to the service account key from an environment variable
# This is more secure and flexible than hardcoding the path.
SERVICE_ACCOUNT_KEY_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
if not SERVICE_ACCOUNT_KEY_PATH:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set.")

try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    initialize_app(cred)
    db = firestore.client()
    logging.info("Firebase Admin SDK initialized successfully.")
except Exception as e:
    logging.error(f"Failed to initialize Firebase Admin SDK: {e}")
    # Exit if we can't connect to Firebase, as the service is non-functional without it.
    exit(1)


# --- FastAPI App and Whisper Model Loading ---
app = FastAPI(
    title="NMS Transcription Service",
    description="A service to transcribe audio files from a URL using OpenAI's Whisper model."
)

# Load the model once at startup. This is memory/time intensive.
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# For higher accuracy on a GPU, consider "medium.en" or "large-v3"
MODEL_NAME = "base.en"
logging.info(f"Loading Whisper model '{MODEL_NAME}' onto device '{DEVICE}'...")
model = whisper.load_model(MODEL_NAME, device=DEVICE)
logging.info("Whisper model loaded successfully.")


# --- Pydantic Models for API Request Validation ---
class TranscriptionRequest(BaseModel):
    audioUrl: HttpUrl  # Pydantic validates this is a valid URL
    documentId: str


# --- Core Transcription Logic (to be run in the background) ---
async def process_transcription(req: TranscriptionRequest):
    """
    Downloads audio from a URL, runs transcription, and updates Firestore.
    Designed to be run as a background task.
    """
    document_ref = db.collection("speech_assessments").document(req.documentId)
    tmp_file_path = None
    
    try:
        # 1. Download the audio file asynchronously
        logging.info(f"[{req.documentId}] Downloading audio from {req.audioUrl}")
        async with httpx.AsyncClient() as client:
            response = await client.get(str(req.audioUrl), follow_redirects=True, timeout=60.0)
            response.raise_for_status()  # Will raise an exception for 4xx/5xx responses
            audio_data = response.content

        # 2. Save audio to a temporary file for Whisper to process
        with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as tmp_file:
            tmp_file.write(audio_data)
            tmp_file_path = tmp_file.name
        
        logging.info(f"[{req.documentId}] Audio saved to temporary file: {tmp_file_path}")

        # 3. Run the Whisper model
        # The transcribe function is blocking, so it will occupy the background worker
        result = model.transcribe(tmp_file_path, fp16=torch.cuda.is_available())
        transcribed_text = result["text"].strip()

        logging.info(f"[{req.documentId}] Transcription successful. Text length: {len(transcribed_text)}")

        # 4. Update the Firestore document with the result
        document_ref.update({
            "transcription": transcribed_text,
            "status": "transcribed" # As per your mobile app's data model
        })
        logging.info(f"[{req.documentId}] Firestore document updated successfully.")

    except Exception as e:
        error_message = f"An error occurred during transcription process: {e}"
        logging.error(f"[{req.documentId}] {error_message}")
        # Update Firestore with an error status so the client app is aware
        document_ref.update({
            "status": "error",
            "error_message": error_message
        })
    finally:
        # 5. Clean up the temporary file, regardless of success or failure
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)
            logging.info(f"[{req.documentId}] Cleaned up temporary file.")


# --- API Endpoints ---
@app.post("/transcribe-from-url")
async def create_transcription_job(request: TranscriptionRequest, background_tasks: BackgroundTasks):
    """
    Accepts a request to transcribe audio from a URL.
    This endpoint immediately returns a 202 response and starts the
    transcription process in the background.
    """
    logging.info(f"Received transcription job for document ID: {request.documentId}")
    
    # Add the heavy-lifting function to run in the background
    background_tasks.add_task(process_transcription, request)
    
    return {
        "status": "accepted",
        "documentId": request.documentId,
        "message": "Transcription process has been started in the background."
    }

@app.get("/health")
def health_check():
    """A simple health check endpoint."""
    return {"status": "ok", "model_loaded": True, "device": DEVICE}