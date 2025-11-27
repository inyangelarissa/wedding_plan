import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, Users, DollarSign, MapPin, LogOut, CheckCircle, XCircle } from "lucide-react";

interface Event {
  id: string;
  title: string;
  event_date: string;
  guest_count: number;
  budget: number;
  status: string;
  venue_location: string;
  couple_id: string;
}

interface BookingRequest {
  id: string;
  request_date: string;
  guest_count: number;
  status: string;
  message: string;
  event_id: string;
  venue_id: string;
  venues: { name: string };
  events: { title: string };
}

interface VendorInquiry {
  id: string;
  status: string;
  message: string;
  event_id: string;
  vendor_id: string;
  vendors: { business_name: string; category: string };
  events: { title: string };
}

const PlannerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [vendorInquiries, setVendorInquiries] = useState<VendorInquiry[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalClients: 0,
    totalBudget: 0,
  });

  const loadEvents = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("planner_id", userId)
      .order("event_date", { ascending: true });

    if (error) {
      toast.error("Failed to load events");
      return;
    }

    setEvents(data || []);
    
    const totalBudget = (data || []).reduce((sum, event) => sum + (event.budget || 0), 0);
    const uniqueClients = new Set((data || []).map(event => event.couple_id));
    
    setStats({
      totalEvents: data?.length || 0,
      activeEvents: data?.filter(e => e.status === "planning" || e.status === "confirmed").length || 0,
      totalClients: uniqueClients.size,
      totalBudget,
    });
  }, []);

  const loadBookingRequests = useCallback(async (userId: string) => {
    const { data: eventsData } = await supabase
      .from("events")
      .select("id")
      .eq("planner_id", userId);

    if (!eventsData || eventsData.length === 0) return;

    const eventIds = eventsData.map(e => e.id);
    
    const { data, error } = await supabase
      .from("booking_requests")
      .select("*, venues(name), events(title)")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load booking requests");
      return;
    }

    setBookingRequests(data || []);
  }, []);

  const loadVendorInquiries = useCallback(async (userId: string) => {
    const { data: eventsData } = await supabase
      .from("events")
      .select("id")
      .eq("planner_id", userId);

    if (!eventsData || eventsData.length === 0) return;

    const eventIds = eventsData.map(e => e.id);
    
    const { data, error } = await supabase
      .from("vendor_inquiries")
      .select("*, vendors(business_name, category), events(title)")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load vendor inquiries");
      return;
    }

    setVendorInquiries(data || []);
  }, []);

  const checkUserAndLoadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roles?.role !== "planner") {
        navigate("/dashboard");
        return;
      }

      await Promise.all([loadEvents(user.id), loadBookingRequests(user.id), loadVendorInquiries(user.id)]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [navigate, loadEvents, loadBookingRequests, loadVendorInquiries]);

  useEffect(() => {
    checkUserAndLoadData();
  }, [checkUserAndLoadData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-blue-500",
      confirmed: "bg-green-500",
      in_progress: "bg-yellow-500",
      completed: "bg-purple-500",
      cancelled: "bg-red-500",
      pending: "bg-orange-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Wedding Planner Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Events I'm Planning</h2>
              <Button onClick={() => navigate("/events")}>View All Events</Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {event.guest_count || 0} guests
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      Budget: ${(event.budget || 0).toLocaleString()}
                    </div>
                    {event.venue_location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {event.venue_location}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Booking Requests</h2>
            
            <div className="space-y-4">
              {bookingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.venues.name}</CardTitle>
                        <CardDescription>For: {request.events.title}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(request.request_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Guests: {request.guest_count}
                    </p>
                    {request.message && (
                      <p className="text-sm mt-2">{request.message}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Vendor Inquiries</h2>
            
            <div className="space-y-4">
              {vendorInquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{inquiry.vendors.business_name}</CardTitle>
                        <CardDescription>
                          {inquiry.vendors.category} • For: {inquiry.events.title}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  {inquiry.message && (
                    <CardContent>
                      <p className="text-sm">{inquiry.message}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlannerDashboard;