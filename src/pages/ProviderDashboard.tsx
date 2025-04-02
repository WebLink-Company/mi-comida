
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Dialog } from '@/components/ui/dialog';
import NavigationBar from '@/components/NavigationBar';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { ProviderDashboardCard } from '@/components/provider/dashboard/ProviderDashboardCard';
import { ProviderDialogContent } from '@/components/provider/dashboard/ProviderDialogContents';
import { Building, DollarSign, ChefHat, ShoppingBag, FileText, Plus, ClipboardList, UserPlus } from 'lucide-react';
import "@/styles/dashboard.css";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    ordersThisWeek: 0,
    totalBilledThisMonth: 0,
    pendingInvoices: 0,
    topCompanyByOrders: 'N/A',
    recentActivities: [] as Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
    }>,
  });

  const fetchDashboardData = async () => {
    try {
      if (!user || !user.id) return;

      // Get provider details for the current user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('provider_id')
        .eq('id', user.id)
        .single();
      
      if (!profileData?.provider_id) return;

      // Get total companies for this provider
      const { count: companyCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', profileData.provider_id);

      // Get total users for companies under this provider
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('provider_id', profileData.provider_id);

      let totalUsers = 0;
      if (companies && companies.length > 0) {
        const companyIds = companies.map(company => company.id);
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('company_id', companyIds);
        
        totalUsers = userCount || 0;
      }

      // Mock data for demonstration purposes
      setStats({
        totalCompanies: companyCount || 0,
        totalUsers: totalUsers,
        ordersThisWeek: Math.floor(Math.random() * 100) + 50,
        totalBilledThisMonth: Math.floor(Math.random() * 10000) + 2000,
        pendingInvoices: Math.floor(Math.random() * 10) + 1,
        topCompanyByOrders: 'Acme Corp',
        recentActivities: [
          {
            id: '1',
            type: 'New Company',
            description: 'Tech Solutions Inc. was registered',
            timestamp: '2 hours ago'
          },
          {
            id: '2',
            type: 'New Order',
            description: 'Acme Corp placed 15 lunch orders',
            timestamp: '5 hours ago'
          },
          {
            id: '3',
            type: 'User Registration',
            description: 'John Doe from Global Tech joined',
            timestamp: '1 day ago'
          },
          {
            id: '4',
            type: 'Invoice Paid',
            description: 'Invoice #2587 was paid by Acme Corp',
            timestamp: '2 days ago'
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const openDialog = (dialogId: string) => {
    setActiveDialog(dialogId);
  };

  const closeDialog = () => {
    setTimeout(() => {
      setActiveDialog(null);
    }, 50);
  };

  const quickActions = [
    { label: 'Add Company', icon: Building, action: () => openDialog('add-company'), path: '/provider/companies' },
    { label: 'Create Invoice', icon: FileText, action: () => openDialog('create-invoice'), path: '/provider/finance' },
    { label: 'Add Menu Item', icon: ChefHat, action: () => openDialog('add-menu-item'), path: '/provider/menu' },
    { label: 'View Orders', icon: ShoppingBag, action: () => openDialog('view-orders'), path: '/provider/orders' },
  ];

  const overviewData = [
    { label: 'Total Companies', value: stats.totalCompanies, path: '/provider/companies' },
    { label: 'Total Users', value: stats.totalUsers, path: '/provider/users' },
    { label: 'Orders This Week', value: stats.ordersThisWeek, path: '/provider/orders' },
  ];

  const financeData = [
    { label: 'Billed This Month', value: `$${stats.totalBilledThisMonth.toLocaleString()}`, path: '/provider/finance' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, path: '/provider/finance' },
    { label: 'Top Company', value: stats.topCompanyByOrders, path: '/provider/companies' },
  ];

  return (
    <div className="min-h-screen">
      <NavigationBar 
        userRole="provider" 
        userName={`${user?.first_name || ''} ${user?.last_name || ''}`} 
      />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ClockDisplay 
            user={user} 
            quickActions={quickActions} 
            subtitle="Here's your daily business summary"
            role="provider"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto mt-auto p-4">
            <ProviderDashboardCard
              title="Business Overview"
              icon={<Building size={16} className="text-white/80" />}
              data={overviewData}
              animationDelay="0.1s"
              path="/provider/companies"
              onOpenDialog={() => openDialog('provider-overview')}
              gradientClass="from-blue-500/30 to-cyan-500/30"
            />
            
            <ProviderDashboardCard
              title="Finance"
              icon={<DollarSign size={16} className="text-white/80" />}
              data={financeData}
              animationDelay="0.2s"
              path="/provider/finance"
              onOpenDialog={() => openDialog('provider-finance')}
              gradientClass="from-emerald-500/30 to-green-600/30"
            />
            
            <ProviderDashboardCard
              title="Recent Activity"
              icon={<ClipboardList size={16} className="text-white/80" />}
              data={stats.recentActivities.slice(0, 3).map(activity => ({
                label: activity.type,
                value: activity.timestamp,
                path: '/provider/activity'
              }))}
              animationDelay="0.3s"
              path="/provider/activity"
              onOpenDialog={() => openDialog('provider-activity')}
              gradientClass="from-purple-500/30 to-pink-600/30"
            />
          </div>
        </div>

        <AlertDialog 
          open={['provider-overview', 'provider-finance', 'provider-activity'].includes(activeDialog || '')} 
          onOpenChange={() => closeDialog()}
        >
          <AlertDialogContent className="neo-blur modal-glassmorphism text-white border-white/20">
            <ProviderDialogContent 
              dialogId={activeDialog || ''} 
              stats={stats}
              onClose={closeDialog}
              navigateTo={navigate}
            />
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default ProviderDashboard;
