'use client';

import { NewsArticle } from '@/lib/mock_data';
import { X, ExternalLink } from 'lucide-react';

interface NewsModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export default function NewsModal({ article, onClose }: NewsModalProps) {
  if (!article) return null;

  return (
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
    >
      {/* Modal Panel */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {article.title}
            </h3>
            <p className="text-sm text-brand-primary font-semibold mt-1">{article.topic}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200">AI Generated Summary</h4>
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {article.agentSummary}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View Original Source
          </a>
           <p className="text-xs text-gray-400">
            Published: {article.publishedDate.toDate().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}