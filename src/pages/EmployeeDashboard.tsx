import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format, isSameDay, addDays } from 'date-fns';
import NavigationBar from '@/components/NavigationBar';
import LunchCard from '@/components/LunchCard';
import OrderSummary from '@/components/OrderSummary';
import { 
  mockLunchOptions, 
  mockOrders, 
  getCurrentUser, 
  getOrdersByUser, 
  getLunchOptionById, 
  getCompanyById
} from '@/lib/mockData';
import { Order, LunchOption } from '@/lib/types';
import { Calendar as CalendarIcon, ChevronRight, ShoppingBag, Clock, CheckCircle } from 'lucide-react';

interface EmployeeDashboardProps {
  activeTab?: 'menu' | 'orders';
}

const EmployeeDashboard = ({ activeTab = 'menu' }: EmployeeDashboardProps) => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLunchId, setSelectedLunchId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  const currentUser = getCurrentUser();
  const userCompany = getCompanyById(currentUser.companyId);
  const subsidyPercentage = userCompany?.subsidyPercentage || 0;

  const availableLunchOptions = mockLunchOptions.filter(option => option.available);

  useEffect(() => {
    const userOrders = getOrdersByUser(currentUser.id);
    setOrders(userOrders);
    
    const existingOrder = userOrders.find(order => 
      isSameDay(new Date(order.date), selectedDate)
    );
    
    if (existingOrder) {
      setSelectedLunchId(existingOrder.lunchOptionId);
    } else {
      setSelectedLunchId(null);
    }

    const timer = setTimeout(() => {
      setLoadingAnimation(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentUser.id, selectedDate]);

  const handleLunchSelect = (lunchId: string) => {
    setSelectedLunchId(lunchId);
  };

  const handleOrderSubmit = () => {
    if (!selectedLunchId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un almuerzo primero.",
        variant: "destructive"
      });
      return;
    }

    const existingOrderIndex = orders.findIndex(order => 
      isSameDay(new Date(order.date), selectedDate)
    );

    const newOrder: Order = {
      id: existingOrderIndex >= 0 ? orders[existingOrderIndex].id : `new-${Date.now()}`,
      userId: currentUser.id,
      lunchOptionId: selectedLunchId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (existingOrderIndex >= 0) {
      const updatedOrders = [...orders];
      updatedOrders[existingOrderIndex] = newOrder;
      setOrders(updatedOrders);
      
      toast({
        title: "Pedido actualizado",
        description: `Tu pedido para el ${format(selectedDate, 'EEEE d MMMM', { locale: es })} ha sido actualizado.`,
      });
    } else {
      setOrders([...orders, newOrder]);
      
      toast({
        title: "Pedido realizado",
        description: `Tu pedido para el ${format(selectedDate, 'EEEE d MMMM', { locale: es })} ha sido enviado.`,
      });
    }
  };

  const getOrdersForTab = () => {
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const approvedOrders = orders.filter(order => order.status === 'approved');
    const completedOrders = orders.filter(order => 
      order.status === 'delivered' || order.status === 'rejected'
    );

    return { pendingOrders, approvedOrders, completedOrders };
  };

  const { pendingOrders, approvedOrders, completedOrders } = getOrdersForTab();

  const renderOrderGroup = (orderGroup: Order[], title: string, icon: JSX.Element, emptyMessage: string) => {
    if (orderGroup.length === 0) {
      return (
        <div className="p-6 text-center bg-muted/30 rounded-lg border border-border">
          <div className="flex justify-center mb-3 text-muted-foreground">
            {icon}
          </div>
          <h3 className="text-lg font-medium mb-1">{title}</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        {orderGroup.map(order => {
          const lunchOption = getLunchOptionById(order.lunchOptionId);
          if (!lunchOption) return null;
          
          return (
            <OrderSummary
              key={order.id}
              order={order}
              lunchOption={lunchOption}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar userRole="employee" userName={currentUser.name} />
      
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold mb-2"
            >
              Bienvenido, {currentUser.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Selecciona y administra tus almuerzos de manera sencilla.
            </motion.p>
          </div>
          
          <Tabs defaultValue={currentTab} onValueChange={(value) => setCurrentTab(value as 'menu' | 'orders')}>
            <TabsList className="mb-8">
              <TabsTrigger value="menu" className="text-base px-5 py-2">Menu del Día</TabsTrigger>
              <TabsTrigger value="orders" className="text-base px-5 py-2">Mis Pedidos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="mt-0">
              <div className="grid md:grid-cols-[300px_1fr] gap-8">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Selecciona una fecha
                      </CardTitle>
                      <CardDescription>
                        Elige el día para tu pedido
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        locale={es}
                        disabled={(date) => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          return date < yesterday || date > addDays(new Date(), 7);
                        }}
                        className="rounded-md border"
                      />
                      <p className="text-sm text-muted-foreground mt-4">
                        Puedes seleccionar hasta 7 días en el futuro.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Fecha seleccionada</p>
                          <p className="font-medium">
                            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Almuerzo seleccionado</p>
                          {selectedLunchId ? (
                            <p className="font-medium">
                              {getLunchOptionById(selectedLunchId)?.name || 'No seleccionado'}
                            </p>
                          ) : (
                            <p className="text-muted-foreground italic">No seleccionado</p>
                          )}
                        </div>
                        
                        {selectedLunchId && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Precio</p>
                            <div className="flex items-center">
                              <p className="font-bold">
                                ${(getLunchOptionById(selectedLunchId)?.price || 0 * (1 - subsidyPercentage / 100)).toFixed(2)}
                              </p>
                              {subsidyPercentage > 0 && (
                                <p className="text-xs text-green-600 ml-2">
                                  ({subsidyPercentage}% subsidiado)
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full mt-4" 
                          onClick={handleOrderSubmit}
                          disabled={!selectedLunchId}
                        >
                          {orders.find(order => isSameDay(new Date(order.date), selectedDate)) 
                            ? 'Actualizar Pedido' 
                            : 'Confirmar Pedido'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {loadingAnimation ? (
                        [...Array(6)].map((_, index) => (
                          <motion.div
                            key={`skeleton-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-muted rounded-xl h-[350px] animate-pulse"
                          />
                        ))
                      ) : (
                        availableLunchOptions.map((lunchOption, index) => (
                          <motion.div
                            key={lunchOption.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ 
                              delay: index * 0.05,
                              duration: 0.3
                            }}
                          >
                            <LunchCard
                              lunchOption={lunchOption}
                              isSelected={selectedLunchId === lunchOption.id}
                              onSelect={handleLunchSelect}
                              subsidyPercentage={subsidyPercentage}
                            />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="orders">
              <div className="grid md:grid-cols-[3fr_1fr] gap-8">
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {renderOrderGroup(
                      pendingOrders, 
                      'Pedidos Pendientes', 
                      <Clock className="w-5 h-5 text-amber-500" />, 
                      'No tienes pedidos pendientes.'
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {renderOrderGroup(
                      approvedOrders, 
                      'Pedidos Aprobados', 
                      <CheckCircle className="w-5 h-5 text-green-500" />, 
                      'No tienes pedidos aprobados.'
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {renderOrderGroup(
                      completedOrders, 
                      'Pedidos Completados', 
                      <ShoppingBag className="w-5 h-5 text-blue-500" />, 
                      'No tienes pedidos completados.'
                    )}
                  </motion.div>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Estadísticas</CardTitle>
                      <CardDescription>
                        Resumen de tus pedidos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Total de pedidos
                        </p>
                        <p className="text-2xl font-bold">{orders.length}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Almuerzos este mes
                        </p>
                        <p className="text-2xl font-bold">
                          {orders.filter(order => {
                            const orderDate = new Date(order.date);
                            const today = new Date();
                            return orderDate.getMonth() === today.getMonth() && 
                                  orderDate.getFullYear() === today.getFullYear();
                          }).length}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-border">
                        <Link to="/employee">
                          <Button variant="outline" className="w-full">
                            Hacer un Nuevo Pedido
                            <ChevronRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
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

export default EmployeeDashboard;
