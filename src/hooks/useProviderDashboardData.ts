
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DashboardStats {
  ordersToday: number;
  totalMealsToday: number;
  companiesWithOrdersToday: number;
  topOrderedMeal: { name: string; count: number } | null;
  pendingOrders: number;
  activeCompanies: number;
  newUsers: number;
  monthlyOrders: number;
  monthlyRevenue: number;
}

export const useProviderDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const providerId = user?.id;
  
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  // Fetch today's orders
  const { data: ordersToday, isLoading: loadingOrdersToday } = useQuery({
    queryKey: ['ordersToday', providerId],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('date', formattedToday)
          .eq('status', 'pending');
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching orders today:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch today\'s orders',
          variant: 'destructive',
        });
        return 0;
      }
    },
    enabled: !!providerId,
  });

  // Fetch total meals today
  const { data: totalMealsToday, isLoading: loadingMealsToday } = useQuery({
    queryKey: ['mealsToday', providerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('date', formattedToday);
          
        if (error) throw error;
        return data?.length || 0;
      } catch (error) {
        console.error('Error fetching total meals today:', error);
        return 0;
      }
    },
    enabled: !!providerId,
  });

  // Fetch companies with orders today
  const { data: companiesWithOrdersToday, isLoading: loadingCompaniesOrders } = useQuery({
    queryKey: ['companiesWithOrders', providerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('company_id')
          .eq('date', formattedToday)
          .is('company_id', 'not.null');
          
        if (error) throw error;
        
        // Get unique company IDs
        const uniqueCompanyIds = [...new Set(data?.map(order => order.company_id))];
        return uniqueCompanyIds.length;
      } catch (error) {
        console.error('Error fetching companies with orders:', error);
        return 0;
      }
    },
    enabled: !!providerId,
  });

  // Fetch top ordered meal
  const { data: topOrderedMeal, isLoading: loadingTopMeal } = useQuery({
    queryKey: ['topOrderedMeal', providerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('lunch_option_id')
          .eq('date', formattedToday);
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return null;
        }
        
        // Count occurrences of each meal
        const mealCounts = data.reduce((acc, order) => {
          acc[order.lunch_option_id] = (acc[order.lunch_option_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Find the meal with the highest count
        const topMealId = Object.entries(mealCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        
        if (!topMealId) {
          return null;
        }
        
        // Get meal name
        const { data: mealData, error: mealError } = await supabase
          .from('lunch_options')
          .select('name')
          .eq('id', topMealId)
          .single();
          
        if (mealError) throw mealError;
        
        return { 
          name: mealData?.name || 'Unknown', 
          count: mealCounts[topMealId] 
        };
      } catch (error) {
        console.error('Error fetching top ordered meal:', error);
        return null;
      }
    },
    enabled: !!providerId,
  });

  // Fetch pending orders
  const { data: pendingOrders, isLoading: loadingPending } = useQuery({
    queryKey: ['pendingOrders', providerId],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching pending orders:', error);
        return 0;
      }
    },
    enabled: !!providerId,
  });

  // Fetch active companies
  const { data: activeCompanies, isLoading: loadingActiveCompanies } = useQuery({
    queryKey: ['activeCompanies', providerId],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', providerId);
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching active companies:', error);
        return 0;
      }
    },
    enabled: !!providerId,
  });

  // Fetch new users (last 7 days)
  const { data: newUsers, isLoading: loadingNewUsers } = useQuery({
    queryKey: ['newUsers', providerId],
    queryFn: async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', providerId)
          .gte('created_at', sevenDaysAgo.toISOString());
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching new users:', error);
        return 0;
      }
    },
    enabled: !!providerId,
  });

  // Fetch monthly orders
  const { data: monthlyOrders, isLoading: loadingMonthlyOrders } = useQuery({
    queryKey: ['monthlyOrders', providerId],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('date', firstDayOfMonth)
          .lte('date', formattedToday);
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching monthly orders:', error);
        return 0;
      }
    },
    enabled: !!providerId,
  });

  // Fetch monthly revenue (this would require joining orders with lunch options to get prices)
  const { data: monthlyRevenue, isLoading: loadingMonthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue', providerId],
    queryFn: async () => {
      try {
        // This is a simplified example - in a real app, we would join orders with lunch options
        // to calculate the actual revenue based on prices
        const { data, error } = await supabase
          .from('orders')
          .select('lunch_option_id')
          .gte('date', firstDayOfMonth)
          .lte('date', formattedToday);
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return 0;
        }
        
        // For now, just return an estimated revenue based on average meal price
        return data.length * 12.50; // Assuming average meal price is $12.50
      } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        return 0;
      }
    },
    enabled: !!providerId,
  });

  return {
    ordersToday: ordersToday || 0,
    loadingOrdersToday,
    totalMealsToday: totalMealsToday || 0,
    loadingMealsToday,
    companiesWithOrdersToday: companiesWithOrdersToday || 0,
    loadingCompaniesOrders,
    topOrderedMeal,
    loadingTopMeal,
    pendingOrders: pendingOrders || 0,
    loadingPending,
    activeCompanies: activeCompanies || 0,
    loadingActiveCompanies,
    newUsers: newUsers || 0,
    loadingNewUsers,
    monthlyOrders: monthlyOrders || 0,
    loadingMonthlyOrders,
    monthlyRevenue: monthlyRevenue || 0,
    loadingMonthlyRevenue,
  };
};
