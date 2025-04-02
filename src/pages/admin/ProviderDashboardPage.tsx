
import React, { useState } from 'react';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building, Package, Receipt, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardMetrics from '@/components/admin/dashboard/DashboardMetrics';
import '@/styles/dashboard.css';
import { useProviderDashboardData } from '@/hooks/useProviderDashboardData';
import { Dialog } from "@/components/ui/dialog";
import { UsersModal } from '@/components/admin/dashboard/UsersModal';
import { CompaniesModal } from '@/components/admin/dashboard/CompaniesModal';
import { OrdersModal } from '@/components/admin/dashboard/OrdersModal';
import { InvoicesModal } from '@/components/admin/dashboard/InvoicesModal';

const ProviderDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  // Fetch dashboard stats using our hook with the provider ID
  const stats = useProviderDashboardData(user?.id);
  
  // Quick actions for the provider
  const quickActions = [
    {
      label: 'Add Company',
      icon: Building,
      action: () => openDialog('create-company'),
      path: '/provider/companies'
    },
    {
      label: 'Add User',
      icon: UserPlus,
      action: () => openDialog('add-user'),
      path: '/provider/users'
    },
    {
      label: 'View Orders',
      icon: Package,
      action: () => openDialog('view-orders'),
      path: '/provider/orders'
    },
    {
      label: 'Review Invoices',
      icon: Receipt,
      action: () => openDialog('review-invoices'),
      path: '/provider/billing'
    }
  ];

  const openDialog = (dialogId: string) => {
    setActiveDialog(dialogId);
  };

  const closeDialog = () => {
    setTimeout(() => {
      setActiveDialog(null);
    }, 50);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
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
        topOrderedMeal={stats.topOrderedMeal?.name}
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

      {/* Modals */}
      <Dialog 
        open={activeDialog === 'add-user'} 
        onOpenChange={() => {
          if (activeDialog === 'add-user') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'add-user' && <UsersModal onClose={closeDialog} />}
      </Dialog>

      <Dialog 
        open={activeDialog === 'create-company'} 
        onOpenChange={() => {
          if (activeDialog === 'create-company') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'create-company' && <CompaniesModal onClose={closeDialog} providerId={user?.id} />}
      </Dialog>

      <Dialog 
        open={activeDialog === 'view-orders'} 
        onOpenChange={() => {
          if (activeDialog === 'view-orders') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'view-orders' && <OrdersModal onClose={closeDialog} />}
      </Dialog>

      <Dialog 
        open={activeDialog === 'review-invoices'} 
        onOpenChange={() => {
          if (activeDialog === 'review-invoices') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'review-invoices' && <InvoicesModal onClose={closeDialog} />}
      </Dialog>
    </div>
  );
};

export default ProviderDashboardPage;
