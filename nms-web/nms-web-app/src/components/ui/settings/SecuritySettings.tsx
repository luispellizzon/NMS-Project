// src/components/ui/settings/SecuritySettings.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Key, Shield, Smartphone, AlertCircle } from 'lucide-react';
import { changePassword } from '@/lib/firebase/auth-service';

export default function SecuritySettings() {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user has password provider (email/password sign-in)
  const hasPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === 'password'
  );

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!hasPasswordProvider) {
      setErrorMessage('Password change is only available for email/password accounts.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Current password is incorrect.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('New password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/requires-recent-login') {
        setErrorMessage('Please sign out and sign in again before changing your password.');
      } else {
        setErrorMessage('Failed to update password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = () => {
    setShowPasswordModal(true);
  };

  const handleConfirm2FA = () => {
    setTwoFactorEnabled(true);
    setShowPasswordModal(false);
    setSuccessMessage('Two-factor authentication enabled!');
  };

  const activeSessions = [
    {
      id: '1',
      device: 'Windows PC - Chrome',
      location: 'New York, USA',
      ip: '192.168.1.1',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      id: '2',
      device: 'iPhone 14 - Safari',
      location: 'New York, USA',
      ip: '192.168.1.25',
      lastActive: '2 hours ago',
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground">
              Update your password regularly to keep your account secure
            </p>
          </div>
        </div>

        {!hasPasswordProvider && (
          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Password change is not available for OAuth accounts (Google/Apple sign-in).
              You can manage your password through your OAuth provider.
            </p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              disabled={!hasPasswordProvider}
              className="w-full md:w-1/2 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377] disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              disabled={!hasPasswordProvider}
              className="w-full md:w-1/2 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377] disabled:opacity-50 disabled:cursor-not-allowed"
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              disabled={!hasPasswordProvider}
              className="w-full md:w-1/2 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377] disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

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

          <button
            type="submit"
            disabled={isLoading || !hasPasswordProvider}
            className="flex items-center gap-2 px-6 py-3 bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>

        <div className="flex items-start justify-between p-4 bg-background border border-border rounded-lg">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-muted-foreground mt-1" />
            <div>
              <p className="font-medium text-foreground mb-1">
                Authenticator App
              </p>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app like Google Authenticator or Authy
              </p>
              {twoFactorEnabled && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  ✓ Enabled
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleEnable2FA}
            disabled={twoFactorEnabled}
            className={`px-4 py-2 rounded-lg transition-colors ${
              twoFactorEnabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#0d7377] text-white hover:bg-[#0a5c5f]'
            }`}
          >
            {twoFactorEnabled ? 'Enabled' : 'Enable'}
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4">
            <button
              onClick={() => setTwoFactorEnabled(false)}
              className="text-sm text-red-600 hover:underline"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        )}
      </div>

      {/* Session Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Session Management
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Session Timeout
          </label>
          <select
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="never">Never</option>
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Automatically log out after period of inactivity
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">
            Active Sessions
          </h3>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 bg-background border border-border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{session.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    IP: {session.ip} • Last active {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <button className="text-sm text-red-600 hover:underline">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>

          <button className="mt-4 text-sm text-red-600 hover:underline">
            Sign out of all other sessions
          </button>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Enable Two-Factor Authentication
            </h3>

            <div className="mb-6">
              <div className="p-4 bg-background border border-border rounded-lg mb-4">
                <p className="text-sm text-foreground mb-2">
                  1. Download an authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <p className="text-sm text-foreground mb-2">
                  2. Scan the QR code below with your app
                </p>
                <p className="text-sm text-foreground">
                  3. Enter the 6-digit code from the app to verify
                </p>
              </div>

              {/* Placeholder for QR code */}
              <div className="w-48 h-48 bg-muted border-2 border-dashed border-border rounded-lg mx-auto flex items-center justify-center mb-4">
                <p className="text-muted-foreground">QR Code</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377] text-center text-2xl tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConfirm2FA}
                className="flex-1 px-4 py-2 bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors"
              >
                Verify & Enable
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
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