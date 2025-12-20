// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Users, UserCog, FileText, MessageSquare, HeadphonesIcon, TrendingUp } from 'lucide-react';
import { getAdminDashboardStats } from '@/lib/firebase/services/admin-service';
import { getRecentFeedback } from '@/lib/firebase/services/feedback-service';
import { getRecentOpenRequests } from '@/lib/firebase/services/support-service';
import { AdminDashboardStats, Feedback, SupportRequest } from '@/types/admin';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [recentSupport, setRecentSupport] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, feedbackData, supportData] = await Promise.all([
          getAdminDashboardStats(),
          getRecentFeedback(5),
          getRecentOpenRequests(5),
        ]);
        setStats(statsData);
        setRecentFeedback(feedbackData);
        setRecentSupport(supportData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and quick statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Doctors"
          value={stats?.totalDoctors || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={UserCog}
          color="bg-green-500"
        />
        <StatCard
          title="Assessments"
          value={stats?.totalAssessments || 0}
          icon={FileText}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg Rating"
          value={stats?.averageRating?.toFixed(1) || '0.0'}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle={`${stats?.feedbackCount || 0} reviews`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Admins"
          value={stats?.totalAdmins || 0}
          icon={UserCog}
          color="bg-indigo-500"
        />
        <StatCard
          title="Open Support"
          value={stats?.openSupportRequests || 0}
          icon={HeadphonesIcon}
          color="bg-red-500"
        />
        <StatCard
          title="New Patients (Month)"
          value={stats?.newPatientsThisMonth || 0}
          icon={TrendingUp}
          color="bg-teal-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Feedback */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              Recent Feedback
            </h2>
            <a href="/admin/feedback" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
          {recentFeedback.length === 0 ? (
            <p className="text-muted-foreground text-sm">No feedback yet</p>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {feedback.patientName || 'Anonymous'}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {feedback.review || 'No comment'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Support Requests */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HeadphonesIcon className="h-5 w-5 text-muted-foreground" />
              Open Support Requests
            </h2>
            <a href="/admin/support" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
          {recentSupport.length === 0 ? (
            <p className="text-muted-foreground text-sm">No open requests</p>
          ) : (
            <div className="space-y-3">
              {recentSupport.map((request) => (
                <div key={request.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {request.subject || 'No subject'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        request.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.patientName || 'Unknown user'} - {request.message?.slice(0, 50)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
