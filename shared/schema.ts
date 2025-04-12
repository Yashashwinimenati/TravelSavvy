import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isAdmin: boolean("is_admin").default(false)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
});

// Destinations table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  continent: text("continent").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating"),
  averageCost: integer("average_cost"),
  interests: text("interests").array(),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertDestinationSchema = createInsertSchema(destinations).pick({
  name: true,
  country: true,
  continent: true,
  description: true,
  imageUrl: true,
  rating: true,
  averageCost: true,
  interests: true,
  isFeatured: true
});

// Restaurants table
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  location: text("location").notNull(),
  distance: text("distance"),
  cuisine: text("cuisine").array(),
  priceRange: text("price_range").notNull(),
  rating: integer("rating"),
  reviewCount: integer("review_count"),
  openingTime: text("opening_time"),
  isRecommended: boolean("is_recommended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertRestaurantSchema = createInsertSchema(restaurants).pick({
  name: true,
  description: true,
  imageUrl: true,
  location: true,
  distance: true,
  cuisine: true,
  priceRange: true,
  rating: true,
  reviewCount: true,
  openingTime: true,
  isRecommended: true
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  location: text("location").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").default("USD"),
  rating: integer("rating"),
  duration: text("duration"),
  category: text("category").array(),
  isRecommended: boolean("is_recommended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  name: true,
  description: true,
  imageUrl: true,
  location: true,
  price: true,
  currency: true,
  rating: true,
  duration: true,
  category: true,
  isRecommended: true
});

// Itineraries table
export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  days: text("days").notNull(), // Stored as JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertItinerarySchema = createInsertSchema(itineraries).pick({
  userId: true,
  name: true,
  destination: true,
  startDate: true,
  endDate: true,
  days: true
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'restaurant', 'activity', 'accommodation'
  itemId: text("item_id").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  partySize: integer("party_size"),
  status: text("status").notNull(), // 'confirmed', 'pending', 'cancelled'
  notes: text("notes"),
  confirmationCode: text("confirmation_code"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  type: true,
  itemId: true,
  date: true,
  time: true,
  partySize: true,
  status: true,
  notes: true,
  confirmationCode: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
