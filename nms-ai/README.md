# NMS-AI: The NeuroMind System AI Backend

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](https://github.com/luispellizzon/NMS-Project/releases)

The AI-powered backend for the NeuroMind System (NMS) - a healthcare solution for early dementia risk screening. This repository provides microservices for speech transcription, AI-powered news curation, dementia risk assessment, and lifestyle-based prediction models.

> **Quick Start:** See [QUICKSTART.md](QUICKSTART.md) for a 10-minute setup guide.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [LLM Configuration](#llm-configuration)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Lifestyle Model](#lifestyle-model)
- [Model Retraining](#model-retraining)
- [Automated News Updates](#automated-news-updates)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## System Architecture

The backend is built on a microservice architecture, orchestrated with Docker Compose. Services communicate through REST APIs and use Firebase/Firestore for data persistence.

```
                                    +------------------+
                                    |   Firebase/      |
                                    |   Firestore      |
                                    +--------+---------+
                                             |
            +--------------------------------+--------------------------------+
            |                |               |               |                |
    +-------v------+  +------v-------+  +----v-----+  +-----v------+  +------v------+
    | Transcription|  |   Agents     |  | Lifestyle|  |   Ollama   |  |   Mobile/   |
    |   Service    |  |   Service    |  |   Model  |  |   (Local)  |  |   Web App   |
    |  Port 8001   |  |  Port 8002   |  | Port 7860|  | Port 11434 |  |   Clients   |
    +--------------+  +--------------+  +----------+  +------------+  +-------------+
         Whisper       CrewAI + LLMs     TensorFlow      Llama 3.2
```

### Services

#### 1. Transcription Service (Port 8001)
A FastAPI service powered by OpenAI's Whisper model for high-accuracy speech-to-text processing.

- **Purpose**: Convert patient speech recordings to text for cognitive analysis
- **Technology**: OpenAI Whisper (base.en model), CUDA-enabled GPU acceleration
- **Key Features**:
  - Async audio downloading and processing
  - Speech assessment scoring against expected answers
  - Background task processing for non-blocking operations

#### 2. Agents Service (Port 8002)
A CrewAI-powered service with intelligent agents for news curation and risk assessment.

- **Purpose**: Generate curated news articles, assess dementia risk, provide recommendations
- **Technology**: CrewAI 0.86.0, LangChain, Multi-LLM support
- **LLM Providers**: Google Gemini + Groq (Kimi K2) + Ollama (local)
- **Key Features**:
  - 4 specialized AI agents (Medical Researcher, Patient Researcher, Summarizer, Risk Calculator)
  - Real-time WebSocket progress updates
  - YAML-driven agent configuration

#### 3. Lifestyle Model Service (Port 7860)
A TensorFlow-based prediction service with Gradio web interface.

- **Purpose**: Predict dementia risk from lifestyle and health factors
- **Technology**: TensorFlow/Keras, Gradio, scikit-learn
- **Key Features**:
  - 16 input health/lifestyle features
  - MMSE score fusion for comprehensive risk assessment
  - Model retraining API with HuggingFace Hub integration
  - Interactive Gradio web interface

#### 4. Ollama Service (Port 11434)
Local LLM hosting for privacy-focused inference.

- **Purpose**: Provide local LLM fallback without external API dependencies
- **Technology**: Ollama with Llama 3.2 model
- **Key Features**:
  - GPU-accelerated inference
  - Persistent model storage via Docker volumes
  - No external API calls required

---

## Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Speech-to-Text** | High-accuracy transcription via OpenAI Whisper |
| **AI News Curation** | Automated dementia/Alzheimer's news for medical professionals and patients |
| **Risk Assessment** | Evidence-based dementia risk scoring with explanations |
| **Lifestyle Prediction** | TensorFlow model for risk prediction from health factors |
| **Model Retraining** | Continuous learning from new patient data |
| **Multi-LLM Support** | 2 online LLMs (Gemini + Groq) + 1 local (Ollama) |
| **Real-time Updates** | WebSocket streaming for live progress |
| **HuggingFace Integration** | Model versioning and deployment |

### Intelligent Agent Workflows

```
Medical News:     Research Agent (arXiv) → Summarizer → Firestore
Patient News:     Patient Agent (Web) → Summarizer → Firestore
Risk Assessment:  Risk Calculator Agent → Analysis → Recommendations
```

### Firestore Collections

| Collection | Purpose |
|------------|---------|
| `medical_news` | Research articles for healthcare professionals |
| `patient_news` | Accessible articles for patients/caregivers |
| `patient_assessments` | Risk assessment results with recommendations |
| `nms_patient_data` | Patient data for model retraining |
| `model_retraining_logs` | Training run history and status |
| `agent_errors` | Error logging for monitoring |

---

## Tech Stack

### Backend Framework
- **Language**: Python 3.11
- **API Framework**: FastAPI + Uvicorn
- **Web UI**: Gradio (for Lifestyle Model)
- **Async Processing**: FastAPI BackgroundTasks

### AI & Machine Learning
| Component | Technology |
|-----------|------------|
| Speech Recognition | OpenAI Whisper (base.en) |
| Agent Framework | CrewAI 0.86.0 + LangChain 0.3.7 |
| Primary LLM | Google Gemini (gemini-2.0-flash-exp) |
| Secondary LLM | Groq (moonshotai/kimi-k2-instruct) |
| Local LLM | Ollama (llama3.2) |
| Prediction Model | TensorFlow/Keras |
| Preprocessing | scikit-learn |

### Database & Storage
- **Database**: Google Firestore (Firebase Admin SDK)
- **Model Registry**: HuggingFace Hub

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **GPU Support**: NVIDIA Docker Runtime
- **Environment Management**: python-dotenv

---

## LLM Configuration

The Agents Service supports multiple LLM providers for optimal performance and redundancy:

| Provider | Model | Usage | API Required |
|----------|-------|-------|--------------|
| **Gemini** | gemini-2.0-flash-exp | Research agents (powerful reasoning) | `GEMINI_API_KEY` |
| **Groq** | moonshotai/kimi-k2-instruct | Summarizer, Risk Calculator (fast inference) | `GROQ_API_KEY` |
| **Ollama** | llama3.2 | Local fallback (privacy-focused) | None (local) |

### Check LLM Status
```bash
curl http://localhost:8002/llm-status
```

Response:
```json
{
  "online_llms": {
    "gemini": {"configured": true, "model": "gemini-2.0-flash-exp"},
    "groq": {"configured": true, "model": "moonshotai/kimi-k2-instruct"}
  },
  "local_llm": {
    "ollama": {"configured": true, "model": "llama3.2"}
  },
  "rubric_compliance": {
    "online_llms_configured": 2,
    "local_llm_configured": 1
  }
}
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose
- [NVIDIA Docker Runtime](https://github.com/NVIDIA/nvidia-docker) (recommended for GPU)
- Firebase Project with Firestore enabled
- API Keys:
  - [Google Gemini API Key](https://ai.google.dev/)
  - [Groq API Key](https://console.groq.com/)

### Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/luispellizzon/NMS-Project.git
cd NMS-Project/nms-ai

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your API keys:
#   - GEMINI_API_KEY=your_gemini_key
#   - GROQ_API_KEY=your_groq_key

# 3. Add Firebase credentials
# Download serviceAccountKey.json from Firebase Console
# Place it in: ./serviceAccountKey.json

# 4. Build and run all services
docker-compose up --build

# 5. Verify services are running
curl http://localhost:8001/health  # Transcription
curl http://localhost:8002/health  # Agents
curl http://localhost:8002/llm-status  # LLM Status
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` | Yes | Path to Firebase credentials JSON |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GROQ_API_KEY` | Yes | Groq API key for Kimi K2 |
| `GROQ_MODEL` | No | Groq model (default: moonshotai/kimi-k2-instruct) |
| `OLLAMA_BASE_URL` | No | Ollama URL (default: http://localhost:11434) |
| `OLLAMA_MODEL` | No | Ollama model (default: llama3.2) |
| `DEFAULT_LLM_PROVIDER` | No | Default provider (default: gemini) |
| `HF_TOKEN` | No | HuggingFace token for model uploads |

---

## API Documentation

### Transcription Service (Port 8001)

#### POST `/transcribe-from-url`
Transcribe audio from a URL.
```json
{
  "userId": "user_id",
  "documentId": "doc_id",
  "audioUrl": "https://storage.googleapis.com/..."
}
```

#### POST `/process-assessment`
Process a complete speech assessment with scoring.
```json
{
  "userId": "user_id",
  "assessmentId": "assessment_id"
}
```

### Agents Service (Port 8002)

#### POST `/generate-news`
Generate curated news articles.
```json
{
  "audience": "medical",  // or "patient"
  "topic": "alzheimer dementia cognitive decline",
  "max_articles": 5
}
```

#### POST `/assess-risk`
Assess dementia risk for a patient.
```json
{
  "documentId": "patient_assessment_doc_id"
}
```

#### GET `/llm-status`
Check LLM provider configurations and rubric compliance.

#### WebSocket `/ws/generate-news`
Real-time news generation with progress updates.
```javascript
const ws = new WebSocket('ws://localhost:8002/ws/generate-news');
ws.send(JSON.stringify({audience: 'medical', topic: 'dementia', max_articles: 3}));
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

### Lifestyle Model Service (Port 7860)

#### POST `/retrain`
Trigger model retraining with new data from Firebase.
```json
{
  "doctor_key": "your_doctor_key"
}
```

#### GET `/training-status/{training_id}`
Check retraining job status.

#### Gradio Interface
Access the interactive prediction UI at: `http://localhost:7860`

### Interactive API Docs
- Transcription: http://localhost:8001/docs
- Agents: http://localhost:8002/docs

---

## Lifestyle Model

### Model Architecture

```
Input (16 features) → Dense(128, ReLU) → Dropout(0.3) → Dense(64, ReLU)
                    → Dense(32, ReLU) → Dense(1, Sigmoid) → Risk Score
```

### Input Features

| Category | Features |
|----------|----------|
| Demographics | Age, Weight, Gender, Dominant Hand, Education Level |
| Lifestyle | Smoking Status, Alcohol Use, Physical Activity, Nutrition/Diet, Sleep Quality |
| Medical | Diabetic, Family History, Depression Status, APOE-e4, Medication History, Chronic Conditions |

### Risk Fusion

The model combines lifestyle prediction with MMSE (Mini-Mental State Exam) scores:

```python
fused_risk = (0.3 * lifestyle_severity) + (0.7 * mmse_severity)
```

Risk Categories:
- **Low Risk**: Score < 0.3
- **Mild Risk**: Score 0.3 - 0.5
- **Moderate Risk**: Score 0.5 - 0.7
- **High Risk**: Score > 0.7

---

## Model Retraining

The Lifestyle Model supports continuous learning from new patient data.

### Trigger Retraining
```bash
curl -X POST http://localhost:7860/retrain \
  -H "Content-Type: application/json" \
  -d '{"doctor_key": "your_key"}'
```

### Retraining Pipeline
1. Fetches new patient data from Firebase (`nms_patient_data` collection)
2. Merges with base training dataset
3. Retrains TensorFlow model with sample weighting
4. Uploads new model to HuggingFace Hub
5. Marks used data in Firestore

### Check Training Status
```bash
curl http://localhost:7860/training-status/{training_id}
```

---

## Automated News Updates

The `scheduled_news_updater.py` script enables automated news generation.

### Manual Usage
```bash
# Generate news for both audiences
python scheduled_news_updater.py --both

# Medical news only
python scheduled_news_updater.py --medical

# Patient news only
python scheduled_news_updater.py --patient

# Custom article count
python scheduled_news_updater.py --both --max-articles 3
```

### Scheduled Execution (Cron)
```bash
# Daily at 6 AM
0 6 * * * cd /path/to/nms-ai && python scheduled_news_updater.py --both >> news.log 2>&1
```

---

## Testing

### Health Checks
```bash
curl http://localhost:8001/health  # Transcription
curl http://localhost:8002/health  # Agents
curl http://localhost:8002/llm-status  # LLM Status
```

### Test News Generation
```bash
# Medical news
curl -X POST http://localhost:8002/generate-news \
  -H "Content-Type: application/json" \
  -d '{"audience":"medical","topic":"alzheimer","max_articles":1}'

# Patient news
curl -X POST http://localhost:8002/generate-news \
  -H "Content-Type: application/json" \
  -d '{"audience":"patient","topic":"dementia prevention","max_articles":1}'
```

### Test Transcription
```bash
python test_transcription.py
```

---

## Project Structure

```
nms-ai/
├── services/
│   ├── agents/                      # CrewAI agents service
│   │   ├── app/
│   │   │   ├── main.py             # FastAPI application
│   │   │   ├── crew_manager.py     # CrewAI orchestration
│   │   │   ├── llm_config.py       # Multi-LLM configuration
│   │   │   ├── tools.py            # Custom agent tools
│   │   │   ├── agents.yaml         # Agent definitions
│   │   │   └── tasks.yaml          # Task definitions
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   └── transcription/               # Whisper transcription service
│       ├── app/
│       │   └── main.py
│       ├── Dockerfile
│       └── requirements.txt
│
├── lifestyle_model/                  # TensorFlow prediction model
│   ├── app.py                       # FastAPI + Gradio interface
│   ├── lifestyle_model_v3.keras     # Trained model artifact
│   ├── preprocessor_v3.pkl          # Feature preprocessor
│   ├── lifestyle_model_v3.py        # Training script
│   ├── dementia_patients_health_data.csv  # Training data
│   ├── Dockerfile
│   └── requirements.txt
│
├── dementia_model/                   # HuggingFace prediction scripts
│   └── predict_dementia.py
│
├── docker-compose.yml               # Service orchestration
├── scheduled_news_updater.py        # Automated news script
├── test_transcription.py            # Test utilities
├── .env                             # Environment config (not in git)
├── serviceAccountKey.json           # Firebase credentials (not in git)
├── README.md                        # This file
└── QUICKSTART.md                    # Quick start guide
```

---

## Development

### Running Individual Services

**Transcription Service:**
```bash
cd services/transcription
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

**Agents Service:**
```bash
cd services/agents
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

**Lifestyle Model:**
```bash
cd lifestyle_model
pip install -r requirements.txt
python app.py  # Runs on port 7860
```

### Docker Commands

```bash
# Build all services
docker-compose build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f agents
docker-compose logs -f transcription

# Rebuild specific service
docker-compose build agents
docker-compose up -d agents

# Stop all services
docker-compose down
```

---

## Troubleshooting

### Service Won't Start
- Check Docker logs: `docker-compose logs -f [service-name]`
- Verify `.env` has correct API keys (GEMINI_API_KEY, GROQ_API_KEY)
- Ensure `serviceAccountKey.json` exists in root directory
- Check port availability (8001, 8002, 7860, 11434)

### GPU Not Detected
- Install [NVIDIA Docker Runtime](https://github.com/NVIDIA/nvidia-docker)
- Verify: `docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi`
- For CPU-only: Comment out GPU config in `docker-compose.yml`

### LLM Connection Issues
- Check API keys are valid: `curl http://localhost:8002/llm-status`
- Verify Groq key at https://console.groq.com/
- Verify Gemini key at https://ai.google.dev/
- For Ollama: Ensure container is running `docker-compose logs ollama`

### News Generation Fails
- Check internet connection for arXiv/web searches
- Review agent logs: `docker-compose logs -f agents`
- Verify Firestore permissions in Firebase Console

### Model Retraining Issues
- Check Firebase credentials are valid
- Ensure `nms_patient_data` collection has data
- Review training logs in `model_retraining_logs` collection

---

## Security Best Practices

1. **Never commit** `serviceAccountKey.json` or `.env` to version control
2. **Rotate API keys** regularly (Gemini, Groq, Firebase)
3. **Use environment variables** for all sensitive configuration
4. **Restrict Firebase permissions** to minimum required
5. **Enable Firebase security rules** for production
6. **Use HTTPS** for production API endpoints

---

## Additional Resources

- [CrewAI Documentation](https://docs.crewai.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [Google Gemini API](https://ai.google.dev/docs)
- [Groq Console](https://console.groq.com/)
- [Ollama](https://ollama.ai/)
- [TensorFlow/Keras](https://www.tensorflow.org/)
- [HuggingFace Hub](https://huggingface.co/docs/hub/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 NeuroMind System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [QUICKSTART.md](QUICKSTART.md)
3. Open an issue on [GitHub](https://github.com/luispellizzon/NMS-Project/issues)

---

**Version 1.0.0** | Released December 2024
