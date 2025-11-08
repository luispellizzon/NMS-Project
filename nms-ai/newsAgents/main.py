#!/usr/bin/env python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
from latest_ai_development.crew import DementiaNewsCrew
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Dementia News API",
    description="CrewAI-powered dementia news generation",
    version="1.0.0"
)

# CORS for webapp team
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Webapp team will configure this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase
firebase_initialized = False
db = None

try:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        firebase_initialized = True
        print("✓ Firebase initialized")
except Exception as e:
    print(f"⚠ Firebase not initialized (mock mode): {e}")

# Request model
class ArticleRequest(BaseModel):
    topic: str
    article_type: Optional[str] = "general"
    target_audience: Optional[str] = "families"
    save_to_firebase: Optional[bool] = True

# Routes
@app.get("/")
def root():
    return {
        "message": "Dementia News API - CrewAI Powered",
        "status": "active",
        "endpoints": {
            "generate": "/api/generate",
            "health": "/health"
        }
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "firebase": firebase_initialized
    }

@app.post("/api/generate")
def generate_article(request: ArticleRequest):
    """
    Generate dementia news article
    
    Returns NewsArticle format for webapp
    """
    try:
        # Initialize crew
        crew = DementiaNewsCrew()
        
        # Generate article
        article = crew.generate_article(
            topic=request.topic,
            article_type=request.article_type,
            target_audience=request.target_audience
        )
        
        # Save to Firebase if enabled
        if request.save_to_firebase and firebase_initialized and db:
            db.collection('news_articles').document(article['id']).set(article)
            print(f"✓ Saved to Firebase: {article['id']}")
        
        return article
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/articles")
def get_articles(limit: int = 50):
    """Get all articles from Firebase"""
    if not firebase_initialized or not db:
        return []
    
    try:
        docs = db.collection('news_articles').limit(limit).stream()
        articles = [doc.to_dict() for doc in docs]
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/articles/{article_id}")
def get_article(article_id: str):
    """Get specific article"""
    if not firebase_initialized or not db:
        raise HTTPException(status_code=404, detail="Article not found")
    
    try:
        doc = db.collection('news_articles').document(article_id).get()
        if doc.exists:
            return doc.to_dict()
        raise HTTPException(status_code=404, detail="Article not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"\n{'='*60}")
    print(f"  Dementia News API Server")
    print(f"{'='*60}")
    print(f"  Server: http://localhost:{port}")
    print(f"  Docs: http://localhost:{port}/docs")
    print(f"{'='*60}\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port)