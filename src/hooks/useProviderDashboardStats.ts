
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { fetchProviderStats } from '@/api/providerStats';

// Exportamos la interfaz para el plato más pedido
export interface TopMeal {
  name: string;
  count: number;
}

// Interface for dashboard statistics
export interface ProviderDashboardStats {
  ordersToday: number;
  totalMealsToday: number;
  companiesWithOrdersToday: number;
  topOrderedMeal: TopMeal;
  pendingOrders: number;
  monthlyOrders: number;
  monthlyRevenue: number;
}

export const useProviderDashboardStats = () => {
  const { user } = useAuth();
  const providerId = user?.provider_id;
  const companyId = user?.company_id; // Usar company_id para supervisores

  // Use React Query with optimized caching and reduced requests
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['providerStats', providerId, companyId],
    queryFn: async () => {
      console.log('Fetching provider stats for:', { providerId, companyId });
      const stats = await fetchProviderStats(providerId, companyId);
      console.log('Provider stats fetched:', stats);
      return stats;
    },
    enabled: !!(providerId || companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: "always"
  });

  // Log the monthly order count for debugging
  console.log('Monthly orders from stats:', data?.monthlyOrders);

  return {
    // Datos
    ordersToday: data?.ordersToday || 0,
    totalMealsToday: data?.totalMealsToday || 0,
    companiesWithOrdersToday: data?.companiesWithOrdersToday || 0,
    topOrderedMeal: data?.topOrderedMeal || { name: 'No hay datos', count: 0 },
    pendingOrders: data?.pendingOrders || 0,
    monthlyOrders: data?.monthlyOrders || 0,
    monthlyRevenue: data?.monthlyRevenue || 0,
    
    // Estados
    loadingOrdersToday: isLoading,
    loadingMealsToday: isLoading,
    loadingCompaniesOrders: isLoading,
    loadingTopMeal: isLoading,
    loadingPending: isLoading,
    loadingMonthlyOrders: isLoading,
    loadingMonthlyRevenue: isLoading,
    
    // Estado original
    isLoading,
    error,
    refetch
  };
};
