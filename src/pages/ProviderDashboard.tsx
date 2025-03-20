import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { LunchOption, Order, User, Company } from '@/lib/types';
import NavigationBar from '@/components/NavigationBar';
import { format } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lunches, orders } from '@/lib/mockData';

interface ProviderDashboardProps {
  activeTab?: string;
}

const ProviderDashboard = ({ activeTab = 'dashboard' }: ProviderDashboardProps) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [menuItems, setMenuItems] = useState<LunchOption[]>([]);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState<Partial<LunchOption>>({
    name: '',
    description: '',
    price: 0,
    image: '/placeholder.svg',
    tags: [],
  });
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: '',
    subsidy_percentage: 0,
    fixed_subsidy_amount: 0,
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'employee',
    company_id: '',
  });

  useEffect(() => {
    // In a real app, fetch from Supabase
    setMenuItems(lunches);
    setPendingOrders(orders.filter(order => order.status === 'pending'));
    
    // Mock companies and users data
    setCompanies([
      {
        id: '1',
        name: 'Acme Corp',
        subsidy_percentage: 50,
        provider_id: currentUser?.id || '',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Globex Inc',
        subsidy_percentage: 30,
        fixed_subsidy_amount: 5000,
        provider_id: currentUser?.id || '',
        created_at: new Date().toISOString(),
      }
    ]);
  }, [currentUser]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleApproveOrder = (orderId: string) => {
    // In a real app, update the order status in Supabase
    const updatedOrders = pendingOrders.map(order =>
      order.id === orderId ? { ...order, status: 'approved' } : order
    );
    setPendingOrders(updatedOrders);
    
    toast({
      title: 'Pedido aprobado',
      description: `El pedido ${orderId} ha sido aprobado.`,
    });
  };

  const handleRejectOrder = (orderId: string) => {
    // In a real app, update the order status in Supabase
    const updatedOrders = pendingOrders.map(order =>
      order.id === orderId ? { ...order, status: 'rejected' } : order
    );
    setPendingOrders(updatedOrders);
    
    toast({
      title: 'Pedido rechazado',
      description: `El pedido ${orderId} ha sido rechazado.`,
      variant: 'destructive',
    });
  };

  const handleAddMenuItem = () => {
    setIsAddingMenuItem(true);
    setNewMenuItem({
      name: '',
      description: '',
      price: 0,
      image: '/placeholder.svg',
      tags: [],
    });
  };

  const handleMenuItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMenuItem({
      ...newMenuItem,
      [name]: value,
    });
  };

  const handleSaveMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.description || !newMenuItem.price) {
      toast({
        title: 'Error',
        description: 'Todos los campos son requeridos',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, save to Supabase
    const newMenuItemItem: LunchOption = {
      id: `new-${Date.now()}`,
      name: newMenuItem.name || '',
      description: newMenuItem.description || '',
      price: newMenuItem.price || 0,
      image: newMenuItem.image || '/placeholder.svg',
      available: true,
      tags: [],
      provider_id: currentUser?.id || '',
      created_at: new Date().toISOString(),
    };

    setMenuItems([...menuItems, newMenuItemItem]);
    setIsAddingMenuItem(false);
    
    toast({
      title: 'Menú agregado',
      description: `${newMenuItem.name} ha sido agregado correctamente.`,
    });
  };

  const handleAddCompany = () => {
    setIsAddingCompany(true);
    setNewCompany({
      name: '',
      subsidy_percentage: 0,
      fixed_subsidy_amount: 0,
    });
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompany({
      ...newCompany,
      [name]: name === 'subsidy_percentage' || name === 'fixed_subsidy_amount' 
        ? parseFloat(value) 
        : value,
    });
  };

  const handleSaveCompany = () => {
    if (!newCompany.name) {
      toast({
        title: 'Error',
        description: 'El nombre de la empresa es requerido',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, save to Supabase
    const newCompanyItem: Company = {
      id: `new-${Date.now()}`,
      name: newCompany.name || '',
      subsidy_percentage: newCompany.subsidy_percentage || 0,
      fixed_subsidy_amount: newCompany.fixed_subsidy_amount,
      provider_id: currentUser?.id || '',
      created_at: new Date().toISOString(),
    };

    setCompanies([...companies, newCompanyItem]);
    setIsAddingCompany(false);
    
    toast({
      title: 'Empresa agregada',
      description: `${newCompany.name} ha sido agregada correctamente.`,
    });
  };

  const handleAddUser = () => {
    setIsAddingUser(true);
    setNewUser({
      first_name: '',
      last_name: '',
      email: '',
      role: 'employee',
      company_id: '',
    });
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleRoleChange = (value: string) => {
    setNewUser({
      ...newUser,
      role: value as 'admin' | 'provider' | 'supervisor' | 'employee' | 'company',
    });
  };

  const handleCompanySelect = (value: string) => {
    setNewUser({
      ...newUser,
      company_id: value,
    });
  };

  const handleSaveUser = () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email) {
      toast({
        title: 'Error',
        description: 'Todos los campos son requeridos',
        variant: 'destructive',
      });
      return;
    }

    if ((newUser.role === 'employee' || newUser.role === 'supervisor') && !newUser.company_id) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar una empresa para empleados y supervisores',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, would save to Supabase and create auth user
    const newUserItem: User = {
      id: `new-${Date.now()}`,
      first_name: newUser.first_name || '',
      last_name: newUser.last_name || '',
      email: newUser.email || '',
      role: newUser.role || 'employee',
      company_id: newUser.company_id,
      created_at: new Date().toISOString(),
    };

    setUsers([...users, newUserItem]);
    setIsAddingUser(false);
    
    toast({
      title: 'Usuario agregado',
      description: `${newUser.first_name} ${newUser.last_name} ha sido agregado correctamente.`,
    });
  };

  const dailyRevenue = menuItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar userRole="provider" userName={`${currentUser?.first_name} ${currentUser?.last_name}`} />
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Panel de Proveedor</h1>
            <p className="text-muted-foreground">
              Gestiona tu menú, pedidos y facturación desde este panel.
            </p>
          </div>
          
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={(value) => {/* Handle tab change if needed */}}
          >
            <TabsList className="mb-8">
              <TabsTrigger value="dashboard" className="text-base px-5 py-2">Dashboard</TabsTrigger>
              <TabsTrigger value="menu" className="text-base px-5 py-2">Menú</TabsTrigger>
              <TabsTrigger value="orders" className="text-base px-5 py-2">Pedidos</TabsTrigger>
              <TabsTrigger value="companies" className="text-base px-5 py-2">Empresas</TabsTrigger>
              <TabsTrigger value="users" className="text-base px-5 py-2">Usuarios</TabsTrigger>
              <TabsTrigger value="billing" className="text-base px-5 py-2">Facturación</TabsTrigger>
            </TabsList>
            
            {/* Dashboard Content */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos Diarios</CardTitle>
                    <CardDescription>Ingresos totales del día</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dailyRevenue.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Pedidos Pendientes</CardTitle>
                    <CardDescription>Número de pedidos por aprobar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingOrders.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Clientes Activos</CardTitle>
                    <CardDescription>Número de clientes que han ordenado hoy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Menu Content */}
            <TabsContent value="menu">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Menú del Día</CardTitle>
                    <CardDescription>
                      Gestiona los platos disponibles para hoy
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddMenuItem}>Agregar Menú</Button>
                </CardHeader>
                <CardContent>
                  {isAddingMenuItem ? (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg mb-6"
                    >
                      <h3 className="font-medium mb-4">Nuevo Menú</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nombre</Label>
                            <Input 
                              id="name" 
                              name="name"
                              value={newMenuItem.name || ''} 
                              onChange={handleMenuItemChange} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Precio</Label>
                            <Input 
                              id="price" 
                              name="price"
                              type="number" 
                              value={newMenuItem.price || 0} 
                              onChange={handleMenuItemChange} 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea 
                            id="description" 
                            name="description"
                            value={newMenuItem.description || ''} 
                            onChange={handleMenuItemChange} 
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddingMenuItem(false)}>Cancelar</Button>
                          <Button onClick={handleSaveMenuItem}>Guardar Menú</Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.length > 0 ? (
                        menuItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>${item.price.toLocaleString()}</TableCell>
                            <TableCell>{item.available ? 'Disponible' : 'No Disponible'}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Editar</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No hay menús registrados. ¡Agrega tu primer menú ahora!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Orders Content */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos del {format(selectedDate, 'dd/MM/yyyy')}</CardTitle>
                  <CardDescription>
                    Gestiona los pedidos realizados en la fecha seleccionada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Menú</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.length > 0 ? (
                        pendingOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.userId}</TableCell>
                            <TableCell>{order.lunchOptionId}</TableCell>
                            <TableCell>{format(new Date(order.date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="capitalize">{order.status}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handleApproveOrder(order.id)}>Aprobar</Button>
                              <Button variant="destructive" size="sm" onClick={() => handleRejectOrder(order.id)}>Rechazar</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No hay pedidos pendientes para hoy.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Companies Content */}
            <TabsContent value="companies">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Empresas</CardTitle>
                    <CardDescription>
                      Gestiona las empresas que utilizan tus servicios
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddCompany}>Agregar Empresa</Button>
                </CardHeader>
                <CardContent>
                  {isAddingCompany ? (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg mb-6"
                    >
                      <h3 className="font-medium mb-4">Nueva Empresa</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="name">Nombre de la Empresa</Label>
                            <Input 
                              id="name" 
                              name="name"
                              value={newCompany.name || ''} 
                              onChange={handleCompanyChange} 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="subsidy_percentage">Porcentaje de Subsidio (%)</Label>
                            <Input 
                              id="subsidy_percentage" 
                              name="subsidy_percentage"
                              type="number" 
                              min="0"
                              max="100"
                              value={newCompany.subsidy_percentage || 0} 
                              onChange={handleCompanyChange} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="fixed_subsidy_amount">Monto Fijo de Subsidio</Label>
                            <Input 
                              id="fixed_subsidy_amount" 
                              name="fixed_subsidy_amount"
                              type="number" 
                              min="0"
                              value={newCompany.fixed_subsidy_amount || 0} 
                              onChange={handleCompanyChange} 
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddingCompany(false)}>Cancelar</Button>
                          <Button onClick={handleSaveCompany}>Guardar Empresa</Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Subsidio (%)</TableHead>
                        <TableHead>Subsidio Fijo</TableHead>
                        <TableHead>Empleados</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.length > 0 ? (
                        companies.map((company) => (
                          <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>{company.subsidy_percentage}%</TableCell>
                            <TableCell>
                              {company.fixed_subsidy_amount 
                                ? `$${company.fixed_subsidy_amount.toLocaleString()}` 
                                : '-'}
                            </TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Editar</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No hay empresas registradas. ¡Agrega tu primera empresa ahora!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Users Content */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Usuarios</CardTitle>
                    <CardDescription>
                      Gestiona los usuarios de tus empresas cliente
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddUser}>Agregar Usuario</Button>
                </CardHeader>
                <CardContent>
                  {isAddingUser ? (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg mb-6"
                    >
                      <h3 className="font-medium mb-4">Nuevo Usuario</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="first_name">Nombre</Label>
                            <Input 
                              id="first_name" 
                              name="first_name"
                              value={newUser.first_name || ''} 
                              onChange={handleUserChange} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="last_name">Apellido</Label>
                            <Input 
                              id="last_name" 
                              name="last_name"
                              value={newUser.last_name || ''} 
                              onChange={handleUserChange} 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input 
                            id="email" 
                            name="email"
                            type="email"
                            value={newUser.email || ''} 
                            onChange={handleUserChange} 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="role">Rol</Label>
                            <Select 
                              onValueChange={handleRoleChange}
                              defaultValue={newUser.role || 'employee'}
                            >
                              <SelectTrigger id="role">
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="employee">Empleado</SelectItem>
                                <SelectItem value="company">Empresa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {(newUser.role === 'employee' || newUser.role === 'supervisor') && (
                            <div>
                              <Label htmlFor="company">Empresa</Label>
                              <Select 
                                onValueChange={handleCompanySelect}
                                defaultValue={newUser.company_id}
                              >
                                <SelectTrigger id="company">
                                  <SelectValue placeholder="Seleccionar empresa" />
                                </SelectTrigger>
                                <SelectContent>
                                  {companies.map(company => (
                                    <SelectItem key={company.id} value={company.id}>
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddingUser(false)}>Cancelar</Button>
                          <Button onClick={handleSaveUser}>Guardar Usuario</Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="capitalize">{user.role}</TableCell>
                            <TableCell>
                              {user.company_id 
                                ? companies.find(c => c.id === user.company_id)?.name || '-'
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Editar</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No hay usuarios registrados. ¡Agrega tu primer usuario ahora!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Billing Content */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Facturación</CardTitle>
                  <CardDescription>
                    Genera y gestiona tus facturas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Aquí irá la información de facturación.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
