import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Star, MapPin, DollarSign, Send } from "lucide-react";
import { toast } from "sonner";

interface Vendor {
  id: string;
  business_name: string;
  description: string | null;
  category: string;
  location: string | null;
  rating: number | null;
  review_count: number | null;
  price_range: string | null;
}

interface Event {
  id: string;
  title: string;
}

const Vendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  // Inquiry dialog state
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get user's events for the inquiry form
  const { data: userEvents } = useQuery<Event[]>({
    queryKey: ["userEvents", user?.id],
    enabled: !!user?.id && isInquiryDialogOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .eq("couple_id", user?.id)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    let filtered = vendors;

    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((v) => v.category === categoryFilter);
    }

    if (priceFilter && priceFilter !== "all") {
      filtered = filtered.filter((v) => v.price_range === priceFilter);
    }

    setFilteredVendors(filtered);
  }, [vendors, searchTerm, categoryFilter, priceFilter]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("approval_status", "approved")
        .order("rating", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsInquiryDialogOpen(true);
    setInquiryMessage("");
    setSelectedEventId("");
  };

  const handleSendInquiry = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }

    if (!inquiryMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("vendor_inquiries")
        .insert({
          vendor_id: selectedVendor?.id,
          event_id: selectedEventId,
          inquirer_id: user?.id,
          message: inquiryMessage.trim(),
          status: "pending",
        });

      if (error) throw error;

      toast.success(`Inquiry sent to ${selectedVendor?.business_name}!`);
      setIsInquiryDialogOpen(false);
      setSelectedVendor(null);
      setInquiryMessage("");
      setSelectedEventId("");
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: { [key: string]: string } = {
      catering: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      decoration: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      photography: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      videography: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      entertainment: "bg-green-500/10 text-green-500 border-green-500/20",
      cultural_performers: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      florist: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      makeup_artist: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    };
    return colors[category] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
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
          <h2 className="text-3xl font-serif font-bold mb-2">Vendor Directory</h2>
          <p className="text-muted-foreground">Find the perfect vendors for your special day</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Narrow down your search to find the best matches</CardDescription>
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="decoration">Decoration</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="videography">Videography</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="cultural_performers">Cultural Performers</SelectItem>
                    <SelectItem value="florist">Florist</SelectItem>
                    <SelectItem value="makeup_artist">Makeup Artist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="$">$ - Budget Friendly</SelectItem>
                    <SelectItem value="$$">$$ - Moderate</SelectItem>
                    <SelectItem value="$$$">$$$ - Premium</SelectItem>
                    <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-muted" />
                <CardContent className="h-24 bg-muted/50 mt-4" />
              </Card>
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters to find more results
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-serif">{vendor.business_name}</CardTitle>
                    <Badge className={getCategoryBadgeColor(vendor.category)}>
                      {vendor.category.replace("_", " ")}
                    </Badge>
                  </div>
                  {vendor.rating !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({vendor.review_count || 0} reviews)
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {vendor.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {vendor.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    {vendor.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {vendor.location}
                      </div>
                    )}
                    {vendor.price_range && (
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="w-4 h-4" />
                        {vendor.price_range}
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleVendorClick(vendor)}
                    disabled={!user}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Dialog */}
      <Dialog open={isInquiryDialogOpen} onOpenChange={setIsInquiryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Inquiry to {selectedVendor?.business_name}</DialogTitle>
            <DialogDescription>
              Select an event and write a message to this vendor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Event</label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {userEvents && userEvents.length > 0 ? (
                    userEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
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
              <label className="text-sm font-medium">Your Message</label>
              <Textarea
                placeholder="Tell the vendor about your event and what you're looking for..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInquiryDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInquiry}
              disabled={isSubmitting || !selectedEventId || !inquiryMessage.trim()}
            >
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendors;
