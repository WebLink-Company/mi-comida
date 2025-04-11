
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, ChefHat, ShoppingBag, DollarSign, 
  Users, FileText, Building, Edit, Package, BarChart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import "@/styles/dashboard.css";
import { DateRange, useProviderDashboardStats } from '@/hooks/useProviderDashboardStats';
import { useProviderUserStats } from '@/hooks/provider/useProviderUserStats';
import { useProviderCompanies } from '@/hooks/provider/useProviderCompanies';
import { useProviderCompanyStats } from '@/hooks/provider/useProviderCompanyStats';
import DateRangeSelector from '@/components/provider/dashboard/DateRangeSelector';
import NoOrdersMessage from '@/components/provider/dashboard/NoOrdersMessage';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>('');
  
  // Estado para el rango de fechas
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: todayStr,
    endDate: todayStr,
    label: 'hoy'
  });
  
  const {
    ordersToday,
    loadingOrdersToday,
    totalMealsToday,
    loadingMealsToday,
    companiesWithOrdersToday,
    loadingCompaniesOrders,
    topOrderedMeal,
    loadingTopMeal,
    pendingOrders,
    loadingPending,
    monthlyOrders,
    loadingMonthlyOrders,
    monthlyRevenue,
    loadingMonthlyRevenue,
    isLoading: statsLoading,
  } = useProviderDashboardStats(dateRange);
  
  const { newUsers, loadingNewUsers } = useProviderUserStats();
  const { activeCompanies, loading: loadingCompanies } = useProviderCompanies();
  const { companiesWithOrdersToday, loading: loadingCompanyStats } = useProviderCompanyStats();

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!user?.provider_id) {
        setError('No se encontró ID de proveedor para este usuario');
        setLoading(false);
        return;
      }

      try {
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('business_name')
          .eq('id', user.provider_id)
          .single();

        if (providerError) {
          throw providerError;
        }

        setProviderName(providerData?.business_name || '');
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
  }, [user, toast]);

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

  // Función para obtener el texto del rango de fechas seleccionado
  const getDateRangeText = () => {
    if (dateRange.startDate === dateRange.endDate) {
      return `la fecha ${format(new Date(dateRange.startDate), 'dd MMMM yyyy', { locale: es })}`;
    } else {
      return `el periodo del ${format(new Date(dateRange.startDate), 'dd MMMM', { locale: es })} al ${format(new Date(dateRange.endDate), 'dd MMMM yyyy', { locale: es })}`;
    }
  };

  // Verificar si hay órdenes en el rango seleccionado
  const hasOrders = monthlyOrders > 0;

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <DashboardHeader 
        user={user}
        quickActions={quickActions}
        refreshData={refreshData}
      />

      <DateRangeSelector 
        onSelectRange={setDateRange} 
        selectedRange={dateRange}
      />

      {statsLoading ? (
        <div className="flex justify-center py-8">
          <p className="text-white">Cargando estadísticas...</p>
        </div>
      ) : !hasOrders ? (
        <NoOrdersMessage 
          onChangeDateRange={() => {}} 
          dateRangeText={getDateRangeText()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pedidos"
            value={monthlyOrders}
            icon={<ShoppingBag size={20} />}
            description={`Pedidos en ${dateRange.label === 'hoy' ? 'el día' : dateRange.label === 'semana' ? 'la semana' : 'el mes'}`}
            loading={loadingMonthlyOrders}
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
            title="Facturación"
            value={monthlyRevenue}
            isCurrency={true}
            icon={<DollarSign size={20} />}
            description={`Ingresos en ${dateRange.label === 'hoy' ? 'el día' : dateRange.label === 'semana' ? 'la semana' : 'el mes'}`}
            loading={loadingMonthlyRevenue}
            linkTo="/provider/billing"
            className="glass"
            borderColor="border-green-500/40"
          />

          <StatCard
            title="Plato Más Pedido"
            value={topOrderedMeal.name}
            icon={<ChefHat size={20} />}
            description={`${topOrderedMeal.count} ordenes`}
            loading={loadingTopMeal}
            linkTo="/provider/menu"
            className="glass"
            borderColor="border-pink-400/40"
          />

          {/* Solo mostrar estos stats si estamos viendo los datos de hoy */}
          {dateRange.label === 'hoy' && (
            <>
              <StatCard
                title="Pedidos Hoy"
                value={ordersToday}
                icon={<ShoppingBag size={20} />}
                description="Pedidos recibidos para hoy"
                loading={loadingOrdersToday}
                linkTo="/provider/orders"
                className="glass"
                borderColor="border-blue-500/40" 
              />

              <StatCard
                title="Platos Hoy"
                value={totalMealsToday}
                icon={<ChefHat size={20} />}
                description="Total de platos para entregar hoy"
                loading={loadingMealsToday}
                linkTo="/provider/orders"
                className="glass"
                borderColor="border-amber-400/40"
              />

              <StatCard
                title="Empresas con Pedidos"
                value={companiesWithOrdersToday}
                icon={<Package size={20} />}
                description="Empresas con pedidos para hoy"
                loading={loadingCompanyStats}
                linkTo="/provider/companies"
                className="glass"
                borderColor="border-orange-400/40"
              />

              <StatCard
                title="Pedidos Pendientes"
                value={pendingOrders}
                icon={<BarChart size={20} />}
                description="Pedidos pendientes de preparación"
                loading={loadingPending}
                linkTo="/provider/orders"
                className="glass"
                borderColor="border-red-400/40"
              />
            </>
          )}
        </div>
      )}

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
                  <span className="text-white/70">Usuarios nuevos este mes: {newUsers}</span>
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
