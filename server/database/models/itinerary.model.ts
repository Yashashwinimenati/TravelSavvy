import mongoose, { Document, Schema } from 'mongoose';

// Define schemas for the nested objects in Itinerary
export interface ItineraryItem {
  title: string;
  description: string;
  type: 'activity' | 'food' | 'transportation' | 'accommodation';
  startTime: string;
  endTime: string;
  location?: string;
  distance?: string;
  price?: string;
  imageUrl?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'none';
  bookingReference?: string;
}

export interface ItineraryDay {
  title: string;
  date: string;
  items: ItineraryItem[];
}

export interface ItineraryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  destination: string;
  startDate: string;
  endDate?: string;
  days: ItineraryDay[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema definitions
const itineraryItemSchema = new Schema<ItineraryItem>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['activity', 'food', 'transportation', 'accommodation']
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String },
  distance: { type: String },
  price: { type: String },
  imageUrl: { type: String },
  status: { 
    type: String, 
    required: true,
    enum: ['confirmed', 'pending', 'cancelled', 'none'],
    default: 'none'
  },
  bookingReference: { type: String }
});

const itineraryDaySchema = new Schema<ItineraryDay>({
  title: { type: String, required: true },
  date: { type: String, required: true },
  items: { type: [itineraryItemSchema], default: [] }
});

const itinerarySchema = new Schema<ItineraryDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    name: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    days: { type: [itineraryDaySchema], default: [] }
  },
  { timestamps: true }
);

export const Itinerary = mongoose.model<ItineraryDocument>('Itinerary', itinerarySchema);