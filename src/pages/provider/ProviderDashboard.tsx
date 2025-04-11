
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
        
        // Fetch essential stats in a single query (significantly reduced payload)
        // We'll do this later based on user interaction to avoid excessive queries
        
        setDashboardStats({
          ordersToday: 0,
          totalMealsToday: 0,
          activeCompanies: activeCompanies,
          pendingOrders: 0,
          monthlyOrders: 0,
          monthlyRevenue: 0,
          newUsers: 0
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
      <h3 className="text-lg font-medium text-white mb-2">Métricas en Mantenimiento</h3>
      <p className="text-white/70">
        Las métricas del panel están temporalmente deshabilitadas para optimización.
        Por favor, utilice las páginas específicas para ver información detallada.
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
