import axios from 'axios';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Layout,
  LogOut,
  MessageCircle,
  Rocket,
  Shield,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

interface Package {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
}

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('+8801XXXXXXXXX');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/packages`),
          axios.get(`${API_URL}/settings`),
        ]);
        setPackages(packagesRes.data);
        setWhatsappNumber(settingsRes.data.whatsappNumber);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCTA = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=I%20want%20to%20subscribe%20to%20Image%20to%20PDF`, '_blank');
  };

  const handleFreeTrial = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=I%20want%20to%20request%20a%207-day%20free%20trial`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ConvertPro</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/converter'} className="text-sm font-medium hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-purple-400 transition-colors">
                  Sign In
                </Link>
                <button
                  onClick={handleCTA}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-bold shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Subscribe Now
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square pointer-events-none opacity-20">
            <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-purple-600 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-pink-600 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-6">
                <Rocket className="w-3.5 h-3.5" />
                Empowering your workflow with AI-driven conversion
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                Convert Images to Pro PDFs in <span className="text-purple-500">Seconds</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                The most beautiful, fast, and secure way to handle your documents. No more blurry PDF files, just crystal clear quality.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleCTA}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all text-center"
                >
                  Already Subscribed?
                </Link>
              </div>
            </motion.div>

            {/* Float Elements */}
            <div className="mt-20 relative px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="glass-card p-4 md:p-8 relative overflow-hidden group"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {[
                    { icon: ImageIcon, label: 'Quality Preserved', color: 'text-blue-400' },
                    { icon: Zap, label: 'Instant Conversion', color: 'text-amber-400' },
                    { icon: ShieldCheck, label: 'Secure Storage', color: 'text-emerald-400' },
                    { icon: Layout, label: 'Pro Layouts', color: 'text-purple-400' },
                  ].map((feature, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${feature.color}`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">{feature.label}</span>
                    </div>
                  ))}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-4 bg-white/[0.02]" id="pricing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-gray-400">Simple, transparent pricing for everyone.</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {packages.map((pkg, i) => (
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative glass-card p-8 group h-full flex flex-col ${i === 1 ? 'border-purple-500 ring-4 ring-purple-500/10' : ''}`}
                  >
                    {i === 1 && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-xs font-black uppercase tracking-widest">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-black text-white">৳{pkg.price}</span>
                        <span className="text-gray-500 text-sm">
                          {pkg.duration === 0 ? 'Once Only' : pkg.duration === 30 ? 'Per Month' : 'Per Year'}
                        </span>
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-gray-400">{pkg.description}</p>
                      )}
                    </div>

                    <ul className="space-y-4 mb-10 flex-1">
                      {pkg.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleCTA}
                      className={`w-full py-4 rounded-xl font-bold transition-all ${i === 1
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                        }`}
                    >
                      Get Started
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Free Trial Section */}
        <section className="py-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto glass-card p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Try Before You Buy</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Not sure which plan is right for you? Request a 7-day free trial and experience all premium features with no commitment.
            </p>
            <button
              onClick={handleFreeTrial}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg shadow-xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <MessageCircle className="w-6 h-6" />
              Request 7-Day Free Trial
            </button>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto glass-card p-12 overflow-hidden relative"
          >
            {/* Background Orbs */}
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
              <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-purple-500 rounded-full blur-[100px]" />
              <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-pink-500 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-lg">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Need a Custom Plan for Your Enterprise?</h2>
                <p className="text-gray-400 text-lg mb-8">
                  Get in touch with us on WhatsApp for specialized business accounts, multi-user licenses, and priority enterprise support.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                    <Shield className="w-4 h-4" />
                    Secure Payments
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                    <Star className="w-4 h-4" />
                    Trusted by 10/10
                  </div>
                </div>
              </div>

              <button
                onClick={handleCTA}
                className="shrink-0 w-full md:w-auto px-10 py-6 rounded-2xl bg-[#25D366] text-white font-black text-xl shadow-2xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-8 h-8 fill-white" />
                Contact WhatsApp
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">ConvertPro</span>
          </div>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
            Superior image to PDF conversions for modern creators and teams across the world.
          </p>
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} <Link to="https://stackrover-landing-v1.vercel.app" target="_blank" rel="noopener noreferrer" className="text-purple-400">StackRover Agency</Link>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
