import { useEffect, useState, useCallback } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Heart, Plus, Upload, X, Store, MessageSquare, Star, CheckCircle, Clock } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type VendorCategory = Database["public"]["Enums"]["vendor_category"];

interface Vendor {
  id: string;
  business_name: string;
  category: VendorCategory;
  description: string | null;
  location: string | null;
  price_range: string | null;
  rating: number | null;
  review_count: number | null;
  portfolio_images: string[] | null;
}

interface VendorInquiry {
  id: string;
  vendor_id: string;
  event_id: string;
  inquirer_id: string;
  message: string | null;
  status: string;
  created_at: string;
  events: { title: string } | null;
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [inquiries, setInquiries] = useState<VendorInquiry[]>([]);
  const [uploading, setUploading] = useState(false);

  // Profile form state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<VendorCategory>("catering");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const checkUser = useCallback(async () => {
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

      if (roleData?.role !== "vendor") {
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
  }, [navigate]);

  const fetchVendor = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast.error("Failed to fetch vendor profile");
      return;
    }

    if (data) {
      setVendor(data);
      setBusinessName(data.business_name);
      setCategory(data.category);
      setDescription(data.description || "");
      setLocation(data.location || "");
      setPriceRange(data.price_range || "");
    }
  }, [user]);

  const fetchInquiries = useCallback(async () => {
    if (!user) return;

    const { data: vendorData } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!vendorData) return;

    const { data, error } = await supabase
      .from("vendor_inquiries")
      .select(`
        *,
        events(title)
      `)
      .eq("vendor_id", vendorData.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch inquiries");
      return;
    }

    setInquiries(data || []);
  }, [user]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      fetchVendor();
      fetchInquiries();
    }
  }, [user, fetchVendor, fetchInquiries]);

  const handleCreateOrUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const profileData = {
      user_id: user.id,
      business_name: businessName,
      category,
      description: description || null,
      location: location || null,
      price_range: priceRange || null,
    };

    if (vendor) {
      const { error } = await supabase
        .from("vendors")
        .update(profileData)
        .eq("id", vendor.id);

      if (error) {
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
    } else {
      const { error } = await supabase
        .from("vendors")
        .insert([profileData]);

      if (error) {
        toast.error("Failed to create profile");
        return;
      }

      toast.success("Profile created successfully!");
    }

    setIsEditProfileOpen(false);
    fetchVendor();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !vendor || !e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('vendor-portfolios')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-portfolios')
        .getPublicUrl(fileName);

      const currentImages = vendor.portfolio_images || [];
      const updatedImages = [...currentImages, publicUrl];

      const { error: updateError } = await supabase
        .from('vendors')
        .update({ portfolio_images: updatedImages })
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      toast.success("Image uploaded successfully!");
      fetchVendor();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!vendor) return;

    const updatedImages = (vendor.portfolio_images || []).filter(img => img !== imageUrl);

    const { error } = await supabase
      .from('vendors')
      .update({ portfolio_images: updatedImages })
      .eq('id', vendor.id);

    if (error) {
      toast.error("Failed to remove image");
      return;
    }

    // Extract filename from URL and delete from storage
    const filename = imageUrl.split('/').slice(-2).join('/');
    await supabase.storage
      .from('vendor-portfolios')
      .remove([filename]);

    toast.success("Image removed successfully!");
    fetchVendor();
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: string) => {
    const { error } = await supabase
      .from("vendor_inquiries")
      .update({ status })
      .eq("id", inquiryId);

    if (error) {
      toast.error("Failed to update inquiry");
      return;
    }

    toast.success(`Inquiry ${status}!`);
    fetchInquiries();
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
            <h1 className="text-2xl font-serif font-bold">IWEMS - Vendor</h1>
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
            Welcome, {user?.user_metadata?.full_name || "Vendor"}!
          </h2>
          <p className="text-muted-foreground">Manage your business profile, portfolio, and inquiries</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Business Profile</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            {!vendor ? (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Create Your Business Profile</h3>
                    <p className="text-muted-foreground mb-4">Set up your vendor profile to start receiving inquiries</p>
                    <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Business Profile</DialogTitle>
                          <DialogDescription>Fill in your business details</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateOrUpdateProfile} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="business-name">Business Name *</Label>
                            <Input
                              id="business-name"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select value={category} onValueChange={(value: VendorCategory) => setCategory(value)}>
                              <SelectTrigger id="category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="catering">Catering</SelectItem>
                                <SelectItem value="decoration">Decoration</SelectItem>
                                <SelectItem value="photography">Photography</SelectItem>
                                <SelectItem value="videography">Videography</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                                <SelectItem value="cultural_performers">Cultural Performers</SelectItem>
                                <SelectItem value="florist">Florist</SelectItem>
                                <SelectItem value="makeup_artist">Makeup Artist</SelectItem>
                                <SelectItem value="transportation">Transportation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="price-range">Price Range</Label>
                              <Input
                                id="price-range"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                placeholder="e.g., $500-$2000"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Create Profile</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{vendor.business_name}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge>{vendor.category.replace(/_/g, ' ')}</Badge>
                      </CardDescription>
                    </div>
                    <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Edit Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Business Profile</DialogTitle>
                          <DialogDescription>Update your business details</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateOrUpdateProfile} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="business-name">Business Name *</Label>
                            <Input
                              id="business-name"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select value={category} onValueChange={(value: VendorCategory) => setCategory(value)}>
                              <SelectTrigger id="category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="catering">Catering</SelectItem>
                                <SelectItem value="decoration">Decoration</SelectItem>
                                <SelectItem value="photography">Photography</SelectItem>
                                <SelectItem value="videography">Videography</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                                <SelectItem value="cultural_performers">Cultural Performers</SelectItem>
                                <SelectItem value="florist">Florist</SelectItem>
                                <SelectItem value="makeup_artist">Makeup Artist</SelectItem>
                                <SelectItem value="transportation">Transportation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="price-range">Price Range</Label>
                              <Input
                                id="price-range"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                placeholder="e.g., $500-$2000"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Update Profile</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vendor.description && (
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-muted-foreground">{vendor.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {vendor.location && (
                      <div>
                        <h4 className="font-semibold mb-1">Location</h4>
                        <p className="text-muted-foreground">{vendor.location}</p>
                      </div>
                    )}
                    {vendor.price_range && (
                      <div>
                        <h4 className="font-semibold mb-1">Price Range</h4>
                        <p className="text-muted-foreground">{vendor.price_range}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{vendor.rating || 0}</span>
                    </div>
                    <span className="text-muted-foreground">({vendor.review_count || 0} reviews)</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            {!vendor ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Create your business profile first to upload portfolio images</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Portfolio Images</CardTitle>
                    <CardDescription>Showcase your work to potential clients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="flex-1"
                      />
                      <Button disabled={uploading}>
                        {uploading ? (
                          <>Uploading...</>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {vendor.portfolio_images && vendor.portfolio_images.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {vendor.portfolio_images.map((imageUrl, index) => (
                      <Card key={index} className="relative overflow-hidden group">
                        <img
                          src={imageUrl}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-64 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(imageUrl)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No portfolio images yet. Upload your first image to get started!</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-4">
            <h3 className="text-xl font-semibold">Booking Inquiries</h3>

            {inquiries.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inquiries yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {inquiry.events?.title || "Unknown Event"}
                          </CardTitle>
                          <CardDescription>
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            inquiry.status === "accepted" ? "default" :
                            inquiry.status === "declined" ? "destructive" :
                            "secondary"
                          }
                        >
                          {inquiry.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {inquiry.message && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Message</p>
                          <p className="text-sm">{inquiry.message}</p>
                        </div>
                      )}
                      {inquiry.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateInquiryStatus(inquiry.id, "accepted")}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleUpdateInquiryStatus(inquiry.id, "declined")}
                            variant="destructive"
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      {inquiry.status === "responded" && (
                        <Button
                          onClick={() => handleUpdateInquiryStatus(inquiry.id, "accepted")}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Booking
                        </Button>
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

export default VendorDashboard;