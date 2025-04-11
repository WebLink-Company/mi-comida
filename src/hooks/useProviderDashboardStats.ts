
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';

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
    
    // 2. Obtener pedidos para hoy
    const { data: todayOrders, error: todayOrdersError } = await supabase
      .from('orders')
      .select('id, company_id, lunch_option_id, status')
      .in('company_id', companyIds)
      .eq('date', today);
      
    if (todayOrdersError) throw todayOrdersError;
    
    // Calcular estadísticas de pedidos hoy
    const ordersToday = todayOrders?.length || 0;
    const totalMealsToday = todayOrders?.length || 0;
    const uniqueCompanies = [...new Set(todayOrders?.map(order => order.company_id) || [])];
    const companiesWithOrdersToday = uniqueCompanies.length;
    const pendingOrdersCount = todayOrders?.filter(order => order.status === 'pending').length || 0;
    
    // 3. Obtener pedidos del mes actual
    const { data: monthOrders, error: monthOrdersError } = await supabase
      .from('orders')
      .select('id, lunch_option_id')
      .in('company_id', companyIds)
      .gte('date', `${currentMonth}-01`)
      .lte('date', today);
      
    if (monthOrdersError) throw monthOrdersError;
    
    const monthlyOrders = monthOrders?.length || 0;
    
    // 4. Calcular ingresos y plato más pedido
    let monthlyRevenue = 0;
    let topOrderedMeal: TopMeal = { name: 'No hay datos', count: 0 };
    
    if (monthOrders && monthOrders.length > 0) {
      const lunchOptionIds = monthOrders.map(order => order.lunch_option_id);
      const { data: lunchOptions, error: lunchOptionsError } = await supabase
        .from('lunch_options')
        .select('id, name, price')
        .in('id', lunchOptionIds);
        
      if (lunchOptionsError) throw lunchOptionsError;
      
      // Crear un mapa de id -> precio para facilitar el cálculo
      const priceMap = new Map();
      const nameMap = new Map();
      lunchOptions?.forEach(option => {
        priceMap.set(option.id, option.price);
        nameMap.set(option.id, option.name);
      });
      
      // Calcular ingresos totales
      monthOrders.forEach(order => {
        const price = priceMap.get(order.lunch_option_id) || 0;
        monthlyRevenue += Number(price);
      });
      
      // Calcular el plato más pedido
      if (todayOrders && todayOrders.length > 0) {
        const mealCount = {};
        
        // Contar apariciones de cada plato
        todayOrders.forEach(order => {
          const id = order.lunch_option_id;
          mealCount[id] = (mealCount[id] || 0) + 1;
        });
        
        // Encontrar el ID del plato más pedido
        let topMealId = null;
        let maxCount = 0;
        
        Object.keys(mealCount).forEach(id => {
          if (mealCount[id] > maxCount) {
            maxCount = mealCount[id];
            topMealId = id;
          }
        });
        
        // Establecer el nombre del plato más pedido
        if (topMealId && nameMap.get(topMealId)) {
          topOrderedMeal = {
            name: nameMap.get(topMealId),
            count: maxCount
          };
        }
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

  // Usar React Query para gestionar la solicitud y el estado
  const { data, isLoading, error } = useQuery({
    queryKey: ['providerStats', providerId, companyId], // Añadir companyId como dependencia
    queryFn: fetchStats,
    enabled: !!(providerId || companyId), // Ejecutar si hay provider_id o company_id
    staleTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
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
