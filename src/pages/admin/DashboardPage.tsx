import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Users, Building, ShoppingBag, FileText, Globe, DollarSign, ChefHat, UserPlus, Plus, LucideIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { UsersModal } from '@/components/admin/dashboard/UsersModal';
import { CompaniesModal } from '@/components/admin/dashboard/CompaniesModal';
import { ProvidersModal } from '@/components/admin/dashboard/ProvidersModal';
import { OrdersModal } from '@/components/admin/dashboard/OrdersModal';
import { InvoicesModal } from '@/components/admin/dashboard/InvoicesModal';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { DashboardCard } from '@/components/admin/dashboard/DashboardCard';
import { DialogContent as DashboardDialogContent } from '@/components/admin/dashboard/DialogContents';
import "@/styles/dashboard.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalProviders: 0,
    totalOrders: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    avgOrdersPerProvider: 0,
    inactiveProviders: 0,
    providersWithNoCompanies: 0,
    pendingInvoices: 0,
    billingThisMonth: 0,
    mostActiveProvider: 'N/A',
    topCompanyByConsumption: 'N/A'
  });

  const fetchDashboardData = async () => {
    try {
      const {
        count: userCount
      } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
      });

      const {
        count: companyCount
      } = await supabase.from('companies').select('*', {
        count: 'exact',
        head: true
      });

      const {
        count: providerCount
      } = await supabase.from('providers').select('*', {
        count: 'exact',
        head: true
      });

      const {
        count: orderCount
      } = await supabase.from('orders').select('*', {
        count: 'exact',
        head: true
      });

      setStats({
        totalUsers: userCount || 0,
        totalCompanies: companyCount || 0,
        totalProviders: providerCount || 0,
        totalOrders: orderCount || 0,
        ordersToday: Math.floor(Math.random() * 50),
        ordersThisWeek: Math.floor(Math.random() * 250),
        avgOrdersPerProvider: Math.floor(Math.random() * 15),
        inactiveProviders: Math.floor(Math.random() * 5),
        providersWithNoCompanies: Math.floor(Math.random() * 3),
        pendingInvoices: Math.floor(Math.random() * 10),
        billingThisMonth: Math.floor(Math.random() * 10000),
        mostActiveProvider: 'Foodie Delights',
        topCompanyByConsumption: 'Acme Corp'
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const openDialog = (dialogId: string) => {
    setActiveDialog(dialogId);
  };

  const closeDialog = () => {
    setTimeout(() => {
      setActiveDialog(null);
    }, 50);
  };

  const quickActions: Array<{
    label: string;
    icon: LucideIcon;
    action: () => void;
    path: string;
  }> = [
    { label: 'Add User', icon: UserPlus, action: () => openDialog('add-user'), path: '/admin/users' },
    { label: 'Create Company', icon: Building, action: () => openDialog('create-company'), path: '/admin/companies' },
    { label: 'Add Provider', icon: ChefHat, action: () => openDialog('add-provider'), path: '/admin/providers' },
    { label: 'View Orders', icon: ShoppingBag, action: () => openDialog('view-orders'), path: '/admin/reports' },
    { label: 'Review Invoices', icon: Plus, action: () => openDialog('review-invoices'), path: '/admin/reports' },
  ];

  const platformOverviewData = [
    { label: 'Users', value: stats.totalUsers, path: '/admin/users' },
    { label: 'Companies', value: stats.totalCompanies, path: '/admin/companies' },
    { label: 'Providers', value: stats.totalProviders, path: '/admin/providers' },
    { label: 'Total Orders', value: stats.totalOrders, path: '/admin/reports' }
  ];

  const providerPerformanceData = [
    { label: 'Most Active', value: stats.mostActiveProvider, path: '/admin/providers' },
    { label: 'Inactive Providers', value: stats.inactiveProviders, path: '/admin/providers' },
    { label: 'Without Companies', value: stats.providersWithNoCompanies, path: '/admin/providers' }
  ];

  const orderMetricsData = [
    { label: 'Orders Today', value: stats.ordersToday, path: '/admin/reports' },
    { label: 'Orders This Week', value: stats.ordersThisWeek, path: '/admin/reports' },
    { label: 'Avg per Provider', value: stats.avgOrdersPerProvider, path: '/admin/reports' }
  ];

  const financeInsightsData = [
    { label: 'Billing This Month', value: `$${new Intl.NumberFormat().format(stats.billingThisMonth)}`, path: '/admin/reports' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, path: '/admin/reports' },
    { label: 'Top Consumer', value: stats.topCompanyByConsumption, path: '/admin/companies' }
  ];

  return (
    <div style={{
      backgroundImage: `url('/win11-background.svg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <ClockDisplay user={user} quickActions={quickActions} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mt-auto p-4">
        <DashboardCard
          title="Platform Overview"
          icon={<Globe size={16} className="text-white/80" />}
          data={platformOverviewData}
          animationDelay="0.1s"
          path="/admin/users"
          onOpenDialog={() => openDialog('platform-overview')}
        />

        <DashboardCard
          title="Provider Performance"
          icon={<Building size={16} className="text-white/80" />}
          data={providerPerformanceData}
          animationDelay="0.2s"
          path="/admin/providers"
          onOpenDialog={() => openDialog('provider-performance')}
        />

        <DashboardCard
          title="Order Metrics"
          icon={<ShoppingBag size={16} className="text-white/80" />}
          data={orderMetricsData}
          animationDelay="0.3s"
          path="/admin/reports"
          onOpenDialog={() => openDialog('order-metrics')}
        />

        <DashboardCard
          title="Finance Insights"
          icon={<DollarSign size={16} className="text-white/80" />}
          data={financeInsightsData}
          animationDelay="0.4s"
          path="/admin/reports"
          onOpenDialog={() => openDialog('finance-insights')}
        />
      </div>

      <AlertDialog 
        open={['platform-overview', 'provider-performance', 'order-metrics', 'finance-insights'].includes(activeDialog || '')} 
        onOpenChange={() => closeDialog()}
      >
        <AlertDialogContent className="neo-blur modal-glassmorphism text-white border-white/20">
          <DashboardDialogContent 
            dialogId={activeDialog || ''} 
            stats={stats}
            onClose={closeDialog}
            navigateTo={navigateTo}
          />
        </AlertDialogContent>
      </AlertDialog>

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
        {activeDialog === 'create-company' && <CompaniesModal onClose={closeDialog} />}
      </Dialog>

      <Dialog 
        open={activeDialog === 'add-provider'} 
        onOpenChange={() => {
          if (activeDialog === 'add-provider') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'add-provider' && <ProvidersModal onClose={closeDialog} />}
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

export default DashboardPage;
