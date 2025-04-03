
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/lib/types';
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  Package, 
  CheckCircle, 
  PackageCheck, 
  User, 
  Clock
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrderWithDetails extends Order {
  user_name: string;
  meal_name: string;
}

interface MealCount {
  name: string;
  count: number;
}

interface OrdersModalProps {
  company: { id: string; name: string; orderCount: number };
  date: Date;
  onClose: () => void;
  onOrderStatusChange: () => void;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ 
  company,
  date,
  onClose,
  onOrderStatusChange
}) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mealCounts, setMealCounts] = useState<MealCount[]>([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [company.id, date]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const selectedDateStr = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(first_name, last_name),
          lunch_options(name)
        `)
        .eq('company_id', company.id)
        .eq('date', selectedDateStr);
      
      if (error) throw error;
      
      if (data) {
        // Transform the data for easier use
        const processedOrders = data.map(order => ({
          ...order,
          user_name: `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`,
          meal_name: order.lunch_options?.name || '',
        }));
        
        setOrders(processedOrders as OrderWithDetails[]);
        
        // Calculate meal counts
        const counts: Record<string, number> = {};
        processedOrders.forEach(order => {
          counts[order.meal_name] = (counts[order.meal_name] || 0) + 1;
        });
        
        const mealCountArray = Object.entries(counts).map(([name, count]) => ({
          name,
          count
        }));
        
        setMealCounts(mealCountArray);
        
        // Calculate unique users
        const uniqueUsers = new Set(processedOrders.map(order => order.user_id));
        setUserCount(uniqueUsers.size);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'prepared' | 'approved') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
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
        description: newStatus === 'prepared' 
          ? 'Order marked as dispatched' 
          : 'Order marked as pending',
      });

      // Notify parent component
      onOrderStatusChange();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  // Filter orders based on the search term
  const filteredOrders = orders.filter(order => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      order.user_name.toLowerCase().includes(lowerSearchTerm) ||
      order.meal_name.toLowerCase().includes(lowerSearchTerm)
    );
  });

  // Separate pending and dispatched orders
  const pendingOrders = filteredOrders.filter(order => 
    order.status !== 'prepared' && order.status !== 'delivered'
  );
  const dispatchedOrders = filteredOrders.filter(order => 
    order.status === 'prepared' || order.status === 'delivered'
  );

  return (
    <DialogContent 
      className="sm:max-w-3xl blue-glass-modal overflow-y-auto max-h-[90vh] shadow-2xl backdrop-blur-2xl"
      onInteractOutside={(e) => {
        e.preventDefault();
        onClose();
      }}
      onEscapeKeyDown={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader className="pb-4 border-b border-white/20">
        <div className="flex items-center">
          <Button 
            variant="ghost"
            size="sm"
            className="mr-2 rounded-full p-0 h-8 w-8 text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <DialogTitle className="text-2xl font-bold text-white">
              {company.name}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Orders for {format(date, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="py-3">
        {/* Summary section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="flex items-center mb-1">
              <Package className="text-white/70 h-5 w-5 mr-2" />
              <h3 className="text-white/90 font-medium">Total Orders</h3>
            </div>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="flex items-center mb-1">
              <User className="text-white/70 h-5 w-5 mr-2" />
              <h3 className="text-white/90 font-medium">Total Users</h3>
            </div>
            <p className="text-2xl font-bold text-white">{userCount}</p>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="flex items-center mb-1">
              <CheckCircle className="text-white/70 h-5 w-5 mr-2" />
              <h3 className="text-white/90 font-medium">Meal Count</h3>
            </div>
            <div className="text-sm text-white/90">
              {mealCounts.map((meal, i) => (
                <div key={i} className="flex justify-between">
                  <span>{meal.name}:</span>
                  <span className="font-medium">{meal.count}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/60" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[280px] bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8 text-white">
            <p>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 mr-2 text-white/80" />
                  <h3 className="text-lg font-medium text-white">Pending Orders</h3>
                </div>
                <div className="rounded-md border border-white/20 overflow-hidden blue-glass-table">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Meal</TableHead>
                        <TableHead className="w-[120px] text-white">Status</TableHead>
                        <TableHead className="w-[100px] text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-white/10">
                          <TableCell className="font-medium text-white">
                            {order.user_name}
                          </TableCell>
                          <TableCell className="text-white/90">
                            {order.meal_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-200 border-yellow-500/40">
                              {order.status === 'pending' ? 'Pending' : 
                               order.status === 'approved' ? 'Approved' : 
                               order.status === 'rejected' ? 'Rejected' : order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm"
                              variant="outline" 
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-200 border-green-500/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(order.id, 'prepared');
                              }}
                            >
                              <PackageCheck className="h-4 w-4 mr-1" />
                              Dispatch
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {/* Dispatched Orders */}
            {dispatchedOrders.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <PackageCheck className="h-5 w-5 mr-2 text-white/80" />
                  <h3 className="text-lg font-medium text-white">Dispatched Orders</h3>
                </div>
                <div className="rounded-md border border-white/20 overflow-hidden blue-glass-table">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Meal</TableHead>
                        <TableHead className="w-[120px] text-white">Status</TableHead>
                        <TableHead className="w-[100px] text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dispatchedOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-white/10">
                          <TableCell className="font-medium text-white">
                            {order.user_name}
                          </TableCell>
                          <TableCell className="text-white/90">
                            {order.meal_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-500/20 text-green-200 border-green-500/40">
                              Dispatched
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm"
                              variant="outline" 
                              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border-yellow-500/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(order.id, 'approved');
                              }}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Pending
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-white/30 mb-4" />
            <p className="text-xl font-medium text-white mb-2">No orders found</p>
            <p className="text-white/60 max-w-md">
              {searchTerm ? 
                'No orders match your search. Try a different search term.' :
                'There are no orders for this company on the selected date.'
              }
            </p>
          </div>
        )}
      </div>

      <DialogFooter className="border-t border-white/20 pt-4">
        <div className="text-xs text-white/60">
          {filteredOrders.length === orders.length ? 
            `Showing all ${orders.length} orders` : 
            `Showing ${filteredOrders.length} of ${orders.length} orders`}
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default OrdersModal;
