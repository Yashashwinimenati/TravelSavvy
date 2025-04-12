import { ItineraryDay, ItineraryItem } from "@/lib/types";
import ItineraryItemComponent from "@/components/itinerary/ItineraryItem";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ItineraryDayProps {
  day: ItineraryDay;
  dayNumber: number;
}

const ItineraryDayComponent = ({ day, dayNumber }: ItineraryDayProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/itineraries/items/${itemId}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries/current'] });
      toast({
        title: "Item updated",
        description: "The itinerary item has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl">Day {dayNumber}: {day.title}</h3>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" title="Edit day">
            <i className="fas fa-edit"></i>
          </Button>
          <Button variant="ghost" size="icon" title="Share itinerary">
            <i className="fas fa-share-alt"></i>
          </Button>
          <Button variant="ghost" size="icon" title="Download as PDF">
            <i className="fas fa-download"></i>
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {day.items.map((item) => (
          <ItineraryItemComponent 
            key={item.id} 
            item={item} 
            onStatusChange={(status) => {
              updateItemMutation.mutate({ itemId: item.id, status });
            }}
          />
        ))}
        
        {day.items.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">No activities planned for this day yet.</p>
            <Button>Add Activity</Button>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex items-center justify-between">
        <Button className="bg-blue-100 text-primary hover:bg-blue-200 transition-colors">
          <i className="fas fa-magic mr-2"></i> AI Suggestions
        </Button>
        <div>
          <Button variant="outline" className="mr-3">
            Save Draft
          </Button>
          <Button>
            Finalize Day {dayNumber}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDayComponent;
