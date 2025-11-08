// Example React Components for Dementia News Integration
// Copy these into your existing web application

import React, { useState, useEffect } from 'react';
import {
  NewsArticle,
  fetchDementiaArticles,
  fetchArticleById,
  generateDementiaArticle,
  searchArticles,
  DementiaArticleRequest,
  DementiaArticleType,
  TargetAudience
} from './DementiaNewsData';

// ===================================================================
// Component 1: Article List - Display all dementia articles
// ===================================================================

export function DementiaArticleList() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDementiaArticles(50);
      setArticles(data);
    } catch (err) {
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dementia News</h2>
        <button 
          onClick={loadArticles}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

// ===================================================================
// Component 2: Article Card - Individual article display
// ===================================================================

interface ArticleCardProps {
  article: NewsArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {article.category}
          </span>
          <span className="text-sm text-gray-500">
            {article.readTime} min read
          </span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {article.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.summary}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{article.author}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// Component 3: Article Generator - Generate new articles
// ===================================================================

export function DementiaArticleGenerator() {
  const [topic, setTopic] = useState('');
  const [articleType, setArticleType] = useState<DementiaArticleType>('general');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('families');
  const [loading, setLoading] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<NewsArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedArticle(null);

    try {
      const request: DementiaArticleRequest = {
        topic,
        article_type: articleType,
        target_audience: targetAudience,
        save_to_firebase: true
      };

      const article = await generateDementiaArticle(request);
      
      if (article) {
        setGeneratedArticle(article);
        setTopic(''); // Reset form
      } else {
        setError('Failed to generate article. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while generating the article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Generate Dementia Article
        </h2>

        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Managing behavioral changes in dementia"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Article Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Type
            </label>
            <select
              value={articleType}
              onChange={(e) => setArticleType(e.target.value as DementiaArticleType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="research">Research</option>
              <option value="caregiving">Caregiving</option>
              <option value="treatment">Treatment</option>
              <option value="prevention">Prevention</option>
              <option value="symptoms">Symptoms</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="families">Families</option>
              <option value="caregivers">Caregivers</option>
              <option value="patients">Patients</option>
              <option value="medical_professionals">Medical Professionals</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating... (30-60 seconds)
              </span>
            ) : (
              'Generate Article'
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Generated Article Display */}
      {generatedArticle && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 pb-4 border-b">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {generatedArticle.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{generatedArticle.author}</span>
              <span>•</span>
              <span>{new Date(generatedArticle.publishedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{generatedArticle.readTime} min read</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-lg text-gray-700 font-medium">
              {generatedArticle.summary}
            </p>
          </div>

          <div className="prose max-w-none">
            {generatedArticle.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {generatedArticle.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// Component 4: Search Bar
// ===================================================================

export function ArticleSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchArticles(query, 10);
      setResults(searchResults);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dementia articles..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

// ===================================================================
// Component 5: Category Filter
// ===================================================================

export function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'all', label: 'All Articles' },
    { value: 'research', label: 'Research' },
    { value: 'caregiving', label: 'Caregiving' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'health', label: 'Health' },
  ];

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = selectedCategory === 'all' 
        ? await fetchDementiaArticles(20)
        : await fetchArticlesByCategory(selectedCategory, 20);
      setArticles(data);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

// ===================================================================
// Export all components
// ===================================================================

export default {
  DementiaArticleList,
  ArticleCard,
  DementiaArticleGenerator,
  ArticleSearch,
  CategoryFilter
};
