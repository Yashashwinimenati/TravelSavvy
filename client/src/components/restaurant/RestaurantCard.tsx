import { Restaurant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [partySize, setPartySize] = useState("2");

  // Book restaurant mutation
  const bookRestaurantMutation = useMutation({
    mutationFn: async (data: { restaurantId: string, date: string, time: string, partySize: string }) => {
      const response = await apiRequest('POST', '/api/restaurants/book', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reservation Confirmed",
        description: `Your reservation at ${restaurant.name} has been confirmed.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Reservation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleReservation = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your reservation.",
        variant: "destructive",
      });
      return;
    }

    bookRestaurantMutation.mutate({
      restaurantId: restaurant.id,
      date: selectedDate,
      time: selectedTime,
      partySize,
    });
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg duration-300">
      <div className="md:w-2/5 h-48 md:h-auto relative">
        <img 
          src={restaurant.imageUrl} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 rounded-full py-1 px-3 text-xs font-medium">
          <i className="fas fa-star text-yellow-400 mr-1"></i> {restaurant.rating} ({restaurant.reviewCount})
        </div>
      </div>
      <div className="p-5 md:w-3/5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{restaurant.name}</h3>
            <span className="text-green-600 text-sm font-medium">{restaurant.priceRange}</span>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            <i className="fas fa-map-marker-alt mr-1"></i> {restaurant.location} · {restaurant.distance} away
          </p>
          <div className="flex items-center space-x-2 mb-3 flex-wrap">
            {restaurant.cuisine.map((type, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {type}
              </span>
            ))}
          </div>
          <p className="text-gray-600 text-sm">{restaurant.description}</p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {restaurant.openingTime ? (
              <><i className="fas fa-clock mr-1"></i> {restaurant.openingTime}</>
            ) : (
              restaurant.isRecommended && (
                <span className="text-green-600">
                  <i className="fas fa-utensils mr-1"></i> AI Recommended for you
                </span>
              )
            )}
          </span>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">Reserve</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book a table at {restaurant.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="date" className="text-right">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="time" className="text-right">
                    Time
                  </label>
                  <select
                    id="time"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Select a time</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="17:30">5:30 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="18:30">6:30 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="19:30">7:30 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="20:30">8:30 PM</option>
                    <option value="21:00">9:00 PM</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="partySize" className="text-right">
                    Party Size
                  </label>
                  <select
                    id="partySize"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                  >
                    <option value="1">1 person</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4 people</option>
                    <option value="5">5 people</option>
                    <option value="6">6 people</option>
                    <option value="7">7 people</option>
                    <option value="8">8 people</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleReservation} disabled={bookRestaurantMutation.isPending}>
                  {bookRestaurantMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Booking...
                    </>
                  ) : (
                    "Confirm Reservation"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
