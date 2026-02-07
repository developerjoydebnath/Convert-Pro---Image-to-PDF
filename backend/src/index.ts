import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import packageRoutes from './routes/packages.js';
import settingsRoutes from './routes/settings.js';
import subscriptionRoutes from './routes/subscriptions.js';
import userRoutes from './routes/users.js';
import { initSocket } from './socket/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
