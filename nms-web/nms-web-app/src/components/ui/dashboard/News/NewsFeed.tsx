'use client';

import { useState } from 'react';
import { richNewsFeedData, NewsArticle } from '@/lib/mock_data';
import { BookOpen, ArrowLeft, ExternalLink } from 'lucide-react';
import GenericSearchBar from '../../common/SearchBar';

// --- Sub-component for the Detail View ---
const ArticleDetailView = ({ article, onGoBack }: { article: NewsArticle; onGoBack: () => void; }) => (
  <div>
    {/* Header with Back Button and Title */}
    <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onGoBack}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Go back to news list"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white">{article.title}</h3>
        <p className="text-sm text-brand-primary font-semibold mt-1">{article.topic}</p>
      </div>
    </div>

    {/* Body with Summary */}
    <div className="py-4 space-y-3 max-h-[250px] overflow-y-auto">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200">AI Generated Summary</h4>
        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {article.agentSummary}
        </p>
    </div>

    {/* Footer with Source Link */}
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline">
            <ExternalLink className="w-4 h-4" />
            View Original Source
        </a>
        <p className="text-xs text-gray-400">
            Published: {article.publishedDate.toDate().toLocaleDateString()}
        </p>
    </div>
  </div>
);

// --- Sub-component for the List View ---
const ArticleListView = ({ articles, onArticleSelect, searchTerm, onSearchChange, onClearSearch }: {
  articles: NewsArticle[];
  onArticleSelect: (article: NewsArticle) => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}) => (
  <div>
    <div className="mb-4">
      <GenericSearchBar
        value={searchTerm}
        onChange={onSearchChange}
        onClear={onClearSearch}
        placeholder="Search topics or title"
        className="border-gray-300 focus:ring-[#0d7377]"
        iconClassName="h-4 w-4 text-gray-400"
      />
    </div>
    <div className="space-y-2 max-h-[350px] overflow-y-auto">
      {articles.map((article) => (
        <div key={article.id} className="grid grid-cols-12 items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
          <div className="col-span-1"><div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-gray-500" /></div></div>
          <div className="col-span-2 text-sm font-medium text-gray-600 dark:text-gray-300">{article.topic}</div>
          <div className="col-span-5 text-sm text-gray-500 dark:text-gray-400 truncate">{article.title}</div>
          <div className="col-span-2 text-sm text-center text-gray-500 dark:text-gray-400">{article.readTime}</div>
          <div className="col-span-2 text-center">
            <button onClick={() => onArticleSelect(article)} className="text-sm font-semibold text-[#0d7377] hover:underline">
              Read
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- Main NewsFeed Component (Controller) ---
export default function NewsFeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const clearSearch = () => setSearchTerm('');

  const filteredNews = richNewsFeedData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // The core logic: Conditionally render the correct view based on state
  return (
    <div>
      {selectedArticle ? (
        <ArticleDetailView
          article={selectedArticle}
          onGoBack={() => setSelectedArticle(null)}
        />
      ) : (
        <ArticleListView
          articles={filteredNews}
          onArticleSelect={setSelectedArticle}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onClearSearch={clearSearch}
        />
      )}
    </div>
  );
}