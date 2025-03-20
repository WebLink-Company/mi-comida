
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Employee Routes */}
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/orders" element={<EmployeeDashboard activeTab="orders" />} />
          
          {/* Supervisor Routes */}
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/supervisor/approve" element={<SupervisorDashboard activeTab="approve" />} />
          <Route path="/supervisor/reports" element={<SupervisorDashboard activeTab="reports" />} />
          
          {/* Provider Routes */}
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/provider/menu" element={<ProviderDashboard activeTab="menu" />} />
          <Route path="/provider/orders" element={<ProviderDashboard activeTab="orders" />} />
          <Route path="/provider/billing" element={<ProviderDashboard activeTab="billing" />} />
          
          {/* Catch-all for non-existent routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
