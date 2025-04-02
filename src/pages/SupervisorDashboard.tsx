
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import NavigationBar from '@/components/NavigationBar';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { SupervisorDashboardCard } from '@/components/supervisor/dashboard/SupervisorDashboardCard';
import { SupervisorDialogContent } from '@/components/supervisor/dashboard/SupervisorDialogContents';
import { 
  ShoppingBag, 
  CalendarDays, 
  Users, 
  DollarSign,  
  ChefHat,
  ClipboardList,
  FileText,
  Building
} from 'lucide-react';
import "@/styles/dashboard.css";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [stats, setStats] = useState({
    ordersCreatedToday: 0,
    pendingOrders: 0,
    companyName: '',
    providerName: '',
    providerLogo: '',
    teamMembers: [] as Array<{ id: string; name: string; role: string }>,
    billingHistory: [] as Array<{ id: string; date: string; amount: number; status: string }>,
  });

  const fetchDashboardData = async () => {
    try {
      if (!user || !user.id) return;

      // Get company details for the current user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (!profileData?.company_id) return;

      // Get company information
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, provider_id')
        .eq('id', profileData.company_id)
        .single();

      if (!companyData) return;

      let providerName = 'Default Provider';
      let providerLogo = '';

      // Get provider information if available
      if (companyData.provider_id) {
        const { data: providerData } = await supabase
          .from('providers')
          .select('business_name, logo')
          .eq('id', companyData.provider_id)
          .single();

        if (providerData) {
          providerName = providerData.business_name;
          providerLogo = providerData.logo || '';
        }
      }

      // Get team members for this company
      const { data: teamData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('company_id', profileData.company_id);

      const formattedTeamMembers = (teamData || []).map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        role: member.role
      }));

      // Mock order data
      const ordersToday = Math.floor(Math.random() * 15) + 1;
      const pendingOrders = Math.floor(Math.random() * 8) + 1;

      // Mock billing history
      const mockBillingHistory = [
        { id: '123e4567-e89b-12d3-a456-426614174000', date: '2023-06-15', amount: 1250, status: 'Paid' },
        { id: '123e4567-e89b-12d3-a456-426614174001', date: '2023-05-15', amount: 1100, status: 'Paid' },
        { id: '123e4567-e89b-12d3-a456-426614174002', date: '2023-04-15', amount: 1350, status: 'Paid' }
      ];

      setStats({
        ordersCreatedToday: ordersToday,
        pendingOrders: pendingOrders,
        companyName: companyData.name,
        providerName: providerName,
        providerLogo: providerLogo,
        teamMembers: formattedTeamMembers,
        billingHistory: mockBillingHistory,
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
    { label: 'Submit Order', icon: ShoppingBag, action: () => navigate('/supervisor/orders/new'), path: '/supervisor/orders/new' },
    { label: 'Team Members', icon: Users, action: () => openDialog('supervisor-team'), path: '/supervisor/team' },
    { label: 'View Billing', icon: FileText, action: () => openDialog('supervisor-billing'), path: '/supervisor/billing' },
    { label: 'Company Info', icon: Building, action: () => navigate('/supervisor/company'), path: '/supervisor/company' },
  ];

  const snapshotData = [
    { label: 'Orders Today', value: stats.ordersCreatedToday, path: '/supervisor/orders' },
    { label: 'Pending Orders', value: stats.pendingOrders, path: '/supervisor/orders' },
    { label: 'Company', value: stats.companyName, path: '/supervisor/company' },
  ];

  const providerData = [
    { 
      label: 'Logo', 
      value: (
        <div className="flex justify-center my-2">
          <Avatar className="w-16 h-16">
            {stats.providerLogo ? (
              <AvatarImage src={stats.providerLogo} alt={stats.providerName} />
            ) : (
              <AvatarFallback className="bg-white/10 text-white text-lg">
                {stats.providerName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      ), 
      path: '/supervisor/provider' 
    },
    { label: 'Name', value: stats.providerName, path: '/supervisor/provider' },
  ];

  const teamData = stats.teamMembers.slice(0, 3).map(member => ({
    label: member.name,
    value: member.role,
    path: '/supervisor/team'
  }));

  const billingData = stats.billingHistory.slice(0, 3).map(bill => ({
    label: bill.date,
    value: `$${bill.amount}`,
    path: '/supervisor/billing'
  }));

  return (
    <div className="min-h-screen">
      <NavigationBar 
        userRole="supervisor" 
        userName={`${user?.first_name || ''} ${user?.last_name || ''}`} 
      />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ClockDisplay 
            user={user} 
            quickActions={quickActions}
            subtitle="Stay on top of your company's activity today"
            role="supervisor"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mt-auto p-4">
            <SupervisorDashboardCard
              title="Today's Snapshot"
              icon={<CalendarDays size={16} className="text-white/80" />}
              data={snapshotData}
              animationDelay="0.1s"
              path="/supervisor/orders"
              onOpenDialog={() => openDialog('supervisor-snapshot')}
              gradientClass="from-violet-500/30 to-purple-600/30"
            />
            
            <SupervisorDashboardCard
              title="Provider Information"
              icon={<ChefHat size={16} className="text-white/80" />}
              data={providerData}
              animationDelay="0.2s"
              path="/supervisor/provider"
              onOpenDialog={() => openDialog('supervisor-provider')}
              gradientClass="from-blue-500/30 to-indigo-600/30"
            />
            
            <SupervisorDashboardCard
              title="Team Overview"
              icon={<Users size={16} className="text-white/80" />}
              data={teamData}
              animationDelay="0.3s"
              path="/supervisor/team"
              onOpenDialog={() => openDialog('supervisor-team')}
              gradientClass="from-cyan-500/30 to-teal-600/30"
            />
            
            <SupervisorDashboardCard
              title="Billing Details"
              icon={<DollarSign size={16} className="text-white/80" />}
              data={billingData}
              animationDelay="0.4s"
              path="/supervisor/billing"
              onOpenDialog={() => openDialog('supervisor-billing')}
              gradientClass="from-amber-500/30 to-orange-600/30"
            />
          </div>
        </div>

        <AlertDialog 
          open={['supervisor-snapshot', 'supervisor-provider', 'supervisor-team', 'supervisor-billing'].includes(activeDialog || '')} 
          onOpenChange={() => closeDialog()}
        >
          <AlertDialogContent className="neo-blur modal-glassmorphism text-white border-white/20">
            <SupervisorDialogContent 
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

export default SupervisorDashboard;
