import mongoose from 'mongoose';
import { MongoDBStorage } from './mongodb-storage';

const MONGODB_URI = 'mongodb+srv://20691a05m8:MkpdHo0CroaKrDW2@clusterone.23kkr7c.mongodb.net/travelapp';

export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB is already connected');
      return;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Initialize the storage with sample data
    const storage = new MongoDBStorage();
    await storage.initSampleData();
    
    return storage;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

export async function disconnectFromDatabase() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnect error:', error);
    throw new Error('Failed to disconnect from MongoDB');
  }
}