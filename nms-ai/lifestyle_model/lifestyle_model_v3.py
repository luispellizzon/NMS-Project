import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import Huber
from tensorflow.keras.callbacks import EarlyStopping
import joblib
from tensorflow import keras

# ==============================
# 1️⃣ LOAD AND PREPARE DATA
# ==============================

df = pd.read_csv("dementia_patients_health_data.csv")

# Create Alcohol_Use bins (since raw value is numeric)
def alcohol_category(level):
    if level == 0:
        return "Non-Drinker"
    elif level < 0.05:
        return "Occasional"
    else:
        return "Regular"

df["Alcohol_Use"] = df["AlcoholLevel"].apply(alcohol_category)

# Selected features suitable for self-reporting
features = [
    "Age", "Weight", "Dominant_Hand", "Gender", "Education_Level",
    "Smoking_Status", "Alcohol_Use", "Physical_Activity",
    "Nutrition_Diet", "Sleep_Quality",
    "Diabetic", "Family_History", "Depression_Status",
    "APOE_ε4", "Medication_History", "Chronic_Health_Conditions"
]


# Drop missing values
df = df.dropna(subset=features + ["Cognitive_Test_Scores"])

# Target: Cognitive severity (0–1)
# 0 = healthy (score 10), 1 = severe (score 0)
df["severity"] = (10 - df["Cognitive_Test_Scores"]) / 10.0

X = df[features]
y = df["severity"]

# Sample weighting: emphasize extreme cases
weights = np.where((df["Cognitive_Test_Scores"] >= 9) | (df["Cognitive_Test_Scores"] <= 3), 2.0, 1.0)

# ==============================
# 2️⃣ PREPROCESSING PIPELINE
# ==============================

num_features = ["Age", "Weight"]
cat_features = [col for col in features if col not in num_features]

preprocessor = ColumnTransformer(transformers=[
    ("num", StandardScaler(), num_features),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features)
])

X_train, X_test, y_train, y_test, w_train, w_test = train_test_split(
    X, y, weights, test_size=0.2, random_state=42
)

X_train_prep = preprocessor.fit_transform(X_train)
X_test_prep = preprocessor.transform(X_test)

# Save preprocessor
joblib.dump(preprocessor, "preprocessor_v3.pkl")
print("✅ Saved preprocessor_v3.pkl")

# ==============================
# 3️⃣ BUILD THE MODEL
# ==============================

input_dim = X_train_prep.shape[1]

model = Sequential([
    Dense(128, activation="relu", input_dim=input_dim),
    Dropout(0.3),
    Dense(64, activation="relu"),
    Dense(32, activation="relu"),
    Dense(1, activation="sigmoid")  # 0–1 severity
])

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss=Huber(delta=0.5),
    metrics=["mae"]
)

# ==============================
# 4️⃣ TRAIN THE MODEL
# ==============================

early_stop = EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)

history = model.fit(
    X_train_prep, y_train,
    sample_weight=w_train,
    validation_split=0.2,
    epochs=100,
    batch_size=32,
    callbacks=[early_stop],
    verbose=1
)

# ==============================
# 5️⃣ EVALUATE & SAVE
# ==============================

loss, mae = model.evaluate(X_test_prep, y_test, verbose=0)
print(f"✅ Test MAE: {mae:.3f}")

# Save model
model.save("lifestyle_model_v3.keras")
print("✅ Saved lifestyle_model_v3.keras")

# ==============================
# 6️⃣ OPTIONAL: CALIBRATION CHECK
# ==============================
from sklearn.metrics import r2_score

y_pred = model.predict(X_test_prep).ravel()
r2 = r2_score(y_test, y_pred)
print(f"R² score: {r2:.3f}")

# Quick calibration rescale (optional)
mean_healthy = np.mean(y_pred[df.loc[X_test.index, "Cognitive_Test_Scores"] >= 9])
mean_severe = np.mean(y_pred[df.loc[X_test.index, "Cognitive_Test_Scores"] <= 2])
print(f"Mean predicted severity: healthy={mean_healthy:.3f}, severe={mean_severe:.3f}")
