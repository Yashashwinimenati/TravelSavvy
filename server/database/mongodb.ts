import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://20691a05m8:MkpdHo0CroaKrDW2@clusterone.23kkr7c.mongodb.net/travelsage';

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Disconnect from MongoDB
export async function disconnectFromDatabase() {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

export default mongoose;