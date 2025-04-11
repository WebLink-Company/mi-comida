
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building, UserPlus, Package, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import '@/styles/dashboard.css';
import { useProviderDashboardData } from '@/hooks/useProviderDashboardData';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

// Newly created components
import { DashboardErrorState } from '@/components/admin/dashboard/DashboardErrorState';
import { DashboardLoadingState } from '@/components/admin/dashboard/DashboardLoadingState';
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import { DebugSection } from '@/components/admin/dashboard/DebugSection';
import { NoOrdersCard } from '@/components/admin/dashboard/NoOrdersCard';
import { DashboardDialogs } from '@/components/admin/dashboard/DashboardDialogs';
import DashboardMetrics from '@/components/admin/dashboard/DashboardMetrics';

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
      <DashboardHeader 
        user={user} 
        quickActions={quickActions} 
        refreshData={refreshData}
      />
      
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
        <NoOrdersCard activeCompanies={stats.activeCompanies} />
      )}

      {/* Debug section */}
      <DebugSection 
        debugInfo={debugInfo}
        user={user}
        stats={stats}
      />

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
