
import { useEffect, useState } from 'react';
import { Users, Building, ChefHat, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import StatCard from '@/components/admin/StatCard';
import ActivityLog from '@/components/admin/ActivityLog';

const DashboardPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    users: { count: '0', loading: true },
    companies: { count: '0', loading: true },
    providers: { count: '0', loading: true },
    orders: { count: '0', loading: true },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        
        // Fetch companies count
        const { count: companiesCount, error: companiesError } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });
        
        if (companiesError) throw companiesError;
        
        // Fetch providers count
        const { count: providersCount, error: providersError } = await supabase
          .from('providers')
          .select('*', { count: 'exact', head: true });
        
        if (providersError) throw providersError;
        
        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (ordersError) throw ordersError;
        
        setStats({
          users: { count: String(usersCount || 0), loading: false },
          companies: { count: String(companiesCount || 0), loading: false },
          providers: { count: String(providersCount || 0), loading: false },
          orders: { count: String(ordersCount || 0), loading: false },
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: 'Error loading dashboard data',
          description: 'Please try again later',
          variant: 'destructive',
        });
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the LunchWise admin panel</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats.users.loading ? "Loading..." : stats.users.count}
          icon={<Users className="h-6 w-6" />}
          description="All registered platform users"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Companies"
          value={stats.companies.loading ? "Loading..." : stats.companies.count}
          icon={<Building className="h-6 w-6" />}
          description="Registered client companies"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Providers"
          value={stats.providers.loading ? "Loading..." : stats.providers.count}
          icon={<ChefHat className="h-6 w-6" />}
          description="Food service providers"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Orders"
          value={stats.orders.loading ? "Loading..." : stats.orders.count}
          icon={<ClipboardList className="h-6 w-6" />}
          description="Total lunch orders processed"
          trend={{ value: 24, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityLog />
        </div>
        <div>
          {/* Additional content like quick actions or system status can go here */}
          <div className="bg-primary/5 rounded-lg border border-border p-6 h-full">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <div className="bg-background rounded-md p-3 border border-border hover:bg-accent/50 transition cursor-pointer">
                <p className="text-sm font-medium">Add New Provider</p>
              </div>
              <div className="bg-background rounded-md p-3 border border-border hover:bg-accent/50 transition cursor-pointer">
                <p className="text-sm font-medium">Create User Account</p>
              </div>
              <div className="bg-background rounded-md p-3 border border-border hover:bg-accent/50 transition cursor-pointer">
                <p className="text-sm font-medium">Generate Monthly Report</p>
              </div>
              <div className="bg-background rounded-md p-3 border border-border hover:bg-accent/50 transition cursor-pointer">
                <p className="text-sm font-medium">Update System Settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
