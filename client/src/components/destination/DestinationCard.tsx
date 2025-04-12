import { Destination } from "@/lib/types";
import { Link } from "wouter";

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <div className="relative h-60">
        <img 
          src={destination.imageUrl} 
          alt={`${destination.name}, ${destination.country}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 rounded-full py-1 px-3 text-xs font-medium">
          <i className="fas fa-star text-yellow-400 mr-1"></i> {destination.rating}
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg mb-1">{destination.name}, {destination.country}</h3>
            <p className="text-gray-600 text-sm">
              <i className="fas fa-map-marker-alt mr-1"></i> {destination.continent}
            </p>
          </div>
          <span className="text-orange-500 font-medium">${destination.averageCost}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{destination.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-wrap">
            {destination.interests.slice(0, 2).map((interest, index) => (
              <span key={index} className="text-xs bg-blue-100 text-primary px-2 py-1 rounded-full">
                {interest}
              </span>
            ))}
          </div>
          <Link href={`/destinations/${destination.id}`}>
            <a className="text-primary hover:text-blue-700 text-sm font-medium flex items-center">
              Explore <i className="fas fa-chevron-right ml-1"></i>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
