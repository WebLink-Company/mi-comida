
import React, { useState, useEffect } from 'react';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building, Package, Receipt, UserPlus, AlertTriangle, ExternalLink, RefreshCw, Server, InfoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardMetrics from '@/components/admin/dashboard/DashboardMetrics';
import '@/styles/dashboard.css';
import { useProviderDashboardData } from '@/hooks/useProviderDashboardData';
import { Dialog } from "@/components/ui/dialog";
import { UsersModal } from '@/components/admin/dashboard/UsersModal';
import { CompaniesModal } from '@/components/admin/dashboard/CompaniesModal';
import { OrdersModal } from '@/components/admin/dashboard/OrdersModal';
import { InvoicesModal } from '@/components/admin/dashboard/InvoicesModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const ProviderDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
  
  // Quick actions for the provider
  const quickActions = [
    {
      label: 'Agregar Empresa',
      icon: Building,
      action: () => openDialog('create-company'),
      path: '/provider/companies'
    },
    {
      label: 'Agregar Usuario',
      icon: UserPlus,
      action: () => navigate('/provider/users'),
      path: '/provider/users'
    },
    {
      label: 'Ver Pedidos',
      icon: Package,
      action: () => openDialog('view-orders'),
      path: '/provider/orders'
    },
    {
      label: 'Revisar Facturas',
      icon: Receipt,
      action: () => openDialog('review-invoices'),
      path: '/provider/billing'
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

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error de Conexión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{errorMessage}</p>
            <p className="text-muted-foreground text-sm">
              Por favor, verifique sus variables de entorno de Netlify y asegúrese de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas correctamente.
              También asegúrese de que su proyecto Supabase tenga su dominio de Netlify agregado a los orígenes CORS permitidos.
            </p>
            
            <div className="bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 p-4 rounded-md text-amber-800 dark:text-amber-300 mt-4">
              <div className="flex gap-2 items-start">
                <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Configuración CORS Requerida</p>
                  <p className="text-sm mt-1">Si está alojando esta aplicación en un dominio diferente al que se desarrolló, debe agregar su dominio a los orígenes permitidos en la configuración de su proyecto Supabase.</p>
                  <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                    <li>Vaya a su Panel de Supabase</li>
                    <li>Navegue a Configuración del Proyecto &gt; API</li>
                    <li>Desplácese hasta "Orígenes CORS"</li>
                    <li>Añada su dominio: {window.location.origin}</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
              >
                {showDebugInfo ? "Ocultar Información de Depuración" : "Mostrar Información de Depuración"}
              </Button>
              
              {showDebugInfo && (
                <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                  <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <h3 className="text-sm font-medium">Cómo solucionarlo:</h3>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>
                  Verifique si VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY están configurados en las variables de entorno de Netlify
                </li>
                <li>
                  Verifique que su proyecto Supabase tenga CORS configurado para permitir solicitudes desde su dominio: {window.location.origin}
                </li>
                <li>
                  Intente cerrar sesión e iniciar sesión nuevamente
                </li>
                <li>
                  Verifique la consola del navegador para ver mensajes de error más detallados
                </li>
              </ol>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="default" 
                onClick={refreshData}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar Conexión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <ClockDisplay user={user} quickActions={[]} />
        </div>
        <div className="text-center py-12">
          <Server className="h-16 w-16 mx-auto mb-4 animate-pulse text-blue-400" />
          <h2 className="text-xl font-medium mb-2">Cargando Datos del Panel...</h2>
          <p className="text-muted-foreground">Conectando a Supabase y recuperando los datos de su proveedor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <ClockDisplay user={user} quickActions={quickActions} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white fade-up" style={{ animationDelay: "0.1s" }}>Vista General del Panel</h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Datos
        </Button>
      </div>
      
      {/* Dashboard metrics */}
      <DashboardMetrics 
        ordersToday={stats.ordersToday}
        loadingOrdersToday={stats.loadingOrdersToday}
        totalMealsToday={stats.totalMealsToday}
        loadingMealsToday={stats.loadingMealsToday}
        companiesWithOrdersToday={stats.companiesWithOrdersToday}
        loadingCompaniesOrders={stats.loadingCompaniesOrders}
        topOrderedMeal={stats.topOrderedMeal?.name}
        loadingTopMeal={stats.loadingTopMeal}
        pendingOrders={stats.pendingOrders}
        loadingPending={stats.loadingPending}
        activeCompanies={stats.activeCompanies}
        loadingActiveCompanies={stats.loadingActiveCompanies}
        newUsers={stats.newUsers}
        loadingNewUsers={stats.loadingNewUsers}
        monthlyOrders={stats.monthlyOrders}
        loadingMonthlyOrders={stats.loadingMonthlyOrders}
        monthlyRevenue={stats.monthlyRevenue}
        loadingMonthlyRevenue={stats.loadingMonthlyRevenue}
      />

      {/* No data message if no companies with orders */}
      {stats.activeCompanies > 0 && stats.companiesWithOrdersToday === 0 && !stats.loadingCompaniesOrders && (
        <Card className="mt-8 border-blue-500/20">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Package className="h-16 w-16 text-blue-400 mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Hay Pedidos Hoy</h3>
            <p className="text-muted-foreground text-center max-w-md mt-2">
              No hay pedidos para hoy todavía. Tiene {stats.activeCompanies} empresas activas que pueden realizar pedidos.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/provider/companies')}
            >
              <Building className="h-4 w-4 mr-2" />
              Administrar Empresas
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug section - visible in all environments */}
      <div className="mt-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="text-white/70 hover:text-white"
        >
          {showDebugInfo ? "Ocultar Estado de Conexión" : "Mostrar Estado de Conexión"}
        </Button>
        
        {showDebugInfo && (
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-md overflow-auto max-h-[200px]">
            <pre className="text-xs text-white/80">{JSON.stringify({ 
              connection: debugInfo.supabaseTestSuccess ? "Conectado" : "Fallido",
              providerId: user?.provider_id,
              environment: import.meta.env.MODE,
              host: window.location.host,
              activeCompanies: stats.activeCompanies,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Modals */}
      <Dialog 
        open={activeDialog === 'add-user'} 
        onOpenChange={() => {
          if (activeDialog === 'add-user') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'add-user' && <UsersModal onClose={closeDialog} />}
      </Dialog>

      <Dialog 
        open={activeDialog === 'create-company'} 
        onOpenChange={() => {
          if (activeDialog === 'create-company') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'create-company' && <CompaniesModal onClose={closeDialog} providerId={user?.provider_id} />}
      </Dialog>

      <Dialog 
        open={activeDialog === 'view-orders'} 
        onOpenChange={() => {
          if (activeDialog === 'view-orders') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'view-orders' && <OrdersModal onClose={closeDialog} />}
      </Dialog>

      <Dialog 
        open={activeDialog === 'review-invoices'} 
        onOpenChange={() => {
          if (activeDialog === 'review-invoices') {
            closeDialog();
          }
        }}
      >
        {activeDialog === 'review-invoices' && <InvoicesModal onClose={closeDialog} />}
      </Dialog>
    </div>
  );
};

export default ProviderDashboardPage;
