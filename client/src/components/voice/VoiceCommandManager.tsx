import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAI } from '@/hooks/use-ai';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { useToast } from '@/hooks/use-toast';

// This component handles global voice commands across the application
const VoiceCommandManager = () => {
  const [location, navigate] = useLocation();
  const { processQuery } = useAI();
  const { isListening, startListening, stopListening, transcript, resetTranscript } = useVoiceRecognition();
  const { toast } = useToast();

  useEffect(() => {
    // Set up a global event listener for starting voice recognition
    const handleStartVoiceRecognition = () => {
      if (!isListening) {
        resetTranscript();
        startListening();
        toast({
          title: "Voice Command Mode",
          description: "Listening for commands... Try saying 'Find Italian restaurants', 'Plan a trip to Tokyo', or 'Book a table'",
        });
      }
    };

    document.addEventListener('startVoiceRecognition', handleStartVoiceRecognition);
    
    return () => {
      document.removeEventListener('startVoiceRecognition', handleStartVoiceRecognition);
    };
  }, [isListening, startListening, resetTranscript, toast]);

  // Process the voice command when transcript is available
  useEffect(() => {
    if (!isListening || !transcript) return;

    const handleCommand = async () => {
      const command = transcript.toLowerCase();
      
      // Handle navigation commands
      if (command.includes('go to home') || command.includes('go home')) {
        navigate('/');
        stopListening();
        toast({ title: "Navigating to Home" });
      } 
      else if (command.includes('go to destinations') || command.includes('show destinations')) {
        navigate('/destinations');
        stopListening();
        toast({ title: "Navigating to Destinations" });
      }
      else if (command.includes('go to restaurants') || command.includes('show restaurants')) {
        navigate('/restaurants');
        stopListening();
        toast({ title: "Navigating to Restaurants" });
      }
      else if (command.includes('go to itinerary') || command.includes('show itinerary')) {
        navigate('/itinerary');
        stopListening();
        toast({ title: "Navigating to Itinerary" });
      }
      
      // Handle restaurant search
      else if (command.includes('find restaurant') || command.includes('search restaurant')) {
        navigate('/restaurants');
        stopListening();
        
        // Extract cuisine if mentioned
        const cuisineRegex = /find (.*?) restaurant|search for (.*?) restaurant/i;
        const cuisineMatch = command.match(cuisineRegex);
        const cuisine = cuisineMatch ? (cuisineMatch[1] || cuisineMatch[2]) : '';
        
        if (cuisine) {
          // Dispatch an event to set the restaurant filter
          document.dispatchEvent(new CustomEvent('setRestaurantFilter', { 
            detail: { cuisine }
          }));
          
          toast({ 
            title: "Searching Restaurants", 
            description: `Looking for ${cuisine} restaurants` 
          });
        } else {
          toast({ 
            title: "Searching Restaurants", 
            description: "Showing all restaurants" 
          });
        }
      }
      
      // Handle booking command
      else if (command.includes('book a table') || command.includes('make a reservation')) {
        // Extract restaurant name if mentioned
        const restaurantRegex = /book a table at (.*?)(?: for|$)|make a reservation at (.*?)(?: for|$)/i;
        const restaurantMatch = command.match(restaurantRegex);
        const restaurant = restaurantMatch ? (restaurantMatch[1] || restaurantMatch[2]) : '';
        
        if (restaurant) {
          navigate('/restaurants');
          stopListening();
          
          // Dispatch an event to trigger restaurant booking
          document.dispatchEvent(new CustomEvent('bookRestaurant', { 
            detail: { restaurantName: restaurant }
          }));
          
          toast({ 
            title: "Restaurant Booking", 
            description: `Looking for availability at ${restaurant}` 
          });
        } else {
          // If no restaurant specified, just show the restaurants page
          navigate('/restaurants');
          stopListening();
          toast({ 
            title: "Restaurant Booking", 
            description: "Please select a restaurant to book" 
          });
        }
      }
      
      // Handle trip planning command
      else if (command.includes('plan a trip') || command.includes('create itinerary')) {
        // Extract destination if mentioned
        const destinationRegex = /plan a trip to (.*?)(?: for|$)|create itinerary for (.*?)(?: for|$)/i;
        const destinationMatch = command.match(destinationRegex);
        const destination = destinationMatch ? (destinationMatch[1] || destinationMatch[2]) : '';
        
        if (destination) {
          navigate('/itinerary');
          stopListening();
          
          // Dispatch an event to pre-fill the destination
          document.dispatchEvent(new CustomEvent('planTripTo', { 
            detail: { destination }
          }));
          
          toast({ 
            title: "Planning Trip", 
            description: `Creating an itinerary for ${destination}` 
          });
        } else {
          navigate('/itinerary');
          stopListening();
          toast({ 
            title: "Planning Trip", 
            description: "Opening itinerary planner" 
          });
        }
      }
      
      // If not a navigation command, pass it to the AI assistant
      else if (command.length > 5) {
        // Trigger the AI assistant
        document.dispatchEvent(new CustomEvent('openAIAssistant'));
        document.dispatchEvent(new CustomEvent('processVoiceQuery', { 
          detail: { query: transcript }
        }));
        
        stopListening();
      }
      
      // Reset for the next command
      resetTranscript();
    };

    // Add a small delay to allow for complete phrases
    const timer = setTimeout(() => {
      if (transcript && transcript.length > 3) {
        handleCommand();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [transcript, isListening, stopListening, navigate, toast, resetTranscript, processQuery]);

  // The component doesn't render anything visible
  return null;
};

export default VoiceCommandManager;
