import mongoose from 'mongoose';
import { IStorage } from '../storage';
import { 
  User as UserModel, 
  Destination as DestinationModel, 
  Restaurant as RestaurantModel,
  Activity as ActivityModel,
  Itinerary as ItineraryModel,
  Booking as BookingModel
} from './models';
import {
  User, InsertUser,
  Destination, 
  Restaurant, 
  Activity,
  Itinerary, 
  Booking
} from '../../shared/schema';
import { ItineraryDay, ItineraryItem } from '@/lib/types';

export class MongoDBStorage implements IStorage {
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      if (!user) return undefined;
      
      return this.mapUserFromMongoose(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) return undefined;
      
      return this.mapUserFromMongoose(user);
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return undefined;
      
      return this.mapUserFromMongoose(user);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser & { email?: string; firstName?: string; lastName?: string; }): Promise<User> {
    try {
      console.log('Creating new user with data:', { ...userData, password: '[REDACTED]' });
      // Create new user document
      const newUser = await UserModel.create({
        username: userData.username,
        password: userData.password, // Should be hashed in production
        email: userData.email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        isAdmin: userData.isAdmin || false
      });

      console.log('User created in MongoDB:', newUser); // Add logging
      
      // Map and return the user
      return this.mapUserFromMongoose(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Destination methods
  async getAllDestinations(): Promise<Destination[]> {
    try {
      const destinations = await DestinationModel.find();
      return destinations.map(dest => this.mapDestinationFromMongoose(dest));
    } catch (error) {
      console.error('Error fetching all destinations:', error);
      return [];
    }
  }

  async getFeaturedDestinations(): Promise<Destination[]> {
    try {
      const featuredDestinations = await DestinationModel.find({ isFeatured: true });
      return featuredDestinations.map(dest => this.mapDestinationFromMongoose(dest));
    } catch (error) {
      console.error('Error fetching featured destinations:', error);
      return [];
    }
  }

  async getDestinationById(id: string): Promise<Destination | undefined> {
    try {
      const destination = await DestinationModel.findById(id);
      if (!destination) return undefined;
      
      return this.mapDestinationFromMongoose(destination);
    } catch (error) {
      console.error('Error fetching destination by ID:', error);
      return undefined;
    }
  }

  async searchDestinations(criteria: { query: string; continent: string; interest: string }): Promise<Destination[]> {
    try {
      let query: any = {};
      
      if (criteria.query) {
        query.$or = [
          { name: { $regex: criteria.query, $options: 'i' } },
          { country: { $regex: criteria.query, $options: 'i' } },
          { description: { $regex: criteria.query, $options: 'i' } }
        ];
      }
      
      if (criteria.continent) {
        query.continent = criteria.continent;
      }
      
      if (criteria.interest) {
        query.interests = { $in: [criteria.interest] };
      }
      
      const destinations = await DestinationModel.find(query);
      return destinations.map(dest => this.mapDestinationFromMongoose(dest));
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }

  // Restaurant methods
  async getAllRestaurants(): Promise<Restaurant[]> {
    try {
      const restaurants = await RestaurantModel.find();
      return restaurants.map(rest => this.mapRestaurantFromMongoose(rest));
    } catch (error) {
      console.error('Error fetching all restaurants:', error);
      return [];
    }
  }

  async getRecommendedRestaurants(): Promise<Restaurant[]> {
    try {
      const recommendedRestaurants = await RestaurantModel.find({ isRecommended: true });
      return recommendedRestaurants.map(rest => this.mapRestaurantFromMongoose(rest));
    } catch (error) {
      console.error('Error fetching recommended restaurants:', error);
      return [];
    }
  }

  async getRecommendedRestaurantsForUser(userId: number): Promise<Restaurant[]> {
    // In a real app, this would use user preferences to recommend restaurants
    // For now, we'll just return general recommended restaurants
    return this.getRecommendedRestaurants();
  }

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    try {
      const restaurant = await RestaurantModel.findById(id);
      if (!restaurant) return undefined;
      
      return this.mapRestaurantFromMongoose(restaurant);
    } catch (error) {
      console.error('Error fetching restaurant by ID:', error);
      return undefined;
    }
  }

  async getRestaurantsByLocation(location: string): Promise<Restaurant[]> {
    try {
      const restaurants = await RestaurantModel.find({ 
        location: { $regex: location, $options: 'i' } 
      });
      return restaurants.map(rest => this.mapRestaurantFromMongoose(rest));
    } catch (error) {
      console.error('Error fetching restaurants by location:', error);
      return [];
    }
  }

  async searchRestaurants(criteria: { query: string; cuisine: string; priceRange: string }): Promise<Restaurant[]> {
    try {
      let query: any = {};
      
      if (criteria.query) {
        query.$or = [
          { name: { $regex: criteria.query, $options: 'i' } },
          { description: { $regex: criteria.query, $options: 'i' } },
          { location: { $regex: criteria.query, $options: 'i' } }
        ];
      }
      
      if (criteria.cuisine) {
        query.cuisine = { $in: [criteria.cuisine] };
      }
      
      if (criteria.priceRange) {
        query.priceRange = criteria.priceRange;
      }
      
      const restaurants = await RestaurantModel.find(query);
      return restaurants.map(rest => this.mapRestaurantFromMongoose(rest));
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return [];
    }
  }

  // Activity methods
  async getPopularActivities(): Promise<Activity[]> {
    try {
      // Get recommended and high-rated activities
      const activities = await ActivityModel.find({
        $or: [
          { isRecommended: true },
          { rating: { $gte: 4 } }
        ]
      }).limit(10);
      
      return activities.map(act => this.mapActivityFromMongoose(act));
    } catch (error) {
      console.error('Error fetching popular activities:', error);
      return [];
    }
  }

  async getActivitiesByDestination(destinationId: string): Promise<Activity[]> {
    try {
      // Find the destination first to get the location
      const destination = await DestinationModel.findById(destinationId);
      if (!destination) return [];
      
      // Find activities in that location
      const activities = await ActivityModel.find({ 
        location: { $regex: destination.name, $options: 'i' } 
      });
      
      return activities.map(act => this.mapActivityFromMongoose(act));
    } catch (error) {
      console.error('Error fetching activities by destination:', error);
      return [];
    }
  }

  // Itinerary methods
  async getCurrentItinerary(userId: number): Promise<Itinerary | undefined> {
    try {
      // Find the most recently updated itinerary for this user
      const itinerary = await ItineraryModel.findOne({ 
        userId: userId 
      }).sort({ updatedAt: -1 });
      
      if (!itinerary) return undefined;
      
      return this.mapItineraryFromMongoose(itinerary);
    } catch (error) {
      console.error('Error fetching current itinerary:', error);
      return undefined;
    }
  }

  async setCurrentItinerary(userId: number, itineraryId: string): Promise<void> {
    // In MongoDB, we don't need a separate table for this since we can just
    // query for the most recent itinerary
    try {
      // Update the itinerary to set it as most recent (touch updatedAt)
      await ItineraryModel.findByIdAndUpdate(itineraryId, { 
        $set: { updatedAt: new Date() } 
      });
    } catch (error) {
      console.error('Error setting current itinerary:', error);
    }
  }

  async getUserItineraries(userId: number): Promise<Itinerary[]> {
    try {
      const itineraries = await ItineraryModel.find({ userId }).sort({ updatedAt: -1 });
      return itineraries.map(itin => this.mapItineraryFromMongoose(itin));
    } catch (error) {
      console.error('Error fetching user itineraries:', error);
      return [];
    }
  }

  async getItineraryById(id: string): Promise<Itinerary | undefined> {
    try {
      const itinerary = await ItineraryModel.findById(id);
      if (!itinerary) return undefined;
      
      return this.mapItineraryFromMongoose(itinerary);
    } catch (error) {
      console.error('Error fetching itinerary by ID:', error);
      return undefined;
    }
  }

  async getItineraryByItemId(itemId: string): Promise<Itinerary | undefined> {
    try {
      // Find an itinerary that contains an item with the given ID
      const itinerary = await ItineraryModel.findOne({
        'days.items._id': itemId
      });
      
      if (!itinerary) return undefined;
      
      return this.mapItineraryFromMongoose(itinerary);
    } catch (error) {
      console.error('Error fetching itinerary by item ID:', error);
      return undefined;
    }
  }

  async createItinerary(data: { 
    userId: number; 
    name: string; 
    destination: string; 
    startDate: string; 
    endDate: string; 
    days: Partial<ItineraryDay>[] 
  }): Promise<Itinerary> {
    try {
      const newItinerary = await ItineraryModel.create(data);
      return this.mapItineraryFromMongoose(newItinerary);
    } catch (error) {
      console.error('Error creating itinerary:', error);
      throw new Error('Failed to create itinerary');
    }
  }

  async updateItinerary(id: string, data: Partial<Itinerary>): Promise<Itinerary> {
    try {
      const updatedItinerary = await ItineraryModel.findByIdAndUpdate(
        id, 
        { $set: data }, 
        { new: true }
      );
      
      if (!updatedItinerary) {
        throw new Error('Itinerary not found');
      }
      
      return this.mapItineraryFromMongoose(updatedItinerary);
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw new Error('Failed to update itinerary');
    }
  }

  async deleteItinerary(id: string): Promise<void> {
    try {
      await ItineraryModel.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw new Error('Failed to delete itinerary');
    }
  }

  async updateItineraryItemStatus(itemId: string, status: string): Promise<any> {
    try {
      // Find the itinerary containing this item
      const itinerary = await ItineraryModel.findOne({
        'days.items._id': itemId
      });
      
      if (!itinerary) {
        throw new Error('Itinerary item not found');
      }
      
      // Update the specific item
      for (const day of itinerary.days) {
        for (const item of day.items) {
          if (item._id.toString() === itemId) {
            item.status = status as any;
            await itinerary.save();
            return item;
          }
        }
      }
      
      throw new Error('Itinerary item not found');
    } catch (error) {
      console.error('Error updating itinerary item status:', error);
      throw new Error('Failed to update itinerary item status');
    }
  }

  async generateItineraryWithAI(
    prompt: string, 
    baseInfo: { destination: string; numberOfDays: number; startDate: string }
  ): Promise<{ days: ItineraryDay[] }> {
    // This function would typically call the OpenAI service
    // For now, we'll return a placeholder that should be replaced by actual AI processing
    throw new Error('Method not implemented');
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
    try {
      const newBooking = await BookingModel.create(data);
      return this.mapBookingFromMongoose(newBooking);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  async getUserBookings(userId: number, type?: string): Promise<Booking[]> {
    try {
      const query: any = { userId };
      
      if (type) {
        query.type = type;
      }
      
      const bookings = await BookingModel.find(query).sort({ createdAt: -1 });
      return bookings.map(booking => this.mapBookingFromMongoose(booking));
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    try {
      const booking = await BookingModel.findById(id);
      if (!booking) return undefined;
      
      return this.mapBookingFromMongoose(booking);
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      return undefined;
    }
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    try {
      const updatedBooking = await BookingModel.findByIdAndUpdate(
        id, 
        { $set: { status } }, 
        { new: true }
      );
      
      if (!updatedBooking) {
        throw new Error('Booking not found');
      }
      
      return this.mapBookingFromMongoose(updatedBooking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }
  
  // Init sample data (will be called during startup)
  async initSampleData() {
    try {
      // Check if we already have data
      const userCount = await UserModel.countDocuments();
      if (userCount > 0) {
        console.log('Sample data already exists, skipping initialization');
        return;
      }
      
      console.log('Initializing sample data for MongoDB');
      
      // Create sample users
      const user1 = await UserModel.create({
        username: 'johndoe',
        password: 'password123', // In a real app, this would be hashed
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isAdmin: false
      });
      
      const user2 = await UserModel.create({
        username: 'admin',
        password: 'admin123', // In a real app, this would be hashed
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true
      });
      
      // Create sample destinations
      const destination1 = await DestinationModel.create({
        name: 'Paris',
        country: 'France',
        continent: 'Europe',
        description: 'The City of Light, known for its art, fashion, gastronomy, and culture.',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
        rating: 4.8,
        averageCost: 200,
        interests: ['Art', 'Food', 'History', 'Architecture'],
        isFeatured: true
      });
      
      const destination2 = await DestinationModel.create({
        name: 'Tokyo',
        country: 'Japan',
        continent: 'Asia',
        description: 'A vibrant mix of traditional and ultramodern culture.',
        imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc',
        rating: 4.7,
        averageCost: 180,
        interests: ['Technology', 'Food', 'Shopping', 'Culture'],
        isFeatured: true
      });
      
      const destination3 = await DestinationModel.create({
        name: 'New York',
        country: 'United States',
        continent: 'North America',
        description: 'The cultural, financial, and media capital of the world.',
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
        rating: 4.6,
        averageCost: 220,
        interests: ['Shopping', 'Arts', 'Food', 'Entertainment'],
        isFeatured: true
      });
      
      // Create sample restaurants
      const restaurant1 = await RestaurantModel.create({
        name: 'La Petite Bistro',
        description: 'Authentic French cuisine in a cozy setting.',
        imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092',
        location: 'Paris, France',
        distance: '1.2 km from city center',
        cuisine: ['French', 'European'],
        priceRange: '$$$',
        rating: 4.6,
        reviewCount: 256,
        openingTime: '11:00 - 23:00',
        isRecommended: true
      });
      
      const restaurant2 = await RestaurantModel.create({
        name: 'Sushi Master',
        description: 'Authentic Japanese sushi made by master chefs.',
        imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
        location: 'Tokyo, Japan',
        distance: '0.8 km from city center',
        cuisine: ['Japanese', 'Sushi'],
        priceRange: '$$$$',
        rating: 4.9,
        reviewCount: 423,
        openingTime: '12:00 - 22:00',
        isRecommended: true
      });
      
      // Create sample activities
      const activity1 = await ActivityModel.create({
        name: 'Eiffel Tower Tour',
        description: 'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris.',
        imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e',
        location: 'Paris, France',
        price: 25,
        currency: 'EUR',
        rating: 4.7,
        duration: '2 hours',
        category: ['Sightseeing', 'Landmarks'],
        isRecommended: true
      });
      
      const activity2 = await ActivityModel.create({
        name: 'Tokyo Food Tour',
        description: 'Explore the local cuisine of Tokyo with our expert guides.',
        imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
        location: 'Tokyo, Japan',
        price: 85,
        currency: 'USD',
        rating: 4.8,
        duration: '4 hours',
        category: ['Food', 'Walking Tour'],
        isRecommended: true
      });
      
      // Create sample itinerary
      const itinerary1 = await ItineraryModel.create({
        userId: user1._id,
        name: 'Weekend in Paris',
        destination: 'Paris',
        startDate: '2025-06-15',
        endDate: '2025-06-17',
        days: [
          {
            title: 'Day 1: Arrival and Exploration',
            date: '2025-06-15',
            items: [
              {
                title: 'Check-in at Hotel',
                description: 'Arrive and check in at your hotel in central Paris',
                type: 'accommodation',
                startTime: '14:00',
                endTime: '15:00',
                location: 'Hotel de Paris',
                status: 'confirmed'
              },
              {
                title: 'Eiffel Tower Visit',
                description: 'Visit the iconic Eiffel Tower',
                type: 'activity',
                startTime: '16:00',
                endTime: '18:00',
                location: 'Eiffel Tower',
                price: '25 EUR',
                status: 'confirmed'
              },
              {
                title: 'Dinner at La Petite Bistro',
                description: 'Enjoy authentic French cuisine',
                type: 'food',
                startTime: '19:30',
                endTime: '21:30',
                location: 'La Petite Bistro',
                status: 'pending'
              }
            ]
          },
          {
            title: 'Day 2: Art and Culture',
            date: '2025-06-16',
            items: [
              {
                title: 'Louvre Museum',
                description: 'Explore the world\'s largest art museum',
                type: 'activity',
                startTime: '10:00',
                endTime: '13:00',
                location: 'Louvre Museum',
                price: '17 EUR',
                status: 'none'
              },
              {
                title: 'Lunch at Café Marly',
                description: 'Lunch with a view of the Louvre Pyramid',
                type: 'food',
                startTime: '13:30',
                endTime: '15:00',
                location: 'Café Marly',
                status: 'none'
              }
            ]
          }
        ]
      });
      
      // Create sample booking
      const booking1 = await BookingModel.create({
        userId: user1._id,
        type: 'restaurant',
        itemId: restaurant1._id.toString(),
        date: '2025-06-15',
        time: '19:30',
        partySize: 2,
        status: 'pending',
        notes: 'Window table preferred',
        confirmationCode: ''
      });
      
      console.log('Sample data initialization complete');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
  
  // Helper methods to map between Mongoose and our interfaces
  private mapUserFromMongoose(user: any): User {
    return {
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
  
  private mapDestinationFromMongoose(destination: any): Destination {
    return {
      id: destination._id.toString(),
      name: destination.name,
      country: destination.country,
      continent: destination.continent,
      description: destination.description,
      imageUrl: destination.imageUrl,
      rating: destination.rating,
      averageCost: destination.averageCost,
      interests: destination.interests,
      isFeatured: destination.isFeatured,
      createdAt: destination.createdAt,
      updatedAt: destination.updatedAt
    };
  }
  
  private mapRestaurantFromMongoose(restaurant: any): Restaurant {
    return {
      id: restaurant._id.toString(),
      name: restaurant.name,
      description: restaurant.description,
      imageUrl: restaurant.imageUrl,
      location: restaurant.location,
      distance: restaurant.distance,
      cuisine: restaurant.cuisine,
      priceRange: restaurant.priceRange,
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
      openingTime: restaurant.openingTime,
      isRecommended: restaurant.isRecommended,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt
    };
  }
  
  private mapActivityFromMongoose(activity: any): Activity {
    return {
      id: activity._id.toString(),
      name: activity.name,
      description: activity.description,
      imageUrl: activity.imageUrl,
      location: activity.location,
      price: activity.price,
      currency: activity.currency,
      rating: activity.rating,
      duration: activity.duration,
      category: activity.category,
      isRecommended: activity.isRecommended,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt
    };
  }
  
  private mapItineraryFromMongoose(itinerary: any): Itinerary {
    return {
      id: itinerary._id.toString(),
      userId: itinerary.userId,
      name: itinerary.name,
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      days: itinerary.days.map((day: any) => ({
        id: day._id.toString(),
        title: day.title,
        date: day.date,
        items: day.items.map((item: any) => ({
          id: item._id.toString(),
          title: item.title,
          description: item.description,
          type: item.type,
          startTime: item.startTime,
          endTime: item.endTime,
          location: item.location,
          distance: item.distance,
          price: item.price,
          imageUrl: item.imageUrl,
          status: item.status,
          bookingReference: item.bookingReference
        }))
      })),
      createdAt: itinerary.createdAt,
      updatedAt: itinerary.updatedAt
    };
  }
  
  private mapBookingFromMongoose(booking: any): Booking {
    return {
      id: booking._id.toString(),
      userId: booking.userId,
      type: booking.type,
      itemId: booking.itemId,
      date: booking.date,
      time: booking.time,
      partySize: booking.partySize,
      status: booking.status,
      notes: booking.notes,
      confirmationCode: booking.confirmationCode,
      createdAt: booking.createdAt
    };
  }
}