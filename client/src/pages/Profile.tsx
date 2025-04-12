import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user data
  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ['/api/users/profile'],
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
      }
    }
  });

  // Fetch user itineraries
  const { data: userItineraries, isLoading: itinerariesLoading } = useQuery({
    queryKey: ['/api/itineraries/user'],
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      const response = await apiRequest('PATCH', '/api/users/profile', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest('POST', '/api/users/change-password', data);
      return await response.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle profile update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ firstName, lastName, email });
  };

  // Handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new password and confirmation match.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (authLoading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded max-w-xl mx-auto mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    navigate("/login");
    return null;
  }

  return (
    <>
      <section className="relative py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Your Profile</h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Manage your account information, view your past trips, and update your preferences.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs defaultValue="profile">
            <TabsList className="w-full justify-start mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="trips">Your Trips</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your account details and personal information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile}>
                      <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium">
                              First Name
                            </label>
                            <Input
                              id="firstName"
                              placeholder="First Name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium">
                              Last Name
                            </label>
                            <Input
                              id="lastName"
                              placeholder="Last Name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="mt-6 w-full"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Manage your password and account security.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword}>
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <label htmlFor="currentPassword" className="text-sm font-medium">
                            Current Password
                          </label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="newPassword" className="text-sm font-medium">
                            New Password
                          </label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm New Password
                          </label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="mt-6 w-full"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="trips">
              <Card>
                <CardHeader>
                  <CardTitle>Your Trips</CardTitle>
                  <CardDescription>
                    View and manage your past and upcoming trips.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {itinerariesLoading ? (
                    <div className="animate-pulse space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="py-4">
                          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : userItineraries && userItineraries.length > 0 ? (
                    <div className="divide-y">
                      {userItineraries.map((itinerary: any) => (
                        <div key={itinerary.id} className="py-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{itinerary.name}</h3>
                            <p className="text-sm text-gray-600">
                              {itinerary.destination} • {itinerary.days.length} days
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a href={`/itinerary/${itinerary.id}`}>View</a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">You haven't created any trips yet.</p>
                      <Button asChild>
                        <a href="/itinerary">Create Your First Trip</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Travel Preferences</CardTitle>
                  <CardDescription>
                    Customize your travel preferences to get better AI recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Beach", "Culture", "Food", "Adventure", "Urban", "Nature", "Romance", "Wellness", "Architecture"].map((interest) => (
                          <Button 
                            key={interest} 
                            variant="outline" 
                            size="sm"
                            className="rounded-full"
                          >
                            {interest}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Cuisine Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Italian", "Japanese", "Mediterranean", "Chinese", "Indian", "French", "Mexican", "Vegetarian"].map((cuisine) => (
                          <Button 
                            key={cuisine} 
                            variant="outline" 
                            size="sm"
                            className="rounded-full"
                          >
                            {cuisine}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Travel Style</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Luxury", "Budget", "Family", "Solo", "Couples", "Group", "Eco-friendly"].map((style) => (
                          <Button 
                            key={style} 
                            variant="outline" 
                            size="sm"
                            className="rounded-full"
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default Profile;
