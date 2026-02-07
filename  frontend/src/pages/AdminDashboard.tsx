import axios from 'axios';
import {
  AlertCircle,
  Ban,
  CheckCircle,
  CreditCard,
  Edit2,
  Key,
  Loader2,
  LogOut,
  Package as PackageIcon,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isSuspended: boolean;
  totalPdfConversions: number;
  createdAt: string;
}

interface UserFormData {
  email: string;
  name: string;
  password: string;
}

export default function AdminDashboard() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch {
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        name: user.name,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({ email: '', name: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ email: '', name: '', password: '' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        const updateData: Partial<UserFormData> = {
          email: formData.email,
          name: formData.name,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await axios.put(`${API_URL}/users/${editingUser._id}`, updateData);
      } else {
        await axios.post(`${API_URL}/users`, formData);
      }
      handleCloseModal();
      fetchUsers();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Operation failed');
      } else {
        setError('Operation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      fetchUsers();
    } catch {
      setError('Failed to delete user');
    }
  };

  const handleToggleSuspend = async (userId: string) => {
    try {
      await axios.put(`${API_URL}/users/${userId}/suspend`);
      fetchUsers();
    } catch {
      setError('Failed to update user status');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex md:flex-row flex-col gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome, {currentUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/admin/packages"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center gap-2 transition-all text-sm font-medium"
            >
              <PackageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Packages</span>
            </Link>
            <Link
              to="/admin/subscriptions"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center gap-2 transition-all text-sm font-medium"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Subscriptions</span>
            </Link>
            <Link
              to="/admin/settings"
              className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 flex items-center gap-2 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            Users
            <span className="ml-2 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
              {users.length}
            </span>
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No users found</p>
            <p className="text-gray-500 text-sm mt-2">Click "Add User" to create one</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Conversions</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Created</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-white font-medium">{user.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-400">{user.email}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded bg-white/5 text-purple-400 text-sm font-mono">
                          {user.totalPdfConversions || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {user.isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                            <Ban className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-500 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(user._id)}
                            className={`p-2 rounded-lg transition-all ${user.isSuspended
                                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                                : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                              }`}
                            title={user.isSuspended ? 'Activate user' : 'Suspend user'}
                          >
                            {user.isSuspended ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop fade-in">
          <div className="glass-card w-full max-w-md p-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {editingUser ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {editingUser ? 'Edit User' : 'Add User'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="modal-email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="modal-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="modal-password" className="block text-sm font-medium text-gray-300">
                  Password {editingUser && <span className="text-gray-500">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="modal-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                    required={!editingUser}
                    minLength={6}
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary px-4 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingUser ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
