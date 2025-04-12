import { Activity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { toast } = useToast();

  const handleBookNow = () => {
    toast({
      title: "Booking in progress",
      description: `We're processing your booking for ${activity.name}.`,
    });

    // In a real app, this would connect to a booking API
    setTimeout(() => {
      toast({
        title: "Booking Confirmed",
        description: `Your booking for ${activity.name} has been confirmed!`,
      });
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <div className="relative h-48">
        <img 
          src={activity.imageUrl} 
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 rounded-full py-1 px-3 text-xs font-medium">
          <i className="fas fa-star text-yellow-400 mr-1"></i> {activity.rating}
        </div>
        {activity.isRecommended && (
          <div className="absolute top-4 left-4 bg-green-500 text-white rounded-full py-1 px-3 text-xs font-medium">
            AI Recommended
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-gray-500">{activity.location}</span>
        <h3 className="font-bold text-lg mt-1">{activity.name}</h3>
        <p className="text-gray-600 text-sm mt-1 mb-3">
          {activity.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-primary">
            ${activity.price} <span className="text-xs text-gray-500 font-normal">/ person</span>
          </span>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleBookNow}>
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
