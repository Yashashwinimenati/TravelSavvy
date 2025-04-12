import mongoose, { Document, Schema } from 'mongoose';

export interface BookingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'restaurant' | 'activity' | 'accommodation';
  itemId: string;
  date: string;
  time?: string;
  partySize?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  confirmationCode?: string;
  createdAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    type: { 
      type: String, 
      required: true,
      enum: ['restaurant', 'activity', 'accommodation']
    },
    itemId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    partySize: { type: Number },
    status: { 
      type: String, 
      required: true,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'pending'
    },
    notes: { type: String },
    confirmationCode: { type: String }
  },
  { 
    // Only include createdAt, not updatedAt
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

export const Booking = mongoose.model<BookingDocument>('Booking', bookingSchema);