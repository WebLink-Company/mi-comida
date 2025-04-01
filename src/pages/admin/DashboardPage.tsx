
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, ChefHat, ShoppingBag, Clock } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    providers: 0,
    orders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [usersRes, companiesRes, providersRes, ordersRes, activityRes] = await Promise.all([
          supabase.from('profiles').select('count'),
          supabase.from('companies').select('count'),
          supabase.from('providers').select('count'),
          supabase.from('orders').select('count'),
          supabase.from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(5)
        ]);

        setStats({
          users: usersRes.count || 0,
          companies: companiesRes.count || 0,
          providers: providersRes.count || 0,
          orders: ordersRes.count || 0,
        });

        setRecentActivity(activityRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your platform's performance and activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={<Users className="h-4 w-4" />} 
          description="Active users across all roles"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Companies" 
          value={stats.companies} 
          icon={<Building className="h-4 w-4" />} 
          description="Client companies registered"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard 
          title="Food Providers" 
          value={stats.providers} 
          icon={<ChefHat className="h-4 w-4" />} 
          description="Active food providers"
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={<ShoppingBag className="h-4 w-4" />} 
          description="Orders processed to date"
          trend={{ value: 8, isPositive: true }}
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
