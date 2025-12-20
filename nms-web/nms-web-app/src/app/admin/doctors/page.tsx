// src/app/admin/doctors/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getAllDoctors, deleteDoctorSoft, createDoctorWithAuth } from '@/lib/firebase/services/admin-service';
import { DoctorWithStats } from '@/types/admin';
import Modal from '@/components/ui/common/Modal';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithStats | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      const data = await getAllDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (doctor: DoctorWithStats) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDoctor) return;

    try {
      await deleteDoctorSoft(selectedDoctor.id);
      setDoctors(doctors.filter((d) => d.id !== selectedDoctor.id));
      setShowDeleteModal(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error deleting doctor:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground">Manage healthcare professionals</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Specialty</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Patients</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  {searchQuery ? 'No doctors found matching your search' : 'No doctors registered yet'}
                </td>
              </tr>
            ) : (
              filteredDoctors.map((doctor, index) => (
                <tr key={doctor.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{doctor.fullName}</div>
                    <div className="text-sm text-muted-foreground">{doctor.hospital || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{doctor.email}</td>
                  <td className="px-6 py-4 text-sm">{doctor.specialty || '-'}</td>
                  <td className="px-6 py-4 text-sm">{doctor.patientCount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doctor.isActive !== false
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {doctor.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === doctor.id ? null : doctor.id)}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {actionMenuOpen === doctor.id && (
                        <>
                          <div
                            className="fixed inset-0 z-[5]"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className={`absolute right-0 w-48 bg-popover border rounded-lg shadow-lg z-10 ${
                            index >= filteredDoctors.length - 2 ? 'bottom-full mb-2' : 'mt-2'
                          }`}>
                          <Link
                            href={`/admin/doctors/${doctor.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setActionMenuOpen(null)}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                          <Link
                            href={`/admin/doctors/${doctor.id}?edit=true`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setActionMenuOpen(null)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(doctor)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-muted w-full text-left"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Doctor Modal */}
      <AddDoctorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchDoctors();
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Doctor"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete <strong>{selectedDoctor?.fullName}</strong>?</p>
          <p className="text-sm text-muted-foreground">
            This will deactivate the doctor account. Their data will be preserved but they won&apos;t be able to log in.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AddDoctorModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialty: '',
    hospital: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createDoctorWithAuth({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'doctor',
      });
      setFormData({ fullName: '', email: '', password: '', specialty: '', hospital: '' });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Doctor">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Specialty (Optional)</label>
          <input
            type="text"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hospital (Optional)</label>
          <input
            type="text"
            value={formData.hospital}
            onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
