import mongoose, { Document, Schema } from 'mongoose';

export interface DestinationDocument extends Document {
  name: string;
  country: string;
  continent: string;
  description: string;
  imageUrl: string;
  rating?: number;
  averageCost?: number;
  interests: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const destinationSchema = new Schema<DestinationDocument>(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    continent: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    rating: { type: Number },
    averageCost: { type: Number },
    interests: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Destination = mongoose.model<DestinationDocument>('Destination', destinationSchema);