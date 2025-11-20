import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Vendors from "./pages/Vendors";
import Venues from "./pages/Venues";
import AdminDashboard from "./pages/AdminDashboard";
import BudgetTracker from "./pages/BudgetTracker";
import CulturalActivities from "./pages/CulturalActivities";
import VenueManagerDashboard from "./pages/VenueManager";
import CreateEvents from "./pages/CreateEvents";
import VendorDashboard from "./pages/VendorDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/create" element={<CreateEvents />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/venues" element={<Venues />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/venue-manager" element={<VenueManagerDashboard />} />
      <Route path="/budget" element={<BudgetTracker />} />
      <Route path="/cultural" element={<CulturalActivities />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;