import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LunchOption, Company } from '@/lib/types';

export const useEmployeeDashboard = (userId: string | undefined) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lunchOptions, setLunchOptions] = useState<LunchOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<LunchOption[]>([]);
  const [displayedOptions, setDisplayedOptions] = useState<LunchOption[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('daily');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', userId)
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
            
            const options = lunchData || [];
            setLunchOptions(options);
            setFilteredOptions(options);
            setDisplayedOptions(options.slice(0, 3));
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
  }, [userId, toast]);

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

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'daily') {
      setFilteredOptions(lunchOptions.slice(0, Math.min(6, lunchOptions.length)));
    } else {
      setFilteredOptions(lunchOptions);
    }
    setDisplayedOptions(filteredOptions.slice(0, showMore ? filteredOptions.length : 3));
  };

  const toggleShowMore = () => {
    setShowMore(prev => !prev);
    if (!showMore) {
      setDisplayedOptions(filteredOptions);
    } else {
      setDisplayedOptions(filteredOptions.slice(0, 3));
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

  const handleSelectDish = async (dish: LunchOption) => {
    if (!userId || !company) return;
    
    try {
      const newOrder = {
        user_id: userId,
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
      
      navigate(`/employee/order/${data.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el pedido. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return {
    isLoading,
    company,
    searchQuery,
    setSearchQuery,
    activeFilter,
    handleFilterChange,
    activeCategory,
    handleCategoryChange,
    filteredOptions,
    displayedOptions,
    showMore,
    toggleShowMore,
    calculateSubsidizedPrice,
    handleSelectDish
  };
};
