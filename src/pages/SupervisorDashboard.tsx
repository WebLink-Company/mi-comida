
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavigationBar from '@/components/NavigationBar';
import OrderSummary from '@/components/OrderSummary';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  mockUsers, 
  mockOrders, 
  getLunchOptionById, 
  getUsersByCompany, 
  getOrdersByCompany, 
  getCurrentUser 
} from '@/lib/mockData';
import { Order, User } from '@/lib/types';
import { CheckCircle, XCircle, Users, Calendar, DollarSign, PieChart as PieChartIcon, Filter } from 'lucide-react';

interface SupervisorDashboardProps {
  activeTab?: 'dashboard' | 'approve' | 'reports';
}

const SupervisorDashboard = ({ activeTab = 'dashboard' }: SupervisorDashboardProps) => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  // Get current supervisor and company data
  const currentUser = getCurrentUser();
  const companyId = currentUser.companyId;

  useEffect(() => {
    // Get all users from the supervisor's company
    const users = getUsersByCompany(companyId);
    setCompanyUsers(users);

    // Get all orders for the company
    const allOrders = getOrdersByCompany(companyId);
    
    // Filter for pending orders
    const pending = allOrders.filter(order => order.status === 'pending');
    setPendingOrders(pending);

    // Simulate loading for animations
    const timer = setTimeout(() => {
      setLoadingAnimation(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [companyId]);

  const handleApproveOrder = (orderId: string) => {
    setPendingOrders(prevOrders => 
      prevOrders.filter(order => order.id !== orderId)
    );

    toast({
      title: "Pedido aprobado",
      description: "El pedido ha sido aprobado exitosamente.",
    });
  };

  const handleRejectOrder = (orderId: string) => {
    setPendingOrders(prevOrders => 
      prevOrders.filter(order => order.id !== orderId)
    );

    toast({
      title: "Pedido rechazado",
      description: "El pedido ha sido rechazado.",
    });
  };

  // Mock data for charts
  const weeklyData = [
    { name: 'Lun', pedidos: 12, valor: 160 },
    { name: 'Mar', pedidos: 15, valor: 190 },
    { name: 'Mié', pedidos: 18, valor: 220 },
    { name: 'Jue', pedidos: 16, valor: 200 },
    { name: 'Vie', pedidos: 20, valor: 250 },
    { name: 'Sáb', pedidos: 5, valor: 70 },
    { name: 'Dom', pedidos: 2, valor: 30 },
  ];

  const userConsumptionData = [
    { name: 'Juan Pérez', pedidos: 18 },
    { name: 'Ana García', pedidos: 15 },
    { name: 'Carlos López', pedidos: 12 },
    { name: 'María Rodríguez', pedidos: 10 },
    { name: 'Pablo Martínez', pedidos: 8 },
  ];

  const mealTypeData = [
    { name: 'Pollo', value: 35 },
    { name: 'Vegetariano', value: 25 },
    { name: 'Pescado', value: 15 },
    { name: 'Pasta', value: 15 },
    { name: 'Otros', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar userRole="supervisor" userName={currentUser.name} />
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold mb-2"
            >
              Panel de Supervisor
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Administra y aprueba los pedidos de tu empresa.
            </motion.p>
          </div>
          
          <Tabs defaultValue={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
            <TabsList className="mb-8">
              <TabsTrigger value="dashboard" className="text-base px-5 py-2">Dashboard</TabsTrigger>
              <TabsTrigger value="approve" className="text-base px-5 py-2">Aprobar Pedidos</TabsTrigger>
              <TabsTrigger value="reports" className="text-base px-5 py-2">Reportes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Usuarios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{companyUsers.length}</div>
                        <Users className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Pedidos Pendientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{pendingOrders.length}</div>
                        <Calendar className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Gasto Mensual
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">$2,450</div>
                        <DollarSign className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Ahorro por Subsidio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">$980</div>
                        <PieChartIcon className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Pedidos Semanales</CardTitle>
                      <CardDescription>Cantidad y valor de pedidos por día</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={weeklyData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="pedidos" 
                              stroke="#0088FE" 
                              fillOpacity={1} 
                              fill="url(#colorPedidos)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="valor" 
                              stroke="#00C49F" 
                              fillOpacity={1} 
                              fill="url(#colorValor)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Top Usuarios</CardTitle>
                      <CardDescription>Empleados con más pedidos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={userConsumptionData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45} 
                              textAnchor="end" 
                              height={70}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="pedidos" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="approve" className="mt-0">
              <div className="grid md:grid-cols-[3fr_1fr] gap-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Pedidos Pendientes</h2>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrar
                    </Button>
                  </div>
                  
                  {loadingAnimation ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div 
                          key={`skeleton-${index}`}
                          className="h-32 bg-muted rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : pendingOrders.length > 0 ? (
                    <div className="space-y-4">
                      {pendingOrders.map((order, index) => {
                        const lunchOption = getLunchOptionById(order.lunchOptionId);
                        const user = mockUsers.find(u => u.id === order.userId);
                        
                        if (!lunchOption || !user) return null;
                        
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <OrderSummary
                              order={order}
                              lunchOption={lunchOption}
                              user={user}
                              showActions={true}
                              onApprove={handleApproveOrder}
                              onReject={handleRejectOrder}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-muted/30 rounded-xl border border-border p-8 text-center"
                    >
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-medium mb-2">¡No hay pedidos pendientes!</h3>
                      <p className="text-muted-foreground">
                        Todos los pedidos han sido revisados. Vuelve más tarde para revisar nuevos pedidos.
                      </p>
                    </motion.div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Pedidos pendientes</p>
                        <p className="text-2xl font-bold">{pendingOrders.length}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Empleados activos</p>
                        <p className="text-2xl font-bold">
                          {companyUsers.filter(user => user.role === 'employee').length}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Valor pedidos pendientes</p>
                        <p className="text-2xl font-bold">
                          ${pendingOrders.reduce((total, order) => {
                            const lunchOption = getLunchOptionById(order.lunchOptionId);
                            return total + (lunchOption?.price || 0);
                          }, 0).toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Tipos de Comida</CardTitle>
                      <CardDescription>Preferencias de los empleados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mealTypeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {mealTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-0">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Consumo por Empleado</CardTitle>
                    <CardDescription>
                      Detalle mensual de almuerzos por usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={userConsumptionData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="pedidos" name="Almuerzos" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gasto por Empleado</CardTitle>
                      <CardDescription>Valor total de almuerzos por empleado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left pb-3 font-medium text-muted-foreground">Empleado</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Almuerzos</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userConsumptionData.map((user, index) => (
                            <tr key={index} className="border-b border-border">
                              <td className="py-3">{user.name}</td>
                              <td className="text-right py-3">{user.pedidos}</td>
                              <td className="text-right py-3 font-medium">
                                ${(user.pedidos * 13.5).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="pt-4 font-medium">Total</td>
                            <td className="text-right pt-4 font-medium">
                              {userConsumptionData.reduce((sum, user) => sum + user.pedidos, 0)}
                            </td>
                            <td className="text-right pt-4 font-medium">
                              ${userConsumptionData.reduce((sum, user) => sum + user.pedidos * 13.5, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Estadísticas Mensuales</CardTitle>
                      <CardDescription>Resumen del mes actual</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total almuerzos</p>
                        <p className="text-3xl font-bold">142</p>
                        <p className="text-sm text-green-600 mt-1">+12% respecto al mes anterior</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Gasto total</p>
                        <p className="text-3xl font-bold">$1,880.50</p>
                        <p className="text-sm text-green-600 mt-1">+8% respecto al mes anterior</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Ahorro por subsidio</p>
                        <p className="text-3xl font-bold">$940.25</p>
                        <p className="text-sm text-muted-foreground mt-1">50% del total</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
