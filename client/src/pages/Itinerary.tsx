import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Itinerary, ItineraryDay, ItineraryItem } from "@/lib/types";
import { useAI } from "@/hooks/use-ai";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ItineraryDayComponent from "@/components/itinerary/ItineraryDay";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const ItineraryPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { generateItinerary, isGenerating } = useAI();
  
  const [activeDay, setActiveDay] = useState<string>("1");
  const [isCreating, setIsCreating] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [newItineraryName, setNewItineraryName] = useState("");
  const [newItineraryDays, setNewItineraryDays] = useState(3);
  const [newItineraryDestination, setNewItineraryDestination] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());

  // Fetch current itinerary
  const { data: currentItinerary, isLoading } = useQuery<Itinerary>({
    queryKey: ['/api/itineraries/current'],
  });

  // Create new itinerary
  const createItineraryMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      destination: string; 
      numberOfDays: number;
      startDate: string;
      prompt?: string;
    }) => {
      const response = await apiRequest('POST', '/api/itineraries', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries/current'] });
      setIsCreating(false);
      toast({
        title: "Itinerary created",
        description: "Your new itinerary has been created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating itinerary",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate itinerary with AI
  const handleGenerateItinerary = async () => {
    if (!promptInput) {
      toast({
        title: "Please enter a prompt",
        description: "Tell us about your travel preferences to generate an itinerary.",
        variant: "destructive",
      });
      return;
    }

    try {
      const generatedItinerary = await generateItinerary(promptInput);
      
      createItineraryMutation.mutate({
        name: generatedItinerary.name || "My Trip",
        destination: generatedItinerary.destination || "Unknown",
        numberOfDays: generatedItinerary.days?.length || 3,
        startDate: selectedStartDate ? format(selectedStartDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        prompt: promptInput
      });
      
    } catch (error) {
      toast({
        title: "Error generating itinerary",
        description: "There was an error while generating your itinerary. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create a new itinerary manually
  const handleCreateItinerary = () => {
    if (!newItineraryName || !newItineraryDestination) {
      toast({
        title: "Missing information",
        description: "Please provide a name and destination for your itinerary.",
        variant: "destructive",
      });
      return;
    }

    createItineraryMutation.mutate({
      name: newItineraryName,
      destination: newItineraryDestination,
      numberOfDays: newItineraryDays,
      startDate: selectedStartDate ? format(selectedStartDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    });
  };

  return (
    <>
      <section className="relative py-12 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Your Travel Itinerary</h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Create, customize and manage your perfect travel plan. Let our AI help you build the ideal itinerary.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : currentItinerary ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{currentItinerary.name}</h2>
                  <p className="text-gray-600">{currentItinerary.destination} • {currentItinerary.days.length} days • Starting {format(new Date(currentItinerary.startDate), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <i className="fas fa-share-alt mr-2"></i> Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <i className="fas fa-download mr-2"></i> Export
                  </Button>
                </div>
              </div>

              <Card className="mb-8">
                <CardContent className="p-0">
                  <Tabs defaultValue={activeDay} onValueChange={setActiveDay}>
                    <TabsList className="w-full justify-start border-b rounded-none px-4 pt-2">
                      {currentItinerary.days.map((day, index) => (
                        <TabsTrigger key={day.id} value={String(index + 1)} className="px-6 py-3">
                          Day {index + 1}
                        </TabsTrigger>
                      ))}
                      <TabsTrigger value="add" className="px-4">
                        <i className="fas fa-plus mr-1"></i> Add Day
                      </TabsTrigger>
                    </TabsList>
                    
                    {currentItinerary.days.map((day, index) => (
                      <TabsContent key={day.id} value={String(index + 1)} className="p-0">
                        <ItineraryDayComponent day={day} dayNumber={index + 1} />
                      </TabsContent>
                    ))}
                    
                    <TabsContent value="add" className="p-6 text-center">
                      <h3 className="text-lg font-medium mb-4">Add a New Day to Your Itinerary</h3>
                      <Button onClick={() => toast({ title: "Feature coming soon", description: "This feature will be available in a future update." })}>
                        <i className="fas fa-plus mr-2"></i> Add Day
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <div className="flex items-center justify-between mt-8">
                <Button variant="outline" onClick={() => setIsCreating(true)}>
                  <i className="fas fa-plus mr-2"></i> New Itinerary
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-100 text-primary hover:bg-blue-200 transition-colors">
                      <i className="fas fa-magic mr-2"></i> AI Suggestions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Get AI Suggestions</DialogTitle>
                      <DialogDescription>
                        Let our AI help you improve your itinerary with personalized suggestions.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Ask for specific suggestions, like 'Find me vegetarian restaurants in Barcelona' or 'Suggest family-friendly activities for Day 3'"
                      className="min-h-[100px]"
                    />
                    <DialogFooter>
                      <Button type="submit">
                        <i className="fas fa-magic mr-2"></i> Get Suggestions
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Create Your First Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">AI-Generated Itinerary</h3>
                      <p className="text-gray-600 mb-4">
                        Tell us about your travel preferences and our AI will create a customized itinerary for you.
                      </p>
                      <Textarea
                        placeholder="Example: I'm planning a 5-day trip to Barcelona with my partner. We love architecture, trying local food, and want some time to relax."
                        className="min-h-[150px] mb-4"
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                      />
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <Calendar
                          mode="single"
                          selected={selectedStartDate}
                          onSelect={setSelectedStartDate}
                          className="border rounded-md"
                        />
                      </div>
                      <Button 
                        onClick={handleGenerateItinerary} 
                        disabled={isGenerating || createItineraryMutation.isPending}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Generating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-magic mr-2"></i> Generate Itinerary
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Create Manually</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Itinerary Name
                          </label>
                          <Input 
                            placeholder="E.g., Summer in Paris"
                            value={newItineraryName}
                            onChange={(e) => setNewItineraryName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Destination
                          </label>
                          <Input 
                            placeholder="E.g., Paris, France"
                            value={newItineraryDestination}
                            onChange={(e) => setNewItineraryDestination(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Days
                          </label>
                          <Input 
                            type="number" 
                            min="1" 
                            max="30"
                            value={newItineraryDays}
                            onChange={(e) => setNewItineraryDays(parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <Calendar
                            mode="single"
                            selected={selectedStartDate}
                            onSelect={setSelectedStartDate}
                            className="border rounded-md"
                          />
                        </div>
                        <Button 
                          onClick={handleCreateItinerary}
                          disabled={createItineraryMutation.isPending}
                          className="w-full"
                        >
                          {createItineraryMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i> Creating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus mr-2"></i> Create Itinerary
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ItineraryPage;
