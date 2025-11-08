// DementiaNewsData.ts
// Integration file for your existing web application
// This provides TypeScript interfaces and API helper functions for dementia news

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  source: string;
  readTime: number;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Article types for dementia content
export type DementiaArticleType = 
  | 'research' 
  | 'caregiving' 
  | 'treatment' 
  | 'prevention' 
  | 'symptoms' 
  | 'lifestyle'
  | 'general';

export type TargetAudience = 
  | 'families' 
  | 'caregivers' 
  | 'patients' 
  | 'medical_professionals';

export interface DementiaArticleRequest {
  topic: string;
  article_type?: DementiaArticleType;
  target_audience?: TargetAudience;
  save_to_firebase?: boolean;
}

// Mock data for development/fallback
export const mockDementiaArticles: NewsArticle[] = [
  {
    id: "dementia-001",
    title: "Understanding Early Warning Signs of Alzheimer's Disease",
    content: `Recognizing the early warning signs of Alzheimer's disease can make a significant difference in managing the condition and planning for the future. While everyone experiences occasional memory lapses, certain patterns may indicate something more serious.

Memory loss that disrupts daily life is one of the most common early signs. This goes beyond forgetting where you placed your keys; it includes forgetting recently learned information, important dates, or asking for the same information repeatedly.

Challenges in planning or solving problems may emerge. Someone might have trouble following a familiar recipe, keeping track of monthly bills, or concentrating on tasks that were once routine. These difficulties often take longer than they used to and may require more effort.

Confusion with time or place is another key indicator. People with early Alzheimer's may lose track of dates, seasons, or the passage of time. They might forget where they are or how they got there.

If you notice these signs in yourself or a loved one, it's important to consult with a healthcare provider. Early diagnosis allows for better treatment planning, participation in clinical trials, and time to make important decisions about care and legal matters.

Remember, not all memory problems indicate Alzheimer's. Various treatable conditions can cause similar symptoms, which is why professional evaluation is crucial.`,
    summary: "Learn to recognize the early warning signs of Alzheimer's disease, including memory loss, planning difficulties, and confusion with time or place. Early detection enables better treatment planning and care.",
    author: "Dementia News Team",
    publishedAt: "2025-11-06T10:00:00Z",
    category: "health",
    tags: ["Dementia", "Alzheimer's", "Symptoms", "Early Detection", "Health"],
    imageUrl: "https://picsum.photos/seed/dementia-signs/800/600",
    source: "Dementia News Network",
    readTime: 4
  },
  {
    id: "dementia-002",
    title: "Breakthrough Blood Test Shows Promise for Early Alzheimer's Detection",
    content: `A revolutionary blood test has demonstrated remarkable accuracy in detecting Alzheimer's disease years before symptoms appear, according to new research published in a leading medical journal.

The test, which measures specific proteins associated with Alzheimer's pathology, achieved 90% accuracy in identifying individuals who would develop the disease within five years. This represents a significant advancement over current diagnostic methods.

Traditional Alzheimer's diagnosis relies on cognitive tests, brain scans, and sometimes invasive spinal taps. This new blood test offers a simpler, more accessible alternative that could enable widespread screening.

Dr. Sarah Chen, lead researcher on the study, explains: "This test detects biomarkers in the blood that indicate early brain changes associated with Alzheimer's. The earlier we can identify these changes, the sooner we can intervene with treatments."

The implications are profound. Early detection could allow individuals to:
- Participate in clinical trials for new treatments
- Make lifestyle modifications that may slow disease progression
- Plan for future care needs
- Access support services earlier

While the test is not yet widely available, researchers are working toward FDA approval. Several healthcare systems are already piloting the technology.

It's important to note that a positive result doesn't guarantee someone will develop Alzheimer's, but it does indicate elevated risk that warrants monitoring and potential intervention.`,
    summary: "New blood test achieves 90% accuracy in predicting Alzheimer's disease years before symptoms appear, offering hope for early intervention and better treatment outcomes.",
    author: "Dementia News Team",
    publishedAt: "2025-11-05T14:30:00Z",
    category: "research",
    tags: ["Dementia", "Alzheimer's", "Research", "Diagnosis", "Medical Science"],
    imageUrl: "https://picsum.photos/seed/blood-test/800/600",
    source: "Dementia News Network",
    readTime: 3
  },
  {
    id: "dementia-003",
    title: "Essential Self-Care Tips for Dementia Caregivers",
    content: `Caring for a loved one with dementia is one of life's most challenging roles. While your focus is naturally on providing the best care possible, neglecting your own wellbeing can lead to burnout, health problems, and reduced effectiveness as a caregiver.

Understanding Caregiver Stress

Caregiving demands are intense: managing medications, handling behavioral changes, providing physical assistance, and coping with the emotional aspects of watching a loved one's decline. It's normal to feel overwhelmed, frustrated, sad, or even angry at times.

Essential Self-Care Strategies

1. Accept Your Feelings
Your emotions are valid. Allow yourself to feel sadness, frustration, or grief without judgment. These feelings don't mean you're failing; they mean you're human.

2. Take Regular Breaks
Respite care isn't selfish—it's necessary. Use adult day programs, hire in-home help, or ask family members to provide regular relief. Even short breaks help you recharge.

3. Maintain Your Health
Schedule your own medical appointments. Eat nutritious meals. Exercise regularly, even if it's just a short walk. Sleep is crucial—don't sacrifice it consistently.

4. Stay Connected
Isolation intensifies stress. Join a dementia caregiver support group, stay in touch with friends, and don't hesitate to share your struggles with trusted people.

5. Set Realistic Expectations
You can't do everything perfectly. Some days will be harder than others. Focus on safety and essential needs, and let go of less important tasks.

6. Use Available Resources
Many communities offer caregiver support services, educational programs, and financial assistance. The Alzheimer's Association helpline (1-800-272-3900) is available 24/7.

Remember: Taking care of yourself isn't taking away from your loved one—it enables you to provide better, more sustainable care. You matter too.`,
    summary: "Comprehensive self-care strategies for dementia caregivers, including stress management, maintaining personal health, seeking support, and setting realistic expectations for sustainable caregiving.",
    author: "Dementia News Team",
    publishedAt: "2025-11-04T09:15:00Z",
    category: "caregiving",
    tags: ["Dementia", "Alzheimer's", "Caregiving", "Support", "Mental Health"],
    imageUrl: "https://picsum.photos/seed/caregiver/800/600",
    source: "Dementia News Network",
    readTime: 5
  },
  {
    id: "dementia-004",
    title: "Brain-Healthy Diet: Foods That May Reduce Dementia Risk",
    content: `Emerging research suggests that dietary choices play a significant role in brain health and may help reduce the risk of dementia. While no diet can completely prevent Alzheimer's or other forms of dementia, certain eating patterns show promising protective effects.

The MIND Diet

The Mediterranean-DASH Intervention for Neurodegenerative Delay (MIND) diet combines elements of the Mediterranean diet and the DASH (Dietary Approaches to Stop Hypertension) diet. Studies indicate it may reduce dementia risk by up to 35%.

Key Components:

Green Leafy Vegetables
Aim for at least six servings per week. Spinach, kale, collards, and lettuce are rich in folate, vitamin E, and flavonoids that support cognitive function.

Berries
Blueberries and strawberries, in particular, contain antioxidants that may slow cognitive decline. Two or more servings weekly are recommended.

Nuts
A handful of nuts daily provides healthy fats, vitamin E, and other nutrients beneficial for brain health. Walnuts are especially rich in omega-3 fatty acids.

Olive Oil
Use as your primary cooking oil. Extra virgin olive oil contains compounds with anti-inflammatory and antioxidant properties.

Whole Grains
Three or more servings daily of whole grains like oatmeal, quinoa, and brown rice support overall health and stable blood sugar.

Fish
Fatty fish like salmon, mackerel, and sardines are rich in omega-3 fatty acids crucial for brain health. Aim for at least one serving weekly.

Foods to Limit:
- Red meat (less than four servings per week)
- Butter and margarine (less than one tablespoon daily)
- Cheese and fried foods (minimal consumption)
- Pastries and sweets (limit to five servings per week)

Beyond Diet

Remember that diet is just one factor. Combine healthy eating with regular exercise, social engagement, quality sleep, and mental stimulation for optimal brain health.

Consult with a healthcare provider or registered dietitian before making significant dietary changes, especially if you have existing health conditions.`,
    summary: "Learn about the MIND diet and specific foods that research suggests may help reduce dementia risk, including leafy greens, berries, nuts, and fatty fish.",
    author: "Dementia News Team",
    publishedAt: "2025-11-03T11:20:00Z",
    category: "lifestyle",
    tags: ["Dementia", "Prevention", "Nutrition", "Brain Health", "Lifestyle"],
    imageUrl: "https://picsum.photos/seed/diet/800/600",
    source: "Dementia News Network",
    readTime: 4
  }
];

// API Helper Functions

/**
 * Fetch all dementia articles from the API
 */
export async function fetchDementiaArticles(limit: number = 50): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dementia/articles?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch dementia articles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dementia articles:', error);
    return mockDementiaArticles; // Fallback to mock data
  }
}

/**
 * Fetch all articles (not just dementia)
 */
export async function fetchAllArticles(limit: number = 50): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return mockDementiaArticles;
  }
}

/**
 * Fetch a single article by ID
 */
export async function fetchArticleById(id: string): Promise<NewsArticle | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

/**
 * Fetch articles by category
 */
export async function fetchArticlesByCategory(
  category: string, 
  limit: number = 20
): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/articles/category/${category}?limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

/**
 * Generate a new dementia article
 */
export async function generateDementiaArticle(
  request: DementiaArticleRequest
): Promise<NewsArticle | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dementia/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: request.topic,
        article_type: request.article_type || 'general',
        target_audience: request.target_audience || 'families',
        save_to_firebase: request.save_to_firebase !== false,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate article');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating article:', error);
    return null;
  }
}

/**
 * Generate article asynchronously (non-blocking)
 */
export async function generateDementiaArticleAsync(
  request: DementiaArticleRequest
): Promise<{ job_id: string; status: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dementia/generate/async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: request.topic,
        article_type: request.article_type || 'general',
        target_audience: request.target_audience || 'families',
        save_to_firebase: request.save_to_firebase !== false,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to start generation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error starting generation:', error);
    return null;
  }
}

/**
 * Get suggested dementia topics
 */
export async function getSuggestedTopics(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dementia/topics`);
    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching topics:', error);
    return null;
  }
}

/**
 * Search articles
 */
export async function searchArticles(
  query: string, 
  limit: number = 20
): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to search articles');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching articles:', error);
    return [];
  }
}

/**
 * Delete an article
 */
export async function deleteArticle(articleId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting article:', error);
    return false;
  }
}

// Export mock data as default
export default mockDementiaArticles;
