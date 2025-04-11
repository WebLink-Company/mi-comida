
// This file contains the useProviderDashboardData hook that fetches dashboard data for the provider

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Order, CompanyType } from '@/lib/types';

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
  const [companies, setCompanies] = useState<CompanyType[]>([]);

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
          const todaysOrders = ordersData.filter(order => 
            order.date && order.date.startsWith(today)
          ).length;
          
          // Count pending orders
          const pendingOrders = ordersData.filter(order => 
            order.status === 'pending'
          ).length;
          
          // Calculate total revenue (delivered + approved orders)
          const revenueOrders = ordersData.filter(order => 
            ['delivered', 'approved'].includes(order.status)
          );
          
          const totalRevenue = revenueOrders.reduce((sum, order) => {
            // Safely convert to number then add
            const orderTotal = typeof order.total === 'number' ? 
              order.total : 
              (typeof order.total === 'string' ? parseFloat(order.total) : 0);
            
            return sum + orderTotal;
          }, 0);
          
          // Count unique companies
          const uniqueCompanies = new Set(ordersData.map(order => order.company_id)).size;
          
          // Find most popular dish
          const dishCounts = ordersData.reduce((acc: {[key: string]: number}, order) => {
            if (order.lunch_option && order.lunch_option.name) {
              const dishName = order.lunch_option.name;
              acc[dishName] = (acc[dishName] || 0) + 1;
            }
            return acc;
          }, {});
          
          let mostPopularDish = '';
          let maxCount = 0;
          
          Object.entries(dishCounts).forEach(([dish, count]) => {
            if (count > maxCount) {
              mostPopularDish = dish;
              maxCount = count;
            }
          });
          
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
            .map(([name, value]) => ({ name, value: Number(value) }));
          
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
            todaysOrders,
            pendingOrders,
            totalRevenue,
            companies: uniqueCompanies,
            mostPopularDish,
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
    setCompanyFilter
  };
};
