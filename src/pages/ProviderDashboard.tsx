import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import NavigationBar from '@/components/NavigationBar';
import LunchCard from '@/components/LunchCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  mockLunchOptions, 
  mockOrders, 
  mockCompanies, 
  mockDashboardStats,
  getCurrentUser 
} from '@/lib/mockData';
import { LunchOption } from '@/lib/types';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  PieChart as PieChartIcon, 
  Plus, 
  CheckCircle, 
  Utensils,
  Building,
  Clock
} from 'lucide-react';

interface ProviderDashboardProps {
  activeTab?: 'dashboard' | 'menu' | 'orders' | 'billing';
}

const ProviderDashboard = ({ activeTab = 'dashboard' }: ProviderDashboardProps) => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [menuItems, setMenuItems] = useState<LunchOption[]>(mockLunchOptions);
  const [newMenuItem, setNewMenuItem] = useState<Partial<LunchOption>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    available: true,
    tags: []
  });
  const [tag, setTag] = useState('');
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  // Get current user
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Simulate loading for animations
    const timer = setTimeout(() => {
      setLoadingAnimation(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleMenuItemChange = (field: string, value: any) => {
    setNewMenuItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tag && !newMenuItem.tags?.includes(tag)) {
      setNewMenuItem(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewMenuItem(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  const handleAddMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.description || newMenuItem.price <= 0 || !newMenuItem.image) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive"
      });
      return;
    }

    const newItem: LunchOption = {
      id: `new-${Date.now()}`,
      name: newMenuItem.name,
      description: newMenuItem.description,
      price: newMenuItem.price,
      image: newMenuItem.image,
      available: newMenuItem.available || true,
      tags: newMenuItem.tags || [],
      provider_id: currentUser.id
    };

    setMenuItems([...menuItems, newItem]);
    
    // Reset form
    setNewMenuItem({
      name: '',
      description: '',
      price: 0,
      image: '',
      available: true,
      tags: []
    });

    toast({
      title: "Plato agregado",
      description: `${newItem.name} ha sido agregado al menú.`,
    });
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(items => 
      items.map(item => 
        item.id === id ? { ...item, available: !item.available } : item
      )
    );

    const item = menuItems.find(item => item.id === id);
    
    toast({
      title: item?.available ? "Plato desactivado" : "Plato activado",
      description: `${item?.name} ahora está ${item?.available ? 'desactivado' : 'activado'}.`,
    });
  };

  // Mock data for charts
  const salesData = [
    { name: 'Ene', ventas: 4200 },
    { name: 'Feb', ventas: 4800 },
    { name: 'Mar', ventas: 5500 },
    { name: 'Abr', ventas: 5200 },
    { name: 'May', ventas: 6100 },
    { name: 'Jun', ventas: 5900 },
    { name: 'Jul', ventas: 6200 },
  ];

  const companyOrdersData = [
    { name: 'Acme Inc.', pedidos: 45 },
    { name: 'TechCorp', pedidos: 38 },
    { name: 'Global Solutions', pedidos: 32 },
    { name: 'InnovateTech', pedidos: 28 },
    { name: 'MegaEmpresa', pedidos: 25 },
  ];

  const mealPreferencesData = [
    { name: 'Pollo', value: 35 },
    { name: 'Vegetariano', value: 25 },
    { name: 'Pescado', value: 15 },
    { name: 'Pasta', value: 15 },
    { name: 'Otros', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar userRole="provider" userName={currentUser.name} />
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold mb-2"
            >
              Panel de Proveedor
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Administra menús, pedidos y facturación de almuerzos.
            </motion.p>
          </div>
          
          <Tabs defaultValue={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
            <TabsList className="mb-8">
              <TabsTrigger value="dashboard" className="text-base px-5 py-2">Dashboard</TabsTrigger>
              <TabsTrigger value="menu" className="text-base px-5 py-2">Menú del Día</TabsTrigger>
              <TabsTrigger value="orders" className="text-base px-5 py-2">Pedidos</TabsTrigger>
              <TabsTrigger value="billing" className="text-base px-5 py-2">Facturación</TabsTrigger>
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
                        Pedidos Hoy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{mockDashboardStats.dailyOrders}</div>
                        <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
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
                        Ingresos Hoy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">${mockDashboardStats.dailyRevenue.toFixed(2)}</div>
                        <DollarSign className="w-8 h-8 text-muted-foreground/50" />
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
                        Empresas Activas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{mockCompanies.length}</div>
                        <Building className="w-8 h-8 text-muted-foreground/50" />
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
                        Ingreso Mensual
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">${mockDashboardStats.monthlyRevenue.toFixed(2)}</div>
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
                      <CardTitle>Ingresos por Mes</CardTitle>
                      <CardDescription>Tendencia de ventas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={salesData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Area 
                              type="monotone" 
                              dataKey="ventas" 
                              stroke="#0088FE" 
                              fillOpacity={1} 
                              fill="url(#colorVentas)" 
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
                      <CardTitle>Pedidos por Empresa</CardTitle>
                      <CardDescription>Principales clientes por volumen</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={companyOrdersData}
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
                            <RechartsTooltip />
                            <Bar dataKey="pedidos" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="md:col-span-1"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferencias</CardTitle>
                      <CardDescription>Tipos de platos preferidos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mealPreferencesData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {mealPreferencesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="md:col-span-2"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Empresas Principales</CardTitle>
                      <CardDescription>Clientes con mayor facturación</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left pb-3 font-medium text-muted-foreground">Empresa</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Pedidos</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Ingreso</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Promedio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockCompanies.map((company, index) => (
                            <tr key={company.id} className="border-b border-border">
                              <td className="py-3 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                                  {company.name.charAt(0)}
                                </div>
                                {company.name}
                              </td>
                              <td className="text-right py-3">
                                {Math.floor(Math.random() * 50) + 20}
                              </td>
                              <td className="text-right py-3 font-medium">
                                ${(Math.random() * 1000 + 500).toFixed(2)}
                              </td>
                              <td className="text-right py-3">
                                ${(Math.random() * 15 + 10).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="menu" className="mt-0">
              <div className="grid md:grid-cols-[1fr_350px] gap-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Menú Actual</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {menuItems.filter(item => item.available).length} platos activos
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loadingAnimation ? (
                      [...Array(4)].map((_, index) => (
                        <div 
                          key={`skeleton-${index}`}
                          className="h-[380px] bg-muted rounded-xl animate-pulse"
                        />
                      ))
                    ) : (
                      menuItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="relative">
                            <LunchCard 
                              lunchOption={item} 
                              showControls={false}
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Switch 
                                  id={`available-${item.id}`}
                                  checked={item.available}
                                  onCheckedChange={() => toggleItemAvailability(item.id)}
                                />
                                <Label htmlFor={`available-${item.id}`} className="text-sm font-medium">
                                  {item.available ? 'Disponible' : 'No disponible'}
                                </Label>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Agregar Nuevo Plato</CardTitle>
                      <CardDescription>
                        Completa el formulario para añadir un plato al menú
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dish-name">Nombre del Plato</Label>
                        <Input 
                          id="dish-name"
                          placeholder="Ej: Ensalada César con Pollo"
                          value={newMenuItem.name}
                          onChange={(e) => handleMenuItemChange('name', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dish-description">Descripción</Label>
                        <Textarea 
                          id="dish-description"
                          placeholder="Describe los ingredientes y preparación..."
                          value={newMenuItem.description}
                          onChange={(e) => handleMenuItemChange('description', e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dish-price">Precio ($)</Label>
                        <Input 
                          id="dish-price"
                          type="number" 
                          placeholder="0.00"
                          value={newMenuItem.price || ''}
                          onChange={(e) => handleMenuItemChange('price', parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dish-image">URL de Imagen</Label>
                        <Input 
                          id="dish-image"
                          placeholder="https://example.com/imagen.jpg"
                          value={newMenuItem.image}
                          onChange={(e) => handleMenuItemChange('image', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dish-tags">Etiquetas</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="dish-tags"
                            placeholder="Ej: vegetariano"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={handleAddTag}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {newMenuItem.tags && newMenuItem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newMenuItem.tags.map((tag, index) => (
                              <div 
                                key={index}
                                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
                              >
                                {tag}
                                <button 
                                  type="button"
                                  className="ml-2 text-primary/70 hover:text-primary"
                                  onClick={() => handleRemoveTag(tag)}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch 
                          id="available"
                          checked={newMenuItem.available}
                          onCheckedChange={(checked) => handleMenuItemChange('available', checked)}
                        />
                        <Label htmlFor="available">Disponible inmediatamente</Label>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={handleAddMenuItem}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar al Menú
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-0">
              <div className="grid md:grid-cols-[3fr_1fr] gap-8">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pedidos de Hoy</CardTitle>
                      <CardDescription>
                        Resumen de pedidos para {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockCompanies.map((company, index) => (
                          <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{company.name}</CardTitle>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pedidos:</span>
                                    <span className="font-medium">{Math.floor(Math.random() * 10) + 5}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total:</span>
                                    <span className="font-medium">${(Math.random() * 200 + 100).toFixed(2)}</span>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button variant="outline" size="sm" className="w-full">
                                  Ver Detalle
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Estado de Entregas</CardTitle>
                      <CardDescription>
                        Seguimiento de pedidos en tiempo real
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left pb-3 font-medium text-muted-foreground">Empresa</th>
                            <th className="text-left pb-3 font-medium text-muted-foreground">Hora</th>
                            <th className="text-left pb-3 font-medium text-muted-foreground">Platos</th>
                            <th className="text-left pb-3 font-medium text-muted-foreground">Estado</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockCompanies.map((company, index) => {
                            const statuses = ['Preparando', 'En camino', 'Entregado', 'Pendiente'];
                            const statusColors = {
                              'Preparando': 'bg-amber-100 text-amber-700',
                              'En camino': 'bg-blue-100 text-blue-700',
                              'Entregado': 'bg-green-100 text-green-700',
                              'Pendiente': 'bg-gray-100 text-gray-700'
                            };
                            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                            
                            return (
                              <tr key={company.id} className="border-b border-border">
                                <td className="py-3">{company.name}</td>
                                <td className="py-3">
                                  {`${12 + Math.floor(Math.random() * 5)}:${(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}`}
                                </td>
                                <td className="py-3">{Math.floor(Math.random() * 15) + 5}</td>
                                <td className="py-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[randomStatus as keyof typeof statusColors]}`}>
                                    {randomStatus}
                                  </span>
                                </td>
                                <td className="text-right py-3">
                                  <Button variant="ghost" size="sm">
                                    Detalles
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen del Día</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Pedidos</p>
                        <p className="text-2xl font-bold">{mockDashboardStats.dailyOrders}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Empresas Atendidas</p>
                        <p className="text-2xl font-bold">{mockCompanies.length}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Ingresos</p>
                        <p className="text-2xl font-bold">${mockDashboardStats.dailyRevenue.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Platos Más Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {menuItems.slice(0, 5).map((item, index) => (
                          <div 
                            key={item.id}
                            className="flex items-center space-x-3"
                          >
                            <div className="rounded-md overflow-hidden w-12 h-12 flex-shrink-0">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {Math.floor(Math.random() * 20) + 5} pedidos
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Próximas Entregas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[...Array(3)].map((_, index) => {
                          const company = mockCompanies[index % mockCompanies.length];
                          return (
                            <div 
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{company.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {`${12 + Math.floor(Math.random() * 5)}:${(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}`} - {Math.floor(Math.random() * 10) + 3} platos
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Detalles
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="billing" className="mt-0">
              <div className="grid md:grid-cols-[2fr_1fr] gap-8">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Facturación por Empresa</CardTitle>
                      <CardDescription>
                        Resumen mensual de facturación
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left pb-3 font-medium text-muted-foreground">Empresa</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Pedidos</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Monto</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Estado</th>
                            <th className="text-right pb-3 font-medium text-muted-foreground">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockCompanies.map((company, index) => {
                            const pedidos = Math.floor(Math.random() * 50) + 20;
                            const monto = pedidos * 13.5;
                            const statuses = ['Pagada', 'Pendiente', 'Enviada'];
                            const statusColors = {
                              'Pagada': 'bg-green-100 text-green-700',
                              'Pendiente': 'bg-amber-100 text-amber-700',
                              'Enviada': 'bg-blue-100 text-blue-700'
                            };
                            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                            
                            return (
                              <tr key={company.id} className="border-b border-border">
                                <td className="py-3 flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                                    {company.name.charAt(0)}
                                  </div>
                                  {company.name}
                                </td>
                                <td className="text-right py-3">{pedidos}</td>
                                <td className="text-right py-3 font-medium">
                                  ${monto.toFixed(2)}
                                </td>
                                <td className="text-right py-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[randomStatus as keyof typeof statusColors]}`}>
                                    {randomStatus}
                                  </span>
                                </td>
                                <td className="text-right py-3">
                                  <Button variant="ghost" size="sm">
                                    Detalles
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="pt-4 font-medium">Total</td>
                            <td className="text-right pt-4 font-medium">
                              {mockCompanies.reduce((sum) => sum + Math.floor(Math.random() * 50) + 20, 0)}
                            </td>
                            <td className="text-right pt-4 font-medium">
                              ${(mockCompanies.reduce((sum) => sum + (Math.floor(Math.random() * 50) + 20) * 13.5, 0)).toFixed(2)}
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </CardContent>
                  </Card>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ingresos Mensuales</CardTitle>
                        <CardDescription>
                          Comparativa de los últimos 6 meses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={salesData}
                              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="ventas" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Resumen Financiero</CardTitle>
                        <CardDescription>Período actual</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Ingresos (último mes)
                          </p>
                          <p className="text-3xl font-bold">${mockDashboardStats.monthlyRevenue.toFixed(2)}</p>
                          <p className="text-sm text-green-600 mt-1">+12% respecto al mes anterior</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Ticket promedio
                          </p>
                          <p className="text-3xl font-bold">$13.50</p>
                          <p className="text-sm text-muted-foreground mt-1">Por almuerzo</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Facturación por empresa
                          </p>
                          <p className="text-3xl font-bold">
                            ${(mockDashboardStats.monthlyRevenue / mockCompanies.length).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">En promedio</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Facturación Rápida</CardTitle>
                      <CardDescription>Generar factura para empresa</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <select 
                          id="company"
                          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Seleccionar empresa</option>
                          {mockCompanies.map(company => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="period">Período</Label>
                        <select 
                          id="period"
                          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="current">Mes Actual</option>
                          <option value="previous">Mes Anterior</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="invoice-number">Número de Factura</Label>
                        <Input 
                          id="invoice-number"
                          placeholder="Ej: F-2023-0001"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notas Adicionales</Label>
                        <Textarea 
                          id="notes"
                          placeholder="Información adicional para la factura..."
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <Button className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Generar Factura
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Facturas Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockCompanies.slice(0, 4).map((company, index) => (
                          <div 
                            key={company.id}
                            className="flex items-center space-x-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(2023, 10 - index, 15).toLocaleDateString('es-ES', { month: 'long' })} - ${(Math.random() * 1000 + 500).toFixed(2)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Pagada
                            </Button>
                          </div>
                        ))}
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

export default ProviderDashboard;
