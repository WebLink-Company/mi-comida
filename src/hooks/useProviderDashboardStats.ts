
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Mock data and API calls would be replaced with real API calls
const fetchOrdersToday = async () => Promise.resolve({ count: 24 });
const fetchMealsToday = async () => Promise.resolve({ count: 72 });
const fetchCompaniesWithOrders = async () => Promise.resolve({ count: 5 });
const fetchPendingOrders = async () => Promise.resolve({ count: 8 });
const fetchActiveCompanies = async () => Promise.resolve({ count: 12 });
const fetchNewUsers = async () => Promise.resolve({ count: 7 });
const fetchMonthlyOrders = async () => Promise.resolve({ count: 342 });
const fetchMonthlyRevenue = async () => Promise.resolve({ amount: 12750.50 });
const fetchTopOrderedMeal = async () => Promise.resolve({ name: "Vegetarian Bowl", count: 34 });

// Simplified interface for the top meal
interface TopMeal {
  name: string;
  count: number;
}

export const useProviderDashboardStats = () => {
  // Query for orders today
  const { data: ordersToday, isLoading: loadingOrdersToday } = useQuery({
    queryKey: ['ordersToday'],
    queryFn: fetchOrdersToday,
  });

  // Query for total meals today
  const { data: totalMealsToday, isLoading: loadingMealsToday } = useQuery({
    queryKey: ['mealsToday'],
    queryFn: fetchMealsToday,
  });

  // Query for companies with orders today
  const { data: companiesWithOrdersToday, isLoading: loadingCompaniesOrders } = useQuery({
    queryKey: ['companiesWithOrders'],
    queryFn: fetchCompaniesWithOrders,
  });

  // Query for pending orders
  const { data: pendingOrders, isLoading: loadingPending } = useQuery({
    queryKey: ['pendingOrders'],
    queryFn: fetchPendingOrders,
  });

  // Query for active companies
  const { data: activeCompanies, isLoading: loadingActiveCompanies } = useQuery({
    queryKey: ['activeCompanies'],
    queryFn: fetchActiveCompanies,
  });

  // Query for new users
  const { data: newUsers, isLoading: loadingNewUsers } = useQuery({
    queryKey: ['newUsers'],
    queryFn: fetchNewUsers,
  });

  // Query for monthly orders
  const { data: monthlyOrders, isLoading: loadingMonthlyOrders } = useQuery({
    queryKey: ['monthlyOrders'],
    queryFn: fetchMonthlyOrders,
  });

  // Query for monthly revenue
  const { data: monthlyRevenue, isLoading: loadingMonthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: fetchMonthlyRevenue,
  });

  // Query for top ordered meal - explicitly typed
  const { data: topOrderedMeal, isLoading: loadingTopMeal } = useQuery<TopMeal>({
    queryKey: ['topOrderedMeal'],
    queryFn: fetchTopOrderedMeal,
  });

  // Return everything needed by the dashboard
  return {
    ordersToday: ordersToday?.count,
    loadingOrdersToday,
    totalMealsToday: totalMealsToday?.count,
    loadingMealsToday,
    companiesWithOrdersToday: companiesWithOrdersToday?.count,
    loadingCompaniesOrders,
    topOrderedMeal: topOrderedMeal?.name,
    loadingTopMeal,
    pendingOrders: pendingOrders?.count,
    loadingPending,
    activeCompanies: activeCompanies?.count,
    loadingActiveCompanies,
    newUsers: newUsers?.count,
    loadingNewUsers,
    monthlyOrders: monthlyOrders?.count,
    loadingMonthlyOrders,
    monthlyRevenue: monthlyRevenue?.amount,
    loadingMonthlyRevenue,
  };
};
