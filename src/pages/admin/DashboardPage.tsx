
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, ChefHat, ShoppingBag, Clock, BarChart3, CreditCard, Activity } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { CompaniesTable } from '@/components/admin/companies/CompaniesTable';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    providers: 0,
    orders: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    averageOrdersPerProvider: 0,
    activeProviders: 0,
    inactiveProviders: 0,
    providersWithNoCompanies: 0,
    billingThisMonth: 0,
    pendingInvoices: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [recentProviders, setRecentProviders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [topCompany, setTopCompany] = useState<string>('');
  const [mostActiveProvider, setMostActiveProvider] = useState<string>('');
  const [greeting, setGreeting] = useState("");

  // Determine greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let greetingText = '';
    
    if (hour < 12) {
      greetingText = 'Good morning';
    } else if (hour < 18) {
      greetingText = 'Good afternoon';
    } else {
      greetingText = 'Good evening';
    }
    
    setGreeting(greetingText);
  }, []);

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
        
        // Additional queries for new metrics
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        
        const ordersTodayResponse = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('date', today);
          
        const ordersThisWeekResponse = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('date', weekAgoStr);
          
        const activeProvidersResponse = await supabase
          .from('providers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
          
        const inactiveProvidersResponse = await supabase
          .from('providers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', false);
          
        // Fetch providers with no companies
        const providersWithCompaniesResponse = await supabase
          .from('companies')
          .select('provider_id', { count: 'exact', head: false });
          
        const providersWithNoCompaniesCount = 
          (providersCountResponse.count || 0) - 
          (new Set(providersWithCompaniesResponse.data?.map(c => c.provider_id) || []).size);
          
        // Get most active provider (simplified - would need a more complex query in real app)
        const mostActiveProviderResponse = await supabase
          .from('providers')
          .select('business_name')
          .eq('is_active', true)
          .limit(1)
          .single();
          
        // Get top company by consumption (simplified)
        const topCompanyResponse = await supabase
          .from('companies')
          .select('name')
          .limit(1)
          .single();

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
        if (ordersTodayResponse.error) throw new Error(`Error fetching orders today: ${ordersTodayResponse.error.message}`);
        if (ordersThisWeekResponse.error) throw new Error(`Error fetching orders this week: ${ordersThisWeekResponse.error.message}`);

        setStats({
          users: usersCountResponse.count || 0,
          companies: companiesCountResponse.count || 0,
          providers: providersCountResponse.count || 0,
          orders: ordersCountResponse.count || 0,
          ordersToday: ordersTodayResponse.count || 0,
          ordersThisWeek: ordersThisWeekResponse.count || 0,
          averageOrdersPerProvider: providersCountResponse.count ? 
            Math.round((ordersCountResponse.count || 0) / providersCountResponse.count) : 0,
          activeProviders: activeProvidersResponse.count || 0,
          inactiveProviders: inactiveProvidersResponse.count || 0,
          providersWithNoCompanies: providersWithNoCompaniesCount,
          billingThisMonth: Math.floor(Math.random() * 10000), // Mock data
          pendingInvoices: Math.floor(Math.random() * 20), // Mock data
        });

        if (mostActiveProviderResponse.data) {
          setMostActiveProvider(mostActiveProviderResponse.data.business_name);
        }
        
        if (topCompanyResponse.data) {
          setTopCompany(topCompanyResponse.data.name);
        }

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
      {/* Glassmorphic Welcome Section */}
      <div className="bg-background/30 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-lg transition-all hover:shadow-xl animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {greeting}, {user?.first_name || 'Admin'} 👋
            </h1>
            <p className="text-muted-foreground">
              What would you like to work on today?
            </p>
          </div>
          <div className="mt-2 md:mt-0 text-right text-sm text-muted-foreground">
            <div>{format(new Date(), 'EEEE, MMMM d, yyyy')}</div>
            <div>{format(new Date(), 'h:mm a')}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p className="font-medium">Failed to load dashboard data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Grouped Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Platform Overview Group */}
        <Card className="overflow-hidden col-span-2 md:col-span-1 transition-all duration-200 hover:shadow-md backdrop-blur-sm bg-background/50 border-primary/10 hover:bg-background/70 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-primary/5 pb-2">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold">{stats.companies}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Providers</p>
                <p className="text-2xl font-bold">{stats.providers}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.orders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Performance Group */}
        <Card className="overflow-hidden col-span-2 md:col-span-1 transition-all duration-200 hover:shadow-md backdrop-blur-sm bg-background/50 border-primary/10 hover:bg-background/70 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-amber-300/5 pb-2">
            <CardTitle className="flex items-center text-lg">
              <ChefHat className="h-5 w-5 mr-2 text-amber-500" />
              Provider Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Most Active Provider</p>
                <p className="text-lg font-medium truncate">{mostActiveProvider || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Providers</p>
                  <p className="text-2xl font-bold">{stats.activeProviders}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Inactive Providers</p>
                  <p className="text-2xl font-bold">{stats.inactiveProviders}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Providers with No Companies</p>
                <p className="text-2xl font-bold">{stats.providersWithNoCompanies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Metrics Group */}
        <Card className="overflow-hidden col-span-2 md:col-span-1 transition-all duration-200 hover:shadow-md backdrop-blur-sm bg-background/50 border-primary/10 hover:bg-background/70 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-300/5 pb-2">
            <CardTitle className="flex items-center text-lg">
              <ShoppingBag className="h-5 w-5 mr-2 text-green-500" />
              Order Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Orders Today</p>
                <p className="text-2xl font-bold">{stats.ordersToday}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Orders This Week</p>
                <p className="text-2xl font-bold">{stats.ordersThisWeek}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Per Provider</p>
                <p className="text-2xl font-bold">{stats.averageOrdersPerProvider}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finance Insights Group */}
        <Card className="overflow-hidden col-span-2 md:col-span-1 transition-all duration-200 hover:shadow-md backdrop-blur-sm bg-background/50 border-primary/10 hover:bg-background/70 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-300/5 pb-2">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
              Finance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Billing This Month</p>
                <p className="text-2xl font-bold">${stats.billingThisMonth.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
                <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Top Company</p>
                <p className="text-lg font-medium truncate">{topCompany || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Card */}
      <Card className="transition-all duration-200 hover:shadow-md backdrop-blur-sm bg-background/50 border-primary/10 hover:bg-background/70 animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-gray-500/10 to-gray-300/5">
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-gray-500" />
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
                  <TableRow key={index} className="hover:bg-background/80">
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
