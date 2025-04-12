import { Request, Response } from "express";
import { storage } from "../storage";
import { format, addDays } from "date-fns";

// Get current/active itinerary
export const getCurrentItinerary = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const itinerary = await storage.getCurrentItinerary(Number(userId));
    
    if (!itinerary) {
      return res.status(404).json({ message: "No active itinerary found" });
    }
    
    res.status(200).json(itinerary);
  } catch (error) {
    console.error("Error getting current itinerary:", error);
    res.status(500).json({ message: "Failed to retrieve current itinerary" });
  }
};

// Get all user itineraries
export const getUserItineraries = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const itineraries = await storage.getUserItineraries(Number(userId));
    res.status(200).json(itineraries);
  } catch (error) {
    console.error("Error getting user itineraries:", error);
    res.status(500).json({ message: "Failed to retrieve user itineraries" });
  }
};

// Create a new itinerary
export const createItinerary = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId || 0; // Use 0 as default user ID if not authenticated
    
    const { name, destination, numberOfDays, startDate, prompt } = req.body;
    
    if (!name || !destination || !numberOfDays || !startDate) {
      return res.status(400).json({ 
        message: "Name, destination, number of days, and start date are required" 
      });
    }
    
    // Calculate end date based on number of days
    const parsedStartDate = new Date(startDate);
    const endDate = format(addDays(parsedStartDate, numberOfDays - 1), 'yyyy-MM-dd');
    
    // Create empty days for the itinerary
    const days = [];
    for (let i = 0; i < numberOfDays; i++) {
      const date = format(addDays(parsedStartDate, i), 'yyyy-MM-dd');
      days.push({
        title: `Day ${i + 1} in ${destination}`,
        date,
        items: []
      });
    }
    
    // If prompt is provided, use AI to generate itinerary content
    let generatedDays = days;
    if (prompt) {
      try {
        const aiData = await storage.generateItineraryWithAI(prompt, {
          destination,
          numberOfDays,
          startDate
        });
        
        if (aiData && aiData.days && aiData.days.length > 0) {
          generatedDays = aiData.days;
        }
      } catch (aiError) {
        console.error("AI itinerary generation error:", aiError);
        // Continue with empty days if AI fails
      }
    }
    
    // Create the itinerary
    const itinerary = await storage.createItinerary({
      userId: Number(userId),
      name,
      destination,
      startDate,
      endDate,
      days: generatedDays
    });
    
    // Set as current itinerary
    await storage.setCurrentItinerary(Number(userId), itinerary.id);
    
    res.status(201).json(itinerary);
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ message: "Failed to create itinerary" });
  }
};

// Get itinerary by ID
export const getItineraryById = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { id } = req.params;
    const itinerary = await storage.getItineraryById(id);
    
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    
    // Check if the itinerary belongs to the user
    if (itinerary.userId !== Number(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.status(200).json(itinerary);
  } catch (error) {
    console.error("Error getting itinerary:", error);
    res.status(500).json({ message: "Failed to retrieve itinerary" });
  }
};

// Update an itinerary
export const updateItinerary = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { id } = req.params;
    const { name, destination, startDate, endDate, days } = req.body;
    
    // Check if the itinerary exists
    const existingItinerary = await storage.getItineraryById(id);
    
    if (!existingItinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    
    // Check if the itinerary belongs to the user
    if (existingItinerary.userId !== Number(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Update the itinerary
    const updatedItinerary = await storage.updateItinerary(id, {
      name: name || existingItinerary.name,
      destination: destination || existingItinerary.destination,
      startDate: startDate || existingItinerary.startDate,
      endDate: endDate || existingItinerary.endDate,
      days: days || existingItinerary.days
    });
    
    res.status(200).json(updatedItinerary);
  } catch (error) {
    console.error("Error updating itinerary:", error);
    res.status(500).json({ message: "Failed to update itinerary" });
  }
};

// Delete an itinerary
export const deleteItinerary = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { id } = req.params;
    
    // Check if the itinerary exists
    const existingItinerary = await storage.getItineraryById(id);
    
    if (!existingItinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    
    // Check if the itinerary belongs to the user
    if (existingItinerary.userId !== Number(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Delete the itinerary
    await storage.deleteItinerary(id);
    
    res.status(200).json({ message: "Itinerary deleted successfully" });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    res.status(500).json({ message: "Failed to delete itinerary" });
  }
};

// Update itinerary item status
export const updateItemStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { itemId } = req.params;
    const { status } = req.body;
    
    if (!status || !['confirmed', 'pending', 'cancelled', 'none'].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" });
    }
    
    // Find the itinerary that contains this item
    const itinerary = await storage.getItineraryByItemId(itemId);
    
    if (!itinerary) {
      return res.status(404).json({ message: "Item not found in any itinerary" });
    }
    
    // Check if the itinerary belongs to the user
    if (itinerary.userId !== Number(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Update the item status
    const updatedItem = await storage.updateItineraryItemStatus(itemId, status);
    
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).json({ message: "Failed to update item status" });
  }
};
