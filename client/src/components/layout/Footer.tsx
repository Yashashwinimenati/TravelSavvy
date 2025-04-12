import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">Travel</span>
                <span className="text-orange-500">Sage</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4">Experience smarter travel planning with our AI-powered platform.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Destinations</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Europe</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Asia</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">North America</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">South America</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Africa</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Oceania</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="/itinerary" className="text-gray-400 hover:text-white transition-colors">AI Itinerary Planner</a></li>
              <li><a href="/restaurants" className="text-gray-400 hover:text-white transition-colors">Restaurant Finder</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Voice Commands</a></li>
              <li><a href="/destinations" className="text-gray-400 hover:text-white transition-colors">Activity Booking</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Trip Sharing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Price Predictions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} TravelSage. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
