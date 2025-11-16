// src/components/ui/settings/NotificationSettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import {
  saveNotificationSettings,
  getNotificationSettings
} from '@/lib/firebase/firestore-service';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState({
    newPatient: true,
    riskAlert: true,
    weeklyReport: false,
    systemUpdates: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    newPatient: true,
    riskAlert: true,
    messages: false,
  });

  const [inAppNotifications, setInAppNotifications] = useState({
    newPatient: true,
    riskAlert: true,
    messages: true,
    mentions: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing notification settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const settings = await getNotificationSettings(user.uid);
        if (settings) {
          setEmailNotifications(settings.email || {
            newPatient: true,
            riskAlert: true,
            weeklyReport: false,
            systemUpdates: true,
          });
          setPushNotifications(settings.push || {
            newPatient: true,
            riskAlert: true,
            messages: false,
          });
          setInAppNotifications(settings.inApp || {
            newPatient: true,
            riskAlert: true,
            messages: true,
            mentions: true,
          });
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsFetching(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await saveNotificationSettings(user.uid, {
        email: emailNotifications,
        push: pushNotifications,
        inApp: inAppNotifications,
      });

      setSuccessMessage('Notification preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setErrorMessage('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Email Notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage email notification preferences
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">New Patient Assigned</p>
              <p className="text-sm text-muted-foreground">
                Get notified when a new patient is assigned to you
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.newPatient}
              onChange={(e) =>
                setEmailNotifications({
                  ...emailNotifications,
                  newPatient: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">High Risk Alerts</p>
              <p className="text-sm text-muted-foreground">
                Receive alerts for patients with high dementia risk scores
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.riskAlert}
              onChange={(e) =>
                setEmailNotifications({
                  ...emailNotifications,
                  riskAlert: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">
                Summary of patient assessments and activities
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.weeklyReport}
              onChange={(e) =>
                setEmailNotifications({
                  ...emailNotifications,
                  weeklyReport: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">System Updates</p>
              <p className="text-sm text-muted-foreground">
                Important updates about the NMS platform
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications.systemUpdates}
              onChange={(e) =>
                setEmailNotifications({
                  ...emailNotifications,
                  systemUpdates: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Push Notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Browser and mobile push notifications
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Push notifications require browser permissions. Make sure to allow notifications
            when prompted.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">New Patient Assigned</p>
              <p className="text-sm text-muted-foreground">
                Instant notification when assigned
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications.newPatient}
              onChange={(e) =>
                setPushNotifications({
                  ...pushNotifications,
                  newPatient: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">High Risk Alerts</p>
              <p className="text-sm text-muted-foreground">
                Critical risk score notifications
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications.riskAlert}
              onChange={(e) =>
                setPushNotifications({
                  ...pushNotifications,
                  riskAlert: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Messages</p>
              <p className="text-sm text-muted-foreground">
                New messages from patients or colleagues
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications.messages}
              onChange={(e) =>
                setPushNotifications({
                  ...pushNotifications,
                  messages: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              In-App Notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Notifications within the application
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">New Patient Assigned</p>
              <p className="text-sm text-muted-foreground">
                Show notification banner
              </p>
            </div>
            <input
              type="checkbox"
              checked={inAppNotifications.newPatient}
              onChange={(e) =>
                setInAppNotifications({
                  ...inAppNotifications,
                  newPatient: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">High Risk Alerts</p>
              <p className="text-sm text-muted-foreground">
                Display risk alerts in dashboard
              </p>
            </div>
            <input
              type="checkbox"
              checked={inAppNotifications.riskAlert}
              onChange={(e) =>
                setInAppNotifications({
                  ...inAppNotifications,
                  riskAlert: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Messages</p>
              <p className="text-sm text-muted-foreground">
                In-app message notifications
              </p>
            </div>
            <input
              type="checkbox"
              checked={inAppNotifications.messages}
              onChange={(e) =>
                setInAppNotifications({
                  ...inAppNotifications,
                  messages: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Mentions</p>
              <p className="text-sm text-muted-foreground">
                When someone mentions you
              </p>
            </div>
            <input
              type="checkbox"
              checked={inAppNotifications.mentions}
              onChange={(e) =>
                setInAppNotifications({
                  ...inAppNotifications,
                  mentions: e.target.checked,
                })
              }
              className="w-5 h-5 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
            />
          </label>
        </div>
      </div>

      {/* Success/Error Messages and Save Button */}
      <div className="space-y-4">
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

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}