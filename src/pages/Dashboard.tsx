import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Users, MapPin, TrendingUp, LogOut, Heart, Clock, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  eventsCount: number;
  vendorInquiriesCount: number;
  bookingRequestsCount: number;
  totalBudget: number;
}

interface Activity {
  id: string;
  type: "event" | "vendor_inquiry" | "booking_request";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: userRole, isLoading: isRoleLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .single();
      return data?.role;
    },
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Get events count and total budget
      const { data: events } = await supabase
        .from("events")
        .select("id, budget")
        .eq("couple_id", user?.id);

      // Get vendor inquiries count
      const { data: vendorInquiries } = await supabase
        .from("vendor_inquiries")
        .select("id")
        .eq("inquirer_id", user?.id);

      // Get booking requests count
      const { data: bookingRequests } = await supabase
        .from("booking_requests")
        .select("id")
        .eq("requester_id", user?.id);

      const totalBudget = events?.reduce((sum, event) => sum + (event.budget || 0), 0) || 0;

      return {
        eventsCount: events?.length || 0,
        vendorInquiriesCount: vendorInquiries?.length || 0,
        bookingRequestsCount: bookingRequests?.length || 0,
        totalBudget,
      };
    },
  });

  // Fetch recent activity
  const { data: activities, isLoading: isActivitiesLoading } = useQuery<Activity[]>({
    queryKey: ["recentActivities", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const allActivities: Activity[] = [];

      // Get recent events
      const { data: events } = await supabase
        .from("events")
        .select("id, title, created_at, status")
        .eq("couple_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (events) {
        events.forEach((event) => {
          allActivities.push({
            id: event.id,
            type: "event",
            title: "Event Created",
            description: event.title,
            timestamp: event.created_at,
            status: event.status,
          });
        });
      }

      // Get recent vendor inquiries
      const { data: inquiries } = await supabase
        .from("vendor_inquiries")
        .select("id, created_at, status, vendors(business_name)")
        .eq("inquirer_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (inquiries) {
        inquiries.forEach((inquiry: any) => {
          allActivities.push({
            id: inquiry.id,
            type: "vendor_inquiry",
            title: "Vendor Inquiry",
            description: inquiry.vendors?.business_name || "Unknown Vendor",
            timestamp: inquiry.created_at,
            status: inquiry.status,
          });
        });
      }

      // Get recent booking requests
      const { data: bookings } = await supabase
        .from("booking_requests")
        .select("id, created_at, status, venues(name)")
        .eq("requester_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (bookings) {
        bookings.forEach((booking: any) => {
          allActivities.push({
            id: booking.id,
            type: "booking_request",
            title: "Venue Booking Request",
            description: booking.venues?.name || "Unknown Venue",
            timestamp: booking.created_at,
            status: booking.status,
          });
        });
      }

      // Sort all activities by timestamp
      return allActivities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5);
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isUserLoading || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary fill-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleName = (role: string | undefined) => {
    if (!role) return "User";
    return role.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "planning":
      case "pending":
        return "bg-blue-500/10 text-blue-500";
      case "confirmed":
      case "approved":
        return "bg-green-500/10 text-green-500";
      case "rejected":
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "event":
        return Calendar;
      case "vendor_inquiry":
        return Users;
      case "booking_request":
        return MapPin;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-serif font-bold">IWEMS</h1>
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
            Welcome back, {user?.user_metadata?.full_name || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Role: <span className="font-medium text-foreground">{getRoleName(userRole)}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.eventsCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Your events</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendor Inquiries</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.vendorInquiriesCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Sent inquiries</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Venue Bookings</CardTitle>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? "..." : stats?.bookingRequestsCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Requested bookings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${isStatsLoading ? "..." : (stats?.totalBudget || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total allocated</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your event planning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => navigate("/events/create")}>
                <Calendar className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/vendors")}>
                <Users className="w-4 h-4 mr-2" />
                Browse Vendors
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/venues")}>
                <MapPin className="w-4 h-4 mr-2" />
                Find Venues
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/budget")}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Budget Tracker
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/cultural")}>
                <Calendar className="w-4 h-4 mr-2" />
                Cultural Activities
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              {isActivitiesLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Loading activities...</p>
                </div>
              ) : !activities || activities.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No activity yet. Start planning your dream wedding!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                            {activity.status && (
                              <Badge className={getStatusColor(activity.status)} variant="secondary">
                                {activity.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;