import { useEffect, useState, } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Heart, Plus, MapPin, Users, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Venue {
  id: string;
  name: string;
  location: string;
  description: string | null;
  capacity: number | null;
  price_per_day: number | null;
  amenities: string[] | null;
  rating: number | null;
  review_count: number | null;
}

interface BookingRequest {
  id: string;
  venue_id: string;
  event_id: string;
  requester_id: string;
  request_date: string;
  guest_count: number | null;
  status: string;
  message: string | null;
  created_at: string;
  venues: { name: string };
  events: { title: string } | null;
}

const VenueManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [selectedVenueForCalendar, setSelectedVenueForCalendar] = useState<string>("");

  // Form state for new venue
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [venueLocation, setVenueLocation] = useState("");
  const [venueDescription, setVenueDescription] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");
  const [venuePrice, setVenuePrice] = useState("");
  const [venueAmenities, setVenueAmenities] = useState("");

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role !== "venue_manager") {
        navigate("/dashboard");
        return;
      }

      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("manager_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch venues");
      return;
    }

    setVenues(data || []);
    if (data && data.length > 0 && !selectedVenueForCalendar) {
      setSelectedVenueForCalendar(data[0].id);
    }
  };

  const fetchBookingRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("booking_requests")
      .select(`
        *,
        venues!inner(name, manager_id),
        events(title)
      `)
      .eq("venues.manager_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch booking requests");
      return;
    }

    setBookingRequests(data || []);
  };

  const fetchVenueAvailability = async () => {
    if (!selectedVenueForCalendar) return;

    const { data, error } = await supabase
      .from("venue_availability")
      .select("*")
      .eq("venue_id", selectedVenueForCalendar)
      .eq("is_available", false);

    if (error) {
      console.error("Error fetching availability:", error);
      return;
    }

    const dates = (data || []).map(item => new Date(item.date));
    setUnavailableDates(dates);
  };

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amenitiesArray = venueAmenities.split(",").map(a => a.trim()).filter(a => a);

    const { error } = await supabase
      .from("venues")
      .insert([{
        manager_id: user.id,
        name: venueName,
        location: venueLocation,
        description: venueDescription || null,
        capacity: venueCapacity ? parseInt(venueCapacity) : null,
        price_per_day: venuePrice ? parseFloat(venuePrice) : null,
        amenities: amenitiesArray.length > 0 ? amenitiesArray : null,
      }]);

    if (error) {
      toast.error("Failed to add venue");
      return;
    }

    toast.success("Venue added successfully!");
    setIsAddVenueOpen(false);
    resetVenueForm();
    fetchVenues();
  };

  const resetVenueForm = () => {
    setVenueName("");
    setVenueLocation("");
    setVenueDescription("");
    setVenueCapacity("");
    setVenuePrice("");
    setVenueAmenities("");
  };

  const handleUpdateBookingStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from("booking_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to update booking request");
      return;
    }

    toast.success(`Booking ${status}!`);
    fetchBookingRequests();
  };

  const toggleDateAvailability = async (date: Date) => {
    if (!selectedVenueForCalendar) return;

    const dateStr = format(date, "yyyy-MM-dd");
    const isCurrentlyUnavailable = unavailableDates.some(
      d => format(d, "yyyy-MM-dd") === dateStr
    );

    if (isCurrentlyUnavailable) {
      const { error } = await supabase
        .from("venue_availability")
        .delete()
        .eq("venue_id", selectedVenueForCalendar)
        .eq("date", dateStr);

      if (error) {
        toast.error("Failed to update availability");
        return;
      }
      toast.success("Date marked as available");
    } else {
      const { error } = await supabase
        .from("venue_availability")
        .insert([{
          venue_id: selectedVenueForCalendar,
          date: dateStr,
          is_available: false,
        }]);

      if (error) {
        toast.error("Failed to update availability");
        return;
      }
      toast.success("Date marked as unavailable");
    }

    fetchVenueAvailability();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary fill-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-serif font-bold">IWEMS - Venue Manager</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold mb-2">
            Welcome, {user?.user_metadata?.full_name || "Venue Manager"}!
          </h2>
          <p className="text-muted-foreground">Manage your venues, availability, and booking requests</p>
        </div>

        <Tabs defaultValue="venues" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="venues">My Venues</TabsTrigger>
            <TabsTrigger value="calendar">Availability</TabsTrigger>
            <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="venues" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Your Venues</h3>
              <Dialog open={isAddVenueOpen} onOpenChange={setIsAddVenueOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Venue
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Venue</DialogTitle>
                    <DialogDescription>Fill in the details for your new venue</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddVenue} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="venue-name">Venue Name *</Label>
                      <Input
                        id="venue-name"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue-location">Location *</Label>
                      <Input
                        id="venue-location"
                        value={venueLocation}
                        onChange={(e) => setVenueLocation(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue-description">Description</Label>
                      <Textarea
                        id="venue-description"
                        value={venueDescription}
                        onChange={(e) => setVenueDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="venue-capacity">Capacity</Label>
                        <Input
                          id="venue-capacity"
                          type="number"
                          value={venueCapacity}
                          onChange={(e) => setVenueCapacity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="venue-price">Price per Day ($)</Label>
                        <Input
                          id="venue-price"
                          type="number"
                          step="0.01"
                          value={venuePrice}
                          onChange={(e) => setVenuePrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue-amenities">Amenities (comma-separated)</Label>
                      <Input
                        id="venue-amenities"
                        value={venueAmenities}
                        onChange={(e) => setVenueAmenities(e.target.value)}
                        placeholder="WiFi, Parking, Catering, AC"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Venue</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {venues.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No venues added yet. Add your first venue to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {venues.map((venue) => (
                  <Card key={venue.id}>
                    <CardHeader>
                      <CardTitle>{venue.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {venue.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {venue.description && (
                        <p className="text-sm text-muted-foreground">{venue.description}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        {venue.capacity && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{venue.capacity} guests</span>
                          </div>
                        )}
                        {venue.price_per_day && (
                          <div className="font-semibold text-primary">
                            ${venue.price_per_day}/day
                          </div>
                        )}
                      </div>
                      {venue.amenities && venue.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {venue.amenities.map((amenity, idx) => (
                            <Badge key={idx} variant="secondary">{amenity}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Select Venue:</Label>
                <select
                  className="border rounded-md px-3 py-2"
                  value={selectedVenueForCalendar}
                  onChange={(e) => setSelectedVenueForCalendar(e.target.value)}
                >
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
              </div>

              {venues.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Add a venue first to manage availability</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Availability</CardTitle>
                    <CardDescription>Click on dates to toggle availability (red = unavailable)</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      onDayClick={toggleDateAvailability}
                      modifiers={{
                        unavailable: unavailableDates,
                      }}
                      modifiersClassNames={{
                        unavailable: "bg-destructive text-destructive-foreground",
                      }}
                      className={cn("pointer-events-auto")}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <h3 className="text-xl font-semibold">Booking Requests</h3>

            {bookingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No booking requests yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.venues.name}</CardTitle>
                          <CardDescription>
                            Event: {request.events?.title || "Unknown"}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            request.status === "approved" ? "default" :
                            request.status === "rejected" ? "destructive" :
                            "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{format(new Date(request.request_date), "PPP")}</p>
                        </div>
                        {request.guest_count && (
                          <div>
                            <p className="text-muted-foreground">Guest Count</p>
                            <p className="font-medium">{request.guest_count} guests</p>
                          </div>
                        )}
                      </div>
                      {request.message && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Message</p>
                          <p className="text-sm">{request.message}</p>
                        </div>
                      )}
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateBookingStatus(request.id, "approved")}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleUpdateBookingStatus(request.id, "rejected")}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VenueManagerDashboard;
