import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/admin/DashboardPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/companies" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/providers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Company Routes */}
            <Route path="/company" element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/company/employees" element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard activeTab="employees" />
              </ProtectedRoute>
            } />
            <Route path="/company/reports" element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard activeTab="reports" />
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/orders" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard activeTab="orders" />
              </ProtectedRoute>
            } />
            
            {/* Supervisor Routes */}
            <Route path="/supervisor" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/supervisor/approve" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard activeTab="approve" />
              </ProtectedRoute>
            } />
            <Route path="/supervisor/reports" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard activeTab="reports" />
              </ProtectedRoute>
            } />
            <Route path="/supervisor/subsidies" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <SupervisorDashboard activeTab="subsidies" />
              </ProtectedRoute>
            } />
            
            {/* Provider Routes */}
            <Route path="/provider" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/provider/menu" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard activeTab="menu" />
              </ProtectedRoute>
            } />
            <Route path="/provider/orders" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard activeTab="orders" />
              </ProtectedRoute>
            } />
            <Route path="/provider/billing" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard activeTab="billing" />
              </ProtectedRoute>
            } />
            <Route path="/provider/companies" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard activeTab="companies" />
              </ProtectedRoute>
            } />
            <Route path="/provider/users" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard activeTab="users" />
              </ProtectedRoute>
            } />
            
            {/* Catch-all for non-existent routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
