// src/components/ui/settings/AccountSettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import {
  saveAccountPreferences,
  getAccountPreferences
} from '@/lib/firebase/firestore-service';
import { deleteUserAccount } from '@/lib/firebase/auth-service';
import { useRouter } from 'next/navigation';

export default function AccountSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const prefs = await getAccountPreferences(user.uid);
        if (prefs) {
          setLanguage(prefs.language || 'en');
          setTimezone(prefs.timezone || 'America/New_York');
          setDateFormat(prefs.dateFormat || 'MM/DD/YYYY');
          if (prefs.privacy) {
            setProfileVisibility(prefs.privacy.profileVisibility ?? true);
            setActivityStatus(prefs.privacy.activityStatus ?? true);
            setDataSharing(prefs.privacy.dataSharing ?? false);
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsFetching(false);
      }
    };

    loadPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await saveAccountPreferences(user.uid, {
        language,
        timezone,
        dateFormat,
        privacy: {
          profileVisibility,
          activityStatus,
          dataSharing,
        },
      });

      setSuccessMessage('Account settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Check if user signed in with email/password or OAuth
      const hasPasswordProvider = user.providerData.some(
        (provider) => provider.providerId === 'password'
      );

      if (hasPasswordProvider) {
        // Require password for email/password users
        if (!deletePassword) {
          setErrorMessage('Please enter your password to confirm deletion.');
          setIsLoading(false);
          return;
        }
        await deleteUserAccount(deletePassword);
      } else {
        // OAuth users don't need password
        await deleteUserAccount();
      }

      // Redirect to sign-in page after deletion
      router.push('/signin');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else if (error.code === 'auth/requires-recent-login') {
        setErrorMessage('Please sign out and sign in again before deleting your account.');
      } else {
        setErrorMessage('Failed to delete account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          General Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-foreground mb-2">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-foreground mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
            </select>
          </div>

          <div>
            <label htmlFor="date-format" className="block text-sm font-medium text-foreground mb-2">
              Date Format
            </label>
            <select
              id="date-format"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Privacy Settings
        </h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Profile Visibility</p>
              <p className="text-sm text-muted-foreground">
                Allow other doctors to see your profile
              </p>
            </div>
            <input
              type="checkbox"
              checked={profileVisibility}
              onChange={(e) => setProfileVisibility(e.target.checked)}
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Activity Status</p>
              <p className="text-sm text-muted-foreground">
                Show when you're online
              </p>
            </div>
            <input
              type="checkbox"
              checked={activityStatus}
              onChange={(e) => setActivityStatus(e.target.checked)}
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Data Sharing</p>
              <p className="text-sm text-muted-foreground">
                Share anonymized data for research purposes
              </p>
            </div>
            <input
              type="checkbox"
              checked={dataSharing}
              onChange={(e) => setDataSharing(e.target.checked)}
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Connected Accounts
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">G</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Google</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'Not connected'}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors">
              Disconnect
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold"></span>
              </div>
              <div>
                <p className="font-medium text-foreground">Apple</p>
                <p className="text-sm text-muted-foreground">Not connected</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors">
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>

        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Delete Account
            </p>
            <p className="text-sm text-red-700 mt-1">
              Once you delete your account, there is no going back. All your data will be
              permanently removed.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Delete Account?
                </h3>
                <p className="text-muted-foreground mt-2">
                  This action cannot be undone. All your data, including patient records and
                  assessments, will be permanently deleted.
                </p>
              </div>
            </div>

            {/* Password field for email/password users */}
            {user?.providerData.some((p) => p.providerId === 'password') && (
              <div className="mt-4">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Enter your password"
                />
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">{errorMessage}</p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setErrorMessage('');
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}