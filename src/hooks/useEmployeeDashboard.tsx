import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LunchOption, Company } from '@/lib/types';

export const useEmployeeDashboard = (userId: string | undefined) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dataFetchedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lunchOptions, setLunchOptions] = useState<LunchOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<LunchOption[]>([]);
  const [displayedOptions, setDisplayedOptions] = useState<LunchOption[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('daily');
  const [showMore, setShowMore] = useState(false);

  // Memoize the fetchData function to prevent unnecessary recreations
  const fetchData = useCallback(async () => {
    // Only fetch once per component lifecycle
    if (!userId || dataFetchedRef.current) return;
    
    try {
      setIsLoading(true);
      dataFetchedRef.current = true;
      
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
          
          // Ensure we always have arrays, even if data is undefined
          const safeData = lunchData || [];
          setLunchOptions(safeData);
          setFilteredOptions(safeData);
          setDisplayedOptions(safeData.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Only show error toast once
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.',
        variant: 'destructive',
        duration: 4000, // Add duration to automatically dismiss
      });
      
      // Load mock data as fallback
      import('@/lib/mockData').then(({ mockLunchOptions, mockCompanies }) => {
        setLunchOptions(mockLunchOptions);
        setFilteredOptions(mockLunchOptions);
        setDisplayedOptions(mockLunchOptions.slice(0, 3));
        setCompany(mockCompanies[0]);
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // Only run fetchData when userId changes
  useEffect(() => {
    fetchData();
    
    // Reset the dataFetchedRef when userId changes
    return () => {
      dataFetchedRef.current = false;
    };
  }, [fetchData]);

  // Handle search and filtering with stable references
  useEffect(() => {
    // Ensure we're working with arrays even if they're undefined
    const currentOptions = Array.isArray(lunchOptions) ? lunchOptions : [];
    
    if (searchQuery.trim() === '') {
      setFilteredOptions(currentOptions);
      setDisplayedOptions(currentOptions.slice(0, showMore ? currentOptions.length : 3));
      return;
    }
    
    const filtered = currentOptions.filter(option => 
      option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredOptions(filtered);
    setDisplayedOptions(filtered.slice(0, showMore ? filtered.length : 3));
  }, [searchQuery, lunchOptions, showMore]);

  // Use useCallback for handlers to prevent unnecessary recreations
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    setShowMore(false);
    
    // Ensure we're working with arrays
    const currentOptions = Array.isArray(lunchOptions) ? lunchOptions : [];
    
    if (filter === 'all') {
      setFilteredOptions(currentOptions);
      setDisplayedOptions(currentOptions.slice(0, 3));
      return;
    }
    
    let filtered;
    switch (filter) {
      case 'popular':
        filtered = [...currentOptions].sort(() => Math.random() - 0.5).slice(0, 3);
        break;
      case 'special':
        filtered = currentOptions.filter(option => 
          option.tags?.some(tag => tag.toLowerCase().includes('special'))
        );
        if (filtered.length === 0) {
          filtered = [...currentOptions].sort(() => Math.random() - 0.5).slice(0, 2);
        }
        break;
      case 'recommended':
        filtered = [...currentOptions].sort(() => Math.random() - 0.5).slice(0, 4);
        break;
      default:
        filtered = currentOptions;
    }
    
    setFilteredOptions(filtered);
    setDisplayedOptions(filtered.slice(0, 3));
  }, [lunchOptions]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    
    // Ensure we're working with arrays
    const currentOptions = Array.isArray(lunchOptions) ? lunchOptions : [];
    
    if (category === 'daily') {
      setFilteredOptions(currentOptions.slice(0, Math.min(6, currentOptions.length)));
    } else {
      setFilteredOptions(currentOptions);
    }
    
    // Ensure filteredOptions is an array
    const safeFilteredOptions = Array.isArray(filteredOptions) ? filteredOptions : [];
    setDisplayedOptions(safeFilteredOptions.slice(0, showMore ? safeFilteredOptions.length : 3));
  }, [lunchOptions, filteredOptions, showMore]);

  const toggleShowMore = useCallback(() => {
    setShowMore(prev => !prev);
    
    // Ensure filteredOptions is an array
    const safeFilteredOptions = Array.isArray(filteredOptions) ? filteredOptions : [];
    
    if (!showMore) {
      setDisplayedOptions(safeFilteredOptions);
    } else {
      setDisplayedOptions(safeFilteredOptions.slice(0, 3));
    }
  }, [filteredOptions, showMore]);

  const calculateSubsidizedPrice = useCallback((price: number) => {
    if (!company) return price;
    
    if (company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0) {
      return Math.max(0, price - company.fixed_subsidy_amount);
    }
    
    const subsidyPercentage = company.subsidy_percentage || company.subsidyPercentage || 0;
    return price * (1 - (subsidyPercentage / 100));
  }, [company]);

  const handleSelectDish = useCallback(async (dish: LunchOption) => {
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
        duration: 4000, // Add duration to automatically dismiss
      });
      
      navigate(`/employee/order/${data.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el pedido. Por favor, intenta de nuevo.',
        variant: 'destructive',
        duration: 4000, // Add duration to automatically dismiss
      });
    }
  }, [userId, company, toast, navigate]);

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
