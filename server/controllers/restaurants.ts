import { Request, Response } from "express";
import { storage } from "../storage";

// Get all restaurants
export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await storage.getAllRestaurants();
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error getting restaurants:", error);
    res.status(500).json({ message: "Failed to retrieve restaurants" });
  }
};

// Get recommended restaurants
// export const getRecommendedRestaurants = async (req: Request, res: Response) => {
//   try {
//     const userId = req.session.userId;
    
//     // If user is logged in, get personalized recommendations
//     if (userId) {
//       const recommendations = await storage.getRecommendedRestaurantsForUser(Number(userId));
//       return res.status(200).json(recommendations);
//     }
    
//     // Otherwise get general recommendations
//     const recommendations = await storage.getRecommendedRestaurants();
//     res.status(200).json(recommendations);
//   } catch (error) {
//     console.error("Error getting recommended restaurants:", error);
//     res.status(500).json({ message: "Failed to retrieve restaurant recommendations" });
//   }
// };

// Get restaurant by ID
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await storage.getRestaurantById(id);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error getting restaurant:", error);
    res.status(500).json({ message: "Failed to retrieve restaurant" });
  }
};

// Book a restaurant
export const bookRestaurant = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { restaurantId, date, time, partySize, notes } = req.body;
    
    if (!restaurantId || !date || !time) {
      return res.status(400).json({ message: "Restaurant ID, date, and time are required" });
    }
    
    // Check if restaurant exists
    const restaurant = await storage.getRestaurantById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    // Create booking
    const booking = await storage.createBooking({
      userId: Number(userId),
      type: 'restaurant',
      itemId: restaurantId,
      date,
      time,
      partySize: Number(partySize) || 2,
      notes: notes || "",
      status: 'confirmed',
      confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase()
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error("Error booking restaurant:", error);
    res.status(500).json({ message: "Failed to book restaurant" });
  }
};

// Search restaurants by criteria
export const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const { query, cuisine, priceRange } = req.query as {
      query?: string;
      cuisine?: string;
      priceRange?: string;
    };
    
    const restaurants = await storage.searchRestaurants({
      query: query || "",
      cuisine: cuisine || "",
      priceRange: priceRange || ""
    });
    
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error searching restaurants:", error);
    res.status(500).json({ message: "Failed to search restaurants" });
  }
};

// Get restaurants by location
export const getRestaurantsByLocation = async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const restaurants = await storage.getRestaurantsByLocation(location);
    
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error getting restaurants by location:", error);
    res.status(500).json({ message: "Failed to retrieve restaurants" });
  }
};

// Get user's restaurant bookings
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const bookings = await storage.getUserBookings(Number(userId), 'restaurant');
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error getting user bookings:", error);
    res.status(500).json({ message: "Failed to retrieve bookings" });
  }
};
