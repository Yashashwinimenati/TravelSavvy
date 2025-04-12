import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";

const Header = () => {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { isListening, startListening, stopListening } = useVoiceRecognition();

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle voice search
  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      // Trigger custom event to be handled by VoiceCommandManager
      document.dispatchEvent(new CustomEvent('startVoiceRecognition'));
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`sticky top-0 z-50 bg-white ${isScrolled ? "shadow-md" : ""} transition-all duration-300`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="text-xl font-bold tracking-tight"><span className="text-primary">Travel</span><span className="text-orange-500">Sage</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/">
              <a className={`font-medium ${location === "/" ? "text-primary" : "text-gray-700 hover:text-primary"} transition-colors`}>
                Home
              </a>
            </Link>
            <Link to="/destinations">
              <a className={`font-medium ${location === "/destinations" ? "text-primary" : "text-gray-700 hover:text-primary"} transition-colors`}>
                Destinations
              </a>
            </Link>
            <Link to="/restaurants">
              <a className={`font-medium ${location === "/restaurants" ? "text-primary" : "text-gray-700 hover:text-primary"} transition-colors`}>
                Restaurants
              </a>
            </Link>
            <Link to="/itinerary">
              <a className={`font-medium ${location === "/itinerary" ? "text-primary" : "text-gray-700 hover:text-primary"} transition-colors`}>
                Itinerary
              </a>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button 
              type="button" 
              className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
              aria-label={isListening ? "Stop Listening" : "Voice Search"}
              onClick={handleVoiceSearch}
            >
              <i className="fas fa-microphone"></i>
              {isListening && <span className="sr-only">Listening...</span>}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <a className="hidden md:block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    <i className="fas fa-user mr-2"></i> Profile
                  </a>
                </Link>
                <Button 
                  variant="outline" 
                  className="hidden md:block"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link to="/login">
                  <Button>Sign In</Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 text-gray-700">
                  <i className="fas fa-bars text-xl"></i>
                </button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col h-full">
                  <div className="flex items-center py-4">
                    <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="text-xl font-bold tracking-tight ml-2"><span className="text-primary">Travel</span><span className="text-orange-500">Sage</span></span>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 mt-8">
                    <Link to="/">
                      <a className={`font-medium ${location === "/" ? "text-primary" : "text-gray-700"} transition-colors p-2`}>
                        Home
                      </a>
                    </Link>
                    <Link to="/destinations">
                      <a className={`font-medium ${location === "/destinations" ? "text-primary" : "text-gray-700"} transition-colors p-2`}>
                        Destinations
                      </a>
                    </Link>
                    <Link to="/restaurants">
                      <a className={`font-medium ${location === "/restaurants" ? "text-primary" : "text-gray-700"} transition-colors p-2`}>
                        Restaurants
                      </a>
                    </Link>
                    <Link to="/itinerary">
                      <a className={`font-medium ${location === "/itinerary" ? "text-primary" : "text-gray-700"} transition-colors p-2`}>
                        Itinerary
                      </a>
                    </Link>
                  </nav>
                  
                  <div className="mt-auto pb-8">
                    <Button 
                      variant={isListening ? "destructive" : "outline"}
                      className="w-full mb-4 flex items-center justify-center"
                      onClick={handleVoiceSearch}
                    >
                      <i className={`fas fa-microphone ${isListening ? 'animate-pulse' : ''} mr-2`}></i>
                      {isListening ? "Stop Listening" : "Voice Commands"}
                    </Button>
                    
                    {user ? (
                      <div className="space-y-4">
                        <Link to="/profile">
                          <a className="block w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-center">
                            <i className="fas fa-user mr-2"></i> Profile
                          </a>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleLogout}
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Link to="/login">
                          <Button className="w-full">Sign In</Button>
                        </Link>
                        <Link to="/register">
                          <Button variant="outline" className="w-full">Create Account</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
