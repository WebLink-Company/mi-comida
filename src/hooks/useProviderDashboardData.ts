
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

export const useProviderDashboardData = (providerId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const effectiveProviderId = providerId || user?.provider_id;
  
  console.log(`Using provider_id for data fetching: ${effectiveProviderId}`);
  console.log(`User data:`, user);
  
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  const { data: activeCompanies, isLoading: loadingActiveCompanies } = useQuery({
    queryKey: ['activeCompanies', effectiveProviderId],
    queryFn: async () => {
      try {
        console.log(`Fetching active companies with provider_id: ${effectiveProviderId}`);
        
        console.log(`QUERY: SELECT * FROM companies WHERE provider_id = '${effectiveProviderId}'`);
        
        const { count, error, data } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: false })
          .eq('provider_id', effectiveProviderId);
          
        if (error) {
          console.error('Error in companies query:', error);
          throw error;
        }
        
        console.log(`Active companies query result:`, data);
        console.log(`Active companies count for provider ${effectiveProviderId}:`, count);
        return count || 0;
      } catch (error) {
        console.error('Error fetching active companies:', error);
        return 0;
      }
    },
    enabled: !!effectiveProviderId,
  });

  const { data: ordersToday, isLoading: loadingOrdersToday } = useQuery({
    queryKey: ['ordersToday', effectiveProviderId],
    queryFn: async () => {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', effectiveProviderId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          return 0;
        }
        
        const companyIds = companies.map(c => c.id);
        
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('date', formattedToday)
          .in('company_id', companyIds)
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
    enabled: !!effectiveProviderId,
  });

  const { data: totalMealsToday, isLoading: loadingMealsToday } = useQuery({
    queryKey: ['mealsToday', effectiveProviderId],
    queryFn: async () => {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', effectiveProviderId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          return 0;
        }
        
        const companyIds = companies.map(c => c.id);
        
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('date', formattedToday)
          .in('company_id', companyIds);
          
        if (error) throw error;
        return data?.length || 0;
      } catch (error) {
        console.error('Error fetching total meals today:', error);
        return 0;
      }
    },
    enabled: !!effectiveProviderId,
  });

  const { data: companiesWithOrdersToday, isLoading: loadingCompaniesOrders } = useQuery({
    queryKey: ['companiesWithOrders', effectiveProviderId],
    queryFn: async () => {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', effectiveProviderId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          return 0;
        }
        
        const companyIds = companies.map(c => c.id);
        
        const { data, error } = await supabase
          .from('orders')
          .select('company_id')
          .eq('date', formattedToday)
          .in('company_id', companyIds)
          .not('company_id', 'is', null);
          
        if (error) throw error;
        
        const uniqueCompanyIds = [...new Set(data?.map(order => order.company_id))];
        return uniqueCompanyIds.length;
      } catch (error) {
        console.error('Error fetching companies with orders:', error);
        return 0;
      }
    },
    enabled: !!effectiveProviderId,
  });

  const { data: topOrderedMeal, isLoading: loadingTopMeal } = useQuery({
    queryKey: ['topOrderedMeal', effectiveProviderId],
    queryFn: async () => {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', effectiveProviderId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          return null;
        }
        
        const companyIds = companies.map(c => c.id);
        
        const { data, error } = await supabase
          .from('orders')
          .select('lunch_option_id')
          .eq('date', formattedToday)
          .in('company_id', companyIds);
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return null;
        }
        
        const mealCounts = data.reduce((acc, order) => {
          acc[order.lunch_option_id] = (acc[order.lunch_option_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const topMealId = Object.entries(mealCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        
        if (!topMealId) {
          return null;
        }
        
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
    enabled: !!effectiveProviderId,
  });

  const { data: pendingOrders, isLoading: loadingPending } = useQuery({
    queryKey: ['pendingOrders', effectiveProviderId],
    queryFn: async () => {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', effectiveProviderId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          return 0;
        }
        
        const companyIds = companies.map(c => c.id);
        
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .in('company_id', companyIds);
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching pending orders:', error);
        return 0;
      }
    },
    enabled: !!effectiveProviderId,
  });

  const { data: newUsers, isLoading: loadingNewUsers } = useQuery({
    queryKey: ['newUsers', effectiveProviderId],
    queryFn: async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', effectiveProviderId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          return 0;
        }
        
        const companyIds = companies.map(c => c.id);

        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('company_id', companyIds)
          .gte('created_at', sevenDaysAgo.toISOString());
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching new users:', error);
        return 0;
      }
    },
    enabled: !!effectiveProviderId,
  });

  const { data: monthlyOrders, isLoading: loadingMonthlyOrders } = useQuery({
    queryKey: ['monthlyOrders', effectiveProviderId],
    queryFn: async () => {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', effectiveProviderId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          return 0;
        }
        
        const companyIds = companies.map(c => c.id);

        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('date', firstDayOfMonth)
          .lte('date', formattedToday)
          .in('company_id', companyIds);
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching monthly orders:', error);
        return 0;
      }
    },
    enabled: !!effectiveProviderId,
  });

  const { data: monthlyRevenue, isLoading: loadingMonthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue', effectiveProviderId],
    queryFn: async () => {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', effectiveProviderId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          return 0;
        }
        
        const companyIds = companies.map(c => c.id);
        const { data, error } = await supabase
          .from('orders')
          .select('lunch_option_id')
          .gte('date', firstDayOfMonth)
          .lte('date', formattedToday)
          .in('company_id', companyIds);
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return 0;
        }
        
        // Fix for TypeScript error - ensuring both values are explicitly treated as numbers
        const averageMealPrice = 12.50;
        const orderCount = data.length;
        // Convert both to numbers explicitly to satisfy TypeScript's type checking
        return Number(orderCount) * Number(averageMealPrice);
      } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        return 0;
      }
    },
    enabled: !!effectiveProviderId,
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
