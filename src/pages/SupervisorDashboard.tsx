
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavigationBar from '@/components/NavigationBar';
import { Order, LunchOption, Company } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SupervisorDashboardProps {
  activeTab?: string;
}

// Extended Order type to include lunch_option and user relations
interface ExtendedOrder extends Order {
  lunch_option?: {
    id: string;
    name: string;
    price: number;
  };
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const SupervisorDashboard = ({ activeTab = 'dashboard' }: SupervisorDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingOrders, setPendingOrders] = useState<ExtendedOrder[]>([]);
  const [employeeUsers, setEmployeeUsers] = useState<any[]>([]);
  const [lunchOptions, setLunchOptions] = useState<LunchOption[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [subsidyPercentage, setSubsidyPercentage] = useState<number>(0);
  const [fixedSubsidyAmount, setFixedSubsidyAmount] = useState<number>(0);
  const [subsidyType, setSubsidyType] = useState<'percentage' | 'fixed'>('percentage');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [employeeSubsidies, setEmployeeSubsidies] = useState<{
    [key: string]: { percentage?: number; fixed_amount?: number; subsidy_type: 'percentage' | 'fixed' }
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStats, setOrderStats] = useState({ approved: 0, rejected: 0, delivered: 0 });

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if the user is a supervisor and has a company assigned
        if (user.role !== 'supervisor') {
          setError("Acceso denegado. Solo los supervisores pueden acceder a este panel.");
          setLoading(false);
          return;
        }

        if (!user.company_id) {
          setError("No tienes ninguna empresa asignada actualmente.");
          setLoading(false);
          return;
        }

        // Fetch company data
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.company_id)
          .single();

        if (companyError) {
          throw companyError;
        }

        if (!companyData) {
          setError("No se encontró información de la empresa asignada.");
          setLoading(false);
          return;
        }

        setCompany(companyData);
        setSubsidyPercentage(companyData.subsidy_percentage || 0);
        setFixedSubsidyAmount(companyData.fixed_subsidy_amount || 0);
        setSubsidyType(companyData.fixed_subsidy_amount ? 'fixed' : 'percentage');

        // Fetch pending orders for the company
        const today = new Date().toISOString().split('T')[0];
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            lunch_option:lunch_option_id(id, name, price),
            user:user_id(id, first_name, last_name, email)
          `)
          .eq('company_id', user.company_id)
          .eq('status', 'pending');

        if (ordersError) {
          throw ordersError;
        }

        setPendingOrders(ordersData || []);

        // Fetch order statistics
        const { data: allOrders, error: allOrdersError } = await supabase
          .from('orders')
          .select('status')
          .eq('company_id', user.company_id);

        if (allOrdersError) {
          throw allOrdersError;
        }

        const stats = {
          approved: allOrders?.filter(o => o.status === 'approved').length || 0,
          rejected: allOrders?.filter(o => o.status === 'rejected').length || 0,
          delivered: allOrders?.filter(o => o.status === 'delivered').length || 0
        };

        setOrderStats(stats);

        // Fetch employees for the company
        const { data: employees, error: employeesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', user.company_id)
          .eq('role', 'employee');

        if (employeesError) {
          throw employeesError;
        }

        setEmployeeUsers(employees || []);

        // Fetch lunch options available to the company
        const { data: companyProvider } = await supabase
          .from('companies')
          .select('provider_id')
          .eq('id', user.company_id)
          .single();

        if (companyProvider?.provider_id) {
          const { data: lunchOptionsData, error: lunchOptionsError } = await supabase
            .from('lunch_options')
            .select('*')
            .eq('provider_id', companyProvider.provider_id);

          if (lunchOptionsError) {
            throw lunchOptionsError;
          }

          setLunchOptions(lunchOptionsData || []);
        }

      } catch (err) {
        console.error('Error fetching supervisor data:', err);
        setError(`Error al cargar datos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos del supervisor',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleUpdateCompanySubsidy = async () => {
    if (!company || !user?.company_id) return;

    try {
      const updateData = {
        subsidy_percentage: subsidyType === 'percentage' ? subsidyPercentage : 0,
        fixed_subsidy_amount: subsidyType === 'fixed' ? fixedSubsidyAmount : 0
      };

      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', user.company_id);

      if (error) throw error;

      setCompany({ ...company, ...updateData });
      toast({
        title: 'Subsidio actualizado',
        description: 'El subsidio de la empresa ha sido actualizado correctamente.',
      });
    } catch (err) {
      console.error('Error al actualizar subsidio:', err);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el subsidio',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEmployeeSubsidy = () => {
    if (!selectedEmployee) return;
    
    const updatedSubsidies = {
      ...employeeSubsidies,
      [selectedEmployee]: {
        percentage: subsidyType === 'percentage' ? subsidyPercentage : undefined,
        fixed_amount: subsidyType === 'fixed' ? fixedSubsidyAmount : undefined,
        subsidy_type: subsidyType
      }
    };
    
    setEmployeeSubsidies(updatedSubsidies);
    
    toast({
      title: 'Subsidio actualizado',
      description: 'El subsidio del empleado ha sido actualizado correctamente.',
    });
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'approved',
          approved_by: user?.id
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update the local state
      setPendingOrders(pendingOrders.filter(order => order.id !== orderId));
      setOrderStats({
        ...orderStats,
        approved: orderStats.approved + 1
      });

      toast({
        title: 'Pedido aprobado',
        description: 'El pedido ha sido aprobado correctamente.',
      });
    } catch (err) {
      console.error('Error al aprobar pedido:', err);
      toast({
        title: 'Error',
        description: 'No se pudo aprobar el pedido',
        variant: 'destructive',
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'rejected',
          approved_by: user?.id
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update the local state
      setPendingOrders(pendingOrders.filter(order => order.id !== orderId));
      setOrderStats({
        ...orderStats,
        rejected: orderStats.rejected + 1
      });

      toast({
        title: 'Pedido rechazado',
        description: 'El pedido ha sido rechazado correctamente.',
      });
    } catch (err) {
      console.error('Error al rechazar pedido:', err);
      toast({
        title: 'Error',
        description: 'No se pudo rechazar el pedido',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar userRole="supervisor" userName={`${user?.first_name} ${user?.last_name}`} />
        <main className="pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <Alert variant="destructive" className="mb-10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Aprobados', value: orderStats.approved },
    { name: 'Rechazados', value: orderStats.rejected },
    { name: 'Entregados', value: orderStats.delivered },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar userRole="supervisor" userName={`${user?.first_name} ${user?.last_name}`} />
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Panel de Supervisor</h1>
            <p className="text-muted-foreground">
              Aprueba pedidos y administra subsidios para tus empleados.
            </p>
          </div>
          
          <Tabs 
            defaultValue={activeTab} 
          >
            <TabsList className="mb-8">
              <TabsTrigger value="dashboard" className="text-base px-5 py-2">Dashboard</TabsTrigger>
              <TabsTrigger value="approve" className="text-base px-5 py-2">Aprobar Pedidos</TabsTrigger>
              <TabsTrigger value="subsidies" className="text-base px-5 py-2">Subsidios</TabsTrigger>
              <TabsTrigger value="reports" className="text-base px-5 py-2">Reportes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pedidos Pendientes</CardTitle>
                    <CardDescription>
                      Número de pedidos que requieren aprobación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-4xl font-bold">Cargando...</p>
                    ) : (
                      <p className="text-4xl font-bold">{pendingOrders.length}</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de Pedidos</CardTitle>
                    <CardDescription>
                      Distribución de los estados de los pedidos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center items-center h-[250px]">Cargando...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="approve">
              <Card>
                <CardHeader>
                  <CardTitle>Aprobar Pedidos</CardTitle>
                  <CardDescription>
                    Lista de pedidos pendientes para su aprobación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-6">Cargando pedidos...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Comida</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingOrders.length > 0 ? (
                          pendingOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{format(new Date(order.date), 'PPP', { locale: es })}</TableCell>
                              <TableCell>
                                {order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Usuario desconocido'}
                              </TableCell>
                              <TableCell>{order.lunch_option?.name || 'Plato desconocido'}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleApproveOrder(order.id)}
                                  className="mr-2"
                                >
                                  Aprobar
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleRejectOrder(order.id)}
                                >
                                  Rechazar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                              No hay pedidos pendientes para aprobar.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subsidies">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subsidio de Empresa</CardTitle>
                    <CardDescription>
                      Configura el subsidio para toda la empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loading ? (
                      <div className="text-center py-6">Cargando datos de subsidio...</div>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="subsidy-type">Tipo de Subsidio</Label>
                          <Select 
                            onValueChange={(value) => setSubsidyType(value as 'percentage' | 'fixed')}
                            defaultValue={subsidyType}
                          >
                            <SelectTrigger id="subsidy-type">
                              <SelectValue placeholder="Seleccionar tipo de subsidio" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Porcentaje</SelectItem>
                              <SelectItem value="fixed">Monto Fijo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {subsidyType === 'percentage' ? (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <Label htmlFor="subsidy-percentage">Porcentaje de Subsidio</Label>
                              <span className="text-sm font-medium">{subsidyPercentage}%</span>
                            </div>
                            <Slider
                              id="subsidy-percentage"
                              min={0}
                              max={100}
                              step={1}
                              value={[subsidyPercentage]}
                              onValueChange={(value) => setSubsidyPercentage(value[0])}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="fixed-subsidy">Monto Fijo de Subsidio</Label>
                            <Input
                              id="fixed-subsidy"
                              type="number"
                              min={0}
                              value={fixedSubsidyAmount}
                              onChange={(e) => setFixedSubsidyAmount(parseFloat(e.target.value))}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleUpdateCompanySubsidy}
                      disabled={loading}
                    >
                      Actualizar Subsidio de Empresa
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Subsidio por Empleado</CardTitle>
                    <CardDescription>
                      Configura subsidios específicos por empleado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loading ? (
                      <div className="text-center py-6">Cargando empleados...</div>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="employee">Empleado</Label>
                          <Select 
                            onValueChange={setSelectedEmployee}
                            defaultValue={selectedEmployee}
                          >
                            <SelectTrigger id="employee">
                              <SelectValue placeholder="Seleccionar empleado" />
                            </SelectTrigger>
                            <SelectContent>
                              {employeeUsers.map(employee => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.first_name} {employee.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedEmployee && (
                          <>
                            <div>
                              <Label htmlFor="employee-subsidy-type">Tipo de Subsidio</Label>
                              <Select 
                                onValueChange={(value) => setSubsidyType(value as 'percentage' | 'fixed')}
                                defaultValue={employeeSubsidies[selectedEmployee]?.subsidy_type || subsidyType}
                              >
                                <SelectTrigger id="employee-subsidy-type">
                                  <SelectValue placeholder="Seleccionar tipo de subsidio" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Porcentaje</SelectItem>
                                  <SelectItem value="fixed">Monto Fijo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {subsidyType === 'percentage' ? (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Label htmlFor="employee-subsidy-percentage">Porcentaje de Subsidio</Label>
                                  <span className="text-sm font-medium">{subsidyPercentage}%</span>
                                </div>
                                <Slider
                                  id="employee-subsidy-percentage"
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={[
                                    employeeSubsidies[selectedEmployee]?.percentage !== undefined
                                      ? employeeSubsidies[selectedEmployee]?.percentage || 0
                                      : subsidyPercentage
                                  ]}
                                  onValueChange={(value) => setSubsidyPercentage(value[0])}
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor="employee-fixed-subsidy">Monto Fijo de Subsidio</Label>
                                <Input
                                  id="employee-fixed-subsidy"
                                  type="number"
                                  min={0}
                                  value={
                                    employeeSubsidies[selectedEmployee]?.fixed_amount !== undefined
                                      ? employeeSubsidies[selectedEmployee]?.fixed_amount || 0
                                      : fixedSubsidyAmount
                                  }
                                  onChange={(e) => setFixedSubsidyAmount(parseFloat(e.target.value))}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleUpdateEmployeeSubsidy}
                      disabled={!selectedEmployee || loading}
                    >
                      Actualizar Subsidio de Empleado
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Subsidios Asignados</CardTitle>
                  <CardDescription>
                    Lista de subsidios específicos por empleado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Tipo de Subsidio</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(employeeSubsidies).length > 0 ? (
                        Object.entries(employeeSubsidies).map(([userId, subsidy]) => {
                          const employee = employeeUsers.find(u => u.id === userId);
                          return (
                            <TableRow key={userId}>
                              <TableCell>
                                {employee ? `${employee.first_name} ${employee.last_name}` : 'Usuario Desconocido'}
                              </TableCell>
                              <TableCell className="capitalize">
                                {subsidy.subsidy_type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                              </TableCell>
                              <TableCell>
                                {subsidy.subsidy_type === 'percentage' 
                                  ? `${subsidy.percentage}%` 
                                  : `$${subsidy.fixed_amount?.toLocaleString()}`}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedEmployee(userId);
                                  setSubsidyType(subsidy.subsidy_type);
                                  if (subsidy.percentage !== undefined) {
                                    setSubsidyPercentage(subsidy.percentage);
                                  }
                                  if (subsidy.fixed_amount !== undefined) {
                                    setFixedSubsidyAmount(subsidy.fixed_amount);
                                  }
                                }}>
                                  Editar
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No hay subsidios específicos asignados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes</CardTitle>
                  <CardDescription>
                    Visualiza estadísticas y reportes de tus empleados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-6">Cargando reportes...</div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Los reportes detallados estarán disponibles próximamente.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
