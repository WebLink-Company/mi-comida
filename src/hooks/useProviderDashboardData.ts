
// This file contains the useProviderDashboardData hook that fetches dashboard data for the provider

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Order, Company } from '@/lib/types';

interface DashboardMetrics {
  todaysOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  companies: number;
  mostPopularDish: string;
  recentActivities: Array<{
    id: string;
    action: string;
    timestamp: string;
    userId?: string;
    username?: string;
  }>;
  chartData: {
    ordersTimeline: { name: string; orders: number }[];
    orderStatuses: { name: string; value: number }[];
    topDishes: { name: string; value: number }[];
  };
}

export const useProviderDashboardData = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todaysOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    companies: 0,
    mostPopularDish: '',
    recentActivities: [],
    chartData: {
      ordersTimeline: [],
      orderStatuses: [
        { name: 'Pendientes', value: 0 },
        { name: 'Aprobados', value: 0 },
        { name: 'Entregados', value: 0 },
        { name: 'Rechazados', value: 0 }
      ],
      topDishes: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [companyOrders, setCompanyOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);

  // Stats for the dashboard metrics component
  const [ordersToday, setOrdersToday] = useState<number>(0);
  const [loadingOrdersToday, setLoadingOrdersToday] = useState<boolean>(true);
  const [totalMealsToday, setTotalMealsToday] = useState<number>(0);
  const [loadingMealsToday, setLoadingMealsToday] = useState<boolean>(true);
  const [companiesWithOrdersToday, setCompaniesWithOrdersToday] = useState<number>(0);
  const [loadingCompaniesOrders, setLoadingCompaniesOrders] = useState<boolean>(true);
  const [topOrderedMeal, setTopOrderedMeal] = useState<{name: string, count: number} | null>(null);
  const [loadingTopMeal, setLoadingTopMeal] = useState<boolean>(true);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [loadingPending, setLoadingPending] = useState<boolean>(true);
  const [activeCompanies, setActiveCompanies] = useState<number>(0);
  const [loadingActiveCompanies, setLoadingActiveCompanies] = useState<boolean>(true);
  const [newUsers, setNewUsers] = useState<number>(0);
  const [loadingNewUsers, setLoadingNewUsers] = useState<boolean>(true);
  const [monthlyOrders, setMonthlyOrders] = useState<number>(0);
  const [loadingMonthlyOrders, setLoadingMonthlyOrders] = useState<boolean>(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [loadingMonthlyRevenue, setLoadingMonthlyRevenue] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get provider ID
        const providerId = user.provider_id;
        
        if (!providerId) {
          setError('No provider ID found');
          setLoading(false);
          return;
        }
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch companies associated with this provider
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('provider_id', providerId);
        
        if (companiesError) throw companiesError;
        
        setCompanies(companiesData || []);
        setActiveCompanies(companiesData?.length || 0);
        setLoadingActiveCompanies(false);
        
        const companyIds = companiesData?.map(c => c.id) || [];
        
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
          
          setOrdersToday(todaysOrderCount);
          setLoadingOrdersToday(false);
          
          // Count pending orders
          const pendingOrdersCount = ordersData.filter(order => 
            order.status === 'pending'
          ).length;
          
          setPendingOrders(pendingOrdersCount);
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
          
          setMonthlyRevenue(totalRevenueAmount);
          setLoadingMonthlyRevenue(false);
          
          // Count unique companies with orders today
          const companiesWithOrdersTodayCount = new Set(
            ordersData
              .filter(order => order.date && order.date.startsWith(today))
              .map(order => order.company_id)
          ).size;
          
          setCompaniesWithOrdersToday(companiesWithOrdersTodayCount);
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
          
          setTopOrderedMeal({ name: mostPopularDishName, count: maxCount });
          setLoadingTopMeal(false);
          
          // Set total meals today (just use order count for now)
          setTotalMealsToday(todaysOrderCount);
          setLoadingMealsToday(false);
          
          // Set monthly orders
          setMonthlyOrders(ordersData.length);
          setLoadingMonthlyOrders(false);
          
          // Set new users (mock data for now)
          setNewUsers(5);
          setLoadingNewUsers(false);
          
          // Generate chart data
          
          // Order timeline (last 7 days)
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
          }).reverse();
          
          const ordersTimeline = last7Days.map(date => {
            const count = ordersData.filter(order => 
              order.date && order.date.startsWith(date)
            ).length;
            
            // Format date as day name
            const dayName = new Date(date).toLocaleDateString('es-ES', { weekday: 'short' });
            
            return {
              name: dayName,
              orders: count
            };
          });
          
          // Order statuses
          const statusCounts = {
            pending: ordersData.filter(order => order.status === 'pending').length,
            approved: ordersData.filter(order => order.status === 'approved').length,
            delivered: ordersData.filter(order => order.status === 'delivered').length,
            rejected: ordersData.filter(order => order.status === 'rejected').length
          };
          
          const orderStatuses = [
            { name: 'Pendientes', value: statusCounts.pending },
            { name: 'Aprobados', value: statusCounts.approved },
            { name: 'Entregados', value: statusCounts.delivered },
            { name: 'Rechazados', value: statusCounts.rejected }
          ];
          
          // Top dishes
          const topDishes = Object.entries(dishCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
          
          // Create company order summaries
          const companyOrderSummaries = companyIds.map(companyId => {
            const companyName = companiesData?.find(c => c.id === companyId)?.name || 'Unknown';
            const companyOrders = ordersData.filter(o => o.company_id === companyId);
            const orderCount = companyOrders.length;
            const pendingCount = companyOrders.filter(o => o.status === 'pending').length;
            const dispatchedCount = companyOrders.filter(o => ['approved', 'delivered'].includes(o.status)).length;
            
            // Get unique users who placed orders
            const uniqueUsers = new Set(companyOrders.map(o => o.user_id)).size;
            
            return {
              id: companyId,
              name: companyName,
              orders: orderCount,
              users: uniqueUsers,
              pending: pendingCount,
              dispatched: dispatchedCount
            };
          }).filter(summary => summary.orders > 0);
          
          // Sort by pending orders (highest first)
          companyOrderSummaries.sort((a, b) => b.pending - a.pending);
          
          setCompanyOrders(companyOrderSummaries);
          setFilteredOrders(ordersData);
          
          // Update metrics
          setMetrics({
            todaysOrders: todaysOrderCount,
            pendingOrders: pendingOrdersCount,
            totalRevenue: totalRevenueAmount,
            companies: companiesWithOrdersTodayCount,
            mostPopularDish: mostPopularDishName,
            recentActivities: [], // Could be populated with actual activity data in the future
            chartData: {
              ordersTimeline,
              orderStatuses,
              topDishes
            }
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error fetching dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // Filter orders by date and company
  useEffect(() => {
    if (!filteredOrders.length) return;
    
    let filtered = [...filteredOrders];
    
    // Filter by date
    if (currentDate) {
      filtered = filtered.filter(order => 
        order.date && order.date.startsWith(currentDate)
      );
    }
    
    // Filter by company
    if (companyFilter) {
      filtered = filtered.filter(order => 
        order.company_id === companyFilter
      );
    }
    
    // For now, this effect is just set up for future filtering functionality
  }, [filteredOrders, currentDate, companyFilter]);

  return {
    metrics,
    loading,
    error,
    companyOrders,
    companies,
    setCurrentDate,
    setCompanyFilter,
    // Export the dashboard metrics
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
    activeCompanies,
    loadingActiveCompanies,
    newUsers,
    loadingNewUsers,
    monthlyOrders,
    loadingMonthlyOrders,
    monthlyRevenue,
    loadingMonthlyRevenue
  };
};
