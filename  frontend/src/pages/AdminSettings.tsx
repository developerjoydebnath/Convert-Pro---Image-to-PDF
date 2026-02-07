import axios from 'axios';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageCircle,
  Save,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

export default function AdminSettings() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/settings`);
      setWhatsappNumber(response.data.whatsappNumber);
    } catch {
      setError('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`${API_URL}/settings`, { whatsappNumber }, { withCredentials: true });
      setSuccess('Settings updated successfully');
    } catch {
      setError('Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto w-full pt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Save className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Global Settings</h1>
          <p className="text-sm text-gray-400">Configure global application parameters</p>
        </div>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp Number
            </label>
            <p className="text-xs text-gray-500 mb-2">This number will be used for all WhatsApp call-to-actions, including pricing inquiries and free trial requests.</p>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
              placeholder="+8801XXXXXXXXX"
              required
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
