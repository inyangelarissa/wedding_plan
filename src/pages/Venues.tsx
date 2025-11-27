import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Star, MapPin, Users, DollarSign, CalendarIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Venue {
  id: string;
  name: string;
  description: string | null;
  location: string;
  capacity: number | null;
  price_per_day: number | null;
  rating: number | null;
  review_count: number | null;
  amenities: string[] | null;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  guest_count: number | null;
}

const Venues = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");

  // Booking dialog state
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<Date>();
  const [guestCount, setGuestCount] = useState<string>("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get user's events for the booking form
  const { data: userEvents } = useQuery<Event[]>({
    queryKey: ["userEvents", user?.id],
    enabled: !!user?.id && isBookingDialogOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, event_date, guest_count")
        .eq("couple_id", user?.id)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const filterVenues = useCallback(() => {
    let filtered = venues;

    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (capacityFilter && capacityFilter !== "all") {
      const [min, max] = capacityFilter.split("-").map(Number);
      filtered = filtered.filter((v) => {
        if (!v.capacity) return false;
        if (max) return v.capacity >= min && v.capacity <= max;
        return v.capacity >= min;
      });
    }

    setFilteredVenues(filtered);
  }, [venues, searchTerm, capacityFilter]);

  useEffect(() => {
    filterVenues();
  }, [filterVenues]);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("approval_status", "approved")
        .order("rating", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsBookingDialogOpen(true);
    setBookingMessage("");
    setSelectedEventId("");
    setBookingDate(undefined);
    setGuestCount("");
  };

  // Auto-fill date and guest count when event is selected
  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = userEvents?.find(e => e.id === eventId);
    if (event) {
      setBookingDate(new Date(event.event_date));
      if (event.guest_count) {
        setGuestCount(event.guest_count.toString());
      }
    }
  };

  const handleSendBookingRequest = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }

    if (!bookingDate) {
      toast.error("Please select a booking date");
      return;
    }

    if (!guestCount || parseInt(guestCount) <= 0) {
      toast.error("Please enter a valid guest count");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("booking_requests")
        .insert({
          venue_id: selectedVenue?.id,
          event_id: selectedEventId,
          requester_id: user?.id,
          request_date: format(bookingDate, "yyyy-MM-dd"),
          guest_count: parseInt(guestCount),
          message: bookingMessage.trim() || null,
          status: "pending",
        });

      if (error) throw error;

      toast.success(`Booking request sent to ${selectedVenue?.name}!`);
      setIsBookingDialogOpen(false);
      setSelectedVenue(null);
      setBookingMessage("");
      setSelectedEventId("");
      setBookingDate(undefined);
      setGuestCount("");
    } catch (error) {
      console.error("Error sending booking request:", error);
      toast.error("Failed to send booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold mb-2">Venue Directory</h2>
          <p className="text-muted-foreground">Discover the perfect location for your celebration</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find venues that match your requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Guest Capacity</label>
              <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="0-50">Intimate (0-50 guests)</SelectItem>
                  <SelectItem value="51-100">Small (51-100 guests)</SelectItem>
                  <SelectItem value="101-200">Medium (101-200 guests)</SelectItem>
                  <SelectItem value="201-500">Large (201-500 guests)</SelectItem>
                  <SelectItem value="501">Grand (500+ guests)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-40 bg-muted" />
                <CardContent className="h-32 bg-muted/50 mt-4" />
              </Card>
            ))}
          </div>
        ) : filteredVenues.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No venues found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters to find more results
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredVenues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">{venue.name}</CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {venue.location}
                    </div>
                    {venue.rating !== null && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{venue.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({venue.review_count || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {venue.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {venue.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    {venue.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Up to {venue.capacity} guests
                        </span>
                      </div>
                    )}
                    {venue.price_per_day && (
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {venue.price_per_day.toLocaleString()}/day
                      </div>
                    )}
                  </div>

                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.slice(0, 3).map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {venue.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{venue.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleVenueClick(venue)}
                    disabled={!user}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Request Booking
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Request Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Booking at {selectedVenue?.name}</DialogTitle>
            <DialogDescription>
              Select an event and provide booking details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Event</label>
              <Select value={selectedEventId} onValueChange={handleEventSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {userEvents && userEvents.length > 0 ? (
                    userEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {format(new Date(event.event_date), "MMM d, yyyy")}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-events" disabled>
                      No events found. Create an event first.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Booking Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !bookingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Guest Count</label>
              <Input
                type="number"
                placeholder="Expected number of guests"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message (Optional)</label>
              <Textarea
                placeholder="Any special requirements or questions..."
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBookingDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendBookingRequest}
              disabled={isSubmitting || !selectedEventId || !bookingDate || !guestCount}
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Venues;
