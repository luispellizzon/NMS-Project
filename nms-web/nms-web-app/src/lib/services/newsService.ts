// src/lib/services/newsService.ts
import { NewsArticle } from '@/types/news';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config'; // You'll need to create this

// Get audience type from environment variable
const DEFAULT_AUDIENCE = process.env.NEXT_PUBLIC_NEWS_AUDIENCE || 'patient'; // 'medical' or 'patient'
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

interface ArticleRequest {
  topic: string;
  article_type?: string;
  target_audience?: 'families' | 'professionals' | 'general';
  save_to_firebase?: boolean;
}

/**
 * Converts Firestore document data to NewsArticle type
 */
function mapFirestoreDocToArticle(doc: DocumentData & { id: string }): NewsArticle {
  const data = doc;
  
  // Extract read time - convert "X min" string to number
  let readTime = 5; // default
  if (data.readTime) {
    const match = String(data.readTime).match(/(\d+)/);
    if (match) readTime = parseInt(match[1], 10);
  }

  return {
    id: doc.id,
    title: data.title || 'Untitled',
    summary: data.agentSummary || data.summary || 'No summary available',
    content: data.agentSummary || data.summary || 'No content available',
    author: data.author || data.authors?.join(', ') || 'Unknown',
    publishedAt: data.publishedDate?.toDate?.().toISOString() || 
                 data.createdAt?.toDate?.().toISOString() || 
                 new Date().toISOString(),
    category: data.topic || 'General',
    tags: data.tags || [],
    imageUrl: data.imageUrl || '',
    source: data.sourceUrl || data.source || 'Unknown',
    readTime,
    createdAt: data.createdAt?.toDate?.().toISOString()
  };
}

/**
 * Fetches the latest news articles from Firestore
 */
export async function fetchArticles(): Promise<NewsArticle[]> {
  try {
    const collectionName = DEFAULT_AUDIENCE === 'medical' ? 'medical_news' : 'patient_news';
    
    const articlesQuery = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc'),
      limit(50) // Fetch recent articles
    );

    const querySnapshot = await getDocs(articlesQuery);
    
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((doc) => {
      articles.push(mapFirestoreDocToArticle({ id: doc.id, ...doc.data() }));
    });

    console.log("📰 Fetched articles:", articles.length);
    return articles;
    
  } catch (error) {
    console.error("Error fetching articles from Firestore:", error);
    throw new Error('Failed to fetch news articles from Firestore.');
  }
}

/**
 * Generates a new article using the AI agents backend
 */
export async function generateArticle(request: ArticleRequest): Promise<void> {
  try {
    // Map frontend audience to backend audience
    const audience = request.target_audience === 'families' ? 'patient' : 'medical';

    const response = await fetch(`${AI_SERVICE_URL}/generate-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audience,
        topic: request.topic,
        max_articles: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const result = await response.json();
    console.log("🤖 Article generation started:", result);

  } catch (error) {
    console.error("Error generating article:", error);
    throw new Error('Failed to generate article from AI agents.');
  }
}

/**
 * Agent artifact interface matching backend structure
 */
export interface AgentArtifact {
  id: string;
  type: 'search' | 'analysis' | 'summary' | 'complete';
  agent: string;
  title: string;
  content: string;
  timestamp: Date;
  status: 'in_progress' | 'completed';
}

/**
 * Custom error types for better error handling
 */
export class NewsGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: 'OVERLOADED' | 'EMPTY_RESPONSE' | 'NETWORK' | 'UNKNOWN',
    public readonly isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'NewsGenerationError';
  }
}

/**
 * Parse error message to determine error type
 */
function parseErrorMessage(message: string): NewsGenerationError {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('overloaded') || lowerMessage.includes('503')) {
    return new NewsGenerationError(
      'The AI service is currently experiencing high demand. Please try again in a few moments.',
      'OVERLOADED',
      true
    );
  }

  if (lowerMessage.includes('none or empty') || lowerMessage.includes('invalid response')) {
    return new NewsGenerationError(
      'The AI model returned an incomplete response. Please try a different search query or try again later.',
      'EMPTY_RESPONSE',
      true
    );
  }

  if (lowerMessage.includes('websocket') || lowerMessage.includes('connection')) {
    return new NewsGenerationError(
      'Connection to the AI service failed. Please check your internet connection and try again.',
      'NETWORK',
      true
    );
  }

  return new NewsGenerationError(
    'An unexpected error occurred while generating the report. Please try again.',
    'UNKNOWN',
    false
  );
}

/**
 * Generates a new article with real-time progress updates via WebSocket
 */
export async function generateArticleWithStream(
  request: ArticleRequest,
  onArtifact: (artifact: AgentArtifact) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Map frontend audience to backend audience
      const audience = request.target_audience === 'families' ? 'patient' : 'medical';

      // Create WebSocket URL (replace http with ws)
      const wsUrl = AI_SERVICE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      const ws = new WebSocket(`${wsUrl}/ws/generate-news`);

      ws.onopen = () => {
        console.log("🔌 WebSocket connected");

        // Send the generation request
        ws.send(JSON.stringify({
          audience,
          topic: request.topic,
          max_articles: 1
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'started') {
            console.log("🤖 Agent generation started:", data.message);
          } else if (data.type === 'artifact') {
            // Convert timestamp string to Date object
            const artifact: AgentArtifact = {
              id: data.id,
              type: data.artifactType,
              agent: data.agent,
              title: data.title,
              content: data.content,
              timestamp: new Date(data.timestamp),
              status: data.status
            };
            onArtifact(artifact);
          } else if (data.type === 'complete') {
            console.log("✅ Agent generation complete:", data.message);
            ws.close();
            resolve();
          } else if (data.type === 'error') {
            console.error("❌ Agent generation error:", data.message);
            ws.close();
            const parsedError = parseErrorMessage(data.message);
            reject(parsedError);
          }
        } catch (parseError) {
          console.error("Error parsing WebSocket message:", parseError);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        const networkError = new NewsGenerationError(
          'Connection to the AI service failed. Please check your internet connection and try again.',
          'NETWORK',
          true
        );
        reject(networkError);
      };

      ws.onclose = (event) => {
        if (!event.wasClean) {
          console.warn("WebSocket closed unexpectedly:", event.code, event.reason);
        }
      };

    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      reject(new Error('Failed to establish WebSocket connection'));
    }
  });
}