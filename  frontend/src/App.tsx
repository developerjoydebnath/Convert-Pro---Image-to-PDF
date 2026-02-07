import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import ConverterPage from './pages/ConverterPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PackagesPage from './pages/PackagesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';

function DashboardRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/converter" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/packages"
        element={
          <AdminRoute>
            <PackagesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <AdminRoute>
            <SubscriptionsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        }
      />
      <Route
        path="/converter"
        element={
          <ProtectedRoute>
            <ConverterPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}