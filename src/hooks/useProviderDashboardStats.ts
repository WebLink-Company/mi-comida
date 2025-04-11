
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Exportamos la interfaz para el plato más pedido
export interface TopMeal {
  name: string;
  count: number;
}

// Interface for meal counter dictionary
interface MealCounterItem {
  count: number;
  name: string;
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
      console.error("No hay ID de proveedor o empresa disponible");
      throw new Error("No hay ID de proveedor o empresa disponible");
    }
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    let companyIds = [];
    
    try {
      console.log("Iniciando fetchStats para providerId:", providerId, "companyId:", companyId);
      
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
      
      // Optimizar consultando solo los datos necesarios en una única solicitud
      console.log(`QUERY OPTIMIZADA: Buscando órdenes para companyIds: [${companyIds.join(', ')}]`);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, 
          status, 
          date,
          company_id, 
          user_id,
          lunch_options:lunch_option_id(id, name, price)
        `)
        .in('company_id', companyIds)
        .gte('date', `${currentMonth}-01`)
        .lte('date', today);
        
      if (ordersError) {
        console.error("Error al obtener órdenes:", ordersError);
        throw ordersError;
      }
      
      console.log(`Se encontraron ${orders?.length || 0} órdenes en total`);
      
      // Filtrar y contar por una sola vez en lugar de múltiples iteraciones
      const todayOrders = orders?.filter(order => order.date === today) || [];
      const approvedOrders = orders?.filter(order => 
        ['approved', 'prepared', 'delivered'].includes(order.status)
      ) || [];
      const todayApprovedOrders = todayOrders.filter(order => 
        ['approved', 'prepared', 'delivered'].includes(order.status)
      );
      const pendingTodayOrders = todayOrders.filter(order => order.status === 'pending');
      
      // Calcular estadísticas de forma eficiente
      const ordersToday = todayApprovedOrders.length;
      const totalMealsToday = todayApprovedOrders.length;
      const uniqueCompanies = [...new Set(todayApprovedOrders.map(order => order.company_id))];
      const companiesWithOrdersToday = uniqueCompanies.length;
      const pendingOrdersCount = pendingTodayOrders.length;
      const monthlyOrders = approvedOrders.length;
      
      // Calcular ingresos totales del mes
      let monthlyRevenue = 0;
      approvedOrders.forEach(order => {
        if (order.lunch_options && order.lunch_options.price) {
          monthlyRevenue += Number(order.lunch_options.price);
        }
      });
      
      // Calcular el plato más pedido hoy
      let topOrderedMeal: TopMeal = { name: 'No hay datos', count: 0 };
      
      if (todayApprovedOrders.length > 0) {
        const mealCounter: Record<string, MealCounterItem> = {};
        
        // Contar ocurrencias de cada plato de forma más eficiente
        todayApprovedOrders.forEach(order => {
          if (order.lunch_options) {
            const mealId = order.lunch_options.id;
            const mealName = order.lunch_options.name;
            
            if (!mealCounter[mealId]) {
              mealCounter[mealId] = { count: 0, name: mealName };
            }
            mealCounter[mealId].count++;
          }
        });
        
        // Encontrar el plato más pedido
        const topMeal = Object.values(mealCounter).reduce<MealCounterItem>(
          (max, current) => current.count > max.count ? current : max, 
          { count: 0, name: 'No hay datos' }
        );
        
        topOrderedMeal = {
          name: topMeal.name,
          count: topMeal.count
        };
      }
      
      console.log("Estadísticas calculadas de forma eficiente");
      
      return {
        ordersToday,
        totalMealsToday,
        companiesWithOrdersToday,
        topOrderedMeal,
        pendingOrders: pendingOrdersCount,
        monthlyOrders,
        monthlyRevenue
      };
    } catch (error) {
      console.error("Error en fetchStats:", error);
      throw error;
    }
  };

  // Use React Query with optimized caching and reduced requests
  const { data, isLoading, error } = useQuery({
    queryKey: ['providerStats', providerId, companyId],
    queryFn: fetchStats,
    enabled: !!(providerId || companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: "always"
  });

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
    error
  };
};
