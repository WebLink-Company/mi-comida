
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Exportamos la interfaz para el plato más pedido
export interface TopMeal {
  name: string;
  count: number;
}

export const useProviderDashboardStats = () => {
  const { user } = useAuth();
  const [ordersToday, setOrdersToday] = useState<number>(0);
  const [totalMealsToday, setTotalMealsToday] = useState<number>(0);
  const [companiesWithOrdersToday, setCompaniesWithOrdersToday] = useState<number>(0);
  const [topOrderedMeal, setTopOrderedMeal] = useState<string | null>(null);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [monthlyOrders, setMonthlyOrders] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  
  // Estados de carga
  const [loadingOrdersToday, setLoadingOrdersToday] = useState<boolean>(true);
  const [loadingMealsToday, setLoadingMealsToday] = useState<boolean>(true);
  const [loadingCompaniesOrders, setLoadingCompaniesOrders] = useState<boolean>(true);
  const [loadingTopMeal, setLoadingTopMeal] = useState<boolean>(true);
  const [loadingPending, setLoadingPending] = useState<boolean>(true);
  const [loadingMonthlyOrders, setLoadingMonthlyOrders] = useState<boolean>(true);
  const [loadingMonthlyRevenue, setLoadingMonthlyRevenue] = useState<boolean>(true);
  
  // Estado para errores
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.provider_id) return;
    
    const fetchStats = async () => {
      try {
        const providerId = user.provider_id;
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
        
        // 1. Obtener empresas asociadas a este proveedor
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', providerId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          // No hay empresas, establecemos valores predeterminados
          setOrdersToday(0);
          setTotalMealsToday(0);
          setCompaniesWithOrdersToday(0);
          setPendingOrders(0);
          setMonthlyOrders(0);
          setMonthlyRevenue(0);
          
          // Finalizamos todos los estados de carga
          setLoadingOrdersToday(false);
          setLoadingMealsToday(false);
          setLoadingCompaniesOrders(false);
          setLoadingTopMeal(false);
          setLoadingPending(false);
          setLoadingMonthlyOrders(false);
          setLoadingMonthlyRevenue(false);
          return;
        }
        
        const companyIds = companies.map(company => company.id);
        
        // 2. Obtener pedidos para hoy
        const { data: todayOrders, error: todayOrdersError } = await supabase
          .from('orders')
          .select('id, company_id, lunch_option_id, status')
          .in('company_id', companyIds)
          .eq('date', today);
          
        if (todayOrdersError) throw todayOrdersError;
        
        // Actualizar ordersToday
        setOrdersToday(todayOrders?.length || 0);
        setLoadingOrdersToday(false);
        
        // Actualizar totalMealsToday (asumiendo 1 meal por orden)
        setTotalMealsToday(todayOrders?.length || 0);
        setLoadingMealsToday(false);
        
        // Actualizar companiesWithOrdersToday
        const uniqueCompanies = [...new Set(todayOrders?.map(order => order.company_id) || [])];
        setCompaniesWithOrdersToday(uniqueCompanies.length);
        setLoadingCompaniesOrders(false);
        
        // Actualizar pendingOrders
        const pendingOrdersCount = todayOrders?.filter(order => order.status === 'pending').length || 0;
        setPendingOrders(pendingOrdersCount);
        setLoadingPending(false);
        
        // 3. Obtener pedidos del mes actual para calcular ingresos
        const { data: monthOrders, error: monthOrdersError } = await supabase
          .from('orders')
          .select('id, lunch_option_id')
          .in('company_id', companyIds)
          .gte('date', `${currentMonth}-01`)
          .lte('date', today);
          
        if (monthOrdersError) throw monthOrdersError;
        
        // Actualizar monthlyOrders
        setMonthlyOrders(monthOrders?.length || 0);
        setLoadingMonthlyOrders(false);
        
        // 4. Obtener los precios de los platos para calcular ingresos
        if (monthOrders && monthOrders.length > 0) {
          const lunchOptionIds = monthOrders.map(order => order.lunch_option_id);
          const { data: lunchOptions, error: lunchOptionsError } = await supabase
            .from('lunch_options')
            .select('id, name, price')
            .in('id', lunchOptionIds);
            
          if (lunchOptionsError) throw lunchOptionsError;
          
          // Crear un mapa de id -> precio para facilitar el cálculo
          const priceMap = new Map();
          lunchOptions?.forEach(option => priceMap.set(option.id, option.price));
          
          // Calcular ingresos totales
          let totalRevenue = 0;
          monthOrders.forEach(order => {
            const price = priceMap.get(order.lunch_option_id) || 0;
            totalRevenue += Number(price);
          });
          
          setMonthlyRevenue(totalRevenue);
          
          // Calcular el plato más pedido
          if (todayOrders && todayOrders.length > 0) {
            const mealCount = {};
            const mealNames = {};
            
            // Contar apariciones de cada plato
            todayOrders.forEach(order => {
              const id = order.lunch_option_id;
              mealCount[id] = (mealCount[id] || 0) + 1;
              
              // Guardar el nombre del plato si ya lo tenemos
              const option = lunchOptions?.find(opt => opt.id === id);
              if (option) {
                mealNames[id] = option.name;
              }
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
            if (topMealId && mealNames[topMealId]) {
              setTopOrderedMeal(mealNames[topMealId]);
            } else {
              setTopOrderedMeal('No hay datos');
            }
          } else {
            setTopOrderedMeal('No hay pedidos hoy');
          }
        } else {
          setMonthlyRevenue(0);
          setTopOrderedMeal('No hay datos');
        }
        
        setLoadingMonthlyRevenue(false);
        setLoadingTopMeal(false);
        
      } catch (err) {
        console.error('Error al obtener estadísticas del proveedor:', err);
        setError('Error al obtener estadísticas del proveedor');
        
        // Finalizamos todos los estados de carga en caso de error
        setLoadingOrdersToday(false);
        setLoadingMealsToday(false);
        setLoadingCompaniesOrders(false);
        setLoadingTopMeal(false);
        setLoadingPending(false);
        setLoadingMonthlyOrders(false);
        setLoadingMonthlyRevenue(false);
      }
    };
    
    fetchStats();
  }, [user]);

  return {
    ordersToday,
    loadingOrdersToday,
    totalMealsToday,
    loadingMealsToday,
    companiesWithOrdersToday,
    loadingCompaniesOrders,
    topOrderedMeal,
    loadingTopMeal,
    pendingOrders,
    loadingPending,
    monthlyOrders,
    loadingMonthlyOrders,
    monthlyRevenue,
    loadingMonthlyRevenue,
    error
  };
};
