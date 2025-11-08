# CrewAI News Article Generator

A complete system for generating AI-powered news articles using CrewAI agents, with HTTP API endpoints and Firebase storage.

## 🎯 Features

- **CrewAI Multi-Agent System**: Research, Writing, and Editing agents working together
- **HTTP API Server**: FastAPI endpoints for article generation and management
- **Firebase Integration**: Store and retrieve articles from Firebase/Firestore
- **NewsArticle Format**: Matches your WebApp TypeScript interface
- **Async Processing**: Background article generation for long-running tasks
- **Search & Filter**: Search articles and filter by category

## 📋 Prerequisites

- Python 3.8+
- OpenAI API key
- Firebase project (optional - system works in mock mode without it)
- CrewAI installed (you mentioned you already have this)

## 🚀 Quick Start

### Step 1: Set Up Environment

1. **Copy environment variables:**
```bash
cp .env.example .env
```

2. **Edit `.env` and add your OpenAI API key:**
```bash
OPENAI_API_KEY=sk-your-key-here
```

3. **(Optional) Add Firebase credentials:**
   - Download your Firebase service account JSON from Firebase Console
   - Place it in the project directory
   - Update `.env`:
```bash
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Run the Server

```bash
python server.py
```

The server will start at `http://localhost:8000`

### Step 4: Test the API

Open your browser and go to:
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## 📡 API Endpoints

### Generate Article (Synchronous)
```bash
POST http://localhost:8000/api/generate

Body:
{
  "topic": "Artificial Intelligence trends",
  "category": "technology",
  "save_to_firebase": true
}

Response: NewsArticle object
```

### Generate Article (Asynchronous - Non-blocking)
```bash
POST http://localhost:8000/api/generate/async

Body:
{
  "topic": "Climate change solutions",
  "category": "environment",
  "save_to_firebase": true
}

Response:
{
  "job_id": "job-abc123",
  "status": "processing",
  "message": "Article generation started in background"
}
```

### Get All Articles
```bash
GET http://localhost:8000/api/articles?limit=50
```

### Get Article by ID
```bash
GET http://localhost:8000/api/articles/{article_id}
```

### Get Articles by Category
```bash
GET http://localhost:8000/api/articles/category/technology?limit=20
```

### Search Articles
```bash
POST http://localhost:8000/api/search

Body:
{
  "query": "quantum computing",
  "limit": 20
}
```

### Delete Article
```bash
DELETE http://localhost:8000/api/articles/{article_id}
```

## 🧪 Testing with Python

Create a test file:

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000"

# 1. Generate an article
response = requests.post(
    f"{BASE_URL}/api/generate",
    json={
        "topic": "The future of renewable energy",
        "category": "environment",
        "save_to_firebase": True
    }
)

article = response.json()
print(f"Generated article: {article['title']}")
print(f"Article ID: {article['id']}")

# 2. Get all articles
response = requests.get(f"{BASE_URL}/api/articles")
articles = response.json()
print(f"Total articles: {len(articles)}")

# 3. Get article by ID
article_id = article['id']
response = requests.get(f"{BASE_URL}/api/articles/{article_id}")
retrieved_article = response.json()
print(f"Retrieved: {retrieved_article['title']}")

# 4. Search articles
response = requests.post(
    f"{BASE_URL}/api/search",
    json={"query": "energy", "limit": 10}
)
search_results = response.json()
print(f"Search results: {len(search_results)}")
```

## 🔧 Using in Your WebApp

### Install Dependencies in Your WebApp

```bash
npm install axios
# or
yarn add axios
```

### Example React/TypeScript Usage

```typescript
import axios from 'axios';
import { NewsArticle } from './MockData';

const API_BASE_URL = 'http://localhost:8000';

// Generate a new article
export async function generateNewArticle(
  topic: string, 
  category: string
): Promise<NewsArticle | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generate`, {
      topic,
      category,
      save_to_firebase: true
    });
    return response.data;
  } catch (error) {
    console.error('Error generating article:', error);
    return null;
  }
}

// Fetch all articles
export async function getAllArticles(): Promise<NewsArticle[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/articles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// Fetch articles by category
export async function getArticlesByCategory(
  category: string
): Promise<NewsArticle[]> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/articles/category/${category}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// Example React component
function ArticleGenerator() {
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<NewsArticle | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const newArticle = await generateNewArticle(
      'Quantum Computing Breakthroughs',
      'technology'
    );
    setArticle(newArticle);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Article'}
      </button>
      {article && (
        <div>
          <h2>{article.title}</h2>
          <p>{article.summary}</p>
          <p>Category: {article.category}</p>
          <p>Read time: {article.readTime} min</p>
        </div>
      )}
    </div>
  );
}
```

## 🏗️ Project Structure

```
.
├── server.py              # FastAPI HTTP server
├── agents.py              # CrewAI agents configuration
├── models.py              # NewsArticle Pydantic model
├── firebase_client.py     # Firebase integration
├── MockData.ts            # TypeScript interface example
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🤖 How the Agents Work

The system uses three specialized CrewAI agents:

1. **Research Agent**: Gathers information on the given topic
   - Finds key facts and statistics
   - Identifies recent developments
   - Collects expert opinions

2. **Writer Agent**: Creates the article
   - Writes engaging headlines
   - Structures content logically
   - Maintains journalistic style

3. **Editor Agent**: Polishes the final product
   - Checks grammar and clarity
   - Ensures proper formatting
   - Verifies completeness

These agents work sequentially, with each building on the previous agent's output.

## 🔥 Firebase Setup (Optional)

If you want to use real Firebase storage instead of mock mode:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Click "Generate new private key"
6. Download the JSON file
7. Save it in your project directory
8. Update `.env` with the path to this file

## 🎨 Customizing Agents

Edit `agents.py` to customize agent behavior:

```python
# Example: Adjust agent parameters
self.researcher = Agent(
    role="News Researcher",
    goal="Your custom goal here",
    backstory="Your custom backstory",
    llm=self.llm,
    temperature=0.7,  # Adjust creativity
    max_iterations=5  # Adjust thoroughness
)
```

## 🐛 Troubleshooting

### "No module named 'crewai'"
```bash
pip install crewai crewai-tools
```

### "OpenAI API key not found"
Make sure you've created `.env` file and added your key:
```bash
OPENAI_API_KEY=sk-your-key-here
```

### "Firebase initialization failed"
The system will work in mock mode without Firebase. If you want real Firebase:
1. Download credentials JSON
2. Set `FIREBASE_CREDENTIALS_PATH` in `.env`

### CORS errors in browser
The server already has CORS enabled. If issues persist, update the CORS middleware in `server.py`:
```python
allow_origins=["http://your-frontend-url.com"]
```

## 📊 Performance Tips

1. **Use Async Generation** for long articles:
   ```bash
   POST /api/generate/async
   ```

2. **Adjust Agent Temperature** in `agents.py` for creativity vs consistency

3. **Limit Results** when fetching multiple articles:
   ```bash
   GET /api/articles?limit=10
   ```

4. **Use Category Filters** instead of searching all articles

## 🔒 Security Notes

- Never commit `.env` file to git
- Use environment variables for all secrets
- In production, restrict CORS to your frontend domain
- Consider adding authentication to your API endpoints
- Use HTTPS in production

## 📝 License

MIT License - Feel free to use and modify as needed.

## 🤝 Support

For issues or questions:
1. Check the FastAPI docs at http://localhost:8000/docs
2. Review error messages in server logs
3. Ensure all environment variables are set correctly

## 🎯 Next Steps

1. ✅ Set up environment variables
2. ✅ Run the server
3. ✅ Test with sample requests
4. ✅ Integrate with your WebApp
5. 🔄 Customize agents for your use case
6. 🔄 Deploy to production (consider using Railway, Render, or AWS)

Happy coding! 🚀
