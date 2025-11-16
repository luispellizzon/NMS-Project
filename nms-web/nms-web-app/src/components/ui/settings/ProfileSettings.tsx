// src/components/ui/settings/ProfileSettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Save, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { updateUserProfile } from '@/lib/firebase/auth-service';
import { updateDoctorProfile, getDoctorProfile } from '@/lib/firebase/firestore-service';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    hospital: '',
    bio: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const profile = await getDoctorProfile(user.uid);
        if (profile) {
          setFormData({
            fullName: profile.fullName || user.displayName || '',
            email: profile.email || user.email || '',
            phone: (profile as any).phone || '',
            specialty: (profile as any).specialty || '',
            licenseNumber: (profile as any).licenseNumber || '',
            hospital: (profile as any).hospital || '',
            bio: (profile as any).bio || '',
          });
        } else {
          // Use Firebase Auth data as fallback
          setFormData({
            fullName: user.displayName || '',
            email: user.email || '',
            phone: '',
            specialty: '',
            licenseNumber: '',
            hospital: '',
            bio: '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsFetching(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Update Firebase Auth profile (display name)
      if (formData.fullName !== user.displayName) {
        await updateUserProfile(formData.fullName);
      }

      // Update Firestore doctor profile
      await updateDoctorProfile(user.uid, {
        fullName: formData.fullName,
        phone: formData.phone,
        specialty: formData.specialty,
        licenseNumber: formData.licenseNumber,
        hospital: formData.hospital,
        bio: formData.bio,
      });

      setSuccessMessage('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = () => {
    // TODO: Implement photo upload with Firebase Storage
    alert('Photo upload feature will be implemented with Firebase Storage');
  };

  if (isFetching) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Profile Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              src={user?.photoURL || '/images/logo.png'}
              alt="Profile"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
            <button
              type="button"
              onClick={handlePhotoChange}
              className="absolute bottom-0 right-0 p-2 bg-[#0d7377] text-white rounded-full hover:bg-[#0a5c5f] transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Profile Photo</h3>
            <p className="text-sm text-muted-foreground mb-2">
              JPG, PNG or GIF. Max size 2MB.
            </p>
            <button
              type="button"
              onClick={handlePhotoChange}
              className="text-sm text-[#0d7377] hover:underline"
            >
              Upload new photo
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
              title="Email cannot be changed here"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Contact support to change email
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Specialty
            </label>
            <select
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            >
              <option value="">Select specialty</option>
              <option value="neurology">Neurology</option>
              <option value="psychiatry">Psychiatry</option>
              <option value="geriatrics">Geriatrics</option>
              <option value="general-practice">General Practice</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Medical License Number
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) =>
                setFormData({ ...formData, licenseNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
              placeholder="e.g., MD123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hospital/Clinic
            </label>
            <input
              type="text"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
              placeholder="e.g., City General Hospital"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Professional Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            placeholder="Tell us about your experience and expertise..."
          />
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}