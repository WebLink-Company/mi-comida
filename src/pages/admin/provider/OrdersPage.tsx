
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { CalendarIcon, ClipboardCheck, CheckCircle2, Package, TruckIcon } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';

// Define the Order type with a specific status type that matches the database
interface Order {
  id: string;
  user_id: string;
  lunch_option_id: string;
  company_id: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'prepared' | 'delivered';
  approved_by?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  meal_name?: string;
  company_name?: string;
  profiles?: any;
  lunch_options?: any;
  companies?: any;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, selectedDate, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(first_name, last_name),
          lunch_options(name),
          companies(name)
        `)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));
      
      // If provider is logged in, filter by companies associated with this provider
      if (user?.role === 'provider') {
        // First get companies for this provider
        const { data: providerCompanies } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', user.id);

        if (providerCompanies && providerCompanies.length > 0) {
          const companyIds = providerCompanies.map(company => company.id);
          query = query.in('company_id', companyIds);
        }
      }

      // Apply status filter if not "all"
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to add user_name and meal_name
        const processedOrders = data.map(order => ({
          ...order,
          user_name: `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`,
          meal_name: order.lunch_options?.name || '',
          company_name: order.companies?.name || '',
        }));

        setOrders(processedOrders as Order[]);
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
            <ClipboardCheck className="mr-2 h-4 w-4" />
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.user_name}</TableCell>
                    <TableCell>{order.meal_name}</TableCell>
                    <TableCell>{order.company_name}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
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
                          <TruckIcon className="mr-1 h-4 w-4" />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>No orders found for the selected date and filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
