
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar, CheckCircle, XCircle, PackageCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DatePicker } from "@/components/ui/date-picker";

interface Order {
  id: string;
  user_id: string;
  lunch_option_id: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'prepared' | 'delivered';
  company_id: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  meal_name?: string;
  company_name?: string;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [selectedDate, activeTab]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(first_name, last_name),
          lunch_options!orders_lunch_option_id_fkey(name),
          companies!orders_company_id_fkey(name)
        `)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));
      
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format the data with additional user and meal information
      const formattedOrders = data.map(order => ({
        ...order,
        user_name: `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`,
        meal_name: order.lunch_options?.name || 'Unknown meal',
        company_name: order.companies?.name || 'Unknown company'
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'approved' | 'rejected' | 'prepared' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      toast({
        title: 'Success',
        description: `Order status updated to ${status}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'prepared':
        return <Badge className="bg-amber-500">Prepared</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderActionButtons = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-500 border-green-500 hover:bg-green-500/10"
              onClick={() => updateOrderStatus(order.id, 'approved')}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 border-red-500 hover:bg-red-500/10 ml-2"
              onClick={() => updateOrderStatus(order.id, 'rejected')}
            >
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </>
        );
      case 'approved':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-amber-500 border-amber-500 hover:bg-amber-500/10"
            onClick={() => updateOrderStatus(order.id, 'prepared')}
          >
            <PackageCheck className="h-4 w-4 mr-1" /> Mark Prepared
          </Button>
        );
      case 'prepared':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 border-green-600 hover:bg-green-600/10"
            onClick={() => updateOrderStatus(order.id, 'delivered')}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Mark Delivered
          </Button>
        );
      case 'delivered':
        return (
          <Button variant="ghost" size="sm" disabled>
            Completed
          </Button>
        );
      default:
        return null;
    }
  };

  const countByStatus = {
    all: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    approved: orders.filter(order => order.status === 'approved').length,
    prepared: orders.filter(order => order.status === 'prepared').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Orders Management</h1>
          <p className="text-white/70">View and manage customer orders for meal delivery</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-white/70" />
            <DatePicker
              date={selectedDate}
              onSelect={setSelectedDate}
              className="bg-white/20 border-white/20 text-white"
            />
          </div>
        </div>
      </div>

      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="mb-4 overflow-x-auto">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/10">
              All Orders <Badge className="ml-2 bg-white/20 text-white">{countByStatus.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-white data-[state=active]:bg-white/10">
              Pending <Badge className="ml-2 bg-white/20 text-white">{countByStatus.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-white data-[state=active]:bg-white/10">
              Approved <Badge className="ml-2 bg-white/20 text-white">{countByStatus.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="prepared" className="text-white data-[state=active]:bg-white/10">
              Prepared <Badge className="ml-2 bg-white/20 text-white">{countByStatus.prepared}</Badge>
            </TabsTrigger>
            <TabsTrigger value="delivered" className="text-white data-[state=active]:bg-white/10">
              Delivered <Badge className="ml-2 bg-white/20 text-white">{countByStatus.delivered}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab}>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Orders for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
              <CardDescription className="text-white/70">
                Manage orders and update their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-white/70" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-white/70">
                  <AlertCircle className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No orders found for this date</p>
                  <p className="text-sm mt-2">Try selecting a different date or status filter</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white/70">Customer</TableHead>
                      <TableHead className="text-white/70">Company</TableHead>
                      <TableHead className="text-white/70">Meal</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                      <TableHead className="text-white/70">Order Time</TableHead>
                      <TableHead className="text-white/70">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium">{order.user_name}</TableCell>
                        <TableCell>{order.company_name}</TableCell>
                        <TableCell>{order.meal_name}</TableCell>
                        <TableCell>{renderStatusBadge(order.status)}</TableCell>
                        <TableCell>{format(new Date(order.created_at), 'h:mm a')}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {renderActionButtons(order)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
