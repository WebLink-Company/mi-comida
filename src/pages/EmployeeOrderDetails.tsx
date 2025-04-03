
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { LunchOption, Order, Company } from '@/lib/types';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderDetailCard from '@/components/employee/OrderDetailCard';
import OrderMetadataCard from '@/components/employee/OrderMetadataCard';

interface OrderWithDetails extends Order {
  lunch?: LunchOption;
}

const EmployeeOrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch order with lunch option details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            lunch:lunch_options(*)
          `)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();
          
        if (orderError) throw orderError;
        
        if (!orderData) {
          toast({
            title: 'Error',
            description: 'No se encontró el pedido solicitado.',
            variant: 'destructive',
          });
          navigate('/employee/orders');
          return;
        }
        
        // Ensure the status is one of the allowed values
        const typedOrder = {
          ...orderData,
          status: orderData.status as "pending" | "approved" | "rejected" | "delivered"
        } as OrderWithDetails;
        
        setOrder(typedOrder);
        
        // Fetch company details
        if (orderData.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', orderData.company_id)
            .single();
            
          if (companyError) throw companyError;
          setCompany(companyData);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los detalles del pedido.',
          variant: 'destructive',
        });
        
        // Use mock data in case of error
        import('@/lib/mockData').then(({ mockOrders, mockLunchOptions, mockCompanies }) => {
          const mockOrder = mockOrders.find(o => o.id === orderId);
          if (mockOrder) {
            const lunch = mockLunchOptions.find(option => option.id === mockOrder.lunch_option_id);
            setOrder({ 
              ...mockOrder, 
              lunch,
              status: mockOrder.status as "pending" | "approved" | "rejected" | "delivered"
            });
            setCompany(mockCompanies[0]);
          } else {
            navigate('/employee/orders');
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, user, toast, navigate]);
  
  // Cancel order
  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id)
        .eq('user_id', user?.id)
        .eq('status', 'pending'); // Only allow canceling pending orders
        
      if (error) throw error;
      
      toast({
        title: 'Pedido cancelado',
        description: 'Tu pedido ha sido cancelado exitosamente.',
      });
      
      navigate('/employee/orders');
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cancelar el pedido. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };
  
  // Calculate subsidized price
  const calculateSubsidizedPrice = (price: number) => {
    if (!company) return price;
    
    if (company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0) {
      return Math.max(0, price - company.fixed_subsidy_amount);
    }
    
    const subsidyPercentage = company.subsidy_percentage || company.subsidyPercentage || 0;
    return price * (1 - (subsidyPercentage / 100));
  };
  
  // Calculate company subsidy amount
  const calculateSubsidyAmount = (price: number) => {
    if (!company) return 0;
    
    if (company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0) {
      return Math.min(price, company.fixed_subsidy_amount);
    }
    
    const subsidyPercentage = company.subsidy_percentage || company.subsidyPercentage || 0;
    return price * (subsidyPercentage / 100);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 pt-6 pb-20 h-full flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-white/70">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }
  
  // Error state - no order found
  if (!order || !order.lunch) {
    return (
      <div className="container px-4 pt-6 pb-20 relative z-10">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0 h-8 w-8 text-white hover:bg-white/10"
            onClick={() => navigate('/employee/orders')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">Detalles del pedido</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <X className="h-12 w-12 text-white/70 mb-4" />
          <p className="text-lg font-medium text-white">Pedido no encontrado</p>
          <p className="text-sm text-white/70 mt-2 mb-4">
            El pedido que buscas no existe o no tienes acceso a él.
          </p>
          <Button onClick={() => navigate('/employee')} className="bg-white/20 hover:bg-white/30 text-white">Ir al menú</Button>
        </div>
      </div>
    );
  }
  
  const { lunch } = order;
  const subsidizedPrice = calculateSubsidizedPrice(lunch.price);
  const subsidyAmount = calculateSubsidyAmount(lunch.price);
  
  return (
    <div className="container px-4 pt-6 pb-20 relative z-10">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2 p-0 h-8 w-8 text-white hover:bg-white/10"
          onClick={() => navigate('/employee/orders')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-white">Detalles del pedido</h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Order Detail Card */}
        <OrderDetailCard
          order={order}
          lunch={lunch}
          subsidizedPrice={subsidizedPrice}
          subsidyAmount={subsidyAmount}
          onCancel={handleCancelOrder}
        />
        
        {/* Order Metadata */}
        <OrderMetadataCard order={order} company={company} />
        
        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center text-sm text-white/70"
        >
          <p>¿Necesitas ayuda con tu pedido?</p>
          <button className="text-white underline mt-1 hover:text-blue-300 transition-colors">
            Contactar a soporte
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmployeeOrderDetails;
