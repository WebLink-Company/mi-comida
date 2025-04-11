
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Package, AlertTriangle } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import OrdersModal from '@/components/provider/orders/OrdersModal';
import CompanyOrderCard from '@/components/provider/orders/CompanyOrderCard';

interface CompanyOrderSummary {
  id: string;
  name: string;
  orders: number;
  users: number;
  dispatched: number;
  pending: number;
  approved: number;
}

const ProviderOrderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [companyOrders, setCompanyOrders] = useState<CompanyOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOrderSummary | null>(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompanyOrders();
    } else {
      setError("No se encontró usuario. Por favor, inicie sesión de nuevo.");
      setLoading(false);
    }
  }, [user, selectedDate]);

  const fetchCompanyOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user?.provider_id) {
        setError("No se encontró ID de proveedor en el perfil del usuario");
        setLoading(false);
        return;
      }
      
      console.log("QUERY EXACTA: Buscando empresas para el proveedor:", user.provider_id);
      
      // First get companies for this provider
      const { data: providerCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('provider_id', user?.provider_id);

      if (companiesError) {
        console.error("Error al obtener empresas:", companiesError);
        setError(`No se pudieron cargar las empresas: ${companiesError.message}`);
        setLoading(false);
        return;
      }

      if (!providerCompanies || providerCompanies.length === 0) {
        console.log("No se encontraron empresas para este proveedor");
        setCompanyOrders([]);
        setLoading(false);
        return;
      }

      console.log(`Se encontraron ${providerCompanies.length} empresas para el proveedor`);
      console.log("Lista de empresas:", providerCompanies.map(c => ({ id: c.id, name: c.name })));
      
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Evitar búsqueda si no hay empresas
      if (providerCompanies.length === 0) {
        setCompanyOrders([]);
        setLoading(false);
        return;
      }
      
      const companyIds = providerCompanies.map(company => company.id);
      
      // Get all orders for these companies on the selected date
      console.log(`QUERY EXACTA: Buscando pedidos para la fecha ${selectedDateStr} en las empresas [${companyIds.join(', ')}]`);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, status, company_id')
        .in('company_id', companyIds)
        .eq('date', selectedDateStr);

      if (ordersError) {
        console.error("Error al obtener pedidos:", ordersError);
        setError(`No se pudieron cargar los pedidos: ${ordersError.message}`);
        setLoading(false);
        return;
      }

      console.log(`Se encontraron ${orders?.length || 0} pedidos en total para la fecha ${selectedDateStr}`);
      console.log("Muestra de pedidos recibidos:", orders?.slice(0, 5));
      
      // Process each company's orders
      const companiesWithOrders = providerCompanies.map(company => {
        // Filter orders for this company
        const companyOrders = orders?.filter(order => order.company_id === company.id) || [];
        console.log(`QUERY EXACTA: Empresa ${company.name} (${company.id}) tiene ${companyOrders.length} pedidos`);
        
        // Only count approved, prepared, and delivered orders for display
        const approvedOrders = companyOrders.filter(order => 
          ['approved', 'prepared', 'delivered'].includes(order.status)
        );
        
        // Count unique users with approved orders
        const usersWithApprovedOrders = [...new Set(approvedOrders.map(order => order.user_id))];
        const uniqueUsers = usersWithApprovedOrders.length;
        
        // Count different types of orders
        const dispatched = companyOrders.filter(order => 
          order.status === 'prepared' || order.status === 'delivered'
        ).length;
        
        const approved = companyOrders.filter(order => order.status === 'approved').length;
        
        const pending = companyOrders.filter(order => order.status === 'pending').length;

        return {
          id: company.id,
          name: company.name,
          orders: approvedOrders.length, // Only count approved+ orders
          users: uniqueUsers,
          dispatched,
          approved,
          pending
        };
      });

      // Filter out companies with no approved orders
      const filteredCompanies = companiesWithOrders.filter(company => company.orders > 0);
      console.log(`Se encontraron ${filteredCompanies.length} empresas con pedidos aprobados el ${selectedDateStr}`);
      
      if (filteredCompanies.length > 0) {
        console.log("Empresas con pedidos:", filteredCompanies);
      } else {
        console.log("IMPORTANTE: No se encontraron empresas con pedidos aprobados para la fecha seleccionada");
      }
      
      setCompanyOrders(filteredCompanies);
    } catch (error) {
      console.error('Error al obtener pedidos de empresas:', error);
      setError(`Ocurrió un error inesperado: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos de las empresas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyClick = (company: CompanyOrderSummary) => {
    setSelectedCompany(company);
    setIsOrdersModalOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive glass">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-destructive">Error al Cargar Pedidos</h3>
            <p className="text-muted-foreground text-center max-w-md mt-2">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 glass"
              onClick={fetchCompanyOrders}
            >
              Intentar de Nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Pedidos</h1>
          <p className="text-white/70">
            Gestione los pedidos aprobados de sus clientes en todas las empresas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DatePicker 
            date={selectedDate}
            onSelect={setSelectedDate}
            className="w-[180px] bg-white/10 text-white border-white/20"
          />
          <Button variant="outline" onClick={fetchCompanyOrders} className="glass">
            <Filter className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-white">Cargando pedidos de empresas...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today's Orders */}
          {companyOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center text-white">
                <Calendar className="mr-2 h-5 w-5" />
                Pedidos para {format(selectedDate, 'PPP', { locale: es })}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyOrders.map(company => (
                  <CompanyOrderCard 
                    key={company.id} 
                    company={company}
                    onClick={() => handleCompanyClick(company)}
                  />
                ))}
              </div>
            </div>
          )}

          {companyOrders.length === 0 && (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Package className="h-16 w-16 text-white mb-4 opacity-30" />
                <h3 className="text-lg font-medium text-white">No se encontraron pedidos aprobados</h3>
                <p className="text-white/70 text-center max-w-md mt-2">
                  No hay pedidos aprobados para la fecha seleccionada. Intente seleccionar una fecha diferente o revisar la sección de pedidos pendientes.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Orders Modal */}
      {selectedCompany && isOrdersModalOpen && (
        <OrdersModal
          company={{ 
            id: selectedCompany.id, 
            name: selectedCompany.name,
            orderCount: selectedCompany.orders
          }}
          date={selectedDate}
          onClose={() => {
            setIsOrdersModalOpen(false);
            setSelectedCompany(null);
          }}
          onOrderStatusChange={() => {
            // Refresh order data when an order status changes
            fetchCompanyOrders();
          }}
        />
      )}
    </div>
  );
};

export default ProviderOrderDashboard;
