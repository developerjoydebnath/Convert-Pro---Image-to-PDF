import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_CONNECTION_URI;
    if (!uri) {
      throw new Error('MONGODB_CONNECTION_URI is not defined');
    }
    
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
