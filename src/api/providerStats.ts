
import { supabase } from '@/integrations/supabase/client';
import { TopMeal } from '@/hooks/useProviderDashboardStats';

// Interface for meal counter dictionary
interface MealCounterItem {
  count: number;
  name: string;
}

/**
 * Fetches dashboard statistics for a provider or supervisor
 * @param providerId The provider ID (for providers)
 * @param companyId The company ID (for supervisors)
 * @returns Dashboard statistics
 */
export const fetchProviderStats = async (providerId?: string, companyId?: string) => {
  // Verificar si es un supervisor (tienen company_id pero no provider_id)
  const isSupervisor = !providerId && companyId;
  
  if (!providerId && !companyId) {
    console.error("No hay ID de proveedor o empresa disponible");
    throw new Error("No hay ID de proveedor o empresa disponible");
  }
  
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  let companyIds: string[] = [];
  
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
    // Corrección: Usar .in() para buscar en una lista de company_ids
    console.log(`QUERY OPTIMIZADA: Buscando órdenes para companyIds: [${companyIds.join(', ')}]`);
    
    // Realizamos una sola consulta para obtener los datos necesarios
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
      .in('company_id', companyIds);
      
    if (ordersError) {
      console.error("Error al obtener órdenes:", ordersError);
      throw ordersError;
    }
    
    console.log(`Se encontraron ${orders?.length || 0} órdenes en total`);
    
    // Filtramos las órdenes según las fechas que necesitamos
    const todayOrders = orders?.filter(order => order.date === today) || [];
    const monthlyOrders = orders?.filter(order => {
      const orderMonth = order.date.substring(0, 7); // YYYY-MM
      return orderMonth === currentMonth;
    }) || [];
    
    // Filtramos y contamos por una sola vez en lugar de múltiples iteraciones
    const todayApprovedOrders = todayOrders.filter(order => 
      ['approved', 'prepared', 'delivered'].includes(order.status)
    );
    const pendingTodayOrders = todayOrders.filter(order => order.status === 'pending');
    const approvedMonthlyOrders = monthlyOrders.filter(order => 
      ['approved', 'prepared', 'delivered'].includes(order.status)
    );
    
    // Calcular estadísticas de forma eficiente
    const ordersToday = todayApprovedOrders.length;
    const totalMealsToday = todayApprovedOrders.length;
    const uniqueCompanies = [...new Set(todayApprovedOrders.map(order => order.company_id))];
    const companiesWithOrdersToday = uniqueCompanies.length;
    const pendingOrdersCount = pendingTodayOrders.length;
    const monthlyOrdersCount = approvedMonthlyOrders.length;
    
    // Calcular ingresos totales del mes
    let monthlyRevenue = 0;
    approvedMonthlyOrders.forEach(order => {
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
    console.log("Orders today:", ordersToday);
    console.log("Monthly orders:", monthlyOrdersCount);
    
    return {
      ordersToday,
      totalMealsToday,
      companiesWithOrdersToday,
      topOrderedMeal,
      pendingOrders: pendingOrdersCount,
      monthlyOrders: monthlyOrdersCount,
      monthlyRevenue
    };
  } catch (error) {
    console.error("Error en fetchStats:", error);
    throw error;
  }
};
