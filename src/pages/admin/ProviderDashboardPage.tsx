
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building, UserPlus, Package, Receipt, PlusCircle, FileText, Clock, CreditCard, ShoppingCart, Calendar, Users, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import '@/styles/dashboard.css';
import { useProviderDashboardData } from '@/hooks/useProviderDashboardData';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

// Newly created components
import { DashboardErrorState } from '@/components/admin/dashboard/DashboardErrorState';
import { DashboardLoadingState } from '@/components/admin/dashboard/DashboardLoadingState';
import { DashboardDialogs } from '@/components/admin/dashboard/DashboardDialogs';
import DashboardMetrics from '@/components/admin/dashboard/DashboardMetrics';
import { DebugSection } from '@/components/admin/dashboard/DebugSection';
import { NoOrdersCard } from '@/components/admin/dashboard/NoOrdersCard';

const ProviderDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  console.log("Provider dashboard - Current user:", user);
  
  // Function to manually refresh data
  const refreshData = () => {
    console.log("Manual refresh triggered");
    setRefreshTrigger(prev => prev + 1);
    setIsLoading(true);
    toast({
      title: "Actualizando panel",
      description: "Cargando la información más reciente del servidor...",
    });
    
    // Set a timeout to ensure the loading state is shown even if the data loads quickly
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Check for missing environment variables
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing Supabase environment variables");
      setHasError(true);
      setErrorMessage("Falta la URL de Supabase o la clave anónima. Por favor, verifique sus variables de entorno en Netlify.");
      return;
    }
    
    if (!user) {
      console.error("No user found in auth context");
      setHasError(true);
      setErrorMessage("No se encontró ningún usuario. Esto podría deberse a un problema de autenticación.");
      return;
    }
    
    if (!user?.provider_id) {
      console.error("Missing provider_id in user profile", user);
      setHasError(true);
      setErrorMessage("No se encontró el ID del proveedor en su perfil. Esto podría deberse a un problema de autenticación o a variables de entorno faltantes.");
    }
    
    // Collect debug info
    setDebugInfo({
      hasSupabaseUrl: !!SUPABASE_URL,
      hasSupabaseKey: !!SUPABASE_ANON_KEY,
      userExists: !!user,
      userHasProviderId: !!user?.provider_id,
      providerId: user?.provider_id,
      currentEnv: import.meta.env.MODE,
      baseUrl: window.location.origin,
      hostname: window.location.hostname,
      timestamp: new Date().toISOString()
    });
    
    // Test Supabase connection
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...");
        const { data, error } = await supabase.from('companies').select('count(*)', { count: 'exact', head: true });
        if (error) {
          console.error("Supabase connection test failed:", error);
          setHasError(true);
          setErrorMessage(`Falló la conexión con Supabase: ${error.message}`);
          setDebugInfo(prev => ({ ...prev, supabaseTestError: error }));
        } else {
          console.log("Supabase connection successful");
          setDebugInfo(prev => ({ ...prev, supabaseTestSuccess: true }));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error testing Supabase connection:", error);
        setHasError(true);
        setErrorMessage(`Error inesperado: ${error instanceof Error ? error.message : String(error)}`);
        setDebugInfo(prev => ({ ...prev, unexpectedError: error }));
      }
    };
    
    // Set initial loading state
    setIsLoading(true);
    
    // Allow a bit of time to show loading state
    setTimeout(() => {
      testConnection();
    }, 500);
    
    // Set a fallback timeout to turn off loading state even if something goes wrong
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(loadingTimeout);
  }, [user, refreshTrigger]);
  
  // Fetch dashboard stats using our hook with the provider ID from user profile
  const stats = useProviderDashboardData();
  
  // Quick actions for the provider - Updated with Spanish text and more provider-specific options
  const quickActions = [
    {
      label: 'Agregar Usuario',
      icon: UserPlus,
      action: () => navigate('/provider/users'),
      path: '/provider/users'
    },
    {
      label: 'Crear Empresa',
      icon: Building,
      action: () => navigate('/provider/companies'),
      path: '/provider/companies'
    },
    {
      label: 'Ver Pedidos',
      icon: Package,
      action: () => navigate('/provider/orders'),
      path: '/provider/orders'
    },
    {
      label: 'Gestionar Menú',
      icon: Utensils,
      action: () => navigate('/provider/menus'),
      path: '/provider/menus'
    },
    {
      label: 'Facturación',
      icon: Receipt,
      action: () => navigate('/provider/billing'),
      path: '/provider/billing'
    },
    {
      label: 'Entregas',
      icon: ShoppingCart,
      action: () => navigate('/provider/delivery'),
      path: '/provider/delivery'
    },
    {
      label: 'Programar Menús',
      icon: Calendar,
      action: () => navigate('/provider/schedule'),
      path: '/provider/schedule'
    },
    {
      label: 'Gestionar Clientes',
      icon: Users,
      action: () => navigate('/provider/clients'),
      path: '/provider/clients'
    }
  ];

  const openDialog = (dialogId: string) => {
    setActiveDialog(dialogId);
  };

  const closeDialog = () => {
    setTimeout(() => {
      setActiveDialog(null);
    }, 50);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (hasError) {
    return (
      <DashboardErrorState 
        errorMessage={errorMessage} 
        refreshData={refreshData} 
        debugInfo={debugInfo} 
      />
    );
  }

  if (isLoading) {
    return <DashboardLoadingState user={user} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Dashboard Header with large name, time, and greeting */}
      <div className="text-center mb-12 fade-up">
        <h1 className="text-6xl font-extralight text-white mb-2">
          {user?.first_name || 'Proveedor'}
        </h1>
        <div className="text-center mb-4">
          <p className="text-4xl font-light text-white/90">
            {format(currentTime, 'EEEE, d MMMM', { locale: es })}
          </p>
          <p className="text-5xl font-light text-white mt-2">
            {format(currentTime, 'HH:mm')}
          </p>
        </div>
        <p className="text-xl text-white/80 mt-4">
          {getGreeting()}, {user?.first_name} 👋
        </p>
        <p className="text-white/70 mt-2">
          ¿En qué te gustaría trabajar hoy?
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-4 mb-12 fade-up" style={{ animationDelay: "0.2s" }}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Badge
              key={index}
              variant="outline"
              onClick={action.action}
              className="quick-action-badge glass-dark py-2 px-4 cursor-pointer"
            >
              <Icon className="h-4 w-4 mr-2" />
              {action.label}
            </Badge>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-up" style={{ animationDelay: "0.3s" }}>
        <div className="dashboard-metric-card p-5">
          <h3 className="text-sm font-medium text-white/70 mb-1">Pedidos Hoy</h3>
          <p className="text-2xl font-semibold text-white">{stats.loadingOrdersToday ? '...' : stats.ordersToday || 0}</p>
        </div>
        
        <div className="dashboard-metric-card p-5">
          <h3 className="text-sm font-medium text-white/70 mb-1">Comidas Servidas</h3>
          <p className="text-2xl font-semibold text-white">{stats.loadingMealsToday ? '...' : stats.totalMealsToday || 0}</p>
        </div>
        
        <div className="dashboard-metric-card p-5">
          <h3 className="text-sm font-medium text-white/70 mb-1">Empresas Activas</h3>
          <p className="text-2xl font-semibold text-white">{stats.loadingActiveCompanies ? '...' : stats.activeCompanies || 0}</p>
        </div>
        
        <div className="dashboard-metric-card p-5">
          <h3 className="text-sm font-medium text-white/70 mb-1">Pendientes</h3>
          <p className="text-2xl font-semibold text-white">{stats.loadingPending ? '...' : stats.pendingOrders || 0}</p>
        </div>
      </div>
      
      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Platform Overview */}
        <div className="dashboard-metric-card p-5 lg:col-span-1 fade-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Visión General</h3>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={() => navigate('/provider/reports')}>
              Ver Detalles
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Usuarios</span>
              <span className="font-medium text-white">{stats.newUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Empresas</span>
              <span className="font-medium text-white">{stats.activeCompanies || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Pedidos Totales</span>
              <span className="font-medium text-white">{stats.monthlyOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Plato Popular</span>
              <span className="font-medium text-white">{stats.topOrderedMeal?.name || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* Order Metrics */}
        <div className="dashboard-metric-card p-5 lg:col-span-1 fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Métricas de Pedidos</h3>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={() => navigate('/provider/orders')}>
              Ver Detalles
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Pedidos Hoy</span>
              <span className="font-medium text-white">{stats.ordersToday || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Pedidos Esta Semana</span>
              <span className="font-medium text-white">{stats.monthlyOrders ? Math.round(stats.monthlyOrders / 4) : 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Promedio por Empresa</span>
              <span className="font-medium text-white">
                {stats.ordersToday && stats.companiesWithOrdersToday
                  ? Math.round(stats.ordersToday / (stats.companiesWithOrdersToday || 1))
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Pendientes</span>
              <span className="font-medium text-white">{stats.pendingOrders || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Finance Insights */}
        <div className="dashboard-metric-card p-5 lg:col-span-1 fade-up" style={{ animationDelay: "0.6s" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Finanzas</h3>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={() => navigate('/provider/billing')}>
              Ver Detalles
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Ingresos Mensuales</span>
              <span className="font-medium text-white currency-value">
                ${stats.monthlyRevenue?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Facturas Pendientes</span>
              <span className="font-medium text-white">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Promedio por Pedido</span>
              <span className="font-medium text-white currency-value">
                ${stats.monthlyRevenue && stats.monthlyOrders
                  ? (stats.monthlyRevenue / (stats.monthlyOrders || 1)).toFixed(2)
                  : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Próximo Pago</span>
              <span className="font-medium text-white">30/04</span>
            </div>
          </div>
        </div>
      </div>

      {/* No data message if no companies with orders */}
      {stats.activeCompanies > 0 && stats.companiesWithOrdersToday === 0 && !stats.loadingCompaniesOrders && (
        <NoOrdersCard activeCompanies={stats.activeCompanies} />
      )}

      {/* Debug section - Hidden by default */}
      {import.meta.env.DEV && (
        <DebugSection 
          debugInfo={debugInfo}
          user={user}
          stats={stats}
        />
      )}

      {/* Refresh Button */}
      <div className="flex justify-center mt-8 fade-up" style={{ animationDelay: "0.7s" }}>
        <Button 
          variant="outline" 
          onClick={refreshData} 
          className="glass"
        >
          Actualizar Datos
        </Button>
      </div>

      {/* Modals */}
      <DashboardDialogs 
        activeDialog={activeDialog}
        closeDialog={closeDialog}
        providerId={user?.provider_id}
      />
    </div>
  );
};

export default ProviderDashboardPage;
