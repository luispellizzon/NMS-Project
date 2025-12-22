'use client';

import { NewsArticle } from '@/types/news';
import { ArrowLeft } from 'lucide-react';

interface ArticleDetailViewProps {
  article: NewsArticle;
  onGoBack: () => void;
}

export default function ArticleDetailView({ article, onGoBack }: ArticleDetailViewProps) {
  return (
    <div>
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <button
          onClick={onGoBack}
          className="p-2 rounded-full hover:bg-accent"
          aria-label="Go back to news list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-card-foreground">{article.title}</h3>
          <p className="text-sm text-primary font-semibold mt-1 capitalize">{article.category}</p>
        </div>
      </div>
      <div className="py-4 space-y-3 max-h-[185px] overflow-y-auto pr-2">
        <h4 className="font-semibold text-muted-foreground">AI Generated Summary</h4>
        <p className="text-base leading-relaxed text-secondary-foreground/80 whitespace-pre-wrap">
          {article.summary}
        </p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm font-medium text-muted-foreground">
          <a href={article.source} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Source: {new URL(article.source).hostname}
          </a>
        </p>
        <p className="text-xs text-muted-foreground">
          Published: {new Date(article.publishedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}