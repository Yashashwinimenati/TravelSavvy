import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Itinerary } from '@/lib/types';

interface UseAIReturn {
  isProcessing: boolean;
  processQuery: (query: string) => Promise<string>;
  generateItinerary: (prompt: string) => Promise<Itinerary>;
  generateRestaurantRecommendations: (preferences: string) => Promise<any>;
}

export const useAI = (): UseAIReturn => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Process a general query through the AI
  const processQuery = useCallback(async (query: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const response = await apiRequest('POST', '/api/ai/query', { query });
      const data = await response.json();
      return data.response;
    } catch (error: any) {
      console.error('Error processing AI query:', error);
      throw new Error(error.message || 'Failed to process your request');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Generate a travel itinerary based on user preferences
  const generateItinerary = useCallback(async (prompt: string): Promise<Itinerary> => {
    setIsProcessing(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-itinerary', { prompt });
      const data = await response.json();
      return data.itinerary;
    } catch (error: any) {
      console.error('Error generating itinerary:', error);
      throw new Error(error.message || 'Failed to generate itinerary');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Generate restaurant recommendations based on user preferences
  const generateRestaurantRecommendations = useCallback(async (preferences: string) => {
    setIsProcessing(true);
    try {
      const response = await apiRequest('POST', '/api/ai/restaurant-recommendations', { preferences });
      const data = await response.json();
      return data.recommendations;
    } catch (error: any) {
      console.error('Error generating restaurant recommendations:', error);
      throw new Error(error.message || 'Failed to generate recommendations');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    processQuery,
    generateItinerary,
    generateRestaurantRecommendations
  };
};
