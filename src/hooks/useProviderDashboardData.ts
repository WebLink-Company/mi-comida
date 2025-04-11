
import { useState, useEffect } from 'react';
import { useProviderCompanies } from './provider/useProviderCompanies';
import { useProviderOrderStats } from './provider/useProviderOrderStats';
import { useProviderUserStats } from './provider/useProviderUserStats';
import { useCompanyOrdersSummary } from './provider/useCompanyOrdersSummary';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';

export const useProviderDashboardData = () => {
  // State for connection status
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Ensure Supabase connection is valid before proceeding
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setConnectionError('Missing Supabase configuration. Please check your environment variables.');
    } else {
      setConnectionError(null);
    }
  }, []);

  // Get companies for current provider
  const { 
    companies, 
    activeCompanies, 
    loading: loadingCompanies,
    error: companiesError 
  } = useProviderCompanies();
  
  // Get company IDs for other hooks
  const companyIds = companies?.map(company => company.id) || [];
  
  // Get order statistics
  const {
    ordersToday,
    totalMealsToday,
    companiesWithOrdersToday,
    pendingOrders,
    monthlyOrders,
    monthlyRevenue,
    topOrderedMeal,
    filteredOrders,
    loadingOrdersToday,
    loadingMealsToday,
    loadingCompaniesOrders,
    loadingTopMeal,
    loadingPending,
    loadingMonthlyOrders,
    loadingMonthlyRevenue,
    error: orderStatsError
  } = useProviderOrderStats(companyIds);
  
  // Get user statistics
  const {
    newUsers,
    loadingNewUsers,
    error: userStatsError
  } = useProviderUserStats();
  
  // Get company order summaries
  const {
    companyOrders,
    loading: loadingCompanyOrders,
    error: companyOrdersError
  } = useCompanyOrdersSummary(companyIds);
  
  // State for current filters
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  
  // Combine all errors
  const error = connectionError || companiesError || orderStatsError || userStatsError || companyOrdersError;
  
  // Loading state for the overall hook
  const loading = loadingCompanies || 
    (loadingOrdersToday && loadingMealsToday && loadingCompaniesOrders && loadingTopMeal);

  return {
    // Connection status
    connectionError,
    
    // Companies data
    companies,
    activeCompanies,
    loadingActiveCompanies: loadingCompanies,
    
    // Order statistics
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
    
    // User statistics
    newUsers,
    loadingNewUsers,
    
    // Company orders
    companyOrders,
    
    // Filters
    currentDate,
    setCurrentDate,
    companyFilter,
    setCompanyFilter,
    
    // Status
    loading,
    error,
    
    // Original metrics format for backward compatibility
    metrics: {
      todaysOrders: ordersToday,
      pendingOrders: pendingOrders,
      totalRevenue: monthlyRevenue,
      companies: activeCompanies,
      mostPopularDish: topOrderedMeal?.name || '',
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
    }
  };
};
