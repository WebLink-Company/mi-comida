
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const [statusFilter, setStatusFilter] = useState<string>('approved');
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
      console.log("Buscando empresas para el proveedor:", user?.provider_id);
      
      const { data: companies, error } = await supabase
        .from('companies')
        .select('id')
        .eq('provider_id', user?.provider_id);
      
      if (error) throw error;
      
      if (companies && companies.length > 0) {
        const ids = companies.map(company => company.id);
        console.log("Empresas encontradas:", ids);
        setCompanyIds(ids);
      } else {
        console.log("No se encontraron empresas para este proveedor");
        setCompanyIds([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error al buscar empresas del proveedor:", error);
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
      
      console.log("Buscando pedidos para la fecha:", format(selectedDate, 'yyyy-MM-dd'));
      console.log("Con filtro de estado:", statusFilter);
      console.log("Para empresas:", companyIds);
      
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
        console.log(`Se encontraron ${data.length} pedidos para la fecha y filtros seleccionados`);
        
        // Transform the data to add user_name, meal_name, and company_name
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
      console.error('Error al cargar pedidos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos. Intente nuevamente.',
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
        title: 'Éxito',
        description: `Estado del pedido actualizado a ${getStatusText(newStatus)}`,
      });
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        variant: 'destructive',
      });
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'prepared':
        return 'Preparado';
      case 'delivered':
        return 'Entregado';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rechazado</Badge>;
      case 'prepared':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Preparado</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Entregado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
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
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Pedidos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="approved">Aprobados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
              <SelectItem value="prepared">Preparados</SelectItem>
              <SelectItem value="delivered">Entregados</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos para {format(selectedDate, 'MMMM d, yyyy', {locale: es})}</CardTitle>
          <CardDescription>
            Gestione los pedidos de almuerzo para la fecha seleccionada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Cargando pedidos...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plato</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Empresa</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
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
                              Marcar Preparado
                            </Button>
                          )}
                          {order.status === 'prepared' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Truck className="mr-1 h-4 w-4" />
                              Marcar Entregado
                            </Button>
                          )}
                          {(order.status === 'pending' || !['pending', 'approved', 'prepared', 'delivered'].includes(order.status)) && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusChange(order.id, 'approved')}
                                className="mr-2"
                              >
                                Aprobar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleStatusChange(order.id, 'rejected')}
                              >
                                Rechazar
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
              <p>No se encontraron pedidos para la fecha y filtros seleccionados</p>
              {companyIds.length === 0 && (
                <p className="mt-2 text-sm">No hay empresas asociadas a este proveedor.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
