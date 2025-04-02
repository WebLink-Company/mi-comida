
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import IndexPage from './pages/Index';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import SupervisorDashboard from './pages/SupervisorDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import { Toaster } from './components/ui/sonner';

// Admin Routes
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import CompaniesPage from './pages/admin/CompaniesPage';
import ProvidersPage from './pages/admin/ProvidersPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Provider Routes */}
          <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
          
          {/* Supervisor Routes */}
          <Route path="/supervisor" element={<ProtectedRoute allowedRoles={['supervisor']}><SupervisorDashboard /></ProtectedRoute>} />
          
          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          
          {/* Company Routes */}
          <Route path="/company" element={<ProtectedRoute allowedRoles={['company']}><CompanyDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
