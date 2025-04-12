import { Request, Response } from "express";
import OpenAI from "openai";
import { storage } from "../storage";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Process a general query
export const processQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }
    
    // Process with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a helpful travel assistant named TravelSage. You provide concise, informative responses about travel destinations, restaurants, activities, and general travel advice. Be friendly and conversational."
        },
        {
          role: "user",
          content: query
        }
      ]
    });
    
    res.status(200).json({
      response: response.choices[0].message.content,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      }
    });
  } catch (error: any) {
    console.error("OpenAI query error:", error);
    res.status(500).json({ 
      message: "Failed to process query",
      error: error.message || "Unknown error"
    });
  }
};

// Generate an itinerary
export const generateItinerary = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    
    // Process with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI travel planner that creates detailed itineraries. 
          Generate a travel itinerary based on user preferences. 
          The output should be a JSON object with the following structure:
          {
            "name": "Trip name",
            "destination": "Main destination",
            "days": [
              {
                "title": "Day 1: Title",
                "date": "YYYY-MM-DD", // Leave as empty string if no date provided
                "items": [
                  {
                    "title": "Activity name",
                    "description": "Detailed description",
                    "type": "activity|food|transportation|accommodation",
                    "startTime": "HH:MM", // 24-hour format
                    "endTime": "HH:MM", // 24-hour format
                    "location": "Location name",
                    "distance": "Distance from previous or hotel", // Optional
                    "price": "Price range or exact amount", // Optional
                    "status": "none" // Default status
                  }
                ]
              }
            ]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const itineraryData = JSON.parse(response.choices[0].message.content || "{}");
    
    res.status(200).json({
      itinerary: itineraryData,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      }
    });
  } catch (error: any) {
    console.error("OpenAI itinerary generation error:", error);
    res.status(500).json({ 
      message: "Failed to generate itinerary",
      error: error.message || "Unknown error"
    });
  }
};

// Get restaurant recommendations
export const getRestaurantRecommendations = async (req: Request, res: Response) => {
  try {
    const { preferences, location } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ message: "Preferences are required" });
    }
    
    // Process with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a restaurant recommendation system. Based on the user's preferences and location (if provided), 
          generate a list of restaurant recommendations.
          The output should be a JSON array with the following structure for each restaurant:
          [
            {
              "name": "Restaurant name",
              "cuisine": ["Cuisine type"],
              "description": "Brief description",
              "priceRange": "$/$$/$$$/$$$$",
              "location": "Location/address",
              "recommendationReason": "Why you recommend this"
            }
          ]`
        },
        {
          role: "user",
          content: `Preferences: ${preferences}${location ? `\nLocation: ${location}` : ""}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const recommendationsData = JSON.parse(response.choices[0].message.content || "[]");
    
    res.status(200).json({
      recommendations: recommendationsData,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      }
    });
  } catch (error: any) {
    console.error("OpenAI restaurant recommendations error:", error);
    res.status(500).json({ 
      message: "Failed to generate restaurant recommendations",
      error: error.message || "Unknown error"
    });
  }
};

// Analyze user preferences
export const analyzePreferences = async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    
    if (!input) {
      return res.status(400).json({ message: "Input is required" });
    }
    
    // Process with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Analyze the user's text input and extract travel preferences.
          The output should be a JSON object with the following structure:
          {
            "destinations": ["List of mentioned destinations"],
            "interests": ["List of activities or interests"],
            "cuisines": ["Food preferences"],
            "budget": "Budget level (low/medium/high)",
            "travelStyle": ["Adventure/luxury/cultural/etc"],
            "travelDuration": "Number of days if mentioned",
            "accommodation": ["Preferences like hotel/hostel/etc"]
          }`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const preferencesData = JSON.parse(response.choices[0].message.content || "{}");
    
    res.status(200).json({
      preferences: preferencesData,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      }
    });
  } catch (error: any) {
    console.error("OpenAI preferences analysis error:", error);
    res.status(500).json({ 
      message: "Failed to analyze preferences",
      error: error.message || "Unknown error"
    });
  }
};

// Process voice query
export const processVoiceQuery = async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ message: "Transcript is required" });
    }
    
    // Process with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Analyze the voice transcript and identify the intent of the query. Determine if it's:
          1. A restaurant search/booking
          2. An itinerary request
          3. A destination query
          4. A general travel question
          The output should be a JSON object with the following structure:
          {
            "intent": "restaurant_search|restaurant_booking|itinerary|destination|general",
            "entities": {
              "destination": "Extracted destination",
              "cuisine": "For restaurant searches",
              "date": "Extracted date if any",
              "time": "Extracted time if any",
              "partySize": "Number of people if mentioned",
              "preferences": ["Any other preferences mentioned"]
            },
            "response": "A natural language response to the query"
          }`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const voiceAnalysisData = JSON.parse(response.choices[0].message.content || "{}");
    
    res.status(200).json({
      ...voiceAnalysisData,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      }
    });
  } catch (error: any) {
    console.error("OpenAI voice query processing error:", error);
    res.status(500).json({ 
      message: "Failed to process voice query",
      error: error.message || "Unknown error"
    });
  }
};
