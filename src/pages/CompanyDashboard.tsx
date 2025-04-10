
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CompanyDashboardProps {
  activeTab?: string;
}

const CompanyDashboard = ({ activeTab = 'dashboard' }: CompanyDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [providerDetails, setProviderDetails] = useState<any>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        
        if (user?.company_id) {
          // Fetch company details to get the provider_id
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*, provider:provider_id(*)')
            .eq('id', user.company_id)
            .single();
            
          if (companyError) throw companyError;
          
          if (companyData?.provider) {
            setProviderDetails(companyData.provider);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos de la empresa:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de la empresa.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar userRole="company" userName={`${user?.first_name} ${user?.last_name}`} />
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Panel de Empresa</h1>
            <p className="text-muted-foreground">
              Administra tu empresa, empleados y reportes.
            </p>
            {providerDetails && (
              <p className="text-sm mt-2">
                Proveedor de servicio: <span className="font-medium">{providerDetails.business_name}</span>
              </p>
            )}
          </div>
          
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={(value) => {/* Handle tab change if needed */}}
          >
            <TabsList className="mb-8">
              <TabsTrigger value="dashboard" className="text-base px-5 py-2">Dashboard</TabsTrigger>
              <TabsTrigger value="employees" className="text-base px-5 py-2">Empleados</TabsTrigger>
              <TabsTrigger value="reports" className="text-base px-5 py-2">Reportes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard de Empresa</CardTitle>
                  <CardDescription>
                    Visualiza información general de tu empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Aquí irá el dashboard con estadísticas y resúmenes.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="employees">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Empleados</CardTitle>
                  <CardDescription>
                    Administra los empleados de tu empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Aquí irá la tabla de empleados y supervisores.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes</CardTitle>
                  <CardDescription>
                    Visualiza reportes y estadísticas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Aquí irán los reportes de la empresa.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
