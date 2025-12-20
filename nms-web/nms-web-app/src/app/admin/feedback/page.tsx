// src/app/admin/feedback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { getAllFeedback, getFeedbackStats } from '@/lib/firebase/services/feedback-service';
import { Feedback, FeedbackStats } from '@/types/admin';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [feedbackData, statsData] = await Promise.all([
          getAllFeedback({ limit: 100 }),
          getFeedbackStats(),
        ]);
        setFeedback(feedbackData.feedback);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredFeedback = filterRating
    ? feedback.filter((f) => f.rating === filterRating)
    : feedback;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feedback & Reviews</h1>
        <p className="text-muted-foreground">User ratings and reviews from the mobile app</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">{stats?.averageRating.toFixed(1) || '0.0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {stats && stats.total > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Rating Distribution</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <button
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    className={`flex items-center gap-1 min-w-16 text-sm ${
                      filterRating === rating ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {rating} <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  </button>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-12 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Feedback List */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {filterRating ? `${filterRating}-Star Reviews` : 'All Reviews'}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredFeedback.length})
            </span>
          </h2>
        </div>
        {filteredFeedback.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {filterRating ? `No ${filterRating}-star reviews yet` : 'No feedback received yet'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredFeedback.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.patientName || 'Anonymous User'}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < item.rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {item.patientEmail && (
                      <p className="text-sm text-muted-foreground mb-2">{item.patientEmail}</p>
                    )}
                    {item.review ? (
                      <p className="text-foreground">{item.review}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No comment provided</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    <p>{item.timestamp instanceof Date ? item.timestamp.toLocaleDateString() : 'Unknown date'}</p>
                    {item.version && <p className="text-xs">v{item.version}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
