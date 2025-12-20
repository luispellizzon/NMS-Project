// src/app/admin/support/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { HeadphonesIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getAllSupportRequests, getSupportStats, updateSupportRequestStatus } from '@/lib/firebase/services/support-service';
import { SupportRequest, SupportStats, SupportRequestStatus } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/common/Modal';

export default function SupportPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SupportRequestStatus | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  async function fetchData() {
    setLoading(true);
    try {
      const [requestsData, statsData] = await Promise.all([
        getAllSupportRequests(filterStatus || undefined),
        getSupportStats(),
      ]);
      setRequests(requestsData.requests);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching support data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: SupportRequestStatus) => {
    try {
      await updateSupportRequestStatus(requestId, newStatus, user?.uid);
      setRequests(requests.map((r) =>
        r.id === requestId ? { ...r, status: newStatus } : r
      ));
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      // Refresh stats
      const newStats = await getSupportStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleViewDetails = (request: SupportRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: SupportRequestStatus) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support Requests</h1>
        <p className="text-muted-foreground">Manage support tickets from mobile app users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Open"
          value={stats?.open || 0}
          icon={AlertCircle}
          color="bg-red-500"
          onClick={() => setFilterStatus(filterStatus === 'open' ? null : 'open')}
          active={filterStatus === 'open'}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgress || 0}
          icon={Clock}
          color="bg-yellow-500"
          onClick={() => setFilterStatus(filterStatus === 'in_progress' ? null : 'in_progress')}
          active={filterStatus === 'in_progress'}
        />
        <StatCard
          title="Resolved"
          value={stats?.resolved || 0}
          icon={CheckCircle}
          color="bg-green-500"
          onClick={() => setFilterStatus(filterStatus === 'resolved' ? null : 'resolved')}
          active={filterStatus === 'resolved'}
        />
        <StatCard
          title="Total"
          value={stats?.total || 0}
          icon={HeadphonesIcon}
          color="bg-blue-500"
          onClick={() => setFilterStatus(null)}
          active={filterStatus === null}
        />
      </div>

      {/* Requests Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Subject</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Priority</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  {filterStatus ? `No ${filterStatus.replace('_', ' ')} requests` : 'No support requests yet'}
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="font-medium text-left hover:text-primary"
                    >
                      {request.subject || 'No subject'}
                    </button>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {request.message?.slice(0, 50)}...
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {request.patientName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {request.createdAt instanceof Date
                      ? request.createdAt.toLocaleDateString()
                      : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id, e.target.value as SupportRequestStatus)}
                      className="text-sm border rounded-lg px-2 py-1 bg-background"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Support Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Subject</label>
              <p className="font-medium">{selectedRequest.subject || 'No subject'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">From</label>
              <p>{selectedRequest.patientName || 'Unknown'}</p>
              {selectedRequest.patientEmail && (
                <p className="text-sm text-muted-foreground">{selectedRequest.patientEmail}</p>
              )}
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Priority</label>
                <p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Message</label>
              <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequest.message}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Update Status</label>
              <select
                value={selectedRequest.status}
                onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value as SupportRequestStatus)}
                className="w-full mt-1 border rounded-lg px-3 py-2 bg-background"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  active,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-card rounded-lg border p-4 text-left transition-all ${
        active ? 'ring-2 ring-primary' : 'hover:border-primary/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </button>
  );
}
