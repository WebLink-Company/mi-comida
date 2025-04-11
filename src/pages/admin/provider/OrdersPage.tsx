
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar, Filter, Package, CheckCircle2, Clock, Truck, Users } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types';

const OrdersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyIds, setCompanyIds] = useState<string[]>([]);

  useEffect(() => {
    // When component mounts, fetch companies associated with the provider
    if (user?.provider_id) {
      fetchProviderCompanies();
    }
  }, [user]);

  useEffect(() => {
    // Only fetch orders if we have the company IDs and a date selected
    if (companyIds.length > 0 && selectedDate) {
      fetchOrders();
    }
  }, [companyIds, selectedDate, statusFilter]);

  const fetchProviderCompanies = async () => {
    try {
      console.log("Fetching companies for provider:", user?.provider_id);
      
      const { data: companies, error } = await supabase
        .from('companies')
        .select('id')
        .eq('provider_id', user?.provider_id);
      
      if (error) throw error;
      
      if (companies && companies.length > 0) {
        const ids = companies.map(company => company.id);
        console.log("Found company IDs:", ids);
        setCompanyIds(ids);
      } else {
        console.log("No companies found for this provider");
        setCompanyIds([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching provider companies:", error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las empresas asociadas a este proveedor.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      // Only proceed if we have companies to query
      if (companyIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      console.log("Fetching orders for date:", format(selectedDate, 'yyyy-MM-dd'));
      console.log("With status filter:", statusFilter);
      console.log("For companies:", companyIds);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(first_name, last_name),
          lunch_options(name, price),
          companies(name)
        `)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .in('company_id', companyIds);
      
      // Apply status filter if not "all"
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        console.log(`Found ${data.length} orders for selected date and filters`);
        
        // Transform the data to add user_name and meal_name
        const processedOrders = data.map(order => ({
          ...order,
          user_name: `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`,
          meal_name: order.lunch_options?.name || '',
          company_name: order.companies?.name || '',
        }));

        setOrders(processedOrders as Order[]);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'prepared':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Prepared</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="flex items-center space-x-2">
          <DatePicker 
            date={selectedDate}
            onSelect={setSelectedDate}
            className="w-[180px]"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="prepared">Prepared</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
          <CardDescription>
            Manage lunch orders for the selected date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Meal</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-4 align-middle font-medium">{order.user_name}</td>
                        <td className="p-4 align-middle">{order.meal_name}</td>
                        <td className="p-4 align-middle">{order.company_name}</td>
                        <td className="p-4 align-middle">{getStatusBadge(order.status)}</td>
                        <td className="p-4 align-middle">
                          {order.status === 'approved' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(order.id, 'prepared')}
                              className="mr-2"
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Mark Prepared
                            </Button>
                          )}
                          {order.status === 'prepared' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Truck className="mr-1 h-4 w-4" />
                              Mark Delivered
                            </Button>
                          )}
                          {(order.status === 'pending' || !['pending', 'approved', 'prepared', 'delivered'].includes(order.status)) && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusChange(order.id, 'approved')}
                                className="mr-2"
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleStatusChange(order.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>No orders found for the selected date and filters</p>
              {companyIds.length === 0 && (
                <p className="mt-2 text-sm">No companies associated with this provider.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
