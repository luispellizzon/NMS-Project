'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, Variants } from 'framer-motion';
import { NewsArticle } from '@/types/news';
import { fetchArticles, generateArticleWithStream } from '@/lib/services/newsService';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import GenericSearchBar from '../../common/SearchBar';
import ArticleDetailView from './ArticleDetailView';
import ArticleListView from './ArticleListView';
import NewsHeader, { NewsMode } from './NewsHeader';
import AgentArtifactsAccordion, { AgentArtifact } from './AgentArtifactsAccordion';
import GenerationCompleteView from './GenerationCompleteView';

interface NewsFeedProps {
  variants?: Variants;
}

export default function NewsFeed({ variants }: NewsFeedProps) {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [newsMode, setNewsMode] = useState<NewsMode>(NewsMode.FilterExisting);
  const [artifacts, setArtifacts] = useState<AgentArtifact[]>([]);
  const [generatedArticle, setGeneratedArticle] = useState<NewsArticle | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArticles();
      setAllArticles(data);
    } catch (err) {
      setError("Could not load news feed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleSearchSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm) return;

    if (newsMode === NewsMode.QueryNewReport) {
      setIsGenerating(true);
      setGenerationComplete(false);
      setArtifacts([]);
      setError(null);
      setGeneratedArticle(null);
      const currentSearchTerm = searchTerm;

      try {
        // Use the streaming function with WebSocket
        await generateArticleWithStream(
          { topic: currentSearchTerm, save_to_firebase: true },
          (artifact) => {
            setArtifacts((prev) => {
              // Update existing artifact or add new one
              const existingIndex = prev.findIndex((a) => a.id === artifact.id);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = artifact;
                return updated;
              }
              return [...prev, artifact];
            });
          }
        );

        // Refresh articles after generation and wait for it to complete
        const refreshedArticles = await fetchArticles();
        setAllArticles(refreshedArticles);
        setIsGenerating(false);

        // Find the generated article
        const newArticle = refreshedArticles.find((a) =>
          a.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
          a.category.toLowerCase().includes(currentSearchTerm.toLowerCase())
        );

        if (newArticle) {
          setGeneratedArticle(newArticle);
        } else {
          // If we can't find by search term, use the most recent article
          if (refreshedArticles.length > 0) {
            setGeneratedArticle(refreshedArticles[0]);
          }
        }

        // Show completion screen
        setGenerationComplete(true);
      } catch (err) {
        setError("Failed to generate the new report. Please try again.");
        setIsGenerating(false);
        setGenerationComplete(false);
      }
    }
  };

  const handleViewReport = () => {
    if (generatedArticle) {
      setSelectedArticle(generatedArticle);
      setGenerationComplete(false);
    }
  };

  const clearSearch = () => setSearchTerm('');

  const filteredNews = allArticles.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <motion.div
        variants={variants}
        className="bg-card text-card-foreground rounded-lg border shadow-sm p-6"
      >
        <div className="flex items-center justify-center h-[400px]">
          <LoaderCircle className="w-8 h-8 animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error && !isGenerating) {
    return (
      <motion.div
        variants={variants}
        className="bg-card text-card-foreground rounded-lg border shadow-sm p-6"
      >
        <div className="flex flex-col items-center justify-center h-[400px] text-destructive">
          <AlertTriangle className="w-8 h-8" />
          <p className="mt-2">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 min-h-[430px]"
    >
      <NewsHeader newsMode={newsMode} onModeChange={setNewsMode} />

      {isGenerating ? (
        <AgentArtifactsAccordion topic={searchTerm} artifacts={artifacts} />
      ) : generationComplete ? (
        <GenerationCompleteView topic={searchTerm} onViewReport={handleViewReport} />
      ) : selectedArticle ? (
        <ArticleDetailView article={selectedArticle} onGoBack={() => setSelectedArticle(null)} />
      ) : (
        <>
          <div className="mb-4">
            <GenericSearchBar
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onSubmit={handleSearchSubmit}
              onClear={clearSearch}
              placeholder={
                newsMode === NewsMode.FilterExisting
                  ? "Filter by topic, title, or category..."
                  : "Describe the research report you need..."
              }
            />
          </div>
          <ArticleListView
            articles={filteredNews}
            onArticleSelect={setSelectedArticle}
            onRefresh={loadArticles}
          />
        </>
      )}
    </motion.div>
  );
}