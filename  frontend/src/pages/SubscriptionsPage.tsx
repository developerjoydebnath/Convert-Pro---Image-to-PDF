import axios from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CreditCard,
  Edit2,
  Loader2,
  Package as PackageIcon,
  Plus,
  Search,
  Trash2,
  User as UserIcon,
  X
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

interface Subscription {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  packageId: {
    _id: string;
    name: string;
    price: number;
  };
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  isExpired: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Package {
  _id: string;
  name: string;
  duration: number;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  
  const [formData, setFormData] = useState({
    userId: '',
    packageId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [subsRes, usersRes, pkgsRes] = await Promise.all([
        axios.get(`${API_URL}/subscriptions`),
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/packages/all`),
      ]);
      setSubscriptions(subsRes.data);
      setUsers(usersRes.data);
      setPackages(pkgsRes.data.filter((p: any) => p.isActive));
    } catch {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (sub?: Subscription) => {
    if (sub) {
      setEditingSubscription(sub);
      setFormData({
        userId: sub.userId._id,
        packageId: sub.packageId._id,
        startDate: new Date(sub.startDate).toISOString().split('T')[0],
        endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : '',
        isActive: sub.isActive,
      });
    } else {
      setEditingSubscription(null);
      setFormData({
        userId: '',
        packageId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        endDate: formData.endDate || null,
      };

      if (editingSubscription) {
        await axios.put(`${API_URL}/subscriptions/${editingSubscription._id}`, payload);
      } else {
        await axios.post(`${API_URL}/subscriptions`, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await axios.delete(`${API_URL}/subscriptions/${id}`);
      fetchData();
    } catch {
      setError('Failed to delete subscription');
    }
  };

  const filteredSubs = subscriptions.filter(s => 
    s.userId?.name.toLowerCase().includes(search.toLowerCase()) ||
    s.userId?.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">User Subscriptions</h1>
              <p className="text-sm text-gray-400">Manage manually assigned subscriptions</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-fit px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subscription
          </button>
        </div>

        {/* Search & Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div className="glass-card flex items-center justify-center gap-3 px-6 py-4">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <div className="text-center">
              <div className="text-base font-bold whitespace-nowrap">Total Active: {subscriptions.length}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">User</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Package</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Duration</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubs.map((sub) => (
                    <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold border border-white/5">
                            {sub.userId?.name[0]}
                          </div>
                          <div>
                            <div className="font-bold">{sub.userId?.name}</div>
                            <div className="text-xs text-gray-500">{sub.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                          {sub.packageId?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-gray-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(sub.startDate).toLocaleDateString()}
                          </div>
                          <div className={`text-xs flex items-center gap-1.5 ${sub.isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                            <ArrowLeft className="w-3 h-3 -rotate-45" />
                            {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Lifetime'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sub.isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-tighter">
                            Expired
                          </span>
                        ) : sub.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-tighter">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-500 text-[10px] font-black uppercase tracking-tighter">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(sub)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub._id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
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
            {filteredSubs.length === 0 && (
              <div className="py-20 text-center text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No subscriptions found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingSubscription ? 'Edit Subscription' : 'New Subscription'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Select User</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors appearance-none"
                    required
                    disabled={!!editingSubscription}
                  >
                    <option value="" className="bg-gray-900">Choose a user...</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id} className="bg-gray-900">{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Select Package</label>
                <div className="relative">
                  <PackageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={formData.packageId}
                    onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors appearance-none"
                    required
                  >
                    <option value="" className="bg-gray-900">Choose a package...</option>
                    {packages.map(p => (
                      <option key={p._id} value={p._id} className="bg-gray-900">{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">End Date (optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-500 px-1 italic">
                * If End Date is empty, the package duration will be used automatically.
              </p>

              <div className="flex items-center gap-3 py-2">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-blue-500 transition-colors" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-white transition-colors">Subscription Active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Subscription'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
