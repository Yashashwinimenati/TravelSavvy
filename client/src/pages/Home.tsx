import { useEffect, useState } from "react";
import SearchBox from "@/components/ui/SearchBox";
import DestinationCard from "@/components/destination/DestinationCard";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import ActivityCard from "@/components/activity/ActivityCard";
import { useQuery } from "@tanstack/react-query";
import { Destination, Restaurant, Activity } from "@/lib/types";

const Home = () => {
  const { data: featuredDestinations } = useQuery<Destination[]>({
    queryKey: ['/api/destinations/featured'],
  });

  const { data: topRestaurants } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants/recommended'],
  });

  const { data: popularActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities/popular'],
  });

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative h-[80vh] min-h-[600px] bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-neutral-900/60"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center relative z-10">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 text-shadow-lg">
            Your Perfect Trip, <br /><span className="text-secondary">Planned by AI</span>
          </h1>
          <p className="text-white text-xl md:text-2xl max-w-2xl mb-10 text-shadow-md">
            Discover amazing destinations, find local restaurants, and build your dream itinerary with our AI-powered assistant.
          </p>
          
          <SearchBox />
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Discover breathtaking locations curated by our AI based on trending destinations and personalized recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations ? (
              featuredDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))
            ) : (
              // Loading skeleton
              Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden h-96 animate-pulse">
                  <div className="h-60 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-10">
            <a href="/destinations" className="bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-6 py-3 rounded-lg font-medium inline-block">
              Discover More Destinations
            </a>
          </div>
        </div>
      </section>

      {/* AI Feature Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-medium text-sm">POWERED BY AI</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2 mb-4">Plan Smarter, Travel Better</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our AI technology analyzes millions of data points to create the perfect trip tailored to your preferences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-robot text-primary text-xl"></i>
              </div>
              <h3 className="font-bold text-xl mb-3">AI Itinerary Generator</h3>
              <p className="text-gray-600 mb-4">
                Tell our AI about your travel style, interests, and budget, and it will create a customized day-by-day plan.
              </p>
              <a href="/itinerary" className="text-primary font-medium hover:text-blue-700 transition-colors">
                Learn more <i className="fas fa-arrow-right ml-1"></i>
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-utensils text-primary text-xl"></i>
              </div>
              <h3 className="font-bold text-xl mb-3">Restaurant Matchmaker</h3>
              <p className="text-gray-600 mb-4">
                Our AI analyzes your food preferences and dietary needs to suggest the perfect local dining experiences.
              </p>
              <a href="/restaurants" className="text-primary font-medium hover:text-blue-700 transition-colors">
                Learn more <i className="fas fa-arrow-right ml-1"></i>
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-microphone text-primary text-xl"></i>
              </div>
              <h3 className="font-bold text-xl mb-3">Voice Commands</h3>
              <p className="text-gray-600 mb-4">
                Just speak to our assistant to search, book, or modify your plans with simple voice instructions.
              </p>
              <a href="#" className="text-primary font-medium hover:text-blue-700 transition-colors">
                Learn more <i className="fas fa-arrow-right ml-1"></i>
              </a>
            </div>
          </div>
          
          <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="text-orange-500 font-medium text-sm">SMART RECOMMENDATIONS</span>
                <h3 className="font-serif text-2xl md:text-3xl font-bold mt-2 mb-4">
                  Personalized Suggestions That Get Better Over Time
                </h3>
                <p className="text-gray-600 mb-6">
                  Our AI learns your preferences from your searches, bookings, and feedback to provide increasingly personalized recommendations for your future trips.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-emerald-600 mt-1 mr-3"></i>
                    <span>Suggestions based on your past trips and reviews</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-emerald-600 mt-1 mr-3"></i>
                    <span>Recommendations adjust to seasonal changes and events</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-emerald-600 mt-1 mr-3"></i>
                    <span>Price predictions to help you book at the right time</span>
                  </li>
                </ul>
                <a href="/itinerary" className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white rounded-lg py-3 px-6 font-medium transition-colors inline-block text-center">
                  Try Smart Recommendations
                </a>
              </div>
              <div className="bg-gray-100 p-6 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="AI recommendation visualization" 
                  className="rounded-lg shadow-md max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants Section Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Discover Local Cuisine</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Explore authentic dining experiences hand-picked by our AI based on your preferences and expert reviews.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {topRestaurants ? (
              topRestaurants.slice(0, 4).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))
            ) : (
              // Loading skeleton
              Array(4).fill(0).map((_, index) => (
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
              ))
            )}
          </div>
          
          <div className="text-center mt-10">
            <a href="/restaurants" className="bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-6 py-3 rounded-lg font-medium inline-block">
              Explore More Restaurants
            </a>
          </div>
        </div>
      </section>

      {/* Activities Section Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Top-Rated Activities</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Discover unique experiences curated by our AI to match your interests and make your trip unforgettable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularActivities ? (
              popularActivities.slice(0, 4).map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              // Loading skeleton
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-10">
            <a href="/destinations" className="bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-6 py-3 rounded-lg font-medium inline-block">
              Browse All Activities
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">Ready to Plan Your Dream Trip?</h2>
          <p className="text-blue-100 max-w-3xl mx-auto mb-8 text-lg">
            Let our AI assistant create a personalized itinerary tailored to your preferences, interests, and travel style.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/itinerary" className="bg-white text-primary hover:bg-blue-50 transition-colors px-8 py-3 rounded-lg font-medium inline-block">
              Create Your Itinerary
            </a>
            <button 
              className="bg-transparent border border-white text-white hover:bg-white/10 transition-colors px-8 py-3 rounded-lg font-medium"
              onClick={() => document.dispatchEvent(new CustomEvent('openAIAssistant'))}
            >
              <i className="fas fa-microphone mr-2"></i> Try Voice Commands
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
