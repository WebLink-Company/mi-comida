import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { LunchOption, Company } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Award, TrendingUp, Clock, ChevronDown } from 'lucide-react';
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
  const [displayedOptions, setDisplayedOptions] = useState<LunchOption[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showMore, setShowMore] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
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
          
          if (companyData.provider_id) {
            const { data: lunchData, error: lunchError } = await supabase
              .from('lunch_options')
              .select('*')
              .eq('provider_id', companyData.provider_id)
              .eq('available', true);
              
            if (lunchError) throw lunchError;
            setLunchOptions(lunchData || []);
            setFilteredOptions(lunchData || []);
            setDisplayedOptions((lunchData || []).slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.',
          variant: 'destructive',
        });
        
        import('@/lib/mockData').then(({ mockLunchOptions, mockCompanies }) => {
          setLunchOptions(mockLunchOptions);
          setFilteredOptions(mockLunchOptions);
          setDisplayedOptions(mockLunchOptions.slice(0, 3));
          setCompany(mockCompanies[0]);
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOptions(lunchOptions);
      setDisplayedOptions(lunchOptions.slice(0, showMore ? lunchOptions.length : 3));
      return;
    }
    
    const filtered = lunchOptions.filter(option => 
      option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredOptions(filtered);
    setDisplayedOptions(filtered.slice(0, showMore ? filtered.length : 3));
  }, [searchQuery, lunchOptions, showMore]);
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setShowMore(false);
    
    if (filter === 'all') {
      setFilteredOptions(lunchOptions);
      setDisplayedOptions(lunchOptions.slice(0, 3));
      return;
    }
    
    let filtered;
    switch (filter) {
      case 'popular':
        filtered = [...lunchOptions].sort(() => Math.random() - 0.5).slice(0, 3);
        break;
      case 'special':
        filtered = lunchOptions.filter(option => 
          option.tags?.some(tag => tag.toLowerCase().includes('special'))
        );
        if (filtered.length === 0) {
          filtered = [...lunchOptions].sort(() => Math.random() - 0.5).slice(0, 2);
        }
        break;
      case 'recommended':
        filtered = [...lunchOptions].sort(() => Math.random() - 0.5).slice(0, 4);
        break;
      default:
        filtered = lunchOptions;
    }
    
    setFilteredOptions(filtered);
    setDisplayedOptions(filtered.slice(0, 3));
  };

  const toggleShowMore = () => {
    setShowMore(prev => !prev);
    if (!showMore) {
      setDisplayedOptions(filteredOptions);
    } else {
      setDisplayedOptions(filteredOptions.slice(0, 3));
    }
  };
  
  const handleSelectDish = (dish: LunchOption) => {
    createOrder(dish)
      .then(orderId => {
        if (orderId) {
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
  
  const calculateSubsidizedPrice = (price: number) => {
    if (!company) return price;
    
    if (company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0) {
      return Math.max(0, price - company.fixed_subsidy_amount);
    }
    
    const subsidyPercentage = company.subsidy_percentage || company.subsidyPercentage || 0;
    return price * (1 - (subsidyPercentage / 100));
  };

  const getSubsidyText = () => {
    if (!company) return '';
    
    if (company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0) {
      return `Tu empresa cubre $${company.fixed_subsidy_amount.toFixed(2)} de tu comida.`;
    }
    
    const percentage = company.subsidy_percentage || company.subsidyPercentage || 0;
    return `Tu empresa cubre el ${percentage}% de tu comida.`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 relative overflow-hidden pb-20">
      <motion.div 
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        animate={{
          background: [
            'linear-gradient(to right, rgba(59,130,246,0.5), rgba(37,99,235,0.5))',
            'linear-gradient(to right, rgba(37,99,235,0.5), rgba(29,78,216,0.5))',
            'linear-gradient(to right, rgba(29,78,216,0.5), rgba(59,130,246,0.5))'
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <MobileNavbar />
      
      <div className="container px-4 pt-16 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <h1 className="text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-blue-100">
            {`Hola ${user?.first_name || 'Usuario'}.`}
          </h1>
          <p className="text-sm text-white/80 mb-1">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <p className="text-sm text-white/80 mb-5">
            {format(new Date(), 'h:mm a')}
          </p>
          <p className="text-white text-xl">
            {getGreeting()} 👋
          </p>
          {company && (
            <div className="mt-2 text-sm text-white/80">
              <p>{company.name}</p>
              <p className="mt-1 text-white font-medium">{getSubsidyText()}</p>
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 max-w-md mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <Input
              type="text"
              placeholder="¿Qué deseas comer hoy?"
              className="pl-10 w-full bg-white/20 backdrop-blur-sm border-white/30 focus-visible:ring-white/30 text-white placeholder:text-white/60 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8 flex justify-center gap-1 overflow-x-auto pb-2 scrollbar-hide"
        >
          <Badge
            onClick={() => handleFilterChange('all')}
            className={`cursor-pointer flex items-center gap-1 px-3 py-1 text-xs ${
              activeFilter === 'all' 
                ? 'bg-white/40 hover:bg-white/50' 
                : 'bg-white/20 hover:bg-white/30'
            } border-white/30 text-white`}
          >
            <Clock className="h-3.5 w-3.5" /> Todos
          </Badge>
          <Badge
            onClick={() => handleFilterChange('popular')}
            className={`cursor-pointer flex items-center gap-1 px-3 py-1 text-xs ${
              activeFilter === 'popular' 
                ? 'bg-white/40 hover:bg-white/50' 
                : 'bg-white/20 hover:bg-white/30'
            } border-white/30 text-white`}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Más pedidos
          </Badge>
          <Badge
            onClick={() => handleFilterChange('special')}
            className={`cursor-pointer flex items-center gap-1 px-3 py-1 text-xs ${
              activeFilter === 'special' 
                ? 'bg-white/40 hover:bg-white/50' 
                : 'bg-white/20 hover:bg-white/30'
            } border-white/30 text-white`}
          >
            <Award className="h-3.5 w-3.5" /> Especial
          </Badge>
          <Badge
            onClick={() => handleFilterChange('recommended')}
            className={`cursor-pointer flex items-center gap-1 px-3 py-1 text-xs ${
              activeFilter === 'recommended' 
                ? 'bg-white/40 hover:bg-white/50' 
                : 'bg-white/20 hover:bg-white/30'
            } border-white/30 text-white`}
          >
            <Star className="h-3.5 w-3.5" /> Recomendados
          </Badge>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((_, i) => (
              <div 
                key={i} 
                className="bg-white/20 animate-pulse rounded-lg h-32"
              />
            ))}
          </div>
        ) : displayedOptions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            {displayedOptions.map((option) => (
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
            <p className="text-white/80">No se encontraron opciones de almuerzo.</p>
            <Button 
              variant="outline" 
              className="mt-4 bg-white/20 hover:bg-white/30 border-white/30 text-white"
              onClick={() => setSearchQuery('')}
            >
              Mostrar todas las opciones
            </Button>
          </motion.div>
        )}

        {filteredOptions.length > 3 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center mt-6"
          >
            <span className="text-xs text-white/80 mb-1">Ver más</span>
            <motion.button
              onClick={toggleShowMore}
              className="flex items-center justify-center cursor-pointer"
              initial={{ y: 0 }}
              animate={{ y: [0, 3, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "loop", 
                ease: "easeInOut" 
              }}
            >
              <ChevronDown className="h-5 w-5 text-blue-400" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

function format(date: Date, formatStr: string): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const days = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
  ];
  
  if (formatStr === 'EEEE, MMMM d') {
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  }
  
  if (formatStr === 'h:mm a') {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  
  return date.toLocaleDateString();
}

export default EmployeeDashboardNew;
