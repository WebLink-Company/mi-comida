
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*, profile:id(first_name, last_name, email)')
        .order('business_name');
        
      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los proveedores.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'providers') {
      fetchProviders();
    } else {
      setIsLoading(false);
    }
  }, [activeTab, toast]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar userRole="admin" userName={`${user?.first_name} ${user?.last_name}`} />
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Gestiona usuarios, empresas y proveedores desde este panel.
            </p>
          </div>
          
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="mb-8">
              <TabsTrigger value="users" className="text-base px-5 py-2">Usuarios</TabsTrigger>
              <TabsTrigger value="companies" className="text-base px-5 py-2">Empresas</TabsTrigger>
              <TabsTrigger value="providers" className="text-base px-5 py-2">Proveedores</TabsTrigger>
              <TabsTrigger value="reports" className="text-base px-5 py-2">Reportes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra todos los usuarios de la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Aquí irá la tabla de usuarios.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="companies">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Empresas</CardTitle>
                  <CardDescription>
                    Administra las empresas registradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Aquí irá la tabla de empresas.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="providers">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Proveedores</CardTitle>
                    <CardDescription>
                      Administra los proveedores de servicios
                    </CardDescription>
                  </div>
                  <Button>Nuevo Proveedor</Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-10 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : providers.length > 0 ? (
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Empresa</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Contacto</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                            <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                          {providers.map((provider) => (
                            <tr key={provider.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium">{provider.business_name}</div>
                                <div className="text-sm text-muted-foreground">{provider.address}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">{provider.contact_email}</div>
                                <div className="text-sm text-muted-foreground">{provider.contact_phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  provider.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {provider.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="ghost" className="h-8 px-2 text-blue-600 hover:text-blue-800">
                                  Editar
                                </Button>
                                <Button variant="ghost" className="h-8 px-2 text-muted-foreground">
                                  Ver menú
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No hay proveedores registrados.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes</CardTitle>
                  <CardDescription>
                    Visualiza estadísticas y reportes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Aquí irán los reportes del sistema.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
