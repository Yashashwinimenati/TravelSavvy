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
    
    // OpenAI API quota exceeded, provide a fallback response
    let fallbackResponse = "";
    
    // Generate a simple fallback response based on common travel queries
    if (query.toLowerCase().includes("destination") || query.toLowerCase().includes("where")) {
      fallbackResponse = "Popular travel destinations include Paris, Tokyo, New York, Rome, and Bali. Each offers unique cultural experiences, cuisine, and attractions. Where would you like to know more about?";
    } else if (query.toLowerCase().includes("restaurant") || query.toLowerCase().includes("food") || query.toLowerCase().includes("eat")) {
      fallbackResponse = "When traveling, try local cuisine and restaurants recommended by locals. Food markets and family-owned establishments often provide authentic experiences. Would you like recommendations for a specific location?";
    } else if (query.toLowerCase().includes("itinerary") || query.toLowerCase().includes("plan")) {
      fallbackResponse = "A good travel itinerary balances sightseeing, relaxation, and free time for unexpected discoveries. Consider 2-3 major activities per day and leave room for spontaneity.";
    } else if (query.toLowerCase().includes("budget") || query.toLowerCase().includes("cost") || query.toLowerCase().includes("price")) {
      fallbackResponse = "Travel costs vary widely by destination, season, and style. Southeast Asia and parts of Latin America are budget-friendly, while Western Europe and Japan tend to be more expensive.";
    } else if (query.toLowerCase().includes("tip") || query.toLowerCase().includes("advice")) {
      fallbackResponse = "Some travel tips: research local customs before you go, learn a few phrases in the local language, keep digital copies of important documents, and pack less than you think you need.";
    } else {
      fallbackResponse = "I'm TravelSage, your travel assistant. I can help with destination information, restaurant recommendations, itinerary planning, and travel tips. What would you like to know about?";
    }
    
    // Return the fallback response
    res.status(200).json({
      response: fallbackResponse,
      tokens: {
        prompt: 0,
        completion: 0,
        total: 0
      }
    });
    
    /* 
    // This code is temporarily disabled due to API quota limits
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
    */
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
    
    // OpenAI API quota exceeded, provide a fallback response
    // Sample itinerary data for Paris (default)
    let destination = "Paris";
    let startDate = new Date();
    
    // Try to extract destination and dates from prompt
    if (prompt.toLowerCase().includes("tokyo") || prompt.toLowerCase().includes("japan")) {
      destination = "Tokyo";
    } else if (prompt.toLowerCase().includes("new york") || prompt.toLowerCase().includes("nyc")) {
      destination = "New York City";
    } else if (prompt.toLowerCase().includes("rome") || prompt.toLowerCase().includes("italy")) {
      destination = "Rome";
    } else if (prompt.toLowerCase().includes("bali") || prompt.toLowerCase().includes("indonesia")) {
      destination = "Bali";
    }
    
    // Generate dates for the itinerary
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Sample fallback itinerary data
    const fallbackItinerary = {
      "name": `Trip to ${destination}`,
      "destination": destination,
      "days": [
        {
          "title": `Day 1: Exploring ${destination}`,
          "date": dates[0],
          "items": [
            {
              "title": "Breakfast at hotel",
              "description": "Start your day with a delicious breakfast at your hotel.",
              "type": "food",
              "startTime": "08:00",
              "endTime": "09:00",
              "location": "Hotel",
              "price": "$",
              "status": "none"
            },
            {
              "title": destination === "Paris" ? "Visit the Eiffel Tower" : 
                      destination === "Tokyo" ? "Visit Tokyo Skytree" :
                      destination === "New York City" ? "Visit Empire State Building" :
                      destination === "Rome" ? "Visit the Colosseum" : "Visit Beach",
              "description": "Explore one of the most iconic landmarks in the city.",
              "type": "activity",
              "startTime": "10:00",
              "endTime": "12:00",
              "location": destination === "Paris" ? "Eiffel Tower" : 
                         destination === "Tokyo" ? "Tokyo Skytree" :
                         destination === "New York City" ? "Empire State Building" :
                         destination === "Rome" ? "Colosseum" : "Famous Beach",
              "distance": "2 km from hotel",
              "price": "$$",
              "status": "none"
            },
            {
              "title": "Lunch at local restaurant",
              "description": "Enjoy authentic local cuisine at a popular restaurant.",
              "type": "food",
              "startTime": "12:30",
              "endTime": "14:00",
              "location": "City Center",
              "price": "$$",
              "status": "none"
            },
            {
              "title": destination === "Paris" ? "Louvre Museum Tour" : 
                      destination === "Tokyo" ? "Senso-ji Temple Visit" :
                      destination === "New York City" ? "Metropolitan Museum of Art" :
                      destination === "Rome" ? "Vatican Museums" : "Cultural Tour",
              "description": "Immerse yourself in the local culture and history.",
              "type": "activity",
              "startTime": "14:30",
              "endTime": "17:00",
              "location": destination === "Paris" ? "Louvre Museum" : 
                         destination === "Tokyo" ? "Senso-ji Temple" :
                         destination === "New York City" ? "Metropolitan Museum" :
                         destination === "Rome" ? "Vatican City" : "Cultural Center",
              "distance": "3 km from lunch spot",
              "price": "$$",
              "status": "none"
            },
            {
              "title": "Dinner and evening stroll",
              "description": "Enjoy a relaxing dinner followed by an evening walk in a scenic area.",
              "type": "food",
              "startTime": "19:00",
              "endTime": "21:00",
              "location": destination === "Paris" ? "Seine River area" : 
                         destination === "Tokyo" ? "Shibuya" :
                         destination === "New York City" ? "Times Square" :
                         destination === "Rome" ? "Trastevere" : "Downtown",
              "price": "$$$",
              "status": "none"
            }
          ]
        },
        {
          "title": `Day 2: More ${destination} Adventures`,
          "date": dates[1],
          "items": [
            {
              "title": "Breakfast at local café",
              "description": "Try a different breakfast spot today.",
              "type": "food",
              "startTime": "08:30",
              "endTime": "09:30",
              "location": "Local Café",
              "price": "$",
              "status": "none"
            },
            {
              "title": destination === "Paris" ? "Montmartre Walk" : 
                      destination === "Tokyo" ? "Harajuku Exploration" :
                      destination === "New York City" ? "Central Park Walk" :
                      destination === "Rome" ? "Spanish Steps and Trevi Fountain" : "Nature Hike",
              "description": "Explore a different part of the city.",
              "type": "activity",
              "startTime": "10:00",
              "endTime": "13:00",
              "location": destination === "Paris" ? "Montmartre" : 
                         destination === "Tokyo" ? "Harajuku" :
                         destination === "New York City" ? "Central Park" :
                         destination === "Rome" ? "Historic Center" : "Natural Area",
              "distance": "4 km from hotel",
              "price": "$",
              "status": "none"
            },
            {
              "title": "Lunch and shopping",
              "description": "Enjoy lunch and then shop for souvenirs or local products.",
              "type": "food",
              "startTime": "13:00",
              "endTime": "16:00",
              "location": destination === "Paris" ? "Galeries Lafayette" : 
                         destination === "Tokyo" ? "Takeshita Street" :
                         destination === "New York City" ? "Fifth Avenue" :
                         destination === "Rome" ? "Via del Corso" : "Shopping District",
              "price": "$$",
              "status": "none"
            },
            {
              "title": destination === "Paris" ? "Seine River Cruise" : 
                      destination === "Tokyo" ? "Tokyo Bay Cruise" :
                      destination === "New York City" ? "Hudson River Cruise" :
                      destination === "Rome" ? "Tiber River Walk" : "Boat Tour",
              "description": "Relax and see the city from a different perspective.",
              "type": "activity",
              "startTime": "17:00",
              "endTime": "19:00",
              "location": "River/Bay Area",
              "price": "$$",
              "status": "none"
            },
            {
              "title": "Fine dining experience",
              "description": "Treat yourself to a special dinner tonight.",
              "type": "food",
              "startTime": "20:00",
              "endTime": "22:00",
              "location": "Upscale Restaurant",
              "price": "$$$$",
              "status": "none"
            }
          ]
        },
        {
          "title": `Day 3: Final Day in ${destination}`,
          "date": dates[2],
          "items": [
            {
              "title": "Leisurely breakfast",
              "description": "Take your time with breakfast today.",
              "type": "food",
              "startTime": "09:00",
              "endTime": "10:30",
              "location": "Hotel or nearby café",
              "price": "$$",
              "status": "none"
            },
            {
              "title": destination === "Paris" ? "Visit Versailles" : 
                      destination === "Tokyo" ? "Day trip to Kamakura" :
                      destination === "New York City" ? "Brooklyn Bridge & DUMBO" :
                      destination === "Rome" ? "Ostia Antica Archaeological Park" : "Day Trip",
              "description": "Take a short trip outside the main city center.",
              "type": "activity",
              "startTime": "11:00",
              "endTime": "16:00",
              "location": destination === "Paris" ? "Palace of Versailles" : 
                         destination === "Tokyo" ? "Kamakura" :
                         destination === "New York City" ? "Brooklyn" :
                         destination === "Rome" ? "Ostia Antica" : "Nearby Attraction",
              "distance": "30-60 minutes from city center",
              "price": "$$",
              "status": "none"
            },
            {
              "title": "Last dinner in the city",
              "description": "Enjoy your final evening meal with local specialties.",
              "type": "food",
              "startTime": "19:00",
              "endTime": "21:00",
              "location": "Local Restaurant",
              "price": "$$$",
              "status": "none"
            },
            {
              "title": "Evening farewell activity",
              "description": "Make the most of your last night with a special activity.",
              "type": "activity",
              "startTime": "21:30",
              "endTime": "23:00",
              "location": destination === "Paris" ? "Moulin Rouge Show" : 
                         destination === "Tokyo" ? "Karaoke in Shinjuku" :
                         destination === "New York City" ? "Broadway Show" :
                         destination === "Rome" ? "Evening Piazza Walk" : "Entertainment Venue",
              "price": "$$$",
              "status": "none"
            }
          ]
        }
      ]
    };
    
    res.status(200).json({
      itinerary: fallbackItinerary,
      tokens: {
        prompt: 0,
        completion: 0,
        total: 0
      }
    });
    
    /* 
    // This code is temporarily disabled due to API quota limits
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
    */
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
    
    // OpenAI API quota exceeded, provide a fallback response
    let userPreferences = preferences.toLowerCase();
    let userLocation = location ? location.toLowerCase() : "city center";
    
    // Default cuisine type based on preferences
    let cuisineType = "International";
    if (userPreferences.includes("italian") || userPreferences.includes("pasta") || userPreferences.includes("pizza")) {
      cuisineType = "Italian";
    } else if (userPreferences.includes("japanese") || userPreferences.includes("sushi")) {
      cuisineType = "Japanese";
    } else if (userPreferences.includes("chinese")) {
      cuisineType = "Chinese";
    } else if (userPreferences.includes("indian") || userPreferences.includes("curry")) {
      cuisineType = "Indian";
    } else if (userPreferences.includes("mexican") || userPreferences.includes("taco")) {
      cuisineType = "Mexican";
    } else if (userPreferences.includes("french")) {
      cuisineType = "French";
    } else if (userPreferences.includes("thai")) {
      cuisineType = "Thai";
    } else if (userPreferences.includes("vegetarian") || userPreferences.includes("vegan")) {
      cuisineType = "Vegetarian/Vegan";
    }
    
    // Price range
    let priceRange = "$$";
    if (userPreferences.includes("cheap") || userPreferences.includes("budget") || userPreferences.includes("affordable")) {
      priceRange = "$";
    } else if (userPreferences.includes("luxury") || userPreferences.includes("fine dining") || userPreferences.includes("expensive")) {
      priceRange = "$$$$";
    } else if (userPreferences.includes("mid-range") || userPreferences.includes("moderate")) {
      priceRange = "$$";
    }
    
    // Generate fallback recommendations
    const fallbackRecommendations = [
      {
        "name": `${cuisineType} Delight`,
        "cuisine": [cuisineType],
        "description": `A charming ${cuisineType.toLowerCase()} restaurant known for authentic flavors and welcoming atmosphere.`,
        "priceRange": priceRange,
        "location": `${userLocation}`,
        "recommendationReason": `Perfect for ${userPreferences.includes("family") ? "family dining" : userPreferences.includes("romantic") ? "a romantic evening" : "a casual meal"} with excellent ${cuisineType.toLowerCase()} cuisine.`
      },
      {
        "name": `${cuisineType} House`,
        "cuisine": [cuisineType],
        "description": `Popular spot offering traditional and modern ${cuisineType.toLowerCase()} dishes in a stylish setting.`,
        "priceRange": priceRange === "$" ? "$$" : priceRange === "$$$$" ? "$$$" : "$$",
        "location": `${userLocation}`,
        "recommendationReason": `Known for its exceptional service and ${userPreferences.includes("authentic") ? "authentic" : "creative"} approach to ${cuisineType.toLowerCase()} cooking.`
      },
      {
        "name": `The ${cuisineType} Experience`,
        "cuisine": [cuisineType, "Fusion"],
        "description": `Innovative restaurant blending ${cuisineType.toLowerCase()} traditions with modern culinary techniques.`,
        "priceRange": priceRange === "$" ? "$$" : priceRange === "$$" ? "$$$" : "$$$$",
        "location": `${userLocation}`,
        "recommendationReason": `Offers a unique dining experience with ${userPreferences.includes("view") ? "beautiful views and" : ""} inventive dishes that surprise and delight.`
      }
    ];
    
    // Add a vegetarian option if mentioned
    if (userPreferences.includes("vegetarian") || userPreferences.includes("vegan")) {
      fallbackRecommendations.push({
        "name": "Green Palette",
        "cuisine": ["Vegetarian", "Vegan", "Health Food"],
        "description": "Specializing in plant-based cuisine that satisfies even non-vegetarians.",
        "priceRange": priceRange,
        "location": `${userLocation}`,
        "recommendationReason": "Perfect for those seeking delicious vegetarian and vegan options with locally-sourced ingredients."
      });
    }
    
    // Add a local specialty restaurant
    fallbackRecommendations.push({
      "name": "Local Flavors",
      "cuisine": ["Regional", "Traditional"],
      "description": "A beloved restaurant showcasing the best local and regional specialties.",
      "priceRange": "$$",
      "location": `${userLocation}`,
      "recommendationReason": "Offers an authentic taste of local cuisine with recipes passed down through generations."
    });
    
    res.status(200).json({
      recommendations: fallbackRecommendations,
      tokens: {
        prompt: 0,
        completion: 0,
        total: 0
      }
    });
    
    /* 
    // This code is temporarily disabled due to API quota limits
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
    */
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
