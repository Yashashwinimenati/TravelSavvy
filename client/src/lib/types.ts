// User related types
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

// Destination types
export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  description: string;
  imageUrl: string;
  rating: number;
  averageCost: number;
  interests: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  bestTimeToVisit?: string[];
  currency?: string;
  language?: string;
  isFeatured?: boolean;
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  distance: string;
  cuisine: string[];
  priceRange: string;
  rating: number;
  reviewCount: number;
  openingTime?: string;
  isRecommended?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Activity types
export interface Activity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  price: number;
  currency?: string;
  rating: number;
  duration?: string;
  isRecommended?: boolean;
  category?: string[];
}

// Itinerary types
export interface ItineraryItem {
  id: string;
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
  id: string;
  title: string;
  date: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate?: string;
  days: ItineraryDay[];
  createdAt: string;
  updatedAt: string;
}

// Booking types
export interface Booking {
  id: string;
  userId: string;
  type: 'restaurant' | 'activity' | 'accommodation';
  itemId: string;
  date: string;
  time?: string;
  partySize?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  confirmationCode?: string;
  createdAt: string;
}

// AI/Voice types
export interface AIRequest {
  prompt: string;
  maxTokens?: number;
}

export interface AIResponse {
  response: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
}
