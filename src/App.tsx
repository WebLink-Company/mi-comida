
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Layouts
import AdminLayout from "./layouts/AdminLayout";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeDashboardNew from "./pages/EmployeeDashboardNew"; // Import the new Employee Dashboard
import EmployeeOrderDetails from "./pages/EmployeeOrderDetails"; // Import the new Order Details page
import EmployeeOrdersPage from "./pages/EmployeeOrdersPage"; // Import the new Orders page
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotFound from "./pages/NotFound";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import ProviderDashboardPage from "./pages/admin/ProviderDashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import CompaniesPage from "./pages/admin/CompaniesPage";
import ProvidersPage from "./pages/admin/ProvidersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";

// Provider Pages
import ProviderOrderDashboard from "./pages/admin/provider/ProviderOrderDashboard";
import MenuManagementPage from "./pages/admin/provider/MenuManagementPage";
import AssignMenusPage from "./pages/admin/provider/AssignMenusPage";
import DeliverySettingsPage from "./pages/admin/provider/DeliverySettingsPage";
import ProviderCompaniesPage from "./pages/admin/provider/CompaniesPage";
import ProviderUsersPage from "./pages/admin/provider/UsersPage";
import BillingPage from "./pages/admin/provider/BillingPage";

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
            
            {/* Admin Routes with Layout */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="provider-dashboard" element={<ProviderDashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="providers" element={<ProvidersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Provider Routes with the same AdminLayout */}
            <Route path="/provider" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ProviderDashboardPage />} />
              <Route path="dashboard" element={<ProviderDashboardPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
              <Route path="orders" element={<ProviderOrderDashboard />} />
              <Route path="assign-menus" element={<AssignMenusPage />} />
              <Route path="companies" element={<ProviderCompaniesPage />} />
              <Route path="delivery-settings" element={<DeliverySettingsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="users" element={<ProviderUsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            
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
            
            {/* Employee Routes - Legacy */}
            <Route path="/employee-legacy" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee-legacy/orders" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard activeTab="orders" />
              </ProtectedRoute>
            } />
            
            {/* New Mobile-First Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboardNew />
              </ProtectedRoute>
            } />
            <Route path="/employee/orders" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeOrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/order/:orderId" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeOrderDetails />
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
            
            {/* Catch-all for non-existent routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
