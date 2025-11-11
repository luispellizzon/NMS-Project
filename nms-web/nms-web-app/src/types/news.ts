// src/types/news.ts

export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    content: string;
    author: string;
    publishedAt: string; // This will be an ISO string, e.g., "2025-11-06T10:00:00Z"
    category: string;
    tags: string[];
    imageUrl: string;
    source: string;
    readTime: number; // The API provides this as a number
    createdAt: string;  
  }