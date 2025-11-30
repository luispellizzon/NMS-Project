import os
import json
import joblib
import pandas as pd
import numpy as np
import tensorflow as tf
import gradio as gr
import uuid
from fastapi import FastAPI, HTTPException, BackgroundTasks
from huggingface_hub import HfApi
import firebase_admin
from firebase_admin import credentials, firestore
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import Huber
from tensorflow.keras.callbacks import EarlyStopping

# ==========================================================
# 1. CONFIGURATION & SETUP
# ==========================================================

app = FastAPI()

# Environment Variables (Set these in HF Space Settings)
HF_TOKEN = os.getenv("HF_TOKEN")
REPO_ID = "JDrizzle/NMS-Project" # Your Repo ID
ADMIN_SECRET = os.getenv("ADMIN_SECRET") # Password for the API

# Initialize Firebase
if not firebase_admin._apps:
    firebase_key = os.getenv("FIREBASE_KEY")
    if firebase_key:
        cred = credentials.Certificate(json.loads(firebase_key))
        firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client() if firebase_admin._apps else None

# Load Initial Assets
try:
    model = tf.keras.models.load_model("lifestyle_model_v3.keras")
    preprocessor = joblib.load("preprocessor_v3.pkl")
    print("✅ Loaded existing model and preprocessor.")
except:
    print("⚠️ Model/Preprocessor not found. Waiting for first training.")
    model = None
    preprocessor = None

# ==========================================================
# 2. RETRAINING LOGIC
# ==========================================================

def run_retraining_pipeline(training_id: str):
    print(f"⏳ Starting Retraining Pipeline (ID: {training_id})...")

    try:
        # --- A. Load Base Data (CSV) ---
        # We keep the CSV as the "Foundation" knowledge
        try:
            df_base = pd.read_csv("dementia_patients_health_data.csv")
            
            # Apply your specific cleaning logic
            def alcohol_category(level):
                if level == 0: return "Non-Drinker"
                elif level < 0.05: return "Occasional"
                else: return "Regular"
            
            if "AlcoholLevel" in df_base.columns:
                df_base["Alcohol_Use"] = df_base["AlcoholLevel"].apply(alcohol_category)
                
            # Calculate Severity Target (0-1)
            if "Cognitive_Test_Scores" in df_base.columns:
                df_base["severity"] = (10 - df_base["Cognitive_Test_Scores"]) / 10.0
                
        except Exception as e:
            print(f"⚠️ Could not load base CSV: {e}")
            df_base = pd.DataFrame()

        # --- B. Load New Data (Firebase) ---
        new_data = []
        used_doc_ids = []
        if firebase_admin._apps and db:
            # Use the global db instance
            # Collection for anonymized patients
            docs = db.collection('nms_patient_data').where('usedInTraining', '==', False).stream()
            for doc in docs:
                data = doc.to_dict()
                # Ensure we have a target label (Admin must verify data before it goes to DB)
                if "Cognitive_Test_Scores" in data:
                    data["severity"] = (10 - data["Cognitive_Test_Scores"]) / 10.0
                    new_data.append(data)
                    used_doc_ids.append(doc.id)
        
        df_new = pd.DataFrame(new_data)
        
        # --- C. Merge Data ---
        df_full = pd.concat([df_base, df_new], ignore_index=True)
        
        features = [
            "Age", "Weight", "Dominant_Hand", "Gender", "Education_Level",
            "Smoking_Status", "Alcohol_Use", "Physical_Activity",
            "Nutrition_Diet", "Sleep_Quality",
            "Diabetic", "Family_History", "Depression_Status",
            "APOE_ε4", "Medication_History", "Chronic_Health_Conditions"
        ]
        
        # Filter valid rows
        df_full = df_full.dropna(subset=features + ["severity"])
        
        if len(df_full) < 50:
            print("❌ Not enough data to train.")
            return

        X = df_full[features]
        y = df_full["severity"]
        
        # Sample Weights logic (from your script)
        # We approximate Cognitive Score from severity for weighting
        approx_score = 10 - (y * 10)
        weights = np.where((approx_score >= 9) | (approx_score <= 3), 2.0, 1.0)

        # --- D. Preprocessing ---
        num_features = ["Age", "Weight"]
        cat_features = [col for col in features if col not in num_features]

        new_preprocessor = ColumnTransformer(transformers=[
            ("num", StandardScaler(), num_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features)
        ])

        X_prep = new_preprocessor.fit_transform(X)
        
        # --- E. Train Model (Your Architecture) ---
        input_dim = X_prep.shape[1]
        
        new_model = Sequential([
            Dense(128, activation="relu", input_dim=input_dim),
            Dropout(0.3),
            Dense(64, activation="relu"),
            Dense(32, activation="relu"),
            Dense(1, activation="sigmoid")
        ])

        new_model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss=Huber(delta=0.5),
            metrics=["mae"]
        )

        early_stop = EarlyStopping(monitor="loss", patience=10, restore_best_weights=True)

        new_model.fit(
            X_prep, y,
            sample_weight=weights,
            epochs=80, # Reduced slightly for cloud constraints
            batch_size=32,
            callbacks=[early_stop],
            verbose=0
        )

        # --- F. Save & Push to Hub ---
        print("💾 Saving artifacts...")
        new_model.save("lifestyle_model_v3.keras")
        joblib.dump(new_preprocessor, "preprocessor_v3.pkl")

        # Mark documents as used in training
        if db and used_doc_ids:
            batch = db.batch()
            for doc_id in used_doc_ids:
                doc_ref = db.collection('nms_patient_data').document(doc_id)
                batch.update(doc_ref, {'usedInTraining': True, 'trainedAt': firestore.SERVER_TIMESTAMP})
            batch.commit()
            print(f"✅ Marked {len(used_doc_ids)} documents as used in training")
        
        if HF_TOKEN:
            print("🚀 Pushing to Hugging Face Hub...")
            api = HfApi()
            api.upload_file(
                path_or_fileobj="lifestyle_model_v3.keras",
                path_in_repo="lifestyle_model_v3.keras",
                repo_id=REPO_ID,
                repo_type="space",
                token=HF_TOKEN,
                commit_message="Auto-Retrain: Updated Model"
            )
            api.upload_file(
                path_or_fileobj="preprocessor_v3.pkl",
                path_in_repo="preprocessor_v3.pkl",
                repo_id=REPO_ID,
                repo_type="space",
                token=HF_TOKEN,
                commit_message="Auto-Retrain: Updated Preprocessor"
            )
            print("✅ Retraining Complete. Space will restart shortly.")
        else:
            print("⚠️ HF_TOKEN not set. Files saved locally but not pushed.")

        # Update status in Firestore
        if db:
            db.collection('model_retraining_logs').document(training_id).update({
                'status': 'completed',
                'completedAt': firestore.SERVER_TIMESTAMP,
                'datasetSize': {
                    'totalRecords': len(df_full),
                    'newRecords': len(df_new),
                    'baseRecords': len(df_base)
                }
            })
            print(f"✅ Updated training log {training_id} to completed")

    except Exception as e:
        print(f"❌ Retraining Failed: {e}")
        # Update status to failed in Firestore
        if db:
            try:
                db.collection('model_retraining_logs').document(training_id).update({
                    'status': 'failed',
                    'error': str(e),
                    'completedAt': firestore.SERVER_TIMESTAMP
                })
            except:
                pass  # Don't fail on logging failure

# ==========================================================
# 3. API ENDPOINTS
# ==========================================================

@app.post("/retrain")
async def trigger_retrain(background_tasks: BackgroundTasks, doctor_key: str):
    if doctor_key != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Store training start
    training_id = str(uuid.uuid4())

    # Only log to Firestore if db is available
    if db:
        db.collection('model_retraining_logs').document(training_id).set({
            'status': 'started',
            'triggeredAt': firestore.SERVER_TIMESTAMP
        })

    background_tasks.add_task(run_retraining_pipeline, training_id)

    return {
        "status": "Retraining started",
        "training_id": training_id,
        "message": "Model retraining has been queued"
    }

@app.get("/training-status/{training_id}")
async def get_training_status(training_id: str):
    doc = db.collection('training_runs').document(training_id).get()
    if doc.exists:
        return doc.to_dict()
    raise HTTPException(status_code=404, detail="Training run not found")

def fuse_lifestyle_mmse(sev_life: float, user_mmse: float, w_mmse: float = 0.7):
    """
    Fuse lifestyle severity (0–1) with user MMSE (0–30)
    into a combined severity, MMSE-equivalent, and risk category.
    """
    sev_life = float(np.clip(sev_life, 0, 1))
    user_mmse = float(np.clip(user_mmse, 0, 30))

    # Convert MMSE → severity (0 = healthy, 1 = severe)
    sev_mmse = (30.0 - user_mmse) / 30.0
    sev_fused = np.clip(w_mmse * sev_mmse + (1 - w_mmse) * sev_life, 0, 1)

    # Convert back to MMSE-equivalent (for display)
    mmse_fused = 30.0 * (1 - sev_fused)

    # Risk label
    if sev_fused < 0.2:
        risk = "Low Risk (Normal Cognition)"
    elif sev_fused < 0.4:
        risk = "Mild Risk (Early Cognitive Changes)"
    elif sev_fused < 0.7:
        risk = "Moderate Risk (Possible Decline)"
    else:
        risk = "High Risk (Likely Cognitive Impairment)"

    # Sanity rule overrides
    if user_mmse <= 10:
        risk = "High Risk (Very Low MMSE Score)"
    elif user_mmse >= 28 and sev_life < 0.5:
        risk = "Low Risk (Healthy Cognition)"

    return {
        "Lifestyle Severity (0–1)": round(sev_life, 3),
        "MMSE → Severity (0–1)": round(sev_mmse, 3),
        "Fused Severity (0–1)": round(sev_fused, 3),
        "Estimated Fused MMSE (0–30)": round(mmse_fused, 1),
        "Dementia Risk": risk,
    }

def predict_severity(Age, Weight, Dominant_Hand, Gender, Education_Level,
                     Smoking_Status, Alcohol_Use, Physical_Activity, Nutrition_Diet,
                     Sleep_Quality, Diabetic, Family_History, Depression_Status,
                     APOE_ε4, Medication_History, Chronic_Health_Conditions, User_MMSE):
    
    if model is None:
        return {"Error": "Model is loading or retraining. Try again in 1 minute."}

    data = pd.DataFrame([[
        Age, Weight, Dominant_Hand, Gender, Education_Level,
        Smoking_Status, Alcohol_Use, Physical_Activity, Nutrition_Diet,
        Sleep_Quality, Diabetic, Family_History, Depression_Status,
        APOE_ε4, Medication_History, Chronic_Health_Conditions
    ]], columns=[
        "Age", "Weight", "Dominant_Hand", "Gender", "Education_Level",
        "Smoking_Status", "Alcohol_Use", "Physical_Activity", "Nutrition_Diet",
        "Sleep_Quality", "Diabetic", "Family_History", "Depression_Status",
        "APOE_ε4", "Medication_History", "Chronic_Health_Conditions"
    ])

    try:
        X_proc = preprocessor.transform(data)
        sev_life = float(model.predict(X_proc)[0][0])
        return fuse_lifestyle_mmse(sev_life, User_MMSE)
    except Exception as e:
        return {"Error": str(e)}

inputs = [
    gr.Slider(40, 100, 65, step=1, label="Age"),
    gr.Slider(40, 120, 70, step=1, label="Weight (kg)"),
    gr.Dropdown(["Right", "Left", "Ambidextrous"], label="Dominant Hand"),
    gr.Dropdown(["Male", "Female"], label="Gender"),
    gr.Dropdown(["No School","Primary", "Secondary", "Tertiary"], label="Education Level"),
    gr.Dropdown(["Never Smoked", "Former Smoker", "Current Smoker"], label="Smoking Status"),
    gr.Dropdown(["Non-Drinker", "Occasional", "Regular"], label="Alcohol Use"),
    gr.Dropdown(["Sedentary", "Mild Activity", "Moderate Activity", "High Activity"], label="Physical Activity"),
    gr.Dropdown(["Balanced Diet", "Low-Carb Diet", "Mediterranean Diet"], label="Nutrition Diet"),
    gr.Dropdown(["Poor", "Average", "Good"], label="Sleep Quality"),
    gr.Dropdown(["0", "1"], label="Diabetic (1=Yes, 0=No)"),
    gr.Dropdown(["Yes", "No"], label="Family History of Dementia"),
    gr.Dropdown(["Yes", "No"], label="Depression Diagnosis"),
    gr.Dropdown(["Positive", "Negative"], label="APOE ε4 Gene"),
    gr.Dropdown(["Yes", "No"], label="Currently Taking Medication"),
    gr.Dropdown(["None", "Diabetes", "Heart Disease", "Hypertension"], label="Chronic Health Condition"),
    gr.Slider(0, 30, 25, step=1, label="Mini-Mental State Exam (MMSE) Score"),
]

io = gr.Interface(
    fn=predict_severity, 
    inputs=inputs, 
    outputs=gr.JSON(), 
    title="NMS Lifestyle Model",
    description="Admin: Trigger retraining via POST /retrain?admin_key=..."
)

# Mount Gradio to FastAPI
app = gr.mount_gradio_app(app, io, path="/")