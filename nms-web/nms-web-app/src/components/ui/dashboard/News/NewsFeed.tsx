// src/components/ui/dashboard/News/NewsFeed.tsx
'use client';

import { useState } from 'react';
import { richNewsFeedData, NewsArticle } from '@/lib/mock_data';
import { BookOpen, ArrowLeft, ExternalLink } from 'lucide-react';
import GenericSearchBar from '../../common/SearchBar';

const ArticleDetailView = ({ article, onGoBack }: { article: NewsArticle; onGoBack: () => void; }) => (
    <div>
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <button onClick={onGoBack} className="p-2 rounded-full hover:bg-accent" aria-label="Go back to news list">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h3 className="font-bold text-card-foreground">{article.title}</h3>
          <p className="text-sm text-primary font-semibold mt-1">{article.topic}</p>
        </div>
      </div>
      <div className="py-4 space-y-3 max-h-[250px] overflow-y-auto">
          <h4 className="font-semibold text-muted-foreground">AI Generated Summary</h4>
          <p className="text-base leading-relaxed text-secondary-foreground/80 whitespace-pre-wrap">
              {article.agentSummary}
          </p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ExternalLink className="w-4 h-4" />
              View Original Source
          </a>
          <p className="text-xs text-muted-foreground">
              Published: {article.publishedDate.toDate().toLocaleDateString()}
          </p>
      </div>
    </div>
);

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
        className="border-border focus:ring-primary"
        iconClassName="h-4 w-4 text-muted-foreground"
      />
    </div>
    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
      {articles.map((article) => (
        <div 
          key={article.id} 
          className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0 md:grid md:grid-cols-12"
        >
          {/* Left side container for Icon and Text */}
          <div className="flex items-center gap-3 min-w-0 md:col-span-8">
            <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center md:col-span-1">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            
            {/* Text container: Allows text to truncate correctly */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
              <p className="text-sm text-primary md:hidden">{article.topic}</p> 
              <p className="hidden md:block text-sm text-muted-foreground md:col-span-2">{article.topic}</p>
            </div>
          </div>
          
          {/* Right side container for Read Time and Button */}
          <div className="flex items-center gap-4 flex-shrink-0 md:col-span-4 md:justify-end">
            <p className="hidden sm:block text-sm text-center text-muted-foreground md:col-span-2">{article.readTime}</p>
            <div className="md:col-span-2 text-center">
              <button onClick={() => onArticleSelect(article)} className="text-sm font-semibold text-primary hover:underline flex-shrink-0">
                Read
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);


// --- Main NewsFeed Component (Controller - No changes needed here) ---
export default function NewsFeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const clearSearch = () => setSearchTerm('');

  const filteredNews = richNewsFeedData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

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