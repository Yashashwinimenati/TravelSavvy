import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { Restaurant } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";

const Restaurants = () => {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  
  const { isListening, startListening, stopListening, transcript } = useVoiceRecognition();

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
  });

  // Handle voice search
  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setSearch(transcript);
      }
    } else {
      startListening();
    }
  };

  const filteredRestaurants = restaurants?.filter((restaurant) => {
    const matchesSearch = 
      restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCuisine = 
      cuisine === "all" || restaurant.cuisine.includes(cuisine);
    
    const matchesPrice = 
      priceRange === "all" || restaurant.priceRange === priceRange;
    
    return matchesSearch && matchesCuisine && matchesPrice;
  });

  return (
    <>
      <section className="relative py-12 bg-orange-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Discover Restaurants</h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Find the perfect restaurant for any occasion. Use our filters or voice search to discover local cuisine.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Search & Filter</span>
                <Button 
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleVoiceSearch}
                  className="flex items-center gap-2"
                >
                  <i className={`fas fa-microphone ${isListening ? 'text-white' : ''}`}></i>
                  {isListening ? 'Listening...' : 'Voice Search'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Restaurants
                  </label>
                  <Input
                    id="search"
                    type="text" 
                    placeholder="Search by name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                  {isListening && (
                    <p className="text-sm text-gray-500 mt-1">Speak now... {transcript}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine
                  </label>
                  <Select value={cuisine} onValueChange={setCuisine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cuisines</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="thai">Thai</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="$">$ - Inexpensive</SelectItem>
                      <SelectItem value="$$">$$ - Moderate</SelectItem>
                      <SelectItem value="$$$">$$$ - Expensive</SelectItem>
                      <SelectItem value="$$$$">$$$$ - Very Expensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="md:w-2/5 h-48 md:h-auto bg-gray-200"></div>
                  <div className="p-5 md:w-3/5">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search term to find restaurants.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Restaurants;
