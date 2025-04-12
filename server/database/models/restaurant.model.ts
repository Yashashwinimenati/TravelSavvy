import mongoose, { Document, Schema } from 'mongoose';

export interface RestaurantDocument extends Document {
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  distance?: string;
  cuisine: string[];
  priceRange: string;
  rating?: number;
  reviewCount?: number;
  openingTime?: string;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<RestaurantDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    location: { type: String, required: true },
    distance: { type: String },
    cuisine: { type: [String], default: [] },
    priceRange: { type: String, required: true },
    rating: { type: Number },
    reviewCount: { type: Number },
    openingTime: { type: String },
    isRecommended: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model<RestaurantDocument>('Restaurant', restaurantSchema);