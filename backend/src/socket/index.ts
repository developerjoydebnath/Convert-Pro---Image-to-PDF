import * as cookie from 'cookie';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

let io: Server;

// Store socket-to-user mappings for reliable force logout
const userSockets = new Map<string, Set<string>>();

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', async (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id);

    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.token;

      if (!token) {
        console.log('No token found in socket handshake');
        return;
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) return;

      const decoded = jwt.verify(token, secret) as { userId: string };
      const userId = decoded.userId;
      const room = `user:${userId}`;
      
      socket.join(room);
      
      // Track socket for this user
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)?.add(socket.id);
      
      console.log(`👤 Socket ${socket.id} joined room ${room}`);

      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
        const userSocks = userSockets.get(userId);
        if (userSocks) {
          userSocks.delete(socket.id);
          if (userSocks.size === 0) {
            userSockets.delete(userId);
          }
        }
      });
    } catch (error) {
      console.log('Socket authentication failed:', error);
    }
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Force logout a specific user
export const forceLogoutUser = (userId: string, reason: string): void => {
  if (!io) return;
  
  const room = `user:${userId}`;
  console.log(`🚪 Force logout user ${userId} from room ${room}: ${reason}`);
  io.to(room).emit('force-logout', { reason });
};
