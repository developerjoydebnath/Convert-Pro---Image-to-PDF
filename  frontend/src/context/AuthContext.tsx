import axios from 'axios';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

// Configure axios defaults
axios.defaults.withCredentials = true;

export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      // Ignore errors during logout
      console.error('Logout failed:', error);
    }
    setUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    setUser(response.data.user);
  }, []);

  // Initialize socket connection when user is logged in
  useEffect(() => {
    let newSocket: Socket | null = null;

    if (user?._id) {
      newSocket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        // console.log('Socket connected');
      });

      newSocket.on('force-logout', (data: { reason: string }) => {
        // console.log('Force logout:', data.reason);
        // Clear state first so other components react immediately
        setUser(null);

        // Show notification and redirect
        setTimeout(() => {
          toast.error(`You have been logged out: ${data.reason}`);
          window.location.href = '/login';
        }, 100);
      });

      setSocket(newSocket);
    } else {
      setSocket(null);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user?._id]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
