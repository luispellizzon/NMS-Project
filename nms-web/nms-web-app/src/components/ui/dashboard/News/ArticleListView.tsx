'use client';

import { useState } from 'react';
import { NewsArticle } from '@/types/news';
import { BookOpen, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ArticleListViewProps {
  articles: NewsArticle[];
  onArticleSelect: (article: NewsArticle) => void;
  onRefresh: () => void;
}

const ARTICLES_PER_PAGE = 3;

export default function ArticleListView({ articles, onArticleSelect, onRefresh }: ArticleListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = articles.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when articles change
  useState(() => {
    setCurrentPage(1);
  });

  return (
    <div>
      <div className="space-y-2 pr-2">
        {currentArticles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No articles found</p>
          </div>
        ) : (
          currentArticles.map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0 hover:bg-accent/50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                  <p className="text-xs text-muted-foreground capitalize line-clamp-1">{article.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <button
                  onClick={() => onArticleSelect(article)}
                  className="text-sm font-semibold text-primary hover:underline flex-shrink-0"
                >
                  Read
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[32px] h-8 px-2 text-sm rounded transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-accent text-muted-foreground'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Just refresh button if only one page */}
      {totalPages <= 1 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}