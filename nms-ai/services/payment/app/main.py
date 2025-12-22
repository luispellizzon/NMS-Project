"""
FastAPI Stripe Payment Server for AlzAware
Handles payment intent creation and webhook events
"""

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import stripe
import os
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="AlzAware Payment API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Android app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stripe configuration
# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
PRICE_AMOUNT = 999  # euro 9.99 in cents

STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
if not STRIPE_API_KEY:
    raise ValueError("STRIPE_API_KEY environment variable not set.")

stripe.api_key = STRIPE_API_KEY

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
if not STRIPE_WEBHOOK_SECRET:
    raise ValueError("STRIPE_WEBHOOK_SECRET environment variable not set.")


import json
firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
if not firebase_json:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set.")

cred_dict = json.loads(firebase_json)
cred = credentials.Certificate(cred_dict)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


db = firestore.client()


# Request Models
class CreatePaymentIntentRequest(BaseModel):
    userId: str
    amount: Optional[int] = PRICE_AMOUNT  # 5 default
    currency: str = "usd"


class PaymentSuccessRequest(BaseModel):
    userId: str
    paymentIntentId: str


# Response Models
class PaymentIntentResponse(BaseModel):
    clientSecret: str
    paymentIntentId: str
    amount: int
    currency: str


class PaymentStatusResponse(BaseModel):
    success: bool
    message: str
    hasPaid: bool


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AlzAware Payment API",
        "version": "1.0.0"
    }


@app.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: CreatePaymentIntentRequest):
    """
    Create a Stripe PaymentIntent for unlocking dementia risk results
    
    Args:
        request: Contains userId and optional amount/currency
    
    Returns:
        PaymentIntentResponse with clientSecret for Stripe SDK
    """
    try:
        # Validate user exists in Firebase
        user_ref = db.collection('users').document(request.userId)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user already paid
        user_data = user_doc.to_dict()
        if user_data.get('hasPaidForResults', False):
            raise HTTPException(
                status_code=400, 
                detail="User has already paid for results"
            )
        
        # Create Stripe PaymentIntent
        payment_intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            metadata={
                'userId': request.userId,
                'product': 'dementia_risk_prediction',
                'app': 'AlzAware'
            },
            automatic_payment_methods={
                'enabled': True,
            },
        )
        
        logger.info(f"PaymentIntent created: {payment_intent.id} for user: {request.userId}")
        
        return PaymentIntentResponse(
            clientSecret=payment_intent.client_secret,
            paymentIntentId=payment_intent.id,
            amount=payment_intent.amount,
            currency=payment_intent.currency
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Stripe webhook handler for payment events
    This provides an additional layer of verification
    
    Important: Configure this URL in your Stripe Dashboard
    """
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        user_id = payment_intent['metadata'].get('userId')
        
        if user_id:
            # Update Firebase
            user_ref = db.collection('users').document(user_id)
            user_ref.update({
                'hasPaidForResults': True,
                'paymentIntentId': payment_intent['id'],
                'paidAt': firestore.SERVER_TIMESTAMP,
                'amountPaid': payment_intent['amount'],
                'currency': payment_intent['currency']
            })
            logger.info(f"Webhook: Payment succeeded for user: {user_id}")
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        logger.warning(f"Webhook: Payment failed: {payment_intent['id']}")
    
    return {"status": "success"}


@app.get("/payment-status/{user_id}", response_model=PaymentStatusResponse)
async def get_payment_status(user_id: str):
    """
    Check if user has paid for results
    
    Args:
        user_id: Firebase user ID
    
    Returns:
        PaymentStatusResponse with current payment status
    """
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_doc.to_dict()
        has_paid = user_data.get('hasPaidForResults', False)
        
        return PaymentStatusResponse(
            success=True,
            message="Payment status retrieved",
            hasPaid=has_paid
        )
        
    except Exception as e:
        logger.error(f"Error checking payment status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)