import mongoose from 'mongoose';
import { MongoDBStorage } from './mongodb-storage';

// Optional MongoDB URI from environment or default to fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amnvramachandra:ramachandra559@cluster0.gzkpmmq.mongodb.net/travelapp?retryWrites=true&w=majority&appName=Cluster0';

// Set a reasonable timeout for MongoDB connection
const MONGODB_TIMEOUT_MS = 5000; 

export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB is already connected');
      return;
    }
    
    // Set a connection timeout
    const connectOptions = {
      serverSelectionTimeoutMS: MONGODB_TIMEOUT_MS,
      connectTimeoutMS: MONGODB_TIMEOUT_MS
    };
    
    // Connect with timeout
    await mongoose.connect(MONGODB_URI, connectOptions);
    console.log('MongoDB connected successfully');
    
    // Initialize the storage with sample data
    const storage = new MongoDBStorage();
    await storage.initSampleData();
    
    return storage;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Instead of throwing error, return null to indicate fallback to memory storage
    return null;
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