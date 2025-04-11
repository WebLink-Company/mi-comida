
import React, { useState, useEffect } from 'react';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building, Package, Receipt, UserPlus, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
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
  
  console.log("Provider dashboard - Current user:", user);
  
  // Function to manually refresh data
  const refreshData = () => {
    console.log("Manual refresh triggered");
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Refreshing dashboard",
      description: "Fetching latest data from the server...",
    });
  };
  
  useEffect(() => {
    // Check for missing environment variables
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing Supabase environment variables");
      setHasError(true);
      setErrorMessage("Supabase URL or Anon Key is missing. Please check your environment variables in Netlify.");
      return;
    }
    
    if (!user) {
      console.error("No user found in auth context");
      setHasError(true);
      setErrorMessage("No user found. This could be caused by an authentication issue.");
      return;
    }
    
    if (!user?.provider_id) {
      console.error("Missing provider_id in user profile", user);
      setHasError(true);
      setErrorMessage("No provider ID found in your profile. This could be caused by an authentication issue or missing environment variables.");
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
          setErrorMessage(`Supabase connection failed: ${error.message}`);
          setDebugInfo(prev => ({ ...prev, supabaseTestError: error }));
        } else {
          console.log("Supabase connection successful");
          setDebugInfo(prev => ({ ...prev, supabaseTestSuccess: true }));
        }
      } catch (error) {
        console.error("Unexpected error testing Supabase connection:", error);
        setHasError(true);
        setErrorMessage(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
        setDebugInfo(prev => ({ ...prev, unexpectedError: error }));
      }
    };
    
    testConnection();
  }, [user, refreshTrigger]);
  
  // Fetch dashboard stats using our hook with the provider ID from user profile
  const stats = useProviderDashboardData(user?.provider_id);
  
  // Quick actions for the provider
  const quickActions = [
    {
      label: 'Add Company',
      icon: Building,
      action: () => openDialog('create-company'),
      path: '/provider/companies'
    },
    {
      label: 'Add User',
      icon: UserPlus,
      action: () => navigate('/provider/users'),
      path: '/provider/users'
    },
    {
      label: 'View Orders',
      icon: Package,
      action: () => openDialog('view-orders'),
      path: '/provider/orders'
    },
    {
      label: 'Review Invoices',
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
              Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{errorMessage}</p>
            <p className="text-muted-foreground text-sm">
              Please check your Netlify environment variables and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.
              Also make sure your Supabase project has your Netlify domain added to the allowed CORS origins.
            </p>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
              >
                {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
              </Button>
              
              {showDebugInfo && (
                <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                  <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <h3 className="text-sm font-medium">How to fix:</h3>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>
                  Check if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Netlify environment variables
                </li>
                <li>
                  Verify that your Supabase project has CORS configured to allow requests from your Netlify domain
                </li>
                <li>
                  Try logging out and logging back in
                </li>
                <li>
                  Check browser console for more detailed error messages
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
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <ClockDisplay user={user} quickActions={quickActions} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white fade-up" style={{ animationDelay: "0.1s" }}>Dashboard Overview</h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
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

      {/* Debug section - visible in all environments */}
      <div className="mt-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="text-white/70 hover:text-white"
        >
          {showDebugInfo ? "Hide Debug Info" : "Show Connection Status"}
        </Button>
        
        {showDebugInfo && (
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-md overflow-auto max-h-[200px]">
            <pre className="text-xs text-white/80">{JSON.stringify({ 
              connection: debugInfo.supabaseTestSuccess ? "Connected" : "Failed",
              providerId: user?.provider_id,
              environment: import.meta.env.MODE,
              host: window.location.host,
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
