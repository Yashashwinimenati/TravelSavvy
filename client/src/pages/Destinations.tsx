import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DestinationCard from "@/components/destination/DestinationCard";
import { Destination } from "@/lib/types";
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

const Destinations = () => {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("all");
  const [interest, setInterest] = useState("all");

  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  const filteredDestinations = destinations?.filter((destination) => {
    const matchesSearch = 
      destination.name.toLowerCase().includes(search.toLowerCase()) ||
      destination.country.toLowerCase().includes(search.toLowerCase());
    
    const matchesContinent = 
      continent === "all" || destination.continent === continent;
    
    const matchesInterest = 
      interest === "all" || destination.interests.includes(interest);
    
    return matchesSearch && matchesContinent && matchesInterest;
  });

  return (
    <>
      <section className="relative py-12 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Explore Destinations</h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Discover amazing destinations around the world. Use our filters to find the perfect place for your next adventure.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Destinations
                  </label>
                  <Input
                    id="search"
                    type="text" 
                    placeholder="Search by city or country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="continent" className="block text-sm font-medium text-gray-700 mb-1">
                    Continent
                  </label>
                  <Select value={continent} onValueChange={setContinent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select continent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Continents</SelectItem>
                      <SelectItem value="africa">Africa</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="north_america">North America</SelectItem>
                      <SelectItem value="oceania">Oceania</SelectItem>
                      <SelectItem value="south_america">South America</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">
                    Interest
                  </label>
                  <Select value={interest} onValueChange={setInterest}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Interests</SelectItem>
                      <SelectItem value="beach">Beach</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="urban">Urban</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                      <SelectItem value="architecture">Architecture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(9).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden h-96 animate-pulse">
                  <div className="h-60 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDestinations && filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search term to find destinations.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Destinations;
