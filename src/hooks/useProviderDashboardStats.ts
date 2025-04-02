
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// Define interfaces for query results
export interface TopMealResult {
  name: string;
  count: number;
}

export const useProviderDashboardStats = () => {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  const firstDayOfMonth = new Date().toISOString().substring(0, 8) + '01';
  const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  
  // Orders Today
  const { data: ordersToday, isLoading: loadingOrdersToday } = useQuery({
    queryKey: ['ordersToday', today, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('date', today)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  // Total Meals Today
  const { data: totalMealsToday, isLoading: loadingMealsToday } = useQuery({
    queryKey: ['mealsToday', today, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('date', today)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  // Companies with Orders Today
  const { data: companiesWithOrdersToday, isLoading: loadingCompaniesOrders } = useQuery({
    queryKey: ['companiesOrdersToday', today, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('company_id')
        .eq('date', today)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      
      const uniqueCompanies = new Set(data?.map(order => order.company_id) || []);
      return uniqueCompanies.size;
    },
    enabled: !!user?.id
  });

  // Top Ordered Meal Today - Fix type issues
  const { data: topOrderedMeal, isLoading: loadingTopMeal } = useQuery<TopMealResult | undefined, Error>({
    queryKey: ['topMeal', today, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('lunch_option_id')
        .eq('date', today)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      
      if (!data || data.length === 0) return { name: 'No orders', count: 0 };
      
      // Count occurrences of each lunch option
      const counts: Record<string, number> = {};
      data.forEach(order => {
        counts[order.lunch_option_id] = (counts[order.lunch_option_id] || 0) + 1;
      });
      
      // Find the most frequent option
      let maxId = '';
      let maxCount = 0;
      Object.entries(counts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxId = id;
          maxCount = count;
        }
      });
      
      // Get the name of the top option
      if (maxId) {
        const { data: lunchData } = await supabase
          .from('lunch_options')
          .select('name')
          .eq('id', maxId)
          .maybeSingle();
          
        return { name: lunchData?.name || 'Unknown', count: maxCount };
      }
      
      return { name: 'No orders', count: 0 };
    },
    enabled: !!user?.id
  });

  // Pending Orders
  const { data: pendingOrders, isLoading: loadingPending } = useQuery({
    queryKey: ['pendingOrders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  // Active Companies
  const { data: activeCompanies, isLoading: loadingActiveCompanies } = useQuery({
    queryKey: ['activeCompanies', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  // New Users This Week
  const { data: newUsers, isLoading: loadingNewUsers } = useQuery({
    queryKey: ['newUsers', sevenDaysAgo, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('created_at', sevenDaysAgo)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  // Monthly Orders
  const { data: monthlyOrders, isLoading: loadingMonthlyOrders } = useQuery({
    queryKey: ['monthlyOrders', firstDayOfMonth, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .gte('date', firstDayOfMonth)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  // Monthly Revenue
  const { data: monthlyRevenue, isLoading: loadingMonthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue', firstDayOfMonth, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('lunch_option_id')
        .gte('date', firstDayOfMonth)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      
      // For demo purposes, let's assume each order is worth $10
      return (data?.length || 0) * 10;
    },
    enabled: !!user?.id
  });

  return {
    // Daily stats
    ordersToday,
    loadingOrdersToday,
    totalMealsToday,
    loadingMealsToday,
    companiesWithOrdersToday,
    loadingCompaniesOrders,
    topOrderedMeal,
    loadingTopMeal,
    
    // General stats
    pendingOrders,
    loadingPending,
    activeCompanies,
    loadingActiveCompanies,
    newUsers,
    loadingNewUsers,
    
    // Monthly stats
    monthlyOrders,
    loadingMonthlyOrders,
    monthlyRevenue,
    loadingMonthlyRevenue
  };
};
