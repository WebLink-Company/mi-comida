
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
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { mockLunchOptions, mockOrders } from '@/lib/mockData';

interface Category {
  id: string;
  name: string;
  description?: string;
  provider_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ProviderDashboardProps {
  activeTab?: string;
}

const ProviderDashboard = ({ activeTab = 'dashboard' }: ProviderDashboardProps) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  // Dashboard state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [activeCustomerCount, setActiveCustomerCount] = useState(0);
  
  // Menu state
  const [menuItems, setMenuItems] = useState<LunchOption[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [menuType, setMenuType] = useState<'predefined' | 'component'>('predefined');
  const [isExtrasItem, setIsExtrasItem] = useState(false);
  
  const [newMenuItem, setNewMenuItem] = useState<Partial<LunchOption>>({
    name: '',
    description: '',
    price: 0,
    image: '/placeholder.svg',
    tags: [],
    available: true,
    menu_type: 'predefined',
  });
  
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    sort_order: 0
  });
  
  // Orders state
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: '',
    subsidy_percentage: 0,
    fixed_subsidy_amount: 0,
  });
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'employee',
    company_id: '',
  });
  
  // Tag input state 
  const [tagInput, setTagInput] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [currentUser]);
  
  const loadData = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Load menu categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('provider_id', currentUser.id)
        .order('sort_order');
        
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Load menu items
      const { data: menuData, error: menuError } = await supabase
        .from('lunch_options')
        .select('*')
        .eq('provider_id', currentUser.id);
        
      if (menuError) throw menuError;
      setMenuItems(menuData || []);
      
      // Calculate dashboard metrics
      setDailyRevenue(menuData ? menuData.reduce((acc, item) => acc + Number(item.price), 0) : 0);
      
      // Load pending orders (mock for now)
      const pendingOrdersWithCorrectStatus = mockOrders
        .filter(order => order.status === 'pending')
        .map(order => ({
          ...order,
          status: 'pending' as 'pending' | 'approved' | 'rejected' | 'delivered'
        }));
      
      setPendingOrders(pendingOrdersWithCorrectStatus);
      setPendingOrderCount(pendingOrdersWithCorrectStatus.length);
      setActiveCustomerCount(12); // Mock data
      
      // Load companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('provider_id', currentUser.id);
        
      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);
      
      // Load users for this provider's companies
      if (companiesData && companiesData.length > 0) {
        const companyIds = companiesData.map(company => company.id);
        
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .in('company_id', companyIds);
          
        if (usersError) throw usersError;
        setUsers(usersData || []);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos.',
        variant: 'destructive',
      });
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Menu Functions
  const handleAddMenuItem = () => {
    setIsAddingMenuItem(true);
    setNewMenuItem({
      name: '',
      description: '',
      price: 0,
      image: '/placeholder.svg',
      tags: [],
      available: true,
      menu_type: 'predefined',
      is_extra: false,
      category_id: selectedCategory || null,
    });
  };

  const handleMenuItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMenuItem({
      ...newMenuItem,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  const handleMenuTypeChange = (value: string) => {
    setMenuType(value as 'predefined' | 'component');
    setNewMenuItem({
      ...newMenuItem,
      menu_type: value,
    });
  };

  const handleExtrasToggle = (checked: boolean) => {
    setIsExtrasItem(checked);
    setNewMenuItem({
      ...newMenuItem,
      is_extra: checked,
    });
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setNewMenuItem({
      ...newMenuItem,
      category_id: value,
    });
  };

  const handleAddTag = () => {
    if (tagInput && !newMenuItem.tags?.includes(tagInput)) {
      setNewMenuItem({
        ...newMenuItem,
        tags: [...(newMenuItem.tags || []), tagInput],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewMenuItem({
      ...newMenuItem,
      tags: newMenuItem.tags?.filter(t => t !== tag) || [],
    });
  };

  const handleAddCategory = () => {
    setIsAddingCategory(true);
    setNewCategory({
      name: '',
      description: '',
      sort_order: categories.length,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: name === 'sort_order' ? parseInt(value) : value,
    });
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: 'Error',
        description: 'El nombre de la categoría es requerido',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({
          name: newCategory.name,
          description: newCategory.description,
          sort_order: newCategory.sort_order,
          provider_id: currentUser?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCategories([...categories, data]);
      setIsAddingCategory(false);
      
      toast({
        title: 'Categoría agregada',
        description: `${newCategory.name} ha sido agregada correctamente.`,
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la categoría.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.description || !newMenuItem.price) {
      toast({
        title: 'Error',
        description: 'El nombre, descripción y precio son requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lunch_options')
        .insert({
          name: newMenuItem.name,
          description: newMenuItem.description,
          price: newMenuItem.price,
          image: newMenuItem.image,
          available: newMenuItem.available,
          tags: newMenuItem.tags,
          is_extra: newMenuItem.is_extra,
          menu_type: newMenuItem.menu_type,
          category_id: newMenuItem.category_id,
          provider_id: currentUser?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setMenuItems([...menuItems, data]);
      setIsAddingMenuItem(false);
      
      toast({
        title: 'Menú agregado',
        description: `${newMenuItem.name} ha sido agregado correctamente.`,
      });
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el menú.',
        variant: 'destructive',
      });
    }
  };

  // Orders Functions
  const handleApproveOrder = (orderId: string) => {
    const updatedOrders = pendingOrders.map(order =>
      order.id === orderId ? { ...order, status: 'approved' as const } : order
    );
    setPendingOrders(updatedOrders);
    
    toast({
      title: 'Pedido aprobado',
      description: `El pedido ${orderId} ha sido aprobado.`,
    });
  };

  const handleRejectOrder = (orderId: string) => {
    const updatedOrders = pendingOrders.map(order =>
      order.id === orderId ? { ...order, status: 'rejected' as const } : order
    );
    setPendingOrders(updatedOrders);
    
    toast({
      title: 'Pedido rechazado',
      description: `El pedido ${orderId} ha sido rechazado.`,
      variant: 'destructive',
    });
  };

  // Companies Functions
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

  const handleSaveCompany = async () => {
    if (!newCompany.name) {
      toast({
        title: 'Error',
        description: 'El nombre de la empresa es requerido',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: newCompany.name,
          subsidy_percentage: newCompany.subsidy_percentage || 0,
          fixed_subsidy_amount: newCompany.fixed_subsidy_amount || 0,
          provider_id: currentUser?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCompanies([...companies, data]);
      setIsAddingCompany(false);
      
      toast({
        title: 'Empresa agregada',
        description: `${newCompany.name} ha sido agregada correctamente.`,
      });
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la empresa.',
        variant: 'destructive',
      });
    }
  };

  // Users Functions
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
      role: value as UserRole,
    });
  };

  const handleCompanySelect = (value: string) => {
    setNewUser({
      ...newUser,
      company_id: value,
    });
  };

  const handleSaveUser = async () => {
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

    // In a real implementation, you would:
    // 1. Create an auth user with Supabase Auth
    // 2. Then create or update the profile record
    try {
      // Check if the role is compatible with the database enum
      // Convert 'company' role to 'employee' for database storage if needed
      // This is a temporary solution until the database enum is updated
      const dbRole = newUser.role === 'company' ? 'employee' : newUser.role;
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          role: dbRole,
          company_id: newUser.company_id,
          provider_id: currentUser?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setUsers([...users, data]);
      setIsAddingUser(false);
      
      toast({
        title: 'Usuario agregado',
        description: `${newUser.first_name} ${newUser.last_name} ha sido agregado correctamente.`,
      });
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el usuario.',
        variant: 'destructive',
      });
    }
  };

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
                    <div className="text-2xl font-bold">{pendingOrderCount}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Clientes Activos</CardTitle>
                    <CardDescription>Número de clientes que han ordenado hoy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeCustomerCount}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="menu">
              <div className="space-y-6">
                {/* Categories Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Categorías del Menú</CardTitle>
                      <CardDescription>
                        Gestiona las categorías para organizar tu menú
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddCategory}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Agregar Categoría
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isAddingCategory ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg mb-6"
                      >
                        <h3 className="font-medium mb-4">Nueva Categoría</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="name">Nombre de la Categoría</Label>
                              <Input 
                                id="name" 
                                name="name"
                                value={newCategory.name || ''} 
                                onChange={handleCategoryChange} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea 
                              id="description" 
                              name="description"
                              value={newCategory.description || ''} 
                              onChange={handleCategoryChange} 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="sort_order">Orden</Label>
                            <Input 
                              id="sort_order" 
                              name="sort_order"
                              type="number" 
                              value={newCategory.sort_order || 0} 
                              onChange={handleCategoryChange} 
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancelar</Button>
                            <Button onClick={handleSaveCategory}>Guardar Categoría</Button>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Orden</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell>{category.description || '-'}</TableCell>
                              <TableCell>{category.sort_order}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Subir
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Bajar
                                  </Button>
                                  <Button variant="ghost" size="sm">Editar</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                              No hay categorías registradas. ¡Agrega tu primera categoría ahora!
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Menu Items Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Menú del Día</CardTitle>
                      <CardDescription>
                        Gestiona los platos disponibles para hoy
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddMenuItem}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Agregar Menú
                    </Button>
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="category">Categoría</Label>
                              <Select 
                                onValueChange={handleCategorySelect}
                                defaultValue={selectedCategory}
                              >
                                <SelectTrigger id="category">
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="menu-type">Tipo de Menú</Label>
                              <Select 
                                onValueChange={handleMenuTypeChange}
                                defaultValue={menuType}
                              >
                                <SelectTrigger id="menu-type">
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="predefined">Predefinido</SelectItem>
                                  <SelectItem value="component">Componente (À la carte)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="is-extra" 
                              checked={isExtrasItem}
                              onCheckedChange={handleExtrasToggle}
                            />
                            <Label htmlFor="is-extra">Es un extra / adicional</Label>
                          </div>
                          
                          <div>
                            <Label htmlFor="tag-input">Etiquetas</Label>
                            <div className="flex space-x-2">
                              <Input
                                id="tag-input"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Ej: Vegano, Sin Gluten, etc."
                              />
                              <Button type="button" onClick={handleAddTag} variant="outline">
                                <Tag className="h-4 w-4 mr-2" />
                                Agregar
                              </Button>
                            </div>
                            
                            {newMenuItem.tags && newMenuItem.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {newMenuItem.tags.map(tag => (
                                  <div key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center">
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTag(tag)}
                                      className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
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
                          <TableHead>Categoría</TableHead>
                          <TableHead>Tipo</TableHead>
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
                              <TableCell>
                                {categories.find(c => c.id === item.category_id)?.name || '-'}
                              </TableCell>
                              <TableCell>
                                {item.is_extra ? 'Extra' : (item.menu_type === 'predefined' ? 'Predefinido' : 'Componente')}
                              </TableCell>
                              <TableCell>${Number(item.price).toLocaleString()}</TableCell>
                              <TableCell>{item.available ? 'Disponible' : 'No Disponible'}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">Editar</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                              No hay menús registrados. ¡Agrega tu primer menú ahora!
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
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
                            <TableCell>
                              {users.filter(u => u.company_id === company.id).length}
                            </TableCell>
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
