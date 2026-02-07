import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGODB_CONNECTION_URI;
    if (!uri) {
      throw new Error('MONGODB_CONNECTION_URI is not defined');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@admin.com',
      password: 'admin123',
      name: 'Administrator',
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
