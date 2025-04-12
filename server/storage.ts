import { users, type User, type InsertUser } from "@shared/schema";
import { Destination, Restaurant, Activity, Itinerary, ItineraryDay, ItineraryItem, Booking } from "@/lib/types";
import { generateId } from "@/lib/utils";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-your-default-key"  // Default key as fallback
});

// Define storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { email?: string; firstName?: string; lastName?: string; }): Promise<User>;
  
  // Destination methods
  getAllDestinations(): Promise<Destination[]>;
  getFeaturedDestinations(): Promise<Destination[]>;
  getDestinationById(id: string): Promise<Destination | undefined>;
  searchDestinations(criteria: { query: string; continent: string; interest: string }): Promise<Destination[]>;
  
  // Restaurant methods
  getAllRestaurants(): Promise<Restaurant[]>;
  getRecommendedRestaurants(): Promise<Restaurant[]>;
  getRecommendedRestaurantsForUser(userId: number): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | undefined>;
  getRestaurantsByLocation(location: string): Promise<Restaurant[]>;
  searchRestaurants(criteria: { query: string; cuisine: string; priceRange: string }): Promise<Restaurant[]>;
  
  // Activity methods
  getPopularActivities(): Promise<Activity[]>;
  getActivitiesByDestination(destinationId: string): Promise<Activity[]>;
  
  // Itinerary methods
  getCurrentItinerary(userId: number): Promise<Itinerary | undefined>;
  setCurrentItinerary(userId: number, itineraryId: string): Promise<void>;
  getUserItineraries(userId: number): Promise<Itinerary[]>;
  getItineraryById(id: string): Promise<Itinerary | undefined>;
  getItineraryByItemId(itemId: string): Promise<Itinerary | undefined>;
  createItinerary(data: { userId: number; name: string; destination: string; startDate: string; endDate: string; days: Partial<ItineraryDay>[] }): Promise<Itinerary>;
  updateItinerary(id: string, data: Partial<Itinerary>): Promise<Itinerary>;
  deleteItinerary(id: string): Promise<void>;
  updateItineraryItemStatus(itemId: string, status: string): Promise<ItineraryItem>;
  generateItineraryWithAI(prompt: string, baseInfo: { destination: string; numberOfDays: number; startDate: string }): Promise<{ days: ItineraryDay[] }>;
  
  // Booking methods
  createBooking(data: { userId: number; type: string; itemId: string; date: string; time?: string; partySize?: number; notes?: string; status: string; confirmationCode?: string }): Promise<Booking>;
  getUserBookings(userId: number, type?: string): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  updateBookingStatus(id: string, status: string): Promise<Booking>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private destinations: Map<string, Destination>;
  private restaurants: Map<string, Restaurant>;
  private activities: Map<string, Activity>;
  private itineraries: Map<string, Itinerary>;
  private userCurrentItinerary: Map<number, string>;
  private bookings: Map<string, Booking>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.destinations = new Map();
    this.restaurants = new Map();
    this.activities = new Map();
    this.itineraries = new Map();
    this.userCurrentItinerary = new Map();
    this.bookings = new Map();
    this.currentId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser & { email?: string; firstName?: string; lastName?: string; }): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAdmin: false
    };
    this.users.set(id, user);
    return user;
  }

  // Destination methods
  async getAllDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }

  async getFeaturedDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values())
      .filter(destination => destination.isFeatured)
      .slice(0, 6);
  }

  async getDestinationById(id: string): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }

  async searchDestinations(criteria: { query: string; continent: string; interest: string }): Promise<Destination[]> {
    let results = Array.from(this.destinations.values());
    
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(
        destination => 
          destination.name.toLowerCase().includes(query) ||
          destination.country.toLowerCase().includes(query) ||
          destination.description.toLowerCase().includes(query)
      );
    }
    
    if (criteria.continent && criteria.continent !== 'all') {
      results = results.filter(
        destination => destination.continent.toLowerCase() === criteria.continent.toLowerCase()
      );
    }
    
    if (criteria.interest && criteria.interest !== 'all') {
      results = results.filter(
        destination => destination.interests.some(
          interest => interest.toLowerCase() === criteria.interest.toLowerCase()
        )
      );
    }
    
    return results;
  }

  // Restaurant methods
  async getAllRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }

  async getRecommendedRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values())
      .filter(restaurant => restaurant.isRecommended)
      .slice(0, 4);
  }

  async getRecommendedRestaurantsForUser(userId: number): Promise<Restaurant[]> {
    // In a real app, this would use user preferences to filter restaurants
    return this.getRecommendedRestaurants();
  }

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getRestaurantsByLocation(location: string): Promise<Restaurant[]> {
    const locationLower = location.toLowerCase();
    return Array.from(this.restaurants.values())
      .filter(restaurant => restaurant.location.toLowerCase().includes(locationLower));
  }

  async searchRestaurants(criteria: { query: string; cuisine: string; priceRange: string }): Promise<Restaurant[]> {
    let results = Array.from(this.restaurants.values());
    
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(
        restaurant => 
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.description.toLowerCase().includes(query)
      );
    }
    
    if (criteria.cuisine && criteria.cuisine !== 'all') {
      results = results.filter(
        restaurant => restaurant.cuisine.some(
          type => type.toLowerCase() === criteria.cuisine.toLowerCase()
        )
      );
    }
    
    if (criteria.priceRange && criteria.priceRange !== 'all') {
      results = results.filter(
        restaurant => restaurant.priceRange === criteria.priceRange
      );
    }
    
    return results;
  }

  // Activity methods
  async getPopularActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }

  async getActivitiesByDestination(destinationId: string): Promise<Activity[]> {
    const destination = await this.getDestinationById(destinationId);
    if (!destination) return [];
    
    // Filter activities by location matching the destination
    return Array.from(this.activities.values())
      .filter(activity => 
        activity.location.toLowerCase().includes(destination.name.toLowerCase()) ||
        activity.location.toLowerCase().includes(destination.country.toLowerCase())
      );
  }

  // Itinerary methods
  async getCurrentItinerary(userId: number): Promise<Itinerary | undefined> {
    const currentItineraryId = this.userCurrentItinerary.get(userId);
    if (!currentItineraryId) return undefined;
    
    return this.itineraries.get(currentItineraryId);
  }

  async setCurrentItinerary(userId: number, itineraryId: string): Promise<void> {
    this.userCurrentItinerary.set(userId, itineraryId);
  }

  async getUserItineraries(userId: number): Promise<Itinerary[]> {
    return Array.from(this.itineraries.values())
      .filter(itinerary => itinerary.userId === userId);
  }

  async getItineraryById(id: string): Promise<Itinerary | undefined> {
    return this.itineraries.get(id);
  }

  async getItineraryByItemId(itemId: string): Promise<Itinerary | undefined> {
    for (const itinerary of this.itineraries.values()) {
      for (const day of itinerary.days) {
        for (const item of day.items) {
          if (item.id === itemId) {
            return itinerary;
          }
        }
      }
    }
    return undefined;
  }

  async createItinerary(data: { 
    userId: number; 
    name: string; 
    destination: string; 
    startDate: string; 
    endDate: string; 
    days: Partial<ItineraryDay>[] 
  }): Promise<Itinerary> {
    const id = generateId();
    const now = new Date().toISOString();
    
    // Create days with proper IDs and items
    const days: ItineraryDay[] = data.days.map(day => ({
      id: generateId(),
      title: day.title || "Day in " + data.destination,
      date: day.date || "",
      items: (day.items || []).map(item => ({
        id: generateId(),
        title: item.title || "",
        description: item.description || "",
        type: item.type || "activity",
        startTime: item.startTime || "09:00",
        endTime: item.endTime || "10:00",
        location: item.location || "",
        distance: item.distance || "",
        price: item.price || "",
        imageUrl: item.imageUrl || "",
        status: item.status || "none"
      }))
    }));
    
    const itinerary: Itinerary = {
      id,
      userId: data.userId,
      name: data.name,
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      days,
      createdAt: now,
      updatedAt: now
    };
    
    this.itineraries.set(id, itinerary);
    this.userCurrentItinerary.set(data.userId, id);
    
    return itinerary;
  }

  async updateItinerary(id: string, data: Partial<Itinerary>): Promise<Itinerary> {
    const itinerary = await this.getItineraryById(id);
    if (!itinerary) {
      throw new Error("Itinerary not found");
    }
    
    const updatedItinerary: Itinerary = {
      ...itinerary,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.itineraries.set(id, updatedItinerary);
    
    return updatedItinerary;
  }

  async deleteItinerary(id: string): Promise<void> {
    const itinerary = await this.getItineraryById(id);
    if (!itinerary) {
      throw new Error("Itinerary not found");
    }
    
    this.itineraries.delete(id);
    
    // If this was the current itinerary, remove that reference
    if (this.userCurrentItinerary.get(itinerary.userId) === id) {
      this.userCurrentItinerary.delete(itinerary.userId);
    }
  }

  async updateItineraryItemStatus(itemId: string, status: string): Promise<ItineraryItem> {
    let updatedItem: ItineraryItem | null = null;
    
    for (const itinerary of this.itineraries.values()) {
      for (const day of itinerary.days) {
        for (let i = 0; i < day.items.length; i++) {
          if (day.items[i].id === itemId) {
            day.items[i] = {
              ...day.items[i],
              status: status as 'confirmed' | 'pending' | 'cancelled' | 'none'
            };
            updatedItem = day.items[i];
            break;
          }
        }
      }
    }
    
    if (!updatedItem) {
      throw new Error("Item not found");
    }
    
    return updatedItem;
  }

  async generateItineraryWithAI(
    prompt: string, 
    baseInfo: { destination: string; numberOfDays: number; startDate: string }
  ): Promise<{ days: ItineraryDay[] }> {
    try {
      // Call OpenAI to generate an itinerary
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI travel planner that creates detailed itineraries. 
            Generate a travel itinerary for ${baseInfo.destination} for ${baseInfo.numberOfDays} days starting on ${baseInfo.startDate}.
            The output should be a JSON object with days array containing day objects.
            Each day should have a title, date, and items array with activities, meals, and transportation.
            Each item should have title, description, type (activity, food, transportation, accommodation),
            startTime, endTime, and status defaulting to "none".`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const itineraryData = JSON.parse(response.choices[0].message.content || "{}");
      
      // Process the data to ensure consistent format
      const days: ItineraryDay[] = (itineraryData.days || []).map((day: any) => ({
        id: generateId(),
        title: day.title || `Day in ${baseInfo.destination}`,
        date: day.date || "",
        items: (day.items || []).map((item: any) => ({
          id: generateId(),
          title: item.title || "",
          description: item.description || "",
          type: item.type || "activity",
          startTime: item.startTime || "09:00",
          endTime: item.endTime || "10:00",
          location: item.location || "",
          distance: item.distance || "",
          price: item.price || "",
          imageUrl: item.imageUrl || "",
          status: item.status || "none"
        }))
      }));
      
      return { days };
    } catch (error) {
      console.error("AI itinerary generation error:", error);
      throw new Error("Failed to generate itinerary with AI");
    }
  }

  // Booking methods
  async createBooking(data: { 
    userId: number; 
    type: string; 
    itemId: string; 
    date: string; 
    time?: string; 
    partySize?: number; 
    notes?: string; 
    status: string; 
    confirmationCode?: string 
  }): Promise<Booking> {
    const id = generateId();
    const now = new Date().toISOString();
    
    const booking: Booking = {
      id,
      userId: data.userId,
      type: data.type as 'restaurant' | 'activity' | 'accommodation',
      itemId: data.itemId,
      date: data.date,
      time: data.time,
      partySize: data.partySize || 1,
      status: data.status as 'confirmed' | 'pending' | 'cancelled',
      notes: data.notes,
      confirmationCode: data.confirmationCode,
      createdAt: now
    };
    
    this.bookings.set(id, booking);
    
    return booking;
  }

  async getUserBookings(userId: number, type?: string): Promise<Booking[]> {
    let bookings = Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId);
    
    if (type) {
      bookings = bookings.filter(booking => booking.type === type);
    }
    
    return bookings;
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const booking = await this.getBookingById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const updatedBooking: Booking = {
      ...booking,
      status: status as 'confirmed' | 'pending' | 'cancelled'
    };
    
    this.bookings.set(id, updatedBooking);
    
    return updatedBooking;
  }

  // Initialize sample data
  private initSampleData() {
    // Sample users
    const user1: User = {
      id: 1,
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAdmin: false
    };
    
    const user2: User = {
      id: 2,
      username: "janedoe",
      email: "jane@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAdmin: false
    };
    
    this.users.set(1, user1);
    this.users.set(2, user2);
    this.currentId = 3;
    
    // Sample destinations
    const destinations: Destination[] = [
      {
        id: "dest1",
        name: "Paris",
        country: "France",
        continent: "Europe",
        description: "Experience the city of lights with its iconic landmarks, world-class cuisine, and romantic ambiance.",
        imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        averageCost: 1200,
        interests: ["Culture", "Romance", "Food"],
        isFeatured: true
      },
      {
        id: "dest2",
        name: "Tokyo",
        country: "Japan",
        continent: "Asia",
        description: "Blend of ultramodern and traditional with buzzing districts, historic temples, and incredible food scene.",
        imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        averageCost: 1800,
        interests: ["Adventure", "Food", "Culture"],
        isFeatured: true
      },
      {
        id: "dest3",
        name: "Santorini",
        country: "Greece",
        continent: "Europe",
        description: "Stunning sunsets, whitewashed buildings, crystal blue waters, and volcanic beaches await.",
        imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.7,
        averageCost: 1500,
        interests: ["Beach", "Romance", "Adventure"],
        isFeatured: true
      },
      {
        id: "dest4",
        name: "Bali",
        country: "Indonesia",
        continent: "Asia",
        description: "Tropical paradise with lush rice terraces, sacred temples, vibrant coral reefs, and wellness retreats.",
        imageUrl: "https://images.unsplash.com/photo-1512036666432-2181c1f26420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.6,
        averageCost: 1100,
        interests: ["Wellness", "Nature", "Beach"],
        isFeatured: true
      },
      {
        id: "dest5",
        name: "New York City",
        country: "USA",
        continent: "North America",
        description: "The city that never sleeps offers iconic skyscrapers, diverse neighborhoods, world-class entertainment.",
        imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        averageCost: 1600,
        interests: ["Urban", "Culture", "Food"],
        isFeatured: true
      },
      {
        id: "dest6",
        name: "Barcelona",
        country: "Spain",
        continent: "Europe",
        description: "Known for stunning architecture, Mediterranean beaches, vibrant nightlife, and amazing food scene.",
        imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.7,
        averageCost: 1300,
        interests: ["Architecture", "Food", "Beach"],
        isFeatured: true
      }
    ];
    
    destinations.forEach(destination => {
      this.destinations.set(destination.id, destination);
    });
    
    // Sample restaurants
    const restaurants: Restaurant[] = [
      {
        id: "rest1",
        name: "El Jardin",
        description: "Authentic Spanish cuisine with a modern twist, featuring locally sourced ingredients and panoramic city views.",
        imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        location: "Barcelona, Spain",
        distance: "0.8 miles away",
        cuisine: ["Mediterranean", "Spanish"],
        priceRange: "$$",
        rating: 4.8,
        reviewCount: 243,
        openingTime: "Reservations available tonight",
        isRecommended: true
      },
      {
        id: "rest2",
        name: "Sakura Sushi",
        description: "Traditional omakase experience with the freshest seafood from Tsukiji market, prepared by master chef Tanaka.",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        location: "Tokyo, Japan",
        distance: "1.2 miles away",
        cuisine: ["Japanese", "Sushi"],
        priceRange: "$$$",
        rating: 4.9,
        reviewCount: 178,
        openingTime: "Few spots left for tomorrow",
        isRecommended: true
      },
      {
        id: "rest3",
        name: "Trattoria Bella Italia",
        description: "Family-run trattoria serving authentic Roman dishes using recipes passed down through generations.",
        imageUrl: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        location: "Rome, Italy",
        distance: "0.5 miles away",
        cuisine: ["Italian", "Pasta"],
        priceRange: "$$",
        rating: 4.7,
        reviewCount: 321,
        openingTime: "Reservations available tonight",
        isRecommended: true
      },
      {
        id: "rest4",
        name: "Green Garden",
        description: "Farm-to-table vegetarian restaurant with organic ingredients grown in their own garden with Balinese influences.",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        location: "Bali, Indonesia",
        distance: "2.1 miles away",
        cuisine: ["Vegetarian", "Organic"],
        priceRange: "$$",
        rating: 4.6,
        reviewCount: 196,
        isRecommended: true
      }
    ];
    
    restaurants.forEach(restaurant => {
      this.restaurants.set(restaurant.id, restaurant);
    });
    
    // Sample activities
    const activities: Activity[] = [
      {
        id: "act1",
        name: "Paella Cooking Class",
        description: "Learn to make authentic Spanish paella with a local chef, including market tour and wine.",
        imageUrl: "https://images.unsplash.com/photo-1606820854416-439b3305ff39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        location: "Barcelona, Spain",
        price: 65,
        currency: "EUR",
        rating: 4.9,
        duration: "3 hours",
        category: ["Food", "Cultural"]
      },
      {
        id: "act2",
        name: "Gaudí Architecture Tour",
        description: "Skip-the-line guided tour of Sagrada Familia and other Gaudí masterpieces in Barcelona.",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        location: "Barcelona, Spain",
        price: 49,
        currency: "EUR",
        rating: 4.8,
        duration: "4 hours",
        category: ["Cultural", "Architecture"]
      },
      {
        id: "act3",
        name: "Mediterranean Sailing",
        description: "3-hour sailing experience along Barcelona's coast with drinks and snacks included.",
        imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        location: "Barcelona, Spain",
        price: 79,
        currency: "EUR",
        rating: 4.7,
        duration: "3 hours",
        category: ["Adventure", "Outdoor"]
      },
      {
        id: "act4",
        name: "Tapas Walking Tour",
        description: "Evening food tour visiting 4 authentic tapas bars with local guide and wine pairings.",
        imageUrl: "https://images.unsplash.com/photo-1614555383830-848e7561120f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        location: "Barcelona, Spain",
        price: 85,
        currency: "EUR",
        rating: 4.9,
        duration: "4 hours",
        category: ["Food", "Cultural"],
        isRecommended: true
      }
    ];
    
    activities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });
  }
}

export const storage = new MemStorage();
