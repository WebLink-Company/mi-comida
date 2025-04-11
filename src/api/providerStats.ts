
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
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  let companyIds: string[] = [];
  
  try {
    console.log("Iniciando fetchStats para providerId:", providerId, "companyId:", companyId);
    console.log("Fecha de hoy:", today);
    console.log("Primer día del mes:", firstDayOfMonth);
    
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
    
    // Consulta específica para órdenes del mes actual (entre el primer día y hoy)
    console.log(`QUERY MENSUAL: Buscando órdenes desde ${firstDayOfMonth} hasta ${today} para companyIds: [${companyIds.join(', ')}]`);
    
    const { data: monthlyOrders, error: monthlyOrdersError } = await supabase
      .from('orders')
      .select(`
        id, 
        status, 
        date,
        lunch_options:lunch_option_id(id, name, price)
      `)
      .in('company_id', companyIds)
      .gte('date', firstDayOfMonth)
      .lte('date', today);
      
    if (monthlyOrdersError) {
      console.error("Error al obtener órdenes mensuales:", monthlyOrdersError);
      throw monthlyOrdersError;
    }
    
    console.log(`Se encontraron ${monthlyOrders?.length || 0} órdenes mensuales en total`);
    
    // Consulta específica para órdenes de hoy
    console.log(`QUERY DIARIA: Buscando órdenes para hoy (${today}) para companyIds: [${companyIds.join(', ')}]`);
    
    const { data: todayOrders, error: todayOrdersError } = await supabase
      .from('orders')
      .select(`
        id, 
        status, 
        date,
        company_id,
        lunch_options:lunch_option_id(id, name, price)
      `)
      .in('company_id', companyIds)
      .eq('date', today);
      
    if (todayOrdersError) {
      console.error("Error al obtener órdenes de hoy:", todayOrdersError);
      throw todayOrdersError;
    }
    
    console.log(`Se encontraron ${todayOrders?.length || 0} órdenes hoy`);
    
    // Consulta específica para órdenes pendientes
    console.log(`QUERY PENDIENTES: Buscando órdenes pendientes para companyIds: [${companyIds.join(', ')}]`);
    
    const { data: pendingOrders, error: pendingOrdersError } = await supabase
      .from('orders')
      .select('id')
      .in('company_id', companyIds)
      .eq('status', 'pending');
      
    if (pendingOrdersError) {
      console.error("Error al obtener órdenes pendientes:", pendingOrdersError);
      throw pendingOrdersError;
    }
    
    console.log(`Se encontraron ${pendingOrders?.length || 0} órdenes pendientes`);
    
    // Filtrar órdenes aprobadas/entregadas para estadísticas
    const approvedTodayOrders = todayOrders?.filter(order => 
      ['approved', 'prepared', 'delivered'].includes(order.status)
    ) || [];
    
    const approvedMonthlyOrders = monthlyOrders?.filter(order => 
      ['approved', 'prepared', 'delivered'].includes(order.status)
    ) || [];
    
    // Calcular estadísticas de forma eficiente
    const ordersToday = approvedTodayOrders.length;
    const totalMealsToday = approvedTodayOrders.length;
    
    // Contar empresas únicas con órdenes aprobadas hoy
    const uniqueCompanies = [...new Set(approvedTodayOrders.map(order => order.company_id))];
    const companiesWithOrdersToday = uniqueCompanies.length;
    
    const pendingOrdersCount = pendingOrders?.length || 0;
    const monthlyOrdersCount = approvedMonthlyOrders.length;
    
    console.log("Estadísticas calculadas:");
    console.log("- Órdenes hoy:", ordersToday);
    console.log("- Órdenes mensuales:", monthlyOrdersCount);
    console.log("- Órdenes pendientes:", pendingOrdersCount);
    
    // Calcular ingresos totales del mes
    let monthlyRevenue = 0;
    approvedMonthlyOrders.forEach(order => {
      if (order.lunch_options && order.lunch_options.price) {
        monthlyRevenue += Number(order.lunch_options.price);
      }
    });
    
    console.log("- Ingresos mensuales:", monthlyRevenue);
    
    // Calcular el plato más pedido hoy
    let topOrderedMeal: TopMeal = { name: 'No hay datos', count: 0 };
    
    if (approvedTodayOrders.length > 0) {
      const mealCounter: Record<string, MealCounterItem> = {};
      
      // Contar ocurrencias de cada plato
      approvedTodayOrders.forEach(order => {
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
