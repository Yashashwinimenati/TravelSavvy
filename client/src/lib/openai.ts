import { apiRequest } from '@/lib/queryClient';

// Function to send a query to OpenAI through our backend
export async function queryOpenAI(prompt: string): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/ai/query', { prompt });
    const data = await response.json();
    return data.response;
  } catch (error: any) {
    console.error('Error querying OpenAI:', error);
    throw new Error(error.message || 'Failed to process your request');
  }
}

// Function to generate an itinerary using OpenAI
export async function generateItinerary(prompt: string): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/ai/generate-itinerary', { prompt });
    const data = await response.json();
    return data.itinerary;
  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    throw new Error(error.message || 'Failed to generate itinerary');
  }
}

// Function to get restaurant recommendations based on preferences
export async function getRestaurantRecommendations(preferences: string, location?: string): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/ai/restaurant-recommendations', { 
      preferences,
      location 
    });
    const data = await response.json();
    return data.recommendations;
  } catch (error: any) {
    console.error('Error getting restaurant recommendations:', error);
    throw new Error(error.message || 'Failed to get restaurant recommendations');
  }
}

// Function to analyze user input and extract travel preferences
export async function analyzeTravelPreferences(input: string): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/ai/analyze-preferences', { input });
    const data = await response.json();
    return data.preferences;
  } catch (error: any) {
    console.error('Error analyzing travel preferences:', error);
    throw new Error(error.message || 'Failed to analyze travel preferences');
  }
}

// Handle voice input specifically for travel or restaurant queries
export async function processVoiceQuery(transcript: string): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/ai/voice-query', { transcript });
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error processing voice query:', error);
    throw new Error(error.message || 'Failed to process voice query');
  }
}
