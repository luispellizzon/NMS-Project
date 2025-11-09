# 📌 NMS-AI: The NeuroMind System AI Backend

This repository contains the backend microservices for the NeuroMind System (NMS). It provides an AI-powered engine that processes patient inputs (speech, questionnaires, etc.) to generate dementia risk assessments, curated news articles, and personalized reports.

> **Quick Start:** See [QUICKSTART.md](QUICKSTART.md) for a fast-track setup guide.

---

## 🏛️ System Architecture

The backend is built on a microservice architecture, orchestrated with Docker Compose. The services communicate through REST APIs and Firebase/Firestore for data persistence.

### Services

#### 1. **Transcription Service** (Port 8001)
A FastAPI service powered by OpenAI's Whisper model for high-accuracy speech-to-text processing.

- **Purpose**: Convert patient speech recordings to text for analysis
- **Technology**: Whisper AI (base.en model), CUDA-enabled for GPU acceleration
- **Endpoint**: `http://localhost:8001`
- **Health Check**: `http://localhost:8001/health`

#### 2. **Agents Service** (Port 8002)
A CrewAI-powered service with intelligent agents for news curation and risk assessment.

- **Purpose**:
  - Generate curated medical and patient news articles
  - Assess dementia risk based on patient data
  - Provide personalized recommendations
- **Technology**: CrewAI, Google Gemini LLM, LangChain
- **Endpoint**: `http://localhost:8002`
- **Health Check**: `http://localhost:8002/health`

**Available Agents:**
- **Medical Research Specialist**: Searches arXiv for latest dementia research papers
- **Patient Education Specialist**: Finds patient-friendly health information
- **Medical Content Summarizer**: Creates professional summaries for healthcare professionals
- **Clinical Risk Assessment Specialist**: Analyzes patient data for dementia risk

---

## ✨ Features

### Core Capabilities
- **Speech-to-Text Processing**: High-accuracy transcription via OpenAI's Whisper model
- **AI News Aggregation**: Automated curation of dementia/Alzheimer's news for two audiences:
  - Medical professionals (research papers from arXiv)
  - Patients & caregivers (accessible health information)
- **Dementia Risk Assessment**: Evidence-based risk scoring with detailed explanations
- **Scheduled News Updates**: Automated news generation via cron jobs
- **Containerized Microservices**: Isolated and reproducible environments
- **Firebase Integration**: Real-time data synchronization with Firestore

### Intelligent Agent Workflows
- **Medical News Workflow**: Research → Summarize → Store in Firestore
- **Patient News Workflow**: Search trusted sources → Simplify → Store in Firestore
- **Risk Assessment Workflow**: Analyze patient data → Calculate risk → Generate recommendations

---

## 🛠️ Tech Stack

### Backend Framework
- **Language**: Python 3.11
- **API Framework**: FastAPI + Uvicorn
- **Async Processing**: FastAPI BackgroundTasks

### AI & Machine Learning
- **Speech Recognition**: OpenAI Whisper (base.en model)
- **LLM Framework**: CrewAI 0.86.0 + LangChain
- **LLM Provider**: Google Gemini (via langchain-google-genai)
- **Agent Tools**: Custom web search, arXiv search, summarization tools

### Database & Storage
- **Database**: Google Firestore (via Firebase Admin SDK)
- **Collections**:
  - `medical_news` - Research articles for healthcare professionals
  - `patient_news` - Accessible articles for patients/caregivers
  - `patient_assessments` - Risk assessment data
  - `speech_assessments` - Transcription data

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **GPU Support**: NVIDIA Docker runtime for Whisper acceleration
- **Environment Management**: python-dotenv

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose
- [NVIDIA Docker Runtime](https://github.com/NVIDIA/nvidia-docker) (recommended for GPU acceleration)
- Firebase Project with Firestore enabled
- Google Gemini API Key ([Get one here](https://ai.google.dev/))
- Python 3.11+ (for running utility scripts)

### Quick Setup

For detailed step-by-step instructions, see **[QUICKSTART.md](QUICKSTART.md)**.

```bash
# 1. Clone the repository
git clone https://github.com/luispellizzon/NMS-Project.git
cd nms-ai

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Add Firebase credentials
# Download serviceAccountKey.json from Firebase Console
# Place it in the root directory: ./serviceAccountKey.json

# 4. Build and run services
docker-compose up --build

# 5. Verify services are running
curl http://localhost:8001/health  # Transcription service
curl http://localhost:8002/health  # Agents service
```

---

## 📡 API Documentation

### Transcription Service (Port 8001)

**POST `/transcribe`**
```json
{
  "documentId": "speech_assessment_doc_id",
  "audioUrl": "https://storage.googleapis.com/..."
}
```

### Agents Service (Port 8002)

**POST `/generate-news`**
Generate curated news articles for a specific audience.
```json
{
  "audience": "medical",  // or "patient"
  "topic": "alzheimer dementia cognitive decline",
  "max_articles": 5
}
```

**POST `/assess-risk`**
Assess dementia risk for a patient.
```json
{
  "documentId": "patient_assessment_doc_id"
}
```

**GET `/health`**
Health check endpoint for both services.

For interactive API documentation:
- Transcription API Docs: http://localhost:8001/docs
- Agents API Docs: http://localhost:8002/docs

---

## 🤖 Automated News Updates

The `scheduled_news_updater.py` script allows for automated news generation on a schedule.

### Manual Usage
```bash
# Activate virtual environment (if using one)
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Generate news for both audiences
python scheduled_news_updater.py --both

# Generate medical news only
python scheduled_news_updater.py --medical

# Generate patient news only
python scheduled_news_updater.py --patient

# Custom article count
python scheduled_news_updater.py --both --max-articles 3
```

### Scheduled Execution (Cron)
Add to crontab for daily updates at 6 AM:
```bash
0 6 * * * cd /path/to/nms-ai && /path/to/venv/bin/python scheduled_news_updater.py --both >> news_updater.log 2>&1
```

---

## 🧪 Testing

### Test Transcription Service
```bash
python test_transcription.py
```

### Test Agents Service
```bash
# Generate medical news
curl -X POST http://localhost:8002/generate-news \
  -H "Content-Type: application/json" \
  -d '{"audience":"medical","topic":"alzheimer","max_articles":1}'

# Generate patient news
curl -X POST http://localhost:8002/generate-news \
  -H "Content-Type: application/json" \
  -d '{"audience":"patient","topic":"dementia prevention","max_articles":1}'
```

Check Firestore collections `medical_news` and `patient_news` for results.

---

## 📁 Project Structure

```
nms-ai/
├── services/
│   ├── agents/                    # CrewAI agents service
│   │   ├── app/
│   │   │   ├── main.py           # FastAPI application
│   │   │   ├── crew_manager.py   # CrewAI orchestration
│   │   │   ├── tools.py          # Custom agent tools
│   │   │   ├── agents.yaml       # Agent definitions
│   │   │   └── tasks.yaml        # Task definitions
│   │   ├── config/               # Agent configurations
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── transcription/            # Whisper transcription service
│       ├── app/
│       │   └── main.py
│       ├── Dockerfile
│       └── requirements.txt
├── docker-compose.yml            # Service orchestration
├── scheduled_news_updater.py     # Automated news generation script
├── test_transcription.py         # Transcription service test
├── .env                          # Environment variables (not in git)
├── serviceAccountKey.json        # Firebase credentials (not in git)
├── README.md                     # This file
└── QUICKSTART.md                 # Quick start guide
```

---

## 🔧 Development

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
export GEMINI_API_KEY="your-key-here"
uvicorn app.main:app --reload --port 8002
```

### Docker Commands

```bash
# Build specific service
docker-compose build agents
docker-compose build transcription

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f agents
docker-compose logs -f transcription

# Stop services
docker-compose down

# Rebuild and restart
docker-compose down && docker-compose up --build
```

---

## 🔐 Security Best Practices

1. **Never commit** `serviceAccountKey.json` or `.env` to version control
2. **Rotate API keys** regularly (Gemini, Firebase)
3. **Use environment variables** for all sensitive configuration
4. **Restrict Firebase service account permissions** to minimum required
5. **Enable Firebase security rules** for production deployments
6. **Use HTTPS** for production API endpoints

---

## 🐛 Troubleshooting

### Service Won't Start
- Check Docker logs: `docker-compose logs -f [service-name]`
- Verify `.env` file has correct `GEMINI_API_KEY`
- Ensure `serviceAccountKey.json` exists in root directory
- Check port availability (8001, 8002)

### GPU Not Detected (Transcription)
- Install [NVIDIA Docker Runtime](https://github.com/NVIDIA/nvidia-docker)
- Verify GPU: `docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi`
- Comment out GPU config in `docker-compose.yml` to use CPU mode

### News Generation Fails
- Verify Gemini API key is valid
- Check internet connection for arXiv/web searches
- Review logs: `docker-compose logs -f agents`
- Check Firestore permissions

### Pydantic Deprecation Warnings
These are expected from CrewAI and can be ignored. They're suppressed in the code.

---

## 📚 Additional Resources

- [CrewAI Documentation](https://docs.crewai.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [Google Gemini API](https://ai.google.dev/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## 📄 License

[Add your license information here]

---

## 👥 Contributing

[Add contribution guidelines here]

---

## 📞 Support

For issues and questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [QUICKSTART.md](QUICKSTART.md)
3. Open an issue on GitHub
