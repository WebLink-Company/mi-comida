
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Exportamos la interfaz para el plato más pedido
export interface TopMeal {
  name: string;
  count: number;
}

export const useProviderDashboardStats = () => {
  const { user } = useAuth();
  const providerId = user?.provider_id;
  const companyId = user?.company_id; // Usar company_id para supervisores

  // Función para obtener las estadísticas
  const fetchStats = async () => {
    // Verificar si es un supervisor (tienen company_id pero no provider_id)
    const isSupervisor = !providerId && companyId;
    
    if (!providerId && !companyId) {
      throw new Error("No hay ID de proveedor o empresa disponible");
    }
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    let companyIds = [];
    
    // Si es supervisor, solo trabajar con su empresa asignada
    if (isSupervisor) {
      if (!companyId) {
        throw new Error("No tienes ninguna empresa asignada actualmente.");
      }
      companyIds = [companyId];
    } 
    // Si es proveedor, obtener todas sus empresas
    else if (providerId) {
      // 1. Obtener empresas asociadas a este proveedor
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('provider_id', providerId);
        
      if (companiesError) throw companiesError;
      
      if (!companies || companies.length === 0) {
        // No hay empresas, devolvemos valores predeterminados
        return {
          ordersToday: 0,
          totalMealsToday: 0,
          companiesWithOrdersToday: 0,
          topOrderedMeal: { name: 'No hay datos', count: 0 },
          pendingOrders: 0,
          monthlyOrders: 0,
          monthlyRevenue: 0
        };
      }
      
      companyIds = companies.map(company => company.id);
    }
    
    // Verificar que tenemos empresas para buscar
    if (companyIds.length === 0) {
      return {
        ordersToday: 0,
        totalMealsToday: 0,
        companiesWithOrdersToday: 0,
        topOrderedMeal: { name: 'No hay datos', count: 0 },
        pendingOrders: 0,
        monthlyOrders: 0,
        monthlyRevenue: 0
      };
    }
    
    // Fetch orders and lunch options in a single request with inner joins
    // This reduces the number of requests significantly
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, 
        company_id, 
        lunch_option_id, 
        status, 
        date,
        lunch_options:lunch_option_id(id, name, price)
      `)
      .in('company_id', companyIds)
      .gte('date', `${currentMonth}-01`)
      .lte('date', today);
      
    if (ordersError) throw ordersError;
    
    // Filter today's orders
    const todayOrders = orders?.filter(order => order.date === today) || [];
    
    // Calculate statistics
    const ordersToday = todayOrders.length;
    const totalMealsToday = todayOrders.length;
    const uniqueCompanies = [...new Set(todayOrders.map(order => order.company_id))];
    const companiesWithOrdersToday = uniqueCompanies.length;
    const pendingOrdersCount = todayOrders.filter(order => order.status === 'pending').length;
    const monthlyOrders = orders?.length || 0;
    
    // Calculate revenue
    let monthlyRevenue = 0;
    orders?.forEach(order => {
      if (order.lunch_options && order.lunch_options.price) {
        monthlyRevenue += Number(order.lunch_options.price);
      }
    });
    
    // Calculate most ordered dish today
    let topOrderedMeal: TopMeal = { name: 'No hay datos', count: 0 };
    
    if (todayOrders.length > 0) {
      const mealCount: {[key: string]: {count: number, name: string}} = {};
      
      // Count occurrences of each dish
      todayOrders.forEach(order => {
        if (order.lunch_options) {
          const id = order.lunch_option_id;
          const name = order.lunch_options.name;
          
          if (!mealCount[id]) {
            mealCount[id] = { count: 0, name };
          }
          mealCount[id].count += 1;
        }
      });
      
      // Find the most popular dish
      let maxCount = 0;
      let topMealId = null;
      
      Object.entries(mealCount).forEach(([id, data]) => {
        if (data.count > maxCount) {
          maxCount = data.count;
          topMealId = id;
        }
      });
      
      if (topMealId && mealCount[topMealId]) {
        topOrderedMeal = {
          name: mealCount[topMealId].name,
          count: mealCount[topMealId].count
        };
      }
    }
    
    return {
      ordersToday,
      totalMealsToday,
      companiesWithOrdersToday,
      topOrderedMeal,
      pendingOrders: pendingOrdersCount,
      monthlyOrders,
      monthlyRevenue
    };
  };

  // Use React Query with caching to prevent excessive requests
  const { data, isLoading, error } = useQuery({
    queryKey: ['providerStats', providerId, companyId],
    queryFn: fetchStats,
    enabled: !!(providerId || companyId),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    // Prevent excessive refetching
    refetchInterval: false,
    refetchOnMount: false,
  });

  // Return all the individual loading states that the ProviderDashboard expects
  return {
    // Datos
    ordersToday: data?.ordersToday || 0,
    totalMealsToday: data?.totalMealsToday || 0,
    companiesWithOrdersToday: data?.companiesWithOrdersToday || 0,
    topOrderedMeal: data?.topOrderedMeal || null,
    pendingOrders: data?.pendingOrders || 0,
    monthlyOrders: data?.monthlyOrders || 0,
    monthlyRevenue: data?.monthlyRevenue || 0,
    
    // We'll use the single isLoading state for all individual loading states
    loadingOrdersToday: isLoading,
    loadingMealsToday: isLoading,
    loadingCompaniesOrders: isLoading,
    loadingTopMeal: isLoading,
    loadingPending: isLoading,
    loadingMonthlyOrders: isLoading,
    loadingMonthlyRevenue: isLoading,
    
    // Original state properties
    isLoading,
    error
  };
};
