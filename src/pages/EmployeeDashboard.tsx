
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { LunchOption, Order, Company } from '@/lib/types';
import NavigationBar from '@/components/NavigationBar';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-mobile';
import LunchCard from '@/components/LunchCard';

interface OrderWithLunch extends Order {
  lunch?: LunchOption;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [isLoading, setIsLoading] = useState(true);
  const [lunchOptions, setLunchOptions] = useState<LunchOption[]>([]);
  const [userOrders, setUserOrders] = useState<OrderWithLunch[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('menu');
  
  // Fetch data from Supabase on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch lunch options
        const { data: lunchData, error: lunchError } = await supabase
          .from('lunch_options')
          .select('*')
          .eq('available', true);
          
        if (lunchError) throw lunchError;
        
        // Fetch user's company
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single();
            
          if (companyError) throw companyError;
          setCompany(companyData);
        }
        
        // Fetch user's orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            lunch:lunch_options(*)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        setLunchOptions(lunchData || []);
        setUserOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.',
          variant: 'destructive',
        });
        
        // Use mock data in case of error
        import('@/lib/mockData').then(({ mockLunchOptions, mockOrders, mockCompanies }) => {
          setLunchOptions(mockLunchOptions);
          const ordersWithLunch = mockOrders
            .filter(order => order.user_id === user.id)
            .map(order => {
              const lunch = mockLunchOptions.find(option => option.id === order.lunch_option_id);
              return { ...order, lunch };
            });
          setUserOrders(ordersWithLunch);
          setCompany(mockCompanies[0]);
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  const placeOrder = async (lunchOptionId: string) => {
    if (!user || !company) return;
    
    try {
      const newOrder = {
        user_id: user.id,
        lunch_option_id: lunchOptionId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status: 'pending',
        company_id: company.id
      };
      
      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();
        
      if (error) throw error;
      
      // Find the lunch option to attach to the order
      const lunch = lunchOptions.find(option => option.id === lunchOptionId);
      const newOrderWithLunch = { ...data, lunch };
      
      setUserOrders(prevOrders => [newOrderWithLunch, ...prevOrders]);
      
      toast({
        title: '¡Pedido realizado!',
        description: 'Tu pedido ha sido enviado y está pendiente de aprobación.',
      });
      
      // Switch to orders tab
      setActiveTab('orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo realizar el pedido. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };
  
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'delivered': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  const calculateSubsidizedPrice = (price: number) => {
    if (!company) return price;
    
    if (company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0) {
      return Math.max(0, price - company.fixed_subsidy_amount);
    }
    
    const subsidyPercentage = company.subsidy_percentage || company.subsidyPercentage || 0;
    return price * (1 - (subsidyPercentage / 100));
  };
  
  const renderLunchOptions = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative">
                <Skeleton className="w-full h-40" />
              </div>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }
    
    if (lunchOptions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay opciones de almuerzo disponibles para hoy.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lunchOptions.map((option) => (
          <LunchCard
            key={option.id}
            name={option.name}
            description={option.description}
            imageUrl={option.image}
            price={option.price}
            subsidizedPrice={calculateSubsidizedPrice(option.price)}
            onSelect={() => placeOrder(option.id)}
            tags={option.tags}
          />
        ))}
      </div>
    );
  };
  
  const renderOrdersTable = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      );
    }
    
    if (userOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tienes pedidos realizados todavía.</p>
        </div>
      );
    }
    
    if (isMobile) {
      return (
        <div className="space-y-4">
          {userOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {order.lunch?.name || 'Almuerzo'}
                  </CardTitle>
                  <Badge className={getOrderStatusColor(order.status)}>
                    {order.status === 'pending' ? 'Pendiente' : 
                     order.status === 'approved' ? 'Aprobado' : 
                     order.status === 'rejected' ? 'Rechazado' : 'Entregado'}
                  </Badge>
                </div>
                <CardDescription>
                  {format(new Date(order.date), 'dd/MM/yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.lunch?.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-medium">${order.lunch?.price.toFixed(2)}</span>
                  {order.status === 'pending' && (
                    <Button variant="outline" size="sm">Cancelar</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Almuerzo</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{format(new Date(order.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="font-medium">{order.lunch?.name}</TableCell>
              <TableCell>${order.lunch?.price.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={getOrderStatusColor(order.status)}>
                  {order.status === 'pending' ? 'Pendiente' : 
                   order.status === 'approved' ? 'Aprobado' : 
                   order.status === 'rejected' ? 'Rechazado' : 'Entregado'}
                </Badge>
              </TableCell>
              <TableCell>
                {order.status === 'pending' && (
                  <Button variant="outline" size="sm">Cancelar</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar 
        userRole="employee" 
        userName={`${user?.first_name} ${user?.last_name}`} 
      />
      
      <main className="pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel de Empleado</h1>
            <p className="text-muted-foreground">
              Realiza pedidos de almuerzo y administra tus órdenes.
            </p>
          </div>
          
          {company && (
            <div className="mb-6">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-medium">Tu empresa: {company.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0 
                          ? `Subsidio fijo: $${company.fixed_subsidy_amount.toFixed(2)}`
                          : `Subsidio: ${company.subsidy_percentage || company.subsidyPercentage || 0}%`
                        }
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Ver política de almuerzos</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="menu">Menú del día</TabsTrigger>
                  <TabsTrigger value="orders">Mis pedidos</TabsTrigger>
                </TabsList>
                
                <div className="hidden md:block">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Fecha:</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      {format(selectedDate, 'dd/MM/yyyy')}
                    </Button>
                  </div>
                </div>
              </div>
              
              {isMobile && (
                <div className="mb-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border mx-auto"
                  />
                </div>
              )}
              
              <TabsContent value="menu" className="pt-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Opciones de almuerzo</CardTitle>
                    <CardDescription>
                      Selecciona tu almuerzo para {format(selectedDate, 'dd/MM/yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderLunchOptions()}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders" className="pt-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis pedidos</CardTitle>
                    <CardDescription>
                      Historial de tus pedidos de almuerzo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderOrdersTable()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
