
import React from 'react';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building, Package, Receipt, UserPlus } from 'lucide-react';
import { useProviderDashboardStats } from '@/hooks/useProviderDashboardStats';
import DashboardMetrics from '@/components/admin/dashboard/DashboardMetrics';
import '@/styles/dashboard.css';

const ProviderDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Quick actions for the provider
  const quickActions = [
    {
      label: 'Add Company',
      icon: Building,
      action: () => navigate('/admin/companies'),
      path: '/admin/companies'
    },
    {
      label: 'Add User',
      icon: UserPlus,
      action: () => navigate('/admin/users'),
      path: '/admin/users'
    },
    {
      label: 'View Orders',
      icon: Package,
      action: () => navigate('/admin/orders'),
      path: '/admin/orders'
    },
    {
      label: 'Review Invoices',
      icon: Receipt,
      action: () => navigate('/admin/invoices'),
      path: '/admin/invoices'
    }
  ];

  // Fetch all dashboard statistics
  const stats = useProviderDashboardStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Blue gradient background */}
      <div className="blue-gradient-bg"></div>
      
      {/* Glass effect notification */}
      <div className="mb-8 p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white">
        <ClockDisplay user={user} quickActions={quickActions} />
      </div>

      <h2 className="text-2xl font-semibold text-white mb-6 fade-up" style={{ animationDelay: "0.1s" }}>Dashboard Overview</h2>
      
      {/* Dashboard metrics */}
      <DashboardMetrics 
        ordersToday={stats.ordersToday}
        loadingOrdersToday={stats.loadingOrdersToday}
        totalMealsToday={stats.totalMealsToday}
        loadingMealsToday={stats.loadingMealsToday}
        companiesWithOrdersToday={stats.companiesWithOrdersToday}
        loadingCompaniesOrders={stats.loadingCompaniesOrders}
        topOrderedMeal={stats.topOrderedMeal}
        loadingTopMeal={stats.loadingTopMeal}
        pendingOrders={stats.pendingOrders}
        loadingPending={stats.loadingPending}
        activeCompanies={stats.activeCompanies}
        loadingActiveCompanies={stats.loadingActiveCompanies}
        newUsers={stats.newUsers}
        loadingNewUsers={stats.loadingNewUsers}
        monthlyOrders={stats.monthlyOrders}
        loadingMonthlyOrders={stats.loadingMonthlyOrders}
        monthlyRevenue={stats.monthlyRevenue}
        loadingMonthlyRevenue={stats.loadingMonthlyRevenue}
      />
    </div>
  );
};

export default ProviderDashboardPage;
