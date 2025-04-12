import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "../storage";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Process a general query
export const processQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }
    
    // OpenAI API quota exceeded, provide a fallback response
    let fallbackResponse = "";
    
    // Generate detailed, personalized fallback responses with rich information
    if (query.toLowerCase().includes("destination") || query.toLowerCase().includes("where")) {
      fallbackResponse = "🌎 Let me be your destination expert! Here are some carefully curated suggestions based on different travel styles:\n\n" +
        "🏛️ Cultural Capitals:\n" +
        "- Paris: Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, charming cafés\n" +
        "- Rome: Colosseum, Vatican Museums, Roman Forum, authentic Italian cuisine\n" +
        "- Kyoto: Ancient temples, tea ceremonies, zen gardens, traditional ryokans\n\n" +
        "🏖️ Tropical Paradise:\n" +
        "- Bali: Rice terraces, Hindu temples, yoga retreats, surf spots\n" +
        "- Maldives: Overwater villas, coral reefs, crystal waters, sunset cruises\n" +
        "- Phuket: White sand beaches, Thai cuisine, island hopping, spa treatments\n\n" +
        "🌆 Urban Adventures:\n" +
        "- Tokyo: Shibuya Crossing, robot restaurants, anime culture, bullet trains\n" +
        "- New York: Times Square, Central Park, Broadway shows, diverse food scene\n" +
        "- Dubai: Burj Khalifa, desert safaris, gold souks, luxury shopping\n\n" +
        "🏔️ Nature & Adventure:\n" +
        "- New Zealand: Hobbiton, fjords, bungee jumping, Maori culture\n" +
        "- Costa Rica: Rainforest ziplines, volcanoes, wildlife sanctuaries\n" +
        "- Switzerland: Alpine hiking, ski resorts, scenic train journeys\n\n" +
        "Which of these experiences captures your imagination? I can provide detailed itineraries, best times to visit, and insider tips for any destination! 🌟";
    } else if (query.toLowerCase().includes("restaurant") || query.toLowerCase().includes("food") || query.toLowerCase().includes("eat")) {
      fallbackResponse = "🍽️ Let me guide you through the world of culinary delights!\n\n" +
        "🌏 Must-Try Regional Specialties:\n" +
        "- Japan: Sushi at Tsukiji Market, Ramen in Fukuoka, Wagyu in Kobe\n" +
        "- Italy: Pasta in Rome, Pizza in Naples, Risotto in Milan\n" +
        "- Thailand: Pad Thai in Bangkok, Green Curry, Mango Sticky Rice\n" +
        "- France: Croissants in Paris, Bouillabaisse in Marseille\n\n" +
        "🔍 Expert Tips for Finding Authentic Food:\n" +
        "- Follow the local crowd during lunch hours\n" +
        "- Explore bustling food markets and street stalls\n" +
        "- Look for restaurants with handwritten menus\n" +
        "- Avoid tourist traps near major attractions\n" +
        "- Use local food apps and review sites\n\n" +
        "💡 Hidden Gem Indicators:\n" +
        "- Lines of locals waiting to eat\n" +
        "- Family-run establishments\n" +
        "- Seasonal menu changes\n" +
        "- Limited seating capacity\n" +
        "- Specialization in one type of dish\n\n" +
        "Would you like specific recommendations for a particular cuisine or destination? I can suggest everything from street food to fine dining! 🌟";
    } else if (query.toLowerCase().includes("itinerary") || query.toLowerCase().includes("plan")) {
      fallbackResponse = "Let me help you create the perfect travel itinerary! Here's my framework for a balanced trip:\n\n" +
        "📅 Morning: Start with major attractions when they're less crowded\n" +
        "🌅 Afternoon: Mix in smaller sites, shopping, or relaxation\n" +
        "🌙 Evening: Experience local culture through food and entertainment\n\n" +
        "Key tips:\n" +
        "- Plan 2-3 major activities per day\n" +
        "- Include buffer time for spontaneous discoveries\n" +
        "- Group activities by location to minimize travel time\n" +
        "- Schedule rest days for longer trips\n\n" +
        "Would you like me to help plan a specific itinerary?";
    } else if (query.toLowerCase().includes("budget") || query.toLowerCase().includes("cost") || query.toLowerCase().includes("price")) {
      fallbackResponse = "Let me break down travel costs to help you plan better!\n\n" +
        "💰 Budget considerations by region:\n" +
        "- Budget-friendly: Southeast Asia ($30-50/day), Eastern Europe ($40-60/day)\n" +
        "- Mid-range: Southern Europe ($100-150/day), Japan ($150-200/day)\n" +
        "- Luxury: Western Europe ($200+/day), Maldives ($300+/day)\n\n" +
        "Money-saving tips:\n" +
        "- Book accommodations in advance\n" +
        "- Travel during shoulder season\n" +
        "- Use public transportation\n" +
        "- Look for free walking tours and attractions\n\n" +
        "Would you like specific budget advice for a destination?";
    } else if (query.toLowerCase().includes("tip") || query.toLowerCase().includes("advice")) {
      fallbackResponse = "Here are my top travel tips for a smooth and enjoyable journey:\n\n" +
        "✈️ Before departure:\n" +
        "- Research local customs and basic phrases\n" +
        "- Make digital copies of important documents\n" +
        "- Download offline maps and translation apps\n\n" +
        "🎒 Packing smart:\n" +
        "- Pack versatile clothing layers\n" +
        "- Bring a portable charger and adapters\n" +
        "- Pack essentials in carry-on\n\n" +
        "🌍 During your trip:\n" +
        "- Stay flexible with your plans\n" +
        "- Try local experiences\n" +
        "- Keep emergency contacts handy\n\n" +
        "Would you like more specific tips for your upcoming trip?";
    } else {
      fallbackResponse = "👋 Hello! I'm TravelSage, your personal travel expert. I can help you with:\n\n" +
        "🌎 Destination recommendations\n" +
        "🍽️ Restaurant suggestions\n" +
        "📅 Custom itinerary planning\n" +
        "💰 Budget advice\n" +
        "✈️ Travel tips and best practices\n\n" +
        "What aspect of travel would you like to explore?";
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
    
    // OpenAI API quota exceeded, provide a fallback response
    const inputLower = input.toLowerCase();
    
    // Create fallback analysis with basic pattern matching
    const fallbackPreferences: any = {
      destinations: [],
      interests: [],
      cuisines: [],
      budget: "medium",
      travelStyle: [],
      travelDuration: "",
      accommodation: []
    };
    
    // Extract destinations
    const destinations = [
      "Paris", "Tokyo", "New York", "London", "Rome", "Barcelona", "Sydney",
      "Amsterdam", "Dubai", "Singapore", "Bangkok", "Hong Kong", "San Francisco", 
      "Los Angeles", "Chicago", "Miami", "Las Vegas", "Orlando", "Bali", "Hawaii",
      "Italy", "France", "Japan", "Thailand", "Spain", "Germany", "Australia",
      "Canada", "Mexico", "Brazil", "China", "India", "Greece", "Portugal"
    ];
    
    for (const dest of destinations) {
      if (inputLower.includes(dest.toLowerCase())) {
        fallbackPreferences.destinations.push(dest);
      }
    }
    
    // Extract interests
    const interestPatterns = {
      "hiking": ["hiking", "hike", "trail", "trekking", "mountain"],
      "museums": ["museum", "art", "gallery", "exhibit", "history"],
      "beaches": ["beach", "sand", "ocean", "swimming", "sunbathing"],
      "shopping": ["shopping", "shop", "mall", "boutique", "market"],
      "nightlife": ["nightlife", "party", "club", "bar", "dancing"],
      "dining": ["restaurant", "dining", "food tour", "culinary", "gastronomy"],
      "sightseeing": ["sightseeing", "landmark", "monument", "tour", "attractions"],
      "adventure": ["adventure", "adrenaline", "extreme", "exciting", "thrill"],
      "relaxation": ["relaxation", "spa", "retreat", "peaceful", "tranquil"],
      "cultural": ["cultural", "culture", "local", "tradition", "authentic"]
    };
    
    for (const [interest, patterns] of Object.entries(interestPatterns)) {
      for (const pattern of patterns) {
        if (inputLower.includes(pattern)) {
          fallbackPreferences.interests.push(interest);
          break;
        }
      }
    }
    
    // Extract cuisine preferences
    const cuisinePatterns = {
      "Italian": ["italian", "pasta", "pizza", "mediterranean"],
      "Japanese": ["japanese", "sushi", "ramen", "tempura"],
      "Chinese": ["chinese", "dim sum", "asian"],
      "Mexican": ["mexican", "tacos", "spicy"],
      "Indian": ["indian", "curry", "spicy"],
      "French": ["french", "pastry", "gourmet"],
      "Thai": ["thai", "spicy"],
      "Vegetarian/Vegan": ["vegetarian", "vegan", "plant-based"],
      "Seafood": ["seafood", "fish", "ocean"],
      "Street Food": ["street food", "local food", "authentic"]
    };
    
    for (const [cuisine, patterns] of Object.entries(cuisinePatterns)) {
      for (const pattern of patterns) {
        if (inputLower.includes(pattern)) {
          fallbackPreferences.cuisines.push(cuisine);
          break;
        }
      }
    }
    
    // Extract budget preference
    if (inputLower.includes("luxury") || 
        inputLower.includes("high-end") || 
        inputLower.includes("five star") || 
        inputLower.includes("5 star") ||
        inputLower.includes("premium") ||
        inputLower.includes("expensive")) {
      fallbackPreferences.budget = "high";
    } else if (inputLower.includes("budget") || 
               inputLower.includes("cheap") || 
               inputLower.includes("affordable") ||
               inputLower.includes("low cost") ||
               inputLower.includes("economy") ||
               inputLower.includes("inexpensive")) {
      fallbackPreferences.budget = "low";
    }
    
    // Extract travel style
    const travelStylePatterns = {
      "Adventure": ["adventure", "exciting", "thrill", "action"],
      "Luxury": ["luxury", "luxurious", "high-end", "premium", "exclusive"],
      "Cultural": ["cultural", "culture", "history", "authentic", "local"],
      "Family": ["family", "kid", "children", "family-friendly"],
      "Solo": ["solo", "alone", "by myself", "independent"],
      "Romantic": ["romantic", "couple", "honeymoon", "anniversary"],
      "Backpacking": ["backpack", "backpacking", "budget", "hostel"],
      "Eco-friendly": ["eco", "sustainable", "green", "responsible"],
      "Photography": ["photo", "photography", "instagram", "camera"],
      "Foodie": ["food", "culinary", "cuisine", "dining", "restaurant"]
    };
    
    for (const [style, patterns] of Object.entries(travelStylePatterns)) {
      for (const pattern of patterns) {
        if (inputLower.includes(pattern)) {
          fallbackPreferences.travelStyle.push(style);
          break;
        }
      }
    }
    
    // Extract travel duration
    const durationRegex = /(\d+)\s+(day|days|week|weeks|month|months)/i;
    const durationMatch = input.match(durationRegex);
    if (durationMatch) {
      const number = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      
      if (unit === "week" || unit === "weeks") {
        fallbackPreferences.travelDuration = `${number * 7} days`;
      } else if (unit === "month" || unit === "months") {
        fallbackPreferences.travelDuration = `${number * 30} days`;
      } else {
        fallbackPreferences.travelDuration = `${number} days`;
      }
    }
    
    // Extract accommodation preferences
    const accommodationPatterns = {
      "Hotel": ["hotel", "resort", "5-star", "4-star", "3-star"],
      "Hostel": ["hostel", "dorm", "backpacker"],
      "Apartment": ["apartment", "flat", "airbnb", "rental"],
      "Villa": ["villa", "house", "cottage", "cabin"],
      "Camping": ["camping", "tent", "camper", "rv", "glamping"],
      "Boutique": ["boutique", "unique", "charming", "small hotel"]
    };
    
    for (const [accomm, patterns] of Object.entries(accommodationPatterns)) {
      for (const pattern of patterns) {
        if (inputLower.includes(pattern)) {
          fallbackPreferences.accommodation.push(accomm);
          break;
        }
      }
    }
    
    // If nothing matched, add some defaults
    if (fallbackPreferences.destinations.length === 0) {
      fallbackPreferences.destinations = ["Paris", "Tokyo", "New York"];
    }
    
    if (fallbackPreferences.interests.length === 0) {
      fallbackPreferences.interests = ["sightseeing", "cultural", "dining"];
    }
    
    if (fallbackPreferences.cuisines.length === 0) {
      fallbackPreferences.cuisines = ["local cuisine"];
    }
    
    if (fallbackPreferences.travelStyle.length === 0) {
      fallbackPreferences.travelStyle = ["Cultural"];
    }
    
    if (fallbackPreferences.accommodation.length === 0) {
      fallbackPreferences.accommodation = ["Hotel"];
    }
    
    if (!fallbackPreferences.travelDuration) {
      fallbackPreferences.travelDuration = "7 days";
    }
    
    // Remove duplicates from arrays
    fallbackPreferences.destinations = [...new Set(fallbackPreferences.destinations)];
    fallbackPreferences.interests = [...new Set(fallbackPreferences.interests)];
    fallbackPreferences.cuisines = [...new Set(fallbackPreferences.cuisines)];
    fallbackPreferences.travelStyle = [...new Set(fallbackPreferences.travelStyle)];
    fallbackPreferences.accommodation = [...new Set(fallbackPreferences.accommodation)];
    
    res.status(200).json({
      preferences: fallbackPreferences,
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
    */
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
    
    // OpenAI API quota exceeded, provide a fallback response
    let transcriptLower = transcript.toLowerCase();
    let intent = "general";
    let destination = "";
    let cuisine = "";
    let date = "";
    let time = "";
    let partySize = "";
    let preferences = [];
    let response = "I'm sorry, I didn't fully understand your request. Could you please provide more details?";
    
    // Detect intent
    if (transcriptLower.includes("restaurant") || 
        transcriptLower.includes("eat") || 
        transcriptLower.includes("food") ||
        transcriptLower.includes("dining") ||
        transcriptLower.includes("lunch") ||
        transcriptLower.includes("dinner")) {
      
      if (transcriptLower.includes("book") || 
          transcriptLower.includes("reserve") || 
          transcriptLower.includes("reservation") ||
          transcriptLower.includes("table")) {
        intent = "restaurant_booking";
        response = "I can help you book a restaurant. Would you like me to find available options?";
      } else {
        intent = "restaurant_search";
        response = "I can help you find restaurants. What type of cuisine are you interested in?";
      }
      
      // Extract cuisine
      if (transcriptLower.includes("italian")) {
        cuisine = "Italian";
        preferences.push("Italian cuisine");
      } else if (transcriptLower.includes("mexican")) {
        cuisine = "Mexican";
        preferences.push("Mexican cuisine");
      } else if (transcriptLower.includes("japanese") || transcriptLower.includes("sushi")) {
        cuisine = "Japanese";
        preferences.push("Japanese cuisine");
      } else if (transcriptLower.includes("chinese")) {
        cuisine = "Chinese";
        preferences.push("Chinese cuisine");
      } else if (transcriptLower.includes("indian")) {
        cuisine = "Indian";
        preferences.push("Indian cuisine");
      } else if (transcriptLower.includes("french")) {
        cuisine = "French";
        preferences.push("French cuisine");
      } else if (transcriptLower.includes("thai")) {
        cuisine = "Thai";
        preferences.push("Thai cuisine");
      }
      
      // Extract party size
      const partySizeRegex = /(\d+)\s+(people|person|guests?|diners?)/i;
      const partySizeMatch = transcript.match(partySizeRegex);
      if (partySizeMatch) {
        partySize = partySizeMatch[1];
      }
      
      // Extract date
      const today = new Date();
      if (transcriptLower.includes("today")) {
        date = today.toISOString().split('T')[0];
      } else if (transcriptLower.includes("tomorrow")) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        date = tomorrow.toISOString().split('T')[0];
      } else if (transcriptLower.includes("next week")) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        date = nextWeek.toISOString().split('T')[0];
      }
      
      // Extract time
      const timeRegex = /(\d{1,2})(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.)/i;
      const timeMatch = transcript.match(timeRegex);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? timeMatch[2].substring(1) : "00";
        const period = timeMatch[3].toLowerCase();
        
        if ((period === "pm" || period === "p.m.") && hour < 12) {
          hour += 12;
        } else if ((period === "am" || period === "a.m.") && hour === 12) {
          hour = 0;
        }
        
        time = `${hour.toString().padStart(2, '0')}:${minutes}`;
      }
      
    } else if (transcriptLower.includes("itinerary") || 
              transcriptLower.includes("plan") || 
              transcriptLower.includes("schedule") ||
              transcriptLower.includes("trip") ||
              transcriptLower.includes("vacation")) {
      intent = "itinerary";
      response = "I can help you plan your trip. Which destination are you interested in?";
    } else if (transcriptLower.includes("destination") || 
              transcriptLower.includes("place") || 
              transcriptLower.includes("location") ||
              transcriptLower.includes("where") ||
              transcriptLower.includes("country") ||
              transcriptLower.includes("city")) {
      intent = "destination";
      response = "I can provide information about various travel destinations. Which places are you curious about?";
    }
    
    // Extract destination
    const destinations = [
      "Paris", "Tokyo", "New York", "London", "Rome", "Barcelona", "Sydney",
      "Amsterdam", "Dubai", "Singapore", "Bangkok", "Hong Kong", "San Francisco", 
      "Los Angeles", "Chicago", "Miami", "Las Vegas", "Orlando", "Bali", "Hawaii"
    ];
    
    for (const dest of destinations) {
      if (transcriptLower.includes(dest.toLowerCase())) {
        destination = dest;
        break;
      }
    }
    
    // Extract additional preferences
    if (transcriptLower.includes("vegetarian") || transcriptLower.includes("vegan")) {
      preferences.push("Vegetarian/Vegan options");
    }
    if (transcriptLower.includes("gluten free") || transcriptLower.includes("gluten-free")) {
      preferences.push("Gluten-free options");
    }
    if (transcriptLower.includes("romantic") || transcriptLower.includes("date")) {
      preferences.push("Romantic setting");
    }
    if (transcriptLower.includes("family") || transcriptLower.includes("kid")) {
      preferences.push("Family-friendly");
    }
    if (transcriptLower.includes("outdoor") || transcriptLower.includes("patio")) {
      preferences.push("Outdoor seating");
    }
    if (transcriptLower.includes("view") || transcriptLower.includes("scenic")) {
      preferences.push("Scenic view");
    }
    
    // Customize response based on detected entities
    if (intent === "restaurant_booking" && destination && cuisine && date && time) {
      response = `I'll help you book a ${cuisine} restaurant in ${destination} for ${date} at ${time}${partySize ? ` for ${partySize} people` : ""}. Would you like me to proceed?`;
    } else if (intent === "restaurant_search" && cuisine) {
      response = `I can recommend some great ${cuisine} restaurants${destination ? ` in ${destination}` : ""}. Would you like to see some options?`;
    } else if (intent === "itinerary" && destination) {
      response = `I can help you plan your trip to ${destination}. How many days will you be staying?`;
    } else if (intent === "destination" && destination) {
      response = `${destination} is a wonderful destination! Would you like to know about attractions, activities, or accommodations there?`;
    }
    
    // Create the fallback response
    const fallbackResponse = {
      intent: intent,
      entities: {
        destination: destination,
        cuisine: cuisine,
        date: date,
        time: time,
        partySize: partySize,
        preferences: preferences
      },
      response: response
    };
    
    res.status(200).json({
      ...fallbackResponse,
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
    */
  } catch (error: any) {
    console.error("OpenAI voice query processing error:", error);
    res.status(500).json({ 
      message: "Failed to process voice query",
      error: error.message || "Unknown error"
    });
  }
};
