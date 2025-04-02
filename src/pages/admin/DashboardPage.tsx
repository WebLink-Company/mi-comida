
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, ChefHat, ShoppingBag, Clock } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel for better performance
        const [usersResponse, companiesResponse, providersResponse, ordersResponse, activityResponse] = await Promise.all([
          supabase.from('profiles').select('count'),
          supabase.from('companies').select('count'),
          supabase.from('providers').select('count'),
          supabase.from('orders').select('count'),
          supabase.from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(5)
        ]);

        // Check for errors
        if (usersResponse.error) throw new Error(`Error fetching users: ${usersResponse.error.message}`);
        if (companiesResponse.error) throw new Error(`Error fetching companies: ${companiesResponse.error.message}`);
        if (providersResponse.error) throw new Error(`Error fetching providers: ${providersResponse.error.message}`);
        if (ordersResponse.error) throw new Error(`Error fetching orders: ${ordersResponse.error.message}`);
        if (activityResponse.error) throw new Error(`Error fetching activity: ${activityResponse.error.message}`);

        setStats({
          users: usersResponse.count || 0,
          companies: companiesResponse.count || 0,
          providers: providersResponse.count || 0,
          orders: ordersResponse.count || 0,
        });

        setRecentActivity(activityResponse.data || []);
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
  }, []);

  // Calculate trend percentages - using random values for now as specified
  const calculateTrend = (min = 2, max = 15) => {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    const isPositive = Math.random() > 0.3; // 70% chance of positive trend for better UX
    return { value, isPositive };
  };

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
        />
        <StatCard 
          title="Companies" 
          value={stats.companies} 
          icon={<Building className="h-4 w-4" />} 
          description="Client companies registered"
          trend={calculateTrend()}
          loading={loading}
        />
        <StatCard 
          title="Food Providers" 
          value={stats.providers} 
          icon={<ChefHat className="h-4 w-4" />} 
          description="Active food providers"
          trend={calculateTrend()}
          loading={loading}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={<ShoppingBag className="h-4 w-4" />} 
          description="Orders processed to date"
          trend={calculateTrend()}
          loading={loading}
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
