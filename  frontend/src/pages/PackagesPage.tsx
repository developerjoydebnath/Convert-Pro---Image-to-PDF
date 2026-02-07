import axios from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

interface Package {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    features: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/packages/all`);
      setPackages(response.data);
    } catch {
      setError('Failed to fetch packages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleOpenModal = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        price: pkg.price.toString(),
        duration: pkg.duration.toString(),
        description: pkg.description || '',
        features: pkg.features.join('\n'),
        isActive: pkg.isActive,
      });
    } else {
      setEditingPackage(null);
      setFormData({ name: '', price: '', duration: '', description: '', features: '', isActive: true });
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
        price: Number(formData.price),
        duration: Number(formData.duration),
        features: formData.features.split('\n').filter((f) => f.trim() !== ''),
      };

      if (editingPackage) {
        await axios.put(`${API_URL}/packages/${editingPackage._id}`, payload);
      } else {
        await axios.post(`${API_URL}/packages`, payload);
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      await axios.delete(`${API_URL}/packages/${id}`);
      fetchPackages();
    } catch {
      setError('Failed to delete package');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex md:flex-row flex-col gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Manage Packages</h1>
              <p className="text-sm text-gray-400">Create and edit subscription plans</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-bold shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Package
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg._id} className="glass-card p-6 relative flex flex-col group">
                {!pkg.isActive && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-red-500 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-500/20">
                      Inactive
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">${pkg.price}</span>
                    <span className="text-gray-500 text-sm">/ {pkg.duration === 0 ? 'Lifetime' : `${pkg.duration}d`}</span>
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-sm text-gray-400 mb-4">{pkg.description}</p>
                )}

                <div className="space-y-3 flex-1 mb-8">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-auto relative z-20">
                  <button
                    onClick={() => handleOpenModal(pkg)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingPackage ? 'Edit Package' : 'New Package'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Package Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-colors"
                  placeholder="e.g. Monthly Pro"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-colors"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Duration (Days, 0=Lifetime)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-colors"
                    placeholder="30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-colors"
                  placeholder="Short description of this package"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Features (one per line)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-colors h-32"
                  placeholder="Feature 1\nFeature 2"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-purple-500 transition-colors" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-white transition-colors">Active Package</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Package'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
