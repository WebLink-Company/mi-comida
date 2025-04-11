
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';

interface OrderStats {
  ordersToday: number;
  totalMealsToday: number;
  companiesWithOrdersToday: number;
  pendingOrders: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  topOrderedMeal: { name: string, count: number } | null;
  companyIds: string[];
  filteredOrders: Order[];
}

export const useProviderOrderStats = (companyIds: string[] = []) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrderStats>({
    ordersToday: 0,
    totalMealsToday: 0,
    companiesWithOrdersToday: 0,
    pendingOrders: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    topOrderedMeal: null,
    companyIds: [],
    filteredOrders: []
  });

  // Loading states
  const [loadingOrdersToday, setLoadingOrdersToday] = useState<boolean>(true);
  const [loadingMealsToday, setLoadingMealsToday] = useState<boolean>(true);
  const [loadingCompaniesOrders, setLoadingCompaniesOrders] = useState<boolean>(true);
  const [loadingTopMeal, setLoadingTopMeal] = useState<boolean>(true);
  const [loadingPending, setLoadingPending] = useState<boolean>(true);
  const [loadingMonthlyOrders, setLoadingMonthlyOrders] = useState<boolean>(true);
  const [loadingMonthlyRevenue, setLoadingMonthlyRevenue] = useState<boolean>(true);
  
  const [error, setError] = useState<string | null>(null);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user || companyIds.length === 0) return;
    
    const fetchOrderStats = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch orders for these companies
        let { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            lunch_option:lunch_option_id(*),
            user:user_id(*)
          `)
          .in('company_id', companyIds);
        
        if (ordersError) throw ordersError;
        
        // Process orders data
        if (ordersData) {
          // Count today's orders
          const todaysOrderCount = ordersData.filter(order => 
            order.date && order.date.startsWith(today)
          ).length;
          
          setStats(prev => ({ ...prev, ordersToday: todaysOrderCount }));
          setLoadingOrdersToday(false);
          
          // Count pending orders
          const pendingOrdersCount = ordersData.filter(order => 
            order.status === 'pending'
          ).length;
          
          setStats(prev => ({ ...prev, pendingOrders: pendingOrdersCount }));
          setLoadingPending(false);
          
          // Calculate total revenue (delivered + approved orders)
          const revenueOrders = ordersData.filter(order => 
            ['delivered', 'approved'].includes(order.status)
          );
          
          const totalRevenueAmount = revenueOrders.reduce((sum, order) => {
            // Safely convert to number then add
            const orderPrice = order.lunch_option ? Number(order.lunch_option.price) : 0;
            return sum + orderPrice;
          }, 0);
          
          setStats(prev => ({ ...prev, monthlyRevenue: totalRevenueAmount }));
          setLoadingMonthlyRevenue(false);
          
          // Count unique companies with orders today
          const companiesWithOrdersTodayCount = new Set(
            ordersData
              .filter(order => order.date && order.date.startsWith(today))
              .map(order => order.company_id)
          ).size;
          
          setStats(prev => ({ ...prev, companiesWithOrdersToday: companiesWithOrdersTodayCount }));
          setLoadingCompaniesOrders(false);
          
          // Find most popular dish
          const dishCounts: {[key: string]: number} = {};
          
          ordersData.forEach(order => {
            if (order.lunch_option && order.lunch_option.name) {
              const dishName = order.lunch_option.name;
              dishCounts[dishName] = (dishCounts[dishName] || 0) + 1;
            }
          });
          
          let mostPopularDishName = '';
          let maxCount = 0;
          
          Object.entries(dishCounts).forEach(([dish, count]) => {
            if (count > maxCount) {
              mostPopularDishName = dish;
              maxCount = count;
            }
          });
          
          if (mostPopularDishName) {
            setStats(prev => ({ 
              ...prev, 
              topOrderedMeal: { name: mostPopularDishName, count: maxCount }
            }));
          }
          setLoadingTopMeal(false);
          
          // Set total meals today (just use order count for now)
          setStats(prev => ({ ...prev, totalMealsToday: todaysOrderCount }));
          setLoadingMealsToday(false);
          
          // Set monthly orders
          setStats(prev => ({ ...prev, monthlyOrders: ordersData.length }));
          setLoadingMonthlyOrders(false);
          
          // Store filtered orders
          setStats(prev => ({ ...prev, filteredOrders: ordersData }));
        }
      } catch (err) {
        console.error('Error fetching order stats:', err);
        setError('Error fetching order stats. Please try again later.');
      }
    };
    
    fetchOrderStats();
  }, [user, companyIds]);

  return {
    ...stats,
    loadingOrdersToday,
    loadingMealsToday,
    loadingCompaniesOrders,
    loadingTopMeal,
    loadingPending,
    loadingMonthlyOrders,
    loadingMonthlyRevenue,
    error
  };
};
