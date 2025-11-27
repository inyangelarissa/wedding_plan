import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
<<<<<<< HEAD
=======
import CreateEvents from "./pages/CreateEvents";
>>>>>>> 79ab52fcddbe5f54c17e8ebf3fd7e32c66add14a
import Vendors from "./pages/Vendors";
import Venues from "./pages/Venues";
import AdminDashboard from "./pages/AdminDashboard";
import BudgetTracker from "./pages/BudgetTracker";
import CulturalActivities from "./pages/CulturalActivities";
import VenueManagerDashboard from "./pages/VenueManager";
<<<<<<< HEAD
import CreateEvents from "./pages/CreateEvents";
import VendorDashboard from "./pages/VendorDashboard";
import PlannerDashboard from "./pages/PlannerDashboard";
import NotFound from "./pages/NotFound";
=======
import VendorDashboard from "./pages/VendorDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
>>>>>>> 79ab52fcddbe5f54c17e8ebf3fd7e32c66add14a

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
<<<<<<< HEAD
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/create" element={<CreateEvents />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/venues" element={<Venues />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/planner" element={<PlannerDashboard />} />
      <Route path="/venue-manager" element={<VenueManagerDashboard />} />
      <Route path="/budget" element={<BudgetTracker />} />
      <Route path="/cultural" element={<CulturalActivities />} />
=======

      {/* Protected Routes for Couples/Planners */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={["couple", "planner"]}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute allowedRoles={["couple", "planner"]}>
          <Events />
        </ProtectedRoute>
      } />
      <Route path="/events/create" element={
        <ProtectedRoute allowedRoles={["couple", "planner"]}>
          <CreateEvents />
        </ProtectedRoute>
      } />
      <Route path="/vendors" element={
        <ProtectedRoute allowedRoles={["couple", "planner"]}>
          <Vendors />
        </ProtectedRoute>
      } />
      <Route path="/venues" element={
        <ProtectedRoute allowedRoles={["couple", "planner"]}>
          <Venues />
        </ProtectedRoute>
      } />
      <Route path="/budget" element={
        <ProtectedRoute allowedRoles={["couple", "planner"]}>
          <BudgetTracker />
        </ProtectedRoute>
      } />
      <Route path="/cultural" element={
        <ProtectedRoute allowedRoles={["couple", "planner"]}>
          <CulturalActivities />
        </ProtectedRoute>
      } />

      {/* Role Specific Dashboards */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/venue-manager" element={
        <ProtectedRoute allowedRoles={["venue_manager"]}>
          <VenueManagerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/vendor-dashboard" element={
        <ProtectedRoute allowedRoles={["vendor"]}>
          <VendorDashboard />
        </ProtectedRoute>
      } />

>>>>>>> 79ab52fcddbe5f54c17e8ebf3fd7e32c66add14a
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;