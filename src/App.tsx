
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CompanyDashboard from "./pages/CompanyDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeDashboardNew from "./pages/EmployeeDashboardNew";
import EmployeeOrdersPage from "./pages/EmployeeOrdersPage";
import EmployeeOrderDetails from "./pages/EmployeeOrderDetails";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import CompaniesPage from "./pages/admin/CompaniesPage";
import ProvidersPage from "./pages/admin/ProvidersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";

// Provider Pages
import ProviderOrderDashboard from "./pages/admin/provider/ProviderOrderDashboard";
import MenuManagementPage from "./pages/admin/provider/MenuManagementPage";
import CompaniesProviderPage from "./pages/admin/provider/CompaniesPage";
import AssignMenusPage from "./pages/admin/provider/AssignMenusPage";
import OrdersPage from "./pages/admin/provider/OrdersPage";
import DeliverySettingsPage from "./pages/admin/provider/DeliverySettingsPage";
import BillingPage from "./pages/admin/provider/BillingPage";
import UsersProviderPage from "./pages/admin/provider/UsersPage";

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  // If there's no user, show the Login page
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  // Routes based on user role
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${user.role}`} replace />} />
      <Route path="/login" element={<Navigate to={`/${user.role}`} replace />} />
      
      {/* Employee routes with the new layout */}
      <Route path="/employee" element={<EmployeeLayout />}>
        <Route index element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboardNew /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeOrdersPage /></ProtectedRoute>} />
        <Route path="order/:orderId" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeOrderDetails /></ProtectedRoute>} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="companies" element={<ProtectedRoute allowedRoles={['admin']}><CompaniesPage /></ProtectedRoute>} />
        <Route path="providers" element={<ProtectedRoute allowedRoles={['admin']}><ProvidersPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
      </Route>
      
      {/* Provider routes - Modified to use OrdersPage as the dashboard temporarily */}
      <Route path="/provider" element={<AdminLayout />}>
        <Route index element={<ProtectedRoute allowedRoles={['provider']}><ProviderOrderDashboard /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute allowedRoles={['provider']}><OrdersPage /></ProtectedRoute>} />
        <Route path="menu" element={<ProtectedRoute allowedRoles={['provider']}><MenuManagementPage /></ProtectedRoute>} />
        <Route path="companies" element={<ProtectedRoute allowedRoles={['provider']}><CompaniesProviderPage /></ProtectedRoute>} />
        <Route path="assign-menus" element={<ProtectedRoute allowedRoles={['provider']}><AssignMenusPage /></ProtectedRoute>} />
        <Route path="delivery" element={<ProtectedRoute allowedRoles={['provider']}><DeliverySettingsPage /></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute allowedRoles={['provider']}><BillingPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['provider']}><UsersProviderPage /></ProtectedRoute>} />
      </Route>
      
      {/* Supervisor routes */}
      <Route path="/supervisor" element={<ProtectedRoute allowedRoles={['supervisor']}><SupervisorDashboard /></ProtectedRoute>} />
      
      {/* Legacy employee dashboard - can be removed after testing the new one */}
      <Route path="/employee-old" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
      
      {/* Company dashboard */}
      <Route path="/company" element={<ProtectedRoute allowedRoles={['company']}><CompanyDashboard /></ProtectedRoute>} />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
