import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, TrendingUp, CheckCircle, XCircle, Building, Store, Calendar, MessageSquare } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  roles: string[];
}

interface Vendor {
  id: string;
  business_name: string;
  category: string;
  location: string;
  approval_status: string;
  rejection_reason: string | null;
  created_at: string;
}

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  approval_status: string;
  rejection_reason: string | null;
  created_at: string;
}

interface Analytics {
  totalUsers: number;
  totalEvents: number;
  totalVendors: number;
  totalVenues: number;
  pendingVendors: number;
  pendingVenues: number;
  activeBookings: number;
}

type UserRole = "couple" | "planner" | "vendor" | "venue_manager" | "admin";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalEvents: 0,
    totalVendors: 0,
    totalVenues: 0,
    pendingVendors: 0,
    pendingVenues: 0,
    activeBookings: 0,
  });
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast.error("Failed to fetch users");
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesError) {
      toast.error("Failed to fetch user roles");
      return;
    }

    const usersWithRoles = profiles.map((profile) => ({
      ...profile,
      roles: roles.filter((r) => r.user_id === profile.id).map((r) => r.role),
    }));

    setUsers(usersWithRoles);
  }, []);

  const fetchVendors = useCallback(async () => {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch vendors");
      return;
    }

    setVendors(data || []);
  }, []);

  const fetchVenues = useCallback(async () => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch venues");
      return;
    }

    setVenues(data || []);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    const [usersCount, eventsCount, vendorsCount, venuesCount, bookingsCount] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("vendors").select("*", { count: "exact", head: true }),
      supabase.from("venues").select("*", { count: "exact", head: true }),
      supabase.from("booking_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    const pendingVendorsCount = vendors.filter(v => v.approval_status === 'pending').length;
    const pendingVenuesCount = venues.filter(v => v.approval_status === 'pending').length;

    setAnalytics({
      totalUsers: usersCount.count || 0,
      totalEvents: eventsCount.count || 0,
      totalVendors: vendorsCount.count || 0,
      totalVenues: venuesCount.count || 0,
      pendingVendors: pendingVendorsCount,
      pendingVenues: pendingVenuesCount,
      activeBookings: bookingsCount.count || 0,
    });
  }, [vendors, venues]);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchUsers(),
      fetchVendors(),
      fetchVenues(),
      fetchAnalytics(),
    ]);
  }, [fetchUsers, fetchVendors, fetchVenues, fetchAnalytics]);

  const checkAdminStatus = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      toast.error("Failed to check admin status");
      navigate("/dashboard");
      return;
    }

    if (!data) {
      toast.error("Access denied: Admin only");
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    fetchAllData();
  }, [user, navigate, fetchAllData]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user, checkAdminStatus]);

  const updateVendorStatus = async (vendorId: string, status: string) => {
    const { error } = await supabase
      .from("vendors")
      .update({
        approval_status: status,
        rejection_reason: status === "rejected" ? rejectionReason[vendorId] || null : null,
      })
      .eq("id", vendorId);

    if (error) {
      toast.error("Failed to update vendor status");
      return;
    }

    toast.success(`Vendor ${status}`);
    setRejectionReason({ ...rejectionReason, [vendorId]: "" });
    fetchVendors();
    fetchAnalytics();
  };

  const updateVenueStatus = async (venueId: string, status: string) => {
    const { error } = await supabase
      .from("venues")
      .update({
        approval_status: status,
        rejection_reason: status === "rejected" ? rejectionReason[venueId] || null : null,
      })
      .eq("id", venueId);

    if (error) {
      toast.error("Failed to update venue status");
      return;
    }

    toast.success(`Venue ${status}`);
    setRejectionReason({ ...rejectionReason, [venueId]: "" });
    fetchVenues();
    fetchAnalytics();
  };

  const updateUserRole = async (userId: string, role: string, action: "add" | "remove") => {
    if (action === "add") {
      const validRoles: UserRole[] = ["couple", "planner", "vendor", "venue_manager", "admin"];
      if (!validRoles.includes(role as UserRole)) {
        toast.error("Invalid role");
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role as UserRole });

      if (error) {
        toast.error("Failed to add role");
        return;
      }
      toast.success("Role added");
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as UserRole);

      if (error) {
        toast.error("Failed to remove role");
        return;
      }
      toast.success("Role removed");
    }

    fetchUsers();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, vendors, venues, and platform analytics</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalVendors}</div>
              <p className="text-xs text-muted-foreground">{analytics.pendingVendors} pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Venues</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalVenues}</div>
              <p className="text-xs text-muted-foreground">{analytics.pendingVenues} pending approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Approvals</TabsTrigger>
            <TabsTrigger value="venues">Venue Approvals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline">No roles</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => {
                              const [action, role] = value.split("-");
                              updateUserRole(user.id, role, action as "add" | "remove");
                            }}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Manage roles" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add-vendor">Add Vendor</SelectItem>
                              <SelectItem value="add-venue_manager">Add Venue Manager</SelectItem>
                              <SelectItem value="add-planner">Add Planner</SelectItem>
                              <SelectItem value="add-admin">Add Admin</SelectItem>
                              {user.roles.map((role) => (
                                <SelectItem key={`remove-${role}`} value={`remove-${role}`}>
                                  Remove {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendor Approvals Tab */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Approvals</CardTitle>
                <CardDescription>Review and approve vendor applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.business_name}</TableCell>
                        <TableCell>
                          <Badge>{vendor.category}</Badge>
                        </TableCell>
                        <TableCell>{vendor.location || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              vendor.approval_status === "approved"
                                ? "default"
                                : vendor.approval_status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {vendor.approval_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {vendor.approval_status === "pending" && (
                              <>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateVendorStatus(vendor.id, "approved")}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      if (rejectionReason[vendor.id]) {
                                        updateVendorStatus(vendor.id, "rejected");
                                      } else {
                                        toast.error("Please provide a rejection reason");
                                      }
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                                <Textarea
                                  placeholder="Rejection reason (required)"
                                  value={rejectionReason[vendor.id] || ""}
                                  onChange={(e) =>
                                    setRejectionReason({
                                      ...rejectionReason,
                                      [vendor.id]: e.target.value,
                                    })
                                  }
                                  className="w-full"
                                />
                              </>
                            )}
                            {vendor.rejection_reason && (
                              <p className="text-sm text-muted-foreground">
                                Reason: {vendor.rejection_reason}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Venue Approvals Tab */}
          <TabsContent value="venues">
            <Card>
              <CardHeader>
                <CardTitle>Venue Approvals</CardTitle>
                <CardDescription>Review and approve venue listings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Venue Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venues.map((venue) => (
                      <TableRow key={venue.id}>
                        <TableCell className="font-medium">{venue.name}</TableCell>
                        <TableCell>{venue.location}</TableCell>
                        <TableCell>{venue.capacity || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              venue.approval_status === "approved"
                                ? "default"
                                : venue.approval_status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {venue.approval_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(venue.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {venue.approval_status === "pending" && (
                              <>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateVenueStatus(venue.id, "approved")}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      if (rejectionReason[venue.id]) {
                                        updateVenueStatus(venue.id, "rejected");
                                      } else {
                                        toast.error("Please provide a rejection reason");
                                      }
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                                <Textarea
                                  placeholder="Rejection reason (required)"
                                  value={rejectionReason[venue.id] || ""}
                                  onChange={(e) =>
                                    setRejectionReason({
                                      ...rejectionReason,
                                      [venue.id]: e.target.value,
                                    })
                                  }
                                  className="w-full"
                                />
                              </>
                            )}
                            {venue.rejection_reason && (
                              <p className="text-sm text-muted-foreground">
                                Reason: {venue.rejection_reason}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Overview of platform metrics and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Active Bookings</p>
                      <p className="text-3xl font-bold">{analytics.activeBookings}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Pending Approvals</p>
                      <p className="text-3xl font-bold">
                        {analytics.pendingVendors + analytics.pendingVenues}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vendors</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${analytics.totalVendors > 0 ? 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.totalVendors}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Venues</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${analytics.totalVenues > 0 ? 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.totalVenues}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Events</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${analytics.totalEvents > 0 ? 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.totalEvents}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}