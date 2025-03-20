
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

  useEffect(() => {
    // You can fetch admin-specific data here
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                <CardHeader>
                  <CardTitle>Gestión de Proveedores</CardTitle>
                  <CardDescription>
                    Administra los proveedores de servicios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Aquí irá la tabla de proveedores.</p>
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
