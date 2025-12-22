// src/app/admin/admins/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { getAllAdmins, createAdminWithAuth, deleteAdminSoft, updateAdminProfile } from '@/lib/firebase/services/admin-service';
import { Admin } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/common/Modal';

export default function AdminsPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAdmins = admins.filter((admin) =>
    admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (admin: Admin) => {
    if (admin.id === user?.uid) {
      alert('You cannot delete your own account');
      return;
    }
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
    setActionMenuOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;

    try {
      await deleteAdminSoft(selectedAdmin.id);
      setAdmins(admins.filter((a) => a.id !== selectedAdmin.id));
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error('Error deleting admin:', error);
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
          <h1 className="text-2xl font-bold text-foreground">Administrators</h1>
          <p className="text-muted-foreground">Manage system administrators</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Admin
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search administrators..."
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
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  {searchQuery ? 'No administrators found matching your search' : 'No administrators yet'}
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin, index) => (
                <tr key={admin.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{admin.fullName}</span>
                      {admin.id === user?.uid && (
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{admin.email}</td>
                  <td className="px-6 py-4 text-sm">
                    {admin.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      admin.isActive !== false
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {admin.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === admin.id ? null : admin.id)}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {actionMenuOpen === admin.id && (
                        <>
                          <div
                            className="fixed inset-0 z-[5]"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className={`absolute right-0 w-48 bg-popover border rounded-lg shadow-lg z-10 ${
                            index >= filteredAdmins.length - 2 ? 'bottom-full mb-2' : 'mt-2'
                          }`}>
                          <button
                            onClick={() => handleEditClick(admin)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted w-full text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(admin)}
                            disabled={admin.id === user?.uid}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-muted w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchAdmins();
        }}
      />

      {/* Edit Admin Modal */}
      {selectedAdmin && (
        <EditAdminModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
          }}
          admin={selectedAdmin}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
            fetchAdmins();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Administrator"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete <strong>{selectedAdmin?.fullName}</strong>?</p>
          <p className="text-sm text-muted-foreground">
            This will deactivate the administrator account.
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

function AddAdminModal({
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createAdminWithAuth(formData);
      setFormData({ fullName: '', email: '', password: '' });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Administrator">
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
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditAdminModal({
  isOpen,
  onClose,
  admin,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: admin.fullName,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateAdminProfile(admin.id, formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Administrator">
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
            value={admin.email}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-muted text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
