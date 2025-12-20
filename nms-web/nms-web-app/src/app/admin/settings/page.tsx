// src/app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminProfile, updateAdminProfile } from '@/lib/firebase/services/admin-service';
import { Admin } from '@/types/admin';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
  });

  useEffect(() => {
    async function fetchAdmin() {
      if (!user) return;
      try {
        const adminData = await getAdminProfile(user.uid);
        if (adminData) {
          setAdmin(adminData);
          setFormData({ fullName: adminData.fullName });
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAdmin();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      await updateAdminProfile(user.uid, formData);
      setAdmin(admin ? { ...admin, ...formData } : null);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground">Manage your administrator profile</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            Profile Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Email address cannot be changed
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            Account Info
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <p className="font-medium flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                  Administrator
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Account ID</label>
              <p className="font-mono text-sm truncate">{user?.uid}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Member Since</label>
              <p>{admin?.createdAt.toLocaleDateString() || 'Unknown'}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <p>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  Active
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
