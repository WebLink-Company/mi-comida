import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { User, Order, LunchOption, Company } from '@/lib/types';
import { mockOrders, mockUsers, mockLunchOptions } from '@/lib/mockData';
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

interface SupervisorDashboardProps {
  activeTab?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
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
  const { user: currentUser } = useAuth();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [employeeUsers, setEmployeeUsers] = useState<User[]>([]);
  const [lunchOptions, setLunchOptions] = useState<LunchOption[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [subsidyPercentage, setSubsidyPercentage] = useState<number>(0);
  const [fixedSubsidyAmount, setFixedSubsidyAmount] = useState<number>(0);
  const [subsidyType, setSubsidyType] = useState<'percentage' | 'fixed'>('percentage');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [employeeSubsidies, setEmployeeSubsidies] = useState<{
    [key: string]: { percentage?: number; fixed_amount?: number; subsidy_type: 'percentage' | 'fixed' }
  }>({});

  useEffect(() => {
    const filteredOrders = mockOrders.filter(order => order.status === 'pending');
    setPendingOrders(filteredOrders);
    setLunchOptions(mockLunchOptions);

    const companyEmployees = mockUsers.filter(user => 
      user.role === 'employee' && user.company_id === currentUser?.company_id
    );
    setEmployeeUsers(companyEmployees);

    setCompany({
      id: '1',
      name: 'Acme Corp',
      subsidy_percentage: 50,
      provider_id: 'provider-1',
      created_at: new Date().toISOString(),
    });

    if (company) {
      setSubsidyPercentage(company.subsidy_percentage || 0);
      setFixedSubsidyAmount(company.fixed_subsidy_amount || 0);
    }
  }, [currentUser]);

  const approvedOrdersCount = mockOrders.filter(order => order.status === 'approved').length;
  const rejectedOrdersCount = mockOrders.filter(order => order.status === 'rejected').length;
  const deliveredOrdersCount = mockOrders.filter(order => order.status === 'delivered').length;

  const data = [
    { name: 'Aprobados', value: approvedOrdersCount },
    { name: 'Rechazados', value: rejectedOrdersCount },
    { name: 'Entregados', value: deliveredOrdersCount },
  ];

  const handleUpdateCompanySubsidy = () => {
    if (company) {
      const updatedCompany = {
        ...company,
        subsidy_percentage: subsidyType === 'percentage' ? subsidyPercentage : 0,
        fixed_subsidy_amount: subsidyType === 'fixed' ? fixedSubsidyAmount : undefined
      };
      setCompany(updatedCompany);
      
      // Success toast message
      // toast({
      //   title: 'Subsidio actualizado',
      //   description: 'El subsidio de la empresa ha sido actualizado correctamente.',
      // });
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
    
    // Success toast message
    // toast({
    //   title: 'Subsidio actualizado',
    //   description: 'El subsidio del empleado ha sido actualizado correctamente.',
    // });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar userRole="supervisor" userName={`${currentUser?.first_name} ${currentUser?.last_name}`} />
      
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
            onValueChange={(value) => {/* Handle tab change if needed */}}
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
                    <p className="text-4xl font-bold">{pendingOrders.length}</p>
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
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
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
                        pendingOrders.map((order) => {
                          const user = mockUsers.find(user => user.id === order.user_id);
                          const lunch = mockLunchOptions.find(lunch => lunch.id === order.lunch_option_id);
                          
                          return (
                            <TableRow key={order.id}>
                              <TableCell>{format(new Date(order.date), 'PPP')}</TableCell>
                              <TableCell>{user?.first_name} {user?.last_name}</TableCell>
                              <TableCell>{lunch?.name}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">Aprobar</Button>
                                <Button variant="destructive" size="sm">Rechazar</Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No hay pedidos pendientes para aprobar.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleUpdateCompanySubsidy}>Actualizar Subsidio de Empresa</Button>
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
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleUpdateEmployeeSubsidy}
                      disabled={!selectedEmployee}
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
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={mockOrders}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="userId" fill="#8884d8" />
                      <Bar dataKey="lunchOptionId" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
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
