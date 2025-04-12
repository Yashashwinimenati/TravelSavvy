import { Request, Response } from "express";
import { storage } from "../storage";

// Get all destinations
export const getAllDestinations = async (req: Request, res: Response) => {
  try {
    const destinations = await storage.getAllDestinations();
    res.status(200).json(destinations);
  } catch (error) {
    console.error("Error getting destinations:", error);
    res.status(500).json({ message: "Failed to retrieve destinations" });
  }
};

// Get featured destinations
export const getFeaturedDestinations = async (req: Request, res: Response) => {
  try {
    const destinations = await storage.getFeaturedDestinations();
    res.status(200).json(destinations);
  } catch (error) {
    console.error("Error getting featured destinations:", error);
    res.status(500).json({ message: "Failed to retrieve featured destinations" });
  }
};

// Get destination by ID
export const getDestinationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const destination = await storage.getDestinationById(id);
    
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    res.status(200).json(destination);
  } catch (error) {
    console.error("Error getting destination:", error);
    res.status(500).json({ message: "Failed to retrieve destination" });
  }
};

// Get popular activities
export const getPopularActivities = async (req: Request, res: Response) => {
  try {
    const activities = await storage.getPopularActivities();
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error getting popular activities:", error);
    res.status(500).json({ message: "Failed to retrieve popular activities" });
  }
};

// Search destinations by criteria
export const searchDestinations = async (req: Request, res: Response) => {
  try {
    const { query, continent, interest } = req.query as {
      query?: string;
      continent?: string;
      interest?: string;
    };
    
    const destinations = await storage.searchDestinations({
      query: query || "",
      continent: continent || "",
      interest: interest || ""
    });
    
    res.status(200).json(destinations);
  } catch (error) {
    console.error("Error searching destinations:", error);
    res.status(500).json({ message: "Failed to search destinations" });
  }
};

// Get activities by destination
export const getActivitiesByDestination = async (req: Request, res: Response) => {
  try {
    const { destinationId } = req.params;
    const activities = await storage.getActivitiesByDestination(destinationId);
    
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error getting activities by destination:", error);
    res.status(500).json({ message: "Failed to retrieve activities" });
  }
};
