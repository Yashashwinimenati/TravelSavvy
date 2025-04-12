import mongoose, { Document, Schema } from 'mongoose';

export interface ActivityDocument extends Document {
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  price: number;
  currency: string;
  rating?: number;
  duration?: string;
  category: string[];
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<ActivityDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    rating: { type: Number },
    duration: { type: String },
    category: { type: [String], default: [] },
    isRecommended: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Activity = mongoose.model<ActivityDocument>('Activity', activitySchema);