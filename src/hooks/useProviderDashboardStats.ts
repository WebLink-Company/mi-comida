
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Exportamos la interfaz para el plato más pedido
export interface TopMeal {
  name: string;
  count: number;
}

// Añadimos la interfaz para el rango de fechas
export interface DateRange {
  startDate: string; // formato YYYY-MM-DD
  endDate: string;   // formato YYYY-MM-DD
  label: 'hoy' | 'semana' | 'mes' | 'personalizado';
}

export const useProviderDashboardStats = (dateRange?: DateRange) => {
  const { user } = useAuth();
  const providerId = user?.provider_id;
  const companyId = user?.company_id; // Usar company_id para supervisores

  // Función para obtener las estadísticas
  const fetchStats = async () => {
    // Verificar si es un supervisor (tienen company_id pero no provider_id)
    const isSupervisor = !providerId && companyId;
    
    if (!providerId && !companyId) {
      console.error("No hay ID de proveedor o empresa disponible");
      throw new Error("No hay ID de proveedor o empresa disponible");
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Si no se proporciona un rango de fechas, usamos el día actual
    const startDate = dateRange?.startDate || today;
    const endDate = dateRange?.endDate || today;
    
    let companyIds = [];
    
    try {
      console.log("Iniciando fetchStats para providerId:", providerId, "companyId:", companyId);
      console.log("Rango de fechas:", startDate, "hasta", endDate);
      
      // Si es supervisor, solo trabajar con su empresa asignada
      if (isSupervisor) {
        if (!companyId) {
          throw new Error("No tienes ninguna empresa asignada actualmente.");
        }
        companyIds = [companyId];
        console.log("Modo supervisor - usando companyId:", companyId);
      } 
      // Si es proveedor, obtener todas sus empresas
      else if (providerId) {
        // 1. Obtener empresas asociadas a este proveedor
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', providerId);
          
        if (companiesError) {
          console.error("Error al obtener empresas:", companiesError);
          throw companiesError;
        }
        
        if (!companies || companies.length === 0) {
          console.log("No se encontraron empresas para el proveedor:", providerId);
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
        console.log("Empresas encontradas para el proveedor:", companyIds);
      }
      
      // Verificar que tenemos empresas para buscar
      if (companyIds.length === 0) {
        console.log("No hay empresas para buscar");
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
      
      // Construcción de la consulta para depuración
      const queryInfo = {
        companyIds: companyIds,
        startDate: startDate,
        endDate: endDate,
        provider: providerId,
        filters: "estado='approved', 'prepared', 'delivered'"
      };
      console.log("⚡ DEBUG QUERY PARAMETERS:", JSON.stringify(queryInfo, null, 2));
      
      // Fetch orders and lunch options in a single request with inner joins
      // This reduces the number of requests significantly
      console.log(`QUERY EXACTA: Buscando órdenes para companyIds: [${companyIds.join(', ')}], desde: ${startDate}, hasta: ${endDate}, con estados: approved, prepared, delivered`);
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
        .gte('date', startDate)
        .lte('date', endDate)
        .in('status', ['approved', 'prepared', 'delivered']);
        
      if (ordersError) {
        console.error("Error al obtener órdenes:", ordersError);
        throw ordersError;
      }
      
      console.log(`Se encontraron ${orders?.length || 0} órdenes en total`);
      if (orders && orders.length > 0) {
        console.log("Primeras 5 órdenes de muestra:", orders.slice(0, 5));
      } else {
        console.log("No se encontraron órdenes para el rango de fechas seleccionado");
      }
      
      // Filtrar por órdenes de hoy para métricas específicas de hoy
      const todayOrders = orders?.filter(order => 
        order.date === today
      ) || [];
      
      console.log(`Órdenes para hoy (aprobadas/preparadas/entregadas): ${todayOrders.length}`);
      
      // Todas las órdenes en el rango seleccionado (ya filtradas por estado en la consulta)
      const rangeOrders = orders || [];
      
      console.log(`Total de órdenes en el rango seleccionado: ${rangeOrders.length}`);
      
      // Calculate statistics
      const ordersToday = todayOrders.length;
      const totalMealsToday = todayOrders.length; 
      
      // Empresas con órdenes hoy
      const uniqueCompanies = [...new Set(todayOrders.map(order => order.company_id))];
      const companiesWithOrdersToday = uniqueCompanies.length;
      
      // Órdenes pendientes (siempre buscar las pendientes del día actual)
      const { data: pendingOrdersData, error: pendingError } = await supabase
        .from('orders')
        .select('id')
        .in('company_id', companyIds)
        .eq('date', today)
        .eq('status', 'pending');
        
      if (pendingError) {
        console.error("Error al obtener órdenes pendientes:", pendingError);
      }
      
      const pendingOrdersCount = pendingOrdersData?.length || 0;
      console.log(`Órdenes pendientes para hoy: ${pendingOrdersCount}`);
      
      // Conteo de órdenes en el rango
      const rangeOrdersCount = rangeOrders.length;
      
      // Calculate revenue from approved, prepared, or delivered orders
      let rangeRevenue = 0;
      rangeOrders.forEach(order => {
        if (order.lunch_options && order.lunch_options.price) {
          rangeRevenue += Number(order.lunch_options.price);
        }
      });
      
      // Calculate most ordered dish in the range
      let topOrderedMeal: TopMeal = { name: 'No hay datos', count: 0 };
      
      if (rangeOrders.length > 0) {
        const mealCount: {[key: string]: {count: number, name: string}} = {};
        
        // Count occurrences of each dish
        rangeOrders.forEach(order => {
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
      
      console.log("Estadísticas calculadas:", {
        ordersToday,
        totalMealsToday,
        companiesWithOrdersToday,
        pendingOrders: pendingOrdersCount,
        monthlyOrders: rangeOrdersCount,
        monthlyRevenue: rangeRevenue
      });
      
      return {
        ordersToday,
        totalMealsToday,
        companiesWithOrdersToday,
        topOrderedMeal,
        pendingOrders: pendingOrdersCount,
        monthlyOrders: rangeOrdersCount,
        monthlyRevenue: rangeRevenue
      };
    } catch (error) {
      console.error("Error en fetchStats:", error);
      throw error;
    }
  };

  // Use React Query with caching to prevent excessive requests
  const { data, isLoading, error } = useQuery({
    queryKey: ['providerStats', providerId, companyId, dateRange?.startDate, dateRange?.endDate],
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
    topOrderedMeal: data?.topOrderedMeal || { name: 'No hay datos', count: 0 },
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
