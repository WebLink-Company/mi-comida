
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { LunchOption, Company } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Star, Clock, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DishCard from '@/components/employee/DishCard';
import MobileNavbar from '@/components/employee/MobileNavbar';

const EmployeeDashboardNew: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lunchOptions, setLunchOptions] = useState<LunchOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<LunchOption[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user's company
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Fetch company details
        if (profileData?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single();
            
          if (companyError) throw companyError;
          setCompany(companyData);
          
          // Fetch lunch options for this company (via provider)
          if (companyData.provider_id) {
            const { data: lunchData, error: lunchError } = await supabase
              .from('lunch_options')
              .select('*')
              .eq('provider_id', companyData.provider_id)
              .eq('available', true);
              
            if (lunchError) throw lunchError;
            setLunchOptions(lunchData || []);
            setFilteredOptions(lunchData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.',
          variant: 'destructive',
        });
        
        // Load mock data in case of error
        import('@/lib/mockData').then(({ mockLunchOptions, mockCompanies }) => {
          setLunchOptions(mockLunchOptions);
          setFilteredOptions(mockLunchOptions);
          setCompany(mockCompanies[0]);
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOptions(lunchOptions);
      return;
    }
    
    const filtered = lunchOptions.filter(option => 
      option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredOptions(filtered);
  }, [searchQuery, lunchOptions]);
  
  // Handle filter selection
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredOptions(lunchOptions);
      return;
    }
    
    let filtered;
    switch (filter) {
      case 'popular':
        // For demo, just show some options - in real app would use order frequency
        filtered = [...lunchOptions].sort(() => Math.random() - 0.5).slice(0, 3);
        break;
      case 'special':
        // Filter by tags containing 'special'
        filtered = lunchOptions.filter(option => 
          option.tags?.some(tag => tag.toLowerCase().includes('special'))
        );
        if (filtered.length === 0) {
          // If no specials, show a random selection
          filtered = [...lunchOptions].sort(() => Math.random() - 0.5).slice(0, 2);
        }
        break;
      case 'recommended':
        // For demo, just show some options - in real app would use recommendations
        filtered = [...lunchOptions].sort(() => Math.random() - 0.5).slice(0, 4);
        break;
      default:
        filtered = lunchOptions;
    }
    
    setFilteredOptions(filtered);
  };
  
  // Handle dish selection
  const handleSelectDish = (dish: LunchOption) => {
    // Create the order
    createOrder(dish)
      .then(orderId => {
        if (orderId) {
          // Navigate to order details page
          navigate(`/employee/order/${orderId}`);
        }
      })
      .catch(error => {
        console.error('Error creating order:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear el pedido. Por favor, intenta de nuevo.',
          variant: 'destructive',
        });
      });
  };
  
  // Create order in database
  const createOrder = async (dish: LunchOption): Promise<string | null> => {
    if (!user || !company) return null;
    
    try {
      const newOrder = {
        user_id: user.id,
        lunch_option_id: dish.id,
        date: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        company_id: company.id
      };
      
      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: '¡Pedido realizado!',
        description: 'Tu pedido ha sido enviado y está pendiente de aprobación.',
      });
      
      return data.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
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

  // Get subsidy text
  const getSubsidyText = () => {
    if (!company) return '';
    
    if (company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0) {
      return `Tu empresa cubre $${company.fixed_subsidy_amount.toFixed(2)} de tu comida.`;
    }
    
    const percentage = company.subsidy_percentage || company.subsidyPercentage || 0;
    return `Tu empresa cubre el ${percentage}% de tu comida.`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 pb-20">
      {/* Bottom Navigation */}
      <MobileNavbar />
      
      {/* Main Content */}
      <div className="container px-4 pt-6 pb-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {user?.first_name || 'Usuario'} 👋
          </h1>
          {company && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p>{company.name}</p>
              <p className="mt-1 text-primary font-medium">{getSubsidyText()}</p>
            </div>
          )}
        </motion.div>
        
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="¿Qué deseas comer hoy?"
              className="pl-10 w-full bg-white/50 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/30 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
        
        {/* Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          <Badge
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 cursor-pointer ${activeFilter === 'all' ? 'bg-primary' : 'bg-secondary hover:bg-secondary/80'}`}
          >
            Todos
          </Badge>
          <Badge
            onClick={() => handleFilterChange('popular')}
            className={`px-3 py-1 cursor-pointer flex items-center gap-1 ${activeFilter === 'popular' ? 'bg-primary' : 'bg-secondary hover:bg-secondary/80'}`}
          >
            <Star className="h-3 w-3" /> Más pedidos
          </Badge>
          <Badge
            onClick={() => handleFilterChange('special')}
            className={`px-3 py-1 cursor-pointer flex items-center gap-1 ${activeFilter === 'special' ? 'bg-primary' : 'bg-secondary hover:bg-secondary/80'}`}
          >
            <Award className="h-3 w-3" /> Especial del chef
          </Badge>
          <Badge
            onClick={() => handleFilterChange('recommended')}
            className={`px-3 py-1 cursor-pointer flex items-center gap-1 ${activeFilter === 'recommended' ? 'bg-primary' : 'bg-secondary hover:bg-secondary/80'}`}
          >
            <ChevronRight className="h-3 w-3" /> Recomendados
          </Badge>
        </motion.div>
        
        {/* Dishes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div 
                key={i} 
                className="bg-white/50 animate-pulse rounded-lg h-48"
              />
            ))}
          </div>
        ) : filteredOptions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {filteredOptions.map((option) => (
              <DishCard
                key={option.id}
                dish={option}
                subsidizedPrice={calculateSubsidizedPrice(option.price)}
                onSelect={() => handleSelectDish(option)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No se encontraron opciones de almuerzo.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Mostrar todas las opciones
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboardNew;
