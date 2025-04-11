
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, ChefHat, ShoppingBag, DollarSign, 
  Users, FileText, Building, Edit
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StatCard from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import "@/styles/dashboard.css";
import { useProviderCompanies } from '@/hooks/provider/useProviderCompanies';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState({
    ordersToday: 0,
    totalMealsToday: 0,
    activeCompanies: 0,
    pendingOrders: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    newUsers: 0
  });
  
  // Only load company data (not orders)
  const { activeCompanies, loading: loadingCompanies } = useProviderCompanies();

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!user?.provider_id) {
        setError('No se encontró ID de proveedor para este usuario');
        setLoading(false);
        return;
      }

      try {
        // Load provider info for display
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('business_name')
          .eq('id', user.provider_id)
          .single();

        if (providerError) {
          throw providerError;
        }

        setProviderName(providerData?.business_name || '');
        
        // Get company IDs for this provider
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', user.provider_id);
        
        if (companiesError) {
          throw companiesError;
        }
        
        const companyIds = companies?.map(company => company.id) || [];
        
        // Get current month information
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const formattedToday = today.toISOString().split('T')[0];
        const formattedFirstDay = firstDayOfMonth.toISOString().split('T')[0];
        
        // Fetch monthly orders - look for orders in the current month with status of approved or delivered
        const { data: monthlyOrders, error: monthlyOrdersError } = await supabase
          .from('orders')
          .select(`
            id,
            lunch_option:lunch_option_id(price)
          `)
          .in('company_id', companyIds)
          .gte('date', formattedFirstDay)
          .lte('date', formattedToday)
          .in('status', ['approved', 'delivered']);
        
        if (monthlyOrdersError) {
          throw monthlyOrdersError;
        }
        
        console.log(`Found ${monthlyOrders?.length || 0} monthly orders for provider ${user.provider_id}`);
        console.log('Monthly orders:', monthlyOrders);
        
        // Calculate monthly revenue
        let totalRevenue = 0;
        if (monthlyOrders && monthlyOrders.length > 0) {
          totalRevenue = monthlyOrders.reduce((sum, order) => {
            const price = order.lunch_option?.price || 0;
            return sum + Number(price);
          }, 0);
        }
        
        // Fetch today's orders
        const { data: todayOrders, error: todayOrdersError } = await supabase
          .from('orders')
          .select('id')
          .in('company_id', companyIds)
          .eq('date', formattedToday)
          .in('status', ['approved', 'delivered']);
        
        if (todayOrdersError) {
          throw todayOrdersError;
        }
        
        // Fetch pending orders
        const { data: pendingOrders, error: pendingOrdersError } = await supabase
          .from('orders')
          .select('id')
          .in('company_id', companyIds)
          .eq('status', 'pending');
        
        if (pendingOrdersError) {
          throw pendingOrdersError;
        }
        
        // Update dashboard stats
        setDashboardStats({
          ordersToday: todayOrders?.length || 0,
          totalMealsToday: todayOrders?.length || 0,
          activeCompanies: activeCompanies,
          pendingOrders: pendingOrders?.length || 0,
          monthlyOrders: monthlyOrders?.length || 0, 
          monthlyRevenue: totalRevenue,
          newUsers: 0
        });
        
        console.log('Dashboard stats updated:', {
          monthlyOrders: monthlyOrders?.length || 0,
          monthlyRevenue: totalRevenue
        });
      } catch (error) {
        console.error('Error al obtener datos del proveedor:', error);
        setError('Error al cargar datos del proveedor');
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos del proveedor',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.provider_id) {
      fetchProviderData();
    }
  }, [user, toast, activeCompanies]);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Datos actualizados',
        description: 'La información del panel ha sido actualizada',
      });
    }, 500);
  };

  const quickActions = [
    { 
      label: 'Ver Pedidos', 
      icon: ShoppingBag, 
      action: () => navigate('/provider/orders'), 
      path: '/provider/orders' 
    },
    { 
      label: 'Editar Menú', 
      icon: Edit, 
      action: () => navigate('/provider/menu'), 
      path: '/provider/menu' 
    },
    { 
      label: 'Facturación', 
      icon: FileText, 
      action: () => navigate('/provider/billing'), 
      path: '/provider/billing' 
    },
    { 
      label: 'Empresas', 
      icon: Building, 
      action: () => navigate('/provider/companies'), 
      path: '/provider/companies' 
    },
    { 
      label: 'Usuarios', 
      icon: Users, 
      action: () => navigate('/provider/users'), 
      path: '/provider/users' 
    },
  ];

  // Display a simple message about the dashboard metrics being temporarily disabled
  const dashboardInfo = () => (
    <div className="glass p-6 rounded-lg border border-orange-500/30 mb-6">
      <h3 className="text-lg font-medium text-white mb-2">Métricas en Tiempo Real</h3>
      <p className="text-white/70">
        Las métricas del panel muestran datos actualizados del mes en curso.
        Para ver información más detallada, utilice las páginas específicas.
      </p>
    </div>
  );

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <DashboardHeader 
        user={user}
        quickActions={quickActions}
        refreshData={refreshData}
      />

      {dashboardInfo()}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pedidos Hoy"
          value={dashboardStats.ordersToday}
          icon={<ShoppingBag size={20} />}
          description="Pedidos recibidos para hoy"
          loading={false}
          linkTo="/provider/orders"
          className="glass"
          borderColor="border-blue-500/40" 
        />

        <StatCard
          title="Empresas Activas"
          value={activeCompanies}
          icon={<Building size={20} />}
          description="Empresas asociadas a tu servicio"
          loading={loadingCompanies}
          linkTo="/provider/companies"
          className="glass"
          borderColor="border-indigo-400/40"
        />

        <StatCard
          title="Pedidos del Mes"
          value={dashboardStats.monthlyOrders}
          icon={<CalendarDays size={20} />}
          description="Total de pedidos este mes"
          loading={false}
          linkTo="/provider/orders"
          className="glass"
          borderColor="border-purple-400/40"
        />

        <StatCard
          title="Facturación Mensual"
          value={dashboardStats.monthlyRevenue}
          icon={<DollarSign size={20} />}
          description="Ingresos totales del mes"
          loading={false}
          linkTo="/provider/billing"
          className="glass"
          borderColor="border-green-500/40"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Información del Proveedor</h2>
        <div className="glass p-6 rounded-lg shadow-md border border-cyan-400/30">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">{providerName}</h3>
              <p className="text-white/70">Proveedor de servicios de alimentación</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-white/70 mr-2" />
                  <span className="text-white/70">Usuarios nuevos este mes: {dashboardStats.newUsers}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-white/70 mr-2" />
                  <span className="text-white/70">Empresas activas: {activeCompanies}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button 
                variant="outline" 
                className="glass mr-2 hover:border-blue-400/50 hover:bg-blue-400/10"
                onClick={() => navigate('/provider/billing')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Facturación
              </Button>
              <Button
                variant="outline" 
                className="glass hover:border-green-400/50 hover:bg-green-400/10"
                onClick={() => navigate('/provider/menu')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Gestionar Menú
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
