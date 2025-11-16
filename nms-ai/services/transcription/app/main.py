# services/transcription/main.py

import re
import string
from typing import Dict, Any, Tuple
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

class ProcessAssessmentJob(BaseModel):
    userId: str
    assessmentId: str

_PUNCT_TABLE = str.maketrans({c: " " for c in string.punctuation})

# --- Helper Functions for Assessment Tasks transcriptions and scoring ---
def normalize_text(s: str) -> str:
    """
    Lowercase, strip punctuation (to spaces), collapse whitespace.
    """
    s = s.lower().translate(_PUNCT_TABLE)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def contains_tokenwise(haystack: str, needle: str) -> bool:
    """
    Inclusive check after normalization; simple substring match on normalized text.
    """
    hay = normalize_text(haystack)
    ned = normalize_text(needle)
    return ned in hay

def calculate_score_for_task(task_id: str, transcript: str, expected_answers: list[str], max_score: int) -> int:
    """
    Count how many expected answers appear in transcript (case-insensitive), 
    capped by max_score. Special-case repeat_action to 0/1.
    """
    if not transcript or not expected_answers:
        return 0

    if task_id == "repeat_action":
        return 1 if any(contains_tokenwise(transcript, ans) for ans in expected_answers) else 0

    score = 0
    for ans in expected_answers:
        if ans and contains_tokenwise(transcript, ans):
            score += 1
    return min(score, max_score)

def assessment_ref(user_id: str, assessment_id: str):
    """
    Path: users/{userId}/speech_assessment/{assessmentId}
    """
    return db.collection("users").document(user_id).collection("speech_assessment").document(assessment_id)

async def process_single_task(user_id: str, assessment_id: str, task_key: str, task_map: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    """
    For one task under content: downloads audio, transcribes with existing model,
    computes score, and returns (score, partialUpdateDict).
    """
    result_map = task_map.get("result") or {}
    audio_url = result_map.get("audioUrl")
    expected_answers = task_map.get("expectedAnswers") or []
    max_score = int(task_map.get("maxScore") or 0)

    updates: Dict[str, Any] = {}
    if not audio_url:
        # ensure deterministic fields even when missing audio
        updates[f"content.{task_key}.result.transcription"] = ""
        updates[f"content.{task_key}.result.userScore"] = 0
        return 0, updates

    tmp_file_path = None
    transcript = ""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(str(audio_url), follow_redirects=True, timeout=120.0)
            resp.raise_for_status()
            audio_bytes = resp.content

        with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as tmp:
            tmp.write(audio_bytes)
            tmp_file_path = tmp.name

        result = model.transcribe(tmp_file_path, fp16=torch.cuda.is_available())
        transcript = (result.get("text") or "").strip()
    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)

    score = calculate_score_for_task(task_key, transcript, expected_answers, max_score)
    updates[f"content.{task_key}.result.transcription"] = transcript
    updates[f"content.{task_key}.result.userScore"] = score
    print(transcript)
    return score, updates

async def process_assessment_document(user_id: str, assessment_id: str):
    """
    Loads users/{userId}/speech_assessment/{assessmentId}, iterates 'content',
    transcribes, scores, and writes back nested updates + totalScore.
    """
    doc_ref = assessment_ref(user_id, assessment_id)
    snap = doc_ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Assessment document not found")

    data = snap.to_dict() or {}
    content = data.get("content") or {}
    if not isinstance(content, dict):
        raise HTTPException(status_code=400, detail="Invalid 'content' structure in assessment document")

    total_score = 0
    batch_updates: Dict[str, Any] = {}

    # sequential to control CPU/GPU usage
    for task_key, task_map in content.items():
        try:
            partial, upd = await process_single_task(user_id, assessment_id, task_key, task_map)
            total_score += partial
            batch_updates.update(upd)
        except Exception as e:
            logging.exception(f"[{assessment_id}] Error processing task '{task_key}': {e}")
            batch_updates[f"content.{task_key}.result.transcription"] = ""
            batch_updates[f"content.{task_key}.result.userScore"] = 0
            batch_updates[f"content.{task_key}.result.error"] = str(e)

    batch_updates["totalScore"] = total_score
    doc_ref.update(batch_updates)

async def _bg_process_assessment(job: ProcessAssessmentJob):
    try:
        await process_assessment_document(job.userId, job.assessmentId)
    except Exception as e:
        logging.exception(f"[{job.assessmentId}] Failed processing assessment: {e}")
        assessment_ref(job.userId, job.assessmentId).update({
            "processingError": str(e)
        })


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


@app.post("/process-assessment")
async def process_assessment(job: ProcessAssessmentJob, background_tasks: BackgroundTasks):
    """
    Starts background processing for users/{userId}/speech_assessment/{assessmentId}.
    Leaves existing endpoints untouched.
    """
    ref = assessment_ref(job.userId, job.assessmentId)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Assessment document not found")

    background_tasks.add_task(_bg_process_assessment, job)
    return {
        "status": "accepted",
        "userId": job.userId,
        "assessmentId": job.assessmentId,
        "message": "Assessment processing started."
    }
