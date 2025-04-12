import { ItineraryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ItineraryItemComponentProps {
  item: ItineraryItem;
  onStatusChange: (status: string) => void;
}

const ItineraryItemComponent = ({ item, onStatusChange }: ItineraryItemComponentProps) => {
  const getStatusColor = (itemType: string) => {
    switch (itemType) {
      case 'activity':
        return 'border-primary';
      case 'food':
        return 'border-orange-500';
      case 'transportation':
        return 'border-purple-500';
      case 'accommodation':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };
  
  const getStatusButton = () => {
    if (item.status === 'confirmed') {
      return (
        <Button className="bg-green-100 text-green-600 text-sm px-3 py-1 rounded-lg mr-2">
          <i className="fas fa-check mr-1"></i> Confirmed
        </Button>
      );
    } else if (item.status === 'pending') {
      return (
        <Button 
          className="bg-orange-100 text-orange-600 text-sm px-3 py-1 rounded-lg mr-2"
          onClick={() => onStatusChange('confirmed')}
        >
          <i className="fas fa-clock mr-1"></i> Book Now
        </Button>
      );
    } else {
      return (
        <Button 
          className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-lg mr-2"
          onClick={() => onStatusChange('pending')}
        >
          <i className="fas fa-plus mr-1"></i> Reserve
        </Button>
      );
    }
  };
  
  return (
    <div className={`border-l-4 ${getStatusColor(item.type)} pl-4 py-2`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">{item.startTime} - {item.endTime}</span>
          <h4 className="font-bold text-lg mt-1">{item.title}</h4>
          <p className="text-gray-600 mt-1">{item.description}</p>
        </div>
        {item.imageUrl && (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-24 h-24 rounded-lg object-cover ml-4"
          />
        )}
      </div>
      <div className="flex items-center mt-3 text-sm">
        {item.distance && (
          <span className="flex items-center text-gray-500 mr-4">
            <i className="fas fa-map-marker-alt mr-1"></i> {item.distance}
          </span>
        )}
        {item.price && (
          <span className="flex items-center text-gray-500">
            <i className="fas fa-euro-sign mr-1"></i> {item.price}
          </span>
        )}
      </div>
      <div className="flex mt-3">
        {getStatusButton()}
        <Button className="bg-white border border-gray-300 text-gray-700 text-sm px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">
          <i className="fas fa-map mr-1"></i> Directions
        </Button>
      </div>
    </div>
  );
};

export default ItineraryItemComponent;
