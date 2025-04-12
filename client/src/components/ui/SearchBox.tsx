import { useState } from "react";
import { useLocation } from "wouter";
import { useAI } from "@/hooks/use-ai";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const SearchBox = () => {
  const [location, navigate] = useLocation();
  const { isProcessing, processQuery } = useAI();
  const { isListening, startListening, stopListening, transcript } = useVoiceRecognition();
  const { toast } = useToast();
  
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("1");

  const handleAskSage = async () => {
    if (!destination) {
      toast({
        title: "Destination required",
        description: "Please enter a destination to plan your trip.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Planning your trip",
      description: "Our AI is creating your personalized itinerary...",
    });

    try {
      document.dispatchEvent(new CustomEvent('openAIAssistant'));
      
      // Prepare the query for the AI
      const query = `I'm planning a trip to ${destination}${dates ? ` on ${dates}` : ""} with ${travelers} traveler(s). Can you help me plan an itinerary?`;
      
      // Process happens in the AI assistant component
      setTimeout(() => {
        navigate("/itinerary");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error creating itinerary",
        description: error.message || "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        // Parse the transcript to extract destination, dates, and travelers
        if (transcript.toLowerCase().includes("destination")) {
          const destinationMatch = transcript.match(/destination\s+(.+?)(?:dates|travelers|$)/i);
          if (destinationMatch && destinationMatch[1]) {
            setDestination(destinationMatch[1].trim());
          }
        }
        
        if (transcript.toLowerCase().includes("dates")) {
          const datesMatch = transcript.match(/dates\s+(.+?)(?:destination|travelers|$)/i);
          if (datesMatch && datesMatch[1]) {
            setDates(datesMatch[1].trim());
          }
        }
        
        if (transcript.toLowerCase().includes("travelers")) {
          const travelersMatch = transcript.match(/travelers\s+(\d+)/i);
          if (travelersMatch && travelersMatch[1]) {
            setTravelers(travelersMatch[1]);
          }
        }
      }
    } else {
      toast({
        title: "Voice Search",
        description: "Speak now. Try saying: 'Destination Barcelona, dates June 15-20, travelers 2'",
      });
      startListening();
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Where to?</label>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <Input
              id="destination"
              placeholder="City, region, or country"
              className="pl-10 w-full"
              value={isListening && transcript ? transcript : destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="dates" className="block text-sm font-medium text-gray-700 mb-1">When?</label>
          <div className="relative">
            <i className="fas fa-calendar absolute left-3 top-3 text-gray-400"></i>
            <Input
              id="dates"
              placeholder="Select dates"
              className="pl-10 w-full"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-1">Who?</label>
          <div className="relative">
            <i className="fas fa-user-friends absolute left-3 top-3 text-gray-400"></i>
            <Select value={travelers} onValueChange={setTravelers}>
              <SelectTrigger className="pl-10 w-full">
                <SelectValue placeholder="Number of travelers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 traveler</SelectItem>
                <SelectItem value="2">2 travelers</SelectItem>
                <SelectItem value="3">3 travelers</SelectItem>
                <SelectItem value="4">4 travelers</SelectItem>
                <SelectItem value="5">5 travelers</SelectItem>
                <SelectItem value="6">6+ travelers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-left flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button 
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
            onClick={handleAskSage}
            disabled={isProcessing}
          >
            <i className="fas fa-robot"></i> 
            {isProcessing ? "Creating Plan..." : "Ask TravelSage to Plan"}
          </Button>
          <p className="text-xs text-gray-600 mt-2">Our AI planner creates personalized itineraries based on your preferences</p>
        </div>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleVoiceSearch}
          disabled={isProcessing}
        >
          <i className={`fas fa-microphone ${isListening ? 'text-red-500' : ''}`}></i>
          {isListening ? "Listening..." : "Voice Search"}
        </Button>
      </div>
    </div>
  );
};

export default SearchBox;
