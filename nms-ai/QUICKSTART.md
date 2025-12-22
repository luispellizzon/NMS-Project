# 🚀 NMS-AI Quick Start Guide

Get the NMS-AI backend up and running in 10 minutes.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- [ ] Firebase project created (with Firestore enabled)
- [ ] Google Gemini API key ([Get one free](https://ai.google.dev/))
- [ ] Git installed
- [ ] (Optional) NVIDIA GPU with drivers for faster transcription

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/luispellizzon/NMS-Project.git
cd nms-ai
```

---

## Step 2: Set Up Firebase Credentials

### 2.1 Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** (gear icon) → **Service accounts**
4. Click **Generate new private key**
5. Save the downloaded JSON file

### 2.2 Place the File

Rename the file to `serviceAccountKey.json` and place it in the **root** of the `nms-ai` directory:

```
nms-ai/
├── serviceAccountKey.json  ← Put it here
├── docker-compose.yml
└── ...
```

**Important**: This file is already in `.gitignore` and will NOT be committed to Git.

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env` File

If you don't have a `.env` file yet, create one:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Or create it manually with this content:

```env
# .env
GEMINI_API_KEY=your_actual_gemini_api_key_here
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/app/secrets/serviceAccountKey.json
```

### 3.2 Add Your Gemini API Key

1. Get your API key from [Google AI Studio](https://ai.google.dev/)
2. Open `.env` in a text editor
3. Replace `your_actual_gemini_api_key_here` with your real key

Example:
```env
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 4: Build and Start Services

### 4.1 Build the Docker Images

```bash
docker-compose build
```

This will take 5-10 minutes the first time (downloads base images and dependencies).

### 4.2 Start the Services

```bash
docker-compose up
```

Add `-d` to run in detached mode (background):
```bash
docker-compose up -d
```

### 4.3 Watch the Logs

If running in detached mode, view logs with:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f agents
docker-compose logs -f transcription
```

---

## Step 5: Verify Services are Running

### 5.1 Check Container Status

```bash
docker-compose ps
```

You should see:
```
NAME                        STATUS   PORTS
nms_agents_service         Up       0.0.0.0:8002->8000/tcp
nms_transcription_service  Up       0.0.0.0:8001->8000/tcp
```

### 5.2 Test Health Endpoints

**Transcription Service:**
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "nms-transcription",
  "model_loaded": true
}
```

**Agents Service:**
```bash
curl http://localhost:8002/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "nms-agents",
  "crew_initialized": true
}
```

Or open in your browser:
- [http://localhost:8001/health](http://localhost:8001/health)
- [http://localhost:8002/health](http://localhost:8002/health)

---

## Step 6: Test the Services

### Option A: Interactive API Documentation

Open in your browser:
- **Agents API**: [http://localhost:8002/docs](http://localhost:8002/docs)
- **Transcription API**: [http://localhost:8001/docs](http://localhost:8001/docs)

### Option B: Command Line Test

**Test News Generation (Agents Service):**

```bash
curl -X POST http://localhost:8002/generate-news \
  -H "Content-Type: application/json" \
  -d '{
    "audience": "patient",
    "topic": "alzheimer prevention",
    "max_articles": 1
  }'
```

Expected response:
```json
{
  "status": "accepted",
  "audience": "patient",
  "message": "News generation process started in the background."
}
```

**Check Results in Firestore:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Check the `patient_news` collection
4. You should see a new document with the generated article (takes ~30-60 seconds)

### Option C: Use the Scheduled Updater Script

```bash
# Make sure Docker services are running first
python scheduled_news_updater.py --patient --max-articles 1
```

---

## Common Issues & Solutions

### Issue: "Port already in use"

**Solution**: Stop any services using ports 8001 or 8002:

```bash
# Windows
netstat -ano | findstr :8002
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8002 | xargs kill -9
```

Or change ports in `docker-compose.yml`:
```yaml
ports:
  - "8003:8000"  # Use 8003 instead of 8002
```

### Issue: "serviceAccountKey.json not found"

**Solution**: Make sure the file is in the correct location:
```bash
ls -la serviceAccountKey.json  # Should show the file
```

### Issue: "Invalid API key" or "GEMINI_API_KEY not found"

**Solution**:
1. Check your `.env` file has the correct key
2. Restart Docker services after changing `.env`:
   ```bash
   docker-compose down
   docker-compose up
   ```

### Issue: Whisper model download is slow

**Solution**: The first run downloads a 139MB model. This is normal and only happens once. Wait for:
```
100%|████████████████████| 139M/139M [00:10<00:00, 13.7MiB/s]
```

### Issue: GPU not detected

**Solution**: If you don't have an NVIDIA GPU or want to use CPU mode:

1. Edit `docker-compose.yml`
2. Comment out the GPU section:
   ```yaml
   # deploy:
   #   resources:
   #     reservations:
   #       devices:
   #         - driver: nvidia
   #           count: 1
   #           capabilities: [gpu]
   ```
3. Rebuild: `docker-compose down && docker-compose up --build`

---

## Next Steps

### Explore the API

Open the interactive documentation:
- [http://localhost:8002/docs](http://localhost:8002/docs) - Agents API
- [http://localhost:8001/docs](http://localhost:8001/docs) - Transcription API

Try different endpoints:
- `/generate-news` - Generate medical or patient news
- `/assess-risk` - Assess dementia risk (requires patient data in Firestore)
- `/transcribe` - Transcribe audio files

### Set Up Scheduled News Updates

Add to your system's task scheduler (cron on Linux/Mac, Task Scheduler on Windows):

**Linux/Mac (Crontab):**
```bash
# Edit crontab
crontab -e

# Add this line for daily updates at 6 AM
0 6 * * * cd /path/to/nms-ai && /path/to/venv/bin/python scheduled_news_updater.py --both >> news_updater.log 2>&1
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 6:00 AM
4. Action: Start a Program
   - Program: `C:\path\to\python.exe`
   - Arguments: `scheduled_news_updater.py --both`
   - Start in: `C:\path\to\nms-ai`

### Integrate with Your Frontend

Example integration code:

```javascript
// Generate news articles
const response = await fetch('http://localhost:8002/generate-news', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audience: 'patient',
    topic: 'dementia prevention',
    max_articles: 5
  })
});

const result = await response.json();
console.log(result); // { status: "accepted", ... }

// Results will be in Firestore collection: patient_news
```

### Monitor Your Services

```bash
# View logs in real-time
docker-compose logs -f

# Check resource usage
docker stats

# Restart a specific service
docker-compose restart agents

# Stop all services
docker-compose down
```

---

## Useful Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose down && docker-compose up --build

# View logs
docker-compose logs -f [service-name]

# Check service status
docker-compose ps

# Access container shell (debugging)
docker exec -it nms_agents_service /bin/bash

# Remove all containers and volumes
docker-compose down -v

# Generate news manually
python scheduled_news_updater.py --both
```

---

## Getting Help

- **Full Documentation**: See [README.md](README.md)
- **Troubleshooting**: Check the [Troubleshooting section](README.md#-troubleshooting)
- **API Reference**: Visit [http://localhost:8002/docs](http://localhost:8002/docs)

---

## Summary

You should now have:

✅ Both services running in Docker containers
✅ Agents service generating news articles
✅ Transcription service ready for audio processing
✅ All data being stored in Firestore
✅ Health checks passing

**Main endpoints:**
- `http://localhost:8001` - Transcription Service
- `http://localhost:8002` - Agents Service

**Firestore collections:**
- `medical_news` - Research articles for healthcare professionals
- `patient_news` - Accessible articles for patients/caregivers
- `patient_assessments` - Risk assessment results
- `speech_assessments` - Transcription data

Happy coding! 🎉
