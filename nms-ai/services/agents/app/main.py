# services/agents/app/main.py
from dotenv import load_dotenv
import os
import logging
import warnings

# Suppress Pydantic v2 deprecation warnings from CrewAI
warnings.filterwarnings("ignore", category=DeprecationWarning, module="pydantic._internal._config")

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from datetime import datetime
from typing import Literal

# Firebase Admin SDK
from firebase_admin import credentials, initialize_app, firestore
from google.cloud.firestore import SERVER_TIMESTAMP

# Import our CrewAI agents
from .crew_manager import NewsCrewManager

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Firebase Admin SDK Initialization ---
SERVICE_ACCOUNT_KEY_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
if not SERVICE_ACCOUNT_KEY_PATH:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set.")

try:
    from firebase_admin import get_app
    
    # Check if Firebase app is already initialized
    try:
        get_app()  # Will raise ValueError if no app exists
        db = firestore.client()
        logging.info("Firebase Admin SDK already initialized, reusing existing app.")
    except ValueError:
        # No app exists yet, initialize a new one
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        initialize_app(cred)
        db = firestore.client()
        logging.info("Firebase Admin SDK initialized successfully.")
except Exception as e:
    logging.error(f"Failed to initialize Firebase Admin SDK: {e}")
    exit(1)

# --- FastAPI App ---
app = FastAPI(
    title="NMS Agents Service",
    description="AI agents for news aggregation and risk assessment using CrewAI"
)

# Initialize the crew manager once at startup
crew_manager = NewsCrewManager()
logging.info("CrewAI agents initialized successfully.")


# --- Pydantic Models ---
class NewsGenerationRequest(BaseModel):
    audience: Literal["medical", "patient"]  # Which audience the news is for
    topic: str = "dementia alzheimer cognitive decline"
    max_articles: int = 5


class RiskAssessmentRequest(BaseModel):
    documentId: str  # Reference to the patient assessment document


# --- Background Tasks ---
async def generate_news_articles(req: NewsGenerationRequest):
    """
    Uses CrewAI agents to research and generate news articles.
    Stores results in Firestore.
    """
    try:
        logging.info(f"Starting news generation for {req.audience} audience on topic: {req.topic}")
        
        # Determine the collection based on audience
        collection_name = "medical_news" if req.audience == "medical" else "patient_news"
        
        # Run the crew to generate articles
        articles = crew_manager.generate_news_articles(
            audience=req.audience,
            topic=req.topic,
            max_articles=req.max_articles
        )
        
        # Store each article in Firestore
        batch = db.batch()
        for article in articles:
            doc_ref = db.collection(collection_name).document()
            batch.set(doc_ref, {
                "topic": article["topic"],
                "title": article["title"],
                "sourceUrl": article["sourceUrl"],
                "publishedDate": SERVER_TIMESTAMP,
                "readTime": article["readTime"],
                "agentSummary": article["agentSummary"],
                "createdAt": SERVER_TIMESTAMP
            })
        
        batch.commit()
        logging.info(f"Successfully stored {len(articles)} articles in Firestore collection: {collection_name}")
        
    except Exception as e:
        error_message = f"Error generating news articles: {e}"
        logging.error(error_message)
        # Log error to a separate collection for monitoring
        db.collection("agent_errors").add({
            "service": "news_generation",
            "audience": req.audience,
            "error": str(e),
            "timestamp": SERVER_TIMESTAMP
        })


async def assess_dementia_risk(req: RiskAssessmentRequest):
    """
    Uses the Risk Calculator Agent to assess dementia risk for a patient.
    Updates the Firestore document with the assessment.
    """
    document_ref = db.collection("patient_assessments").document(req.documentId)
    
    try:
        logging.info(f"Starting risk assessment for document: {req.documentId}")
        
        # Fetch the patient data from Firestore
        doc = document_ref.get()
        if not doc.exists:
            raise ValueError(f"Document {req.documentId} not found")
        
        patient_data = doc.to_dict()
        
        # Run the risk assessment crew
        risk_assessment = crew_manager.calculate_risk(patient_data)
        
        # Update the document with the risk assessment
        document_ref.update({
            "riskScore": risk_assessment["riskScore"],
            "riskLevel": risk_assessment["riskLevel"],
            "explanation": risk_assessment["explanation"],
            "recommendations": risk_assessment["recommendations"],
            "assessedAt": SERVER_TIMESTAMP,
            "status": "assessed"
        })
        
        logging.info(f"Risk assessment completed for document: {req.documentId}")
        
    except Exception as e:
        error_message = f"Error assessing risk: {e}"
        logging.error(f"[{req.documentId}] {error_message}")
        document_ref.update({
            "status": "error",
            "error_message": error_message
        })


# --- API Endpoints ---
@app.post("/generate-news")
async def create_news_generation_job(request: NewsGenerationRequest, background_tasks: BackgroundTasks):
    """
    Triggers the news generation agents to fetch and summarize articles.
    Returns immediately with 202 Accepted and processes in the background.
    """
    logging.info(f"Received news generation request for {request.audience} audience")
    
    background_tasks.add_task(generate_news_articles, request)
    
    return {
        "status": "accepted",
        "audience": request.audience,
        "message": "News generation process started in the background."
    }


@app.post("/assess-risk")
async def create_risk_assessment_job(request: RiskAssessmentRequest, background_tasks: BackgroundTasks):
    """
    Triggers the risk assessment agent for a specific patient.
    Returns immediately with 202 Accepted and processes in the background.
    """
    logging.info(f"Received risk assessment request for document: {request.documentId}")
    
    background_tasks.add_task(assess_dementia_risk, request)
    
    return {
        "status": "accepted",
        "documentId": request.documentId,
        "message": "Risk assessment process started in the background."
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "nms-agents",
        "crew_initialized": crew_manager is not None
    }


@app.get("/")
def root():
    """Root endpoint with service information."""
    return {
        "service": "NMS Agents Service",
        "version": "1.0.0",
        "endpoints": {
            "generate_news": "/generate-news",
            "assess_risk": "/assess-risk",
            "health": "/health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # app object in main.py
        host="127.0.0.1",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )