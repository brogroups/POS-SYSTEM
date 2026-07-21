import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/kitchen';

export const connectDB = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ MongoDB connected successfully via Mongoose');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
