import requests
import json

DOCUMENT_ID = ""  # e.g., "9f4B6pXqW8z...""
AUDIO_URL = ""         # e.g., "https://firebasestorage.googleapis.com/..."

    # --- The URL of your locally running service ---
SERVICE_URL = "http://localhost:8001/transcribe-from-url"

def test_transcription_service():
    """Sends a request to the local transcription service."""
    if "YOUR_DOCUMENT_ID" in DOCUMENT_ID:
        print("❌ ERROR: Please replace the placeholder values in the script.")
        return

    print(f"▶️  Sending request for document: {DOCUMENT_ID}")

    payload = {
        "documentId": DOCUMENT_ID,
        "audioUrl": AUDIO_URL
    }

    try:
        response = requests.post(SERVICE_URL, json=payload, timeout=10)

            # Check the immediate response from the API
        print(f"✅ Immediate API Response Status: {response.status_code}")
        print(f"✅ Immediate API Response Body: {response.json()}")

        if response.status_code == 200:
            print("\n✅ Test initiated successfully!")
            print("   Check the Docker logs and your Firestore document for the result.")
        else:
            print(f"\n❌ Test failed with status code {response.status_code}")

    except requests.RequestException as e:
        print(f"\n❌ ERROR: Could not connect to the service at {SERVICE_URL}.")
        print("   Is the Docker container running? Check with 'docker ps'.")
        print(f"   Error details: {e}")

if __name__ == "__main__":
    test_transcription_service()