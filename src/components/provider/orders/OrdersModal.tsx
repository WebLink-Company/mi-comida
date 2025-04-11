
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Package, CheckCircle, Clock, TruckDelivery, Users } from 'lucide-react';
import OrderStatusBadge from '@/components/employee/OrderStatusBadge';
import { Badge } from '@/components/ui/badge';

interface OrdersModalProps {
  company: {
    id: string;
    name: string;
    orderCount: number;
  };
  date: Date;
  onClose: () => void;
  onOrderStatusChange?: () => void;
}

type Order = {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'prepared' | 'delivered';
  user_id: string;
  lunch_option_id: string;
  profiles?: { first_name: string; last_name: string };
  lunch_options?: { name: string; price: number };
  created_at: string;
};

const OrdersModal: React.FC<OrdersModalProps> = ({ company, date, onClose, onOrderStatusChange }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    fetchOrders();
  }, [company.id, date]);
  
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          status, 
          user_id, 
          lunch_option_id,
          created_at,
          profiles:user_id(first_name, last_name),
          lunch_options:lunch_option_id(name, price)
        `)
        .eq('company_id', company.id)
        .eq('date', dateStr);
      
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('No se pudieron cargar los pedidos');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos de esta empresa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (orderId: string, newStatus: 'approved' | 'prepared' | 'delivered' | 'rejected') => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast({
        title: 'Pedido actualizado',
        description: `El estado del pedido ha sido actualizado a "${getStatusText(newStatus)}"`,
      });
      
      // Notify parent component that an order status has changed
      if (onOrderStatusChange) {
        onOrderStatusChange();
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'prepared': return 'Preparado';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };
  
  const filterOrdersByStatus = () => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => order.status === activeTab);
  };
  
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const approvedCount = orders.filter(o => o.status === 'approved').length;
  const preparedCount = orders.filter(o => o.status === 'prepared').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  
  const filteredOrders = filterOrdersByStatus();
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Pedidos de {company.name} - {format(date, 'PPP', { locale: es })}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <p>Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-center">{error}</p>
            <Button onClick={fetchOrders} className="mt-4">
              Intentar de nuevo
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-center">No hay pedidos para esta empresa en la fecha seleccionada</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {new Set(orders.map(o => o.user_id)).size} usuarios con pedidos
                </span>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 px-3">
                {orders.length} pedidos en total
              </Badge>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  Todos ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">
                  <Clock className="h-4 w-4 mr-1" />
                  Pendientes ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprobados ({approvedCount})
                </TabsTrigger>
                <TabsTrigger value="prepared" className="flex-1">
                  <Package className="h-4 w-4 mr-1" />
                  Preparados ({preparedCount})
                </TabsTrigger>
                <TabsTrigger value="delivered" className="flex-1">
                  <TruckDelivery className="h-4 w-4 mr-1" />
                  Entregados ({deliveredCount})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                <div className="space-y-4">
                  {filteredOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="bg-white rounded-lg shadow p-4 border border-gray-100"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            {order.lunch_options?.name || "Plato desconocido"}
                          </h4>
                          
                          <p className="text-sm text-gray-600">
                            Solicitado por: {order.profiles?.first_name} {order.profiles?.last_name}
                          </p>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-semibold mr-2">
                              ${order.lunch_options?.price.toFixed(2) || "0.00"}
                            </span>
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex gap-2">
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                onClick={() => handleUpdateStatus(order.id, 'approved')}
                                className="bg-green-500 hover:bg-green-600 text-white"
                                disabled={isUpdating}
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprobar
                              </Button>
                              
                              <Button 
                                onClick={() => handleUpdateStatus(order.id, 'rejected')}
                                variant="destructive"
                                disabled={isUpdating}
                                size="sm"
                              >
                                Rechazar
                              </Button>
                            </>
                          )}
                          
                          {order.status === 'approved' && (
                            <Button 
                              onClick={() => handleUpdateStatus(order.id, 'prepared')}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={isUpdating}
                              size="sm"
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Marcar como Preparado
                            </Button>
                          )}
                          
                          {order.status === 'prepared' && (
                            <Button 
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              className="bg-purple-500 hover:bg-purple-600 text-white"
                              disabled={isUpdating}
                              size="sm"
                            >
                              <TruckDelivery className="h-4 w-4 mr-1" />
                              Marcar como Entregado
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrdersModal;
