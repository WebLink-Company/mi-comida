
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, ChefHat, ShoppingBag, Clock } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { CompaniesTable } from '@/components/admin/companies/CompaniesTable';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    providers: 0,
    orders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [recentProviders, setRecentProviders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch counts first
        const usersCountResponse = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        const companiesCountResponse = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });
          
        const providersCountResponse = await supabase
          .from('providers')
          .select('*', { count: 'exact', head: true });
          
        const ordersCountResponse = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        // Fetch recent data
        const [
          activityResponse,
          recentUsersResponse,
          recentCompaniesResponse,
          recentProvidersResponse
        ] = await Promise.all([
          supabase.from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(5),
          supabase.from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('companies')
            .select('*, providers(business_name)')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('providers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        // Need to handle the orders query separately due to the relationship issue
        const recentOrdersResponse = await supabase
          .from('orders')
          .select(`
            *,
            user:profiles!orders_user_id_fkey(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Check for errors
        if (usersCountResponse.error) throw new Error(`Error fetching users count: ${usersCountResponse.error.message}`);
        if (companiesCountResponse.error) throw new Error(`Error fetching companies count: ${companiesCountResponse.error.message}`);
        if (providersCountResponse.error) throw new Error(`Error fetching providers count: ${providersCountResponse.error.message}`);
        if (ordersCountResponse.error) throw new Error(`Error fetching orders count: ${ordersCountResponse.error.message}`);
        if (activityResponse.error) throw new Error(`Error fetching activity: ${activityResponse.error.message}`);
        if (recentUsersResponse.error) throw new Error(`Error fetching recent users: ${recentUsersResponse.error.message}`);
        if (recentCompaniesResponse.error) throw new Error(`Error fetching recent companies: ${recentCompaniesResponse.error.message}`);
        if (recentProvidersResponse.error) throw new Error(`Error fetching recent providers: ${recentProvidersResponse.error.message}`);
        if (recentOrdersResponse.error) throw new Error(`Error fetching recent orders: ${recentOrdersResponse.error.message}`);

        setStats({
          users: usersCountResponse.count || 0,
          companies: companiesCountResponse.count || 0,
          providers: providersCountResponse.count || 0,
          orders: ordersCountResponse.count || 0,
        });

        setRecentActivity(activityResponse.data || []);
        setRecentUsers(recentUsersResponse.data || []);
        setRecentCompanies(recentCompaniesResponse.data || []);
        setRecentProviders(recentProvidersResponse.data || []);
        setRecentOrders(recentOrdersResponse.data || []);
        setLastUpdated(formatDistanceToNow(new Date(), { addSuffix: true }));
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
        toast({
          title: "Error loading dashboard data",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time listener for updates
    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        // Refresh data when changes occur
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate trend percentages - using random values for now as specified
  const calculateTrend = (min = 2, max = 15) => {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    const isPositive = Math.random() > 0.3; // 70% chance of positive trend for better UX
    return { value, isPositive };
  };

  // Quick view components
  const UsersQuickView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{`${user.first_name} ${user.last_name}`}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant="outline">{user.role}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const CompaniesQuickView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Subsidy %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentCompanies.map((company) => (
          <TableRow key={company.id}>
            <TableCell className="font-medium">{company.name}</TableCell>
            <TableCell>{company.providers?.business_name || 'Not assigned'}</TableCell>
            <TableCell>{company.subsidy_percentage}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const ProvidersQuickView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Provider Name</TableHead>
          <TableHead>Contact Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentProviders.map((provider) => (
          <TableRow key={provider.id}>
            <TableCell className="font-medium">{provider.business_name}</TableCell>
            <TableCell>{provider.contact_email}</TableCell>
            <TableCell>
              <Badge variant={provider.is_active ? "success" : "secondary"}>
                {provider.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const OrdersQuickView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">
              {order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Unknown'}
            </TableCell>
            <TableCell>{order.date ? format(new Date(order.date), 'MMM d, yyyy') : 'N/A'}</TableCell>
            <TableCell>
              <Badge 
                variant={
                  order.status === 'approved' ? 'success' : 
                  order.status === 'rejected' ? 'destructive' : 
                  'secondary'
                }
              >
                {order.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your platform's performance and activity.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p className="font-medium">Failed to load dashboard data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={<Users className="h-4 w-4" />} 
          description="Active users across all roles"
          trend={calculateTrend()}
          loading={loading}
          linkTo="/admin/users"
          lastUpdated={lastUpdated}
          quickViewComponent={<UsersQuickView />}
        />
        <StatCard 
          title="Companies" 
          value={stats.companies} 
          icon={<Building className="h-4 w-4" />} 
          description="Client companies registered"
          trend={calculateTrend()}
          loading={loading}
          linkTo="/admin/companies"
          lastUpdated={lastUpdated}
          quickViewComponent={<CompaniesQuickView />}
        />
        <StatCard 
          title="Food Providers" 
          value={stats.providers} 
          icon={<ChefHat className="h-4 w-4" />} 
          description="Active food providers"
          trend={calculateTrend()}
          loading={loading}
          linkTo="/admin/providers"
          lastUpdated={lastUpdated}
          quickViewComponent={<ProvidersQuickView />}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={<ShoppingBag className="h-4 w-4" />} 
          description="Orders processed to date"
          trend={calculateTrend()}
          loading={loading}
          linkTo="/admin/orders"
          lastUpdated={lastUpdated}
          quickViewComponent={<OrdersQuickView />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{activity.action}</TableCell>
                    <TableCell>{activity.table_name}</TableCell>
                    <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No recent activity</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
