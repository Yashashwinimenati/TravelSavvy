import type { Express } from "express";
import { createServer, type Server } from "http";

// Import controllers
import * as authController from "./controllers/auth";
import * as destinationsController from "./controllers/destinations";
import * as restaurantsController from "./controllers/restaurants";
import * as itinerariesController from "./controllers/itineraries";
import * as openaiController from "./controllers/openai";

// Import middleware
import { requireAuth } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/me', requireAuth, authController.getMe);

  // Destination routes
  app.get('/api/destinations', destinationsController.getAllDestinations);
  app.get('/api/destinations/featured', destinationsController.getFeaturedDestinations);
  app.get('/api/destinations/:id', destinationsController.getDestinationById);

  // Restaurant routes
  app.get('/api/restaurants', restaurantsController.getAllRestaurants);
  app.get('/api/restaurants/recommended', restaurantsController.getRecommendedRestaurants);
  app.get('/api/restaurants/:id', restaurantsController.getRestaurantById);
  app.post('/api/restaurants/book', requireAuth, restaurantsController.bookRestaurant);

  // Itinerary routes
  app.get('/api/itineraries/current', requireAuth, itinerariesController.getCurrentItinerary);
  app.get('/api/itineraries/user', requireAuth, itinerariesController.getUserItineraries);
  app.post('/api/itineraries', itinerariesController.createItinerary);
  app.get('/api/itineraries/:id', requireAuth, itinerariesController.getItineraryById);
  app.patch('/api/itineraries/:id', requireAuth, itinerariesController.updateItinerary);
  app.delete('/api/itineraries/:id', requireAuth, itinerariesController.deleteItinerary);
  app.patch('/api/itineraries/items/:itemId/status', requireAuth, itinerariesController.updateItemStatus);

  // OpenAI/Gemini routes
  app.post('/api/ai/query', openaiController.processQuery);
  app.post('/api/ai/generate-itinerary', openaiController.generateItinerary);
  app.post('/api/ai/restaurant-recommendations', openaiController.getRestaurantRecommendations);
  app.post('/api/ai/analyze-preferences', openaiController.analyzePreferences);
  app.post('/api/ai/voice-query', openaiController.processVoiceQuery);

  // Create and return HTTP server
  return createServer(app);
}