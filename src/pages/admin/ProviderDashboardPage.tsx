
import React, { useEffect, useState } from 'react';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { PlusCircle, Users, Package, Receipt, 
  Calendar, ShoppingBag, Building, Award, 
  Clock, Briefcase, UserPlus, ListOrdered, DollarSign } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import '../styles/dashboard.css';

const ProviderDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  const firstDayOfMonth = new Date().toISOString().substring(0, 8) + '01';
  const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  
  // Quick actions for the provider
  const quickActions = [
    {
      label: 'Add Company',
      icon: Building,
      action: () => navigate('/admin/companies'),
      path: '/admin/companies'
    },
    {
      label: 'Add User',
      icon: UserPlus,
      action: () => navigate('/admin/users'),
      path: '/admin/users'
    },
    {
      label: 'View Orders',
      icon: Package,
      action: () => navigate('/admin/orders'),
      path: '/admin/orders'
    },
    {
      label: 'Review Invoices',
      icon: Receipt,
      action: () => navigate('/admin/invoices'),
      path: '/admin/invoices'
    }
  ];

  // Fetch all required provider metrics
  const { data: ordersToday, isLoading: loadingOrdersToday } = useQuery({
    queryKey: ['ordersToday', today, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('date', today)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  const { data: totalMealsToday, isLoading: loadingMealsToday } = useQuery({
    queryKey: ['mealsToday', today, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('date', today)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0; // In a real app, this would count the quantity in each order
    },
    enabled: !!user?.id
  });

  const { data: companiesWithOrdersToday, isLoading: loadingCompaniesOrders } = useQuery({
    queryKey: ['companiesOrdersToday', today, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('company_id')
        .eq('date', today)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      
      // Count unique companies
      const uniqueCompanies = new Set(data?.map(order => order.company_id) || []);
      return uniqueCompanies.size;
    },
    enabled: !!user?.id
  });

  interface TopMealResult {
    name: string;
    count: number;
  }

  const { data: topOrderedMeal, isLoading: loadingTopMeal } = useQuery<TopMealResult, Error>({
    queryKey: ['topMeal', today, user?.id],
    queryFn: async () => {
      // This is a simplified query - in a real app you'd use a more complex query with joins and group by
      const { data, error } = await supabase
        .from('orders')
        .select('lunch_option_id')
        .eq('date', today)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      
      if (!data || data.length === 0) return { name: 'No orders', count: 0 };
      
      // Count occurrences of each lunch option
      const counts: Record<string, number> = {};
      data.forEach(order => {
        counts[order.lunch_option_id] = (counts[order.lunch_option_id] || 0) + 1;
      });
      
      // Find the most frequent option
      let maxId = '';
      let maxCount = 0;
      Object.entries(counts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxId = id;
          maxCount = count;
        }
      });
      
      // Get the name of the top option
      if (maxId) {
        const { data: lunchData } = await supabase
          .from('lunch_options')
          .select('name')
          .eq('id', maxId)
          .maybeSingle();
          
        return { name: lunchData?.name || 'Unknown', count: maxCount };
      }
      
      return { name: 'No orders', count: 0 };
    },
    enabled: !!user?.id
  });

  const { data: pendingOrders, isLoading: loadingPending } = useQuery({
    queryKey: ['pendingOrders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  const { data: activeCompanies, isLoading: loadingActiveCompanies } = useQuery({
    queryKey: ['activeCompanies', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  const { data: newUsers, isLoading: loadingNewUsers } = useQuery({
    queryKey: ['newUsers', sevenDaysAgo, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('created_at', sevenDaysAgo)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  const { data: monthlyOrders, isLoading: loadingMonthlyOrders } = useQuery({
    queryKey: ['monthlyOrders', firstDayOfMonth, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .gte('date', firstDayOfMonth)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id
  });

  const { data: monthlyRevenue, isLoading: loadingMonthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue', firstDayOfMonth, user?.id],
    queryFn: async () => {
      // In a real app, this would calculate the actual revenue from orders
      const { data, error } = await supabase
        .from('orders')
        .select('lunch_option_id')
        .gte('date', firstDayOfMonth)
        .eq('provider_id', user?.id || '');
        
      if (error) throw error;
      
      // For demo purposes, let's assume each order is worth $10
      return (data?.length || 0) * 10;
    },
    enabled: !!user?.id
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Glass effect notification */}
      <div className="mb-8 p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white">
        <ClockDisplay user={user} quickActions={quickActions} />
      </div>

      <h2 className="text-2xl font-semibold text-white mb-6 fade-up" style={{ animationDelay: "0.1s" }}>Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Orders Today */}
        <StatCard
          title="Orders Today"
          value={loadingOrdersToday ? "Loading..." : ordersToday}
          icon={<Calendar className="h-6 w-6" />}
          className="bg-white/10 border-blue-400/20 border text-white backdrop-blur-md"
          loading={loadingOrdersToday}
          linkTo="/admin/orders"
          lastUpdated="just now"
        />
        
        {/* Total Meals Today */}
        <StatCard
          title="Total Meals Today"
          value={loadingMealsToday ? "Loading..." : totalMealsToday}
          icon={<ShoppingBag className="h-6 w-6" />}
          className="bg-white/10 border-green-400/20 border text-white backdrop-blur-md"
          loading={loadingMealsToday}
          linkTo="/admin/orders"
          lastUpdated="just now"
        />
        
        {/* Companies with Orders Today */}
        <StatCard
          title="Companies Ordering Today"
          value={loadingCompaniesOrders ? "Loading..." : companiesWithOrdersToday}
          icon={<Building className="h-6 w-6" />}
          className="bg-white/10 border-yellow-400/20 border text-white backdrop-blur-md"
          loading={loadingCompaniesOrders}
          linkTo="/admin/companies"
          lastUpdated="just now"
        />
        
        {/* Top Ordered Meal Today */}
        <StatCard
          title="Top Ordered Meal Today"
          value={loadingTopMeal ? "Loading..." : `${topOrderedMeal?.name} x${topOrderedMeal?.count}`}
          icon={<Award className="h-6 w-6" />}
          className="bg-white/10 border-purple-400/20 border text-white backdrop-blur-md"
          loading={loadingTopMeal}
          linkTo="/admin/menu"
          lastUpdated="just now"
        />
        
        {/* Pending Orders */}
        <StatCard
          title="Pending Orders"
          value={loadingPending ? "Loading..." : pendingOrders}
          icon={<Clock className="h-6 w-6" />}
          className="bg-white/10 border-red-400/20 border text-white backdrop-blur-md"
          loading={loadingPending}
          linkTo="/admin/orders?status=pending"
          lastUpdated="just now"
        />
        
        {/* Active Companies Total */}
        <StatCard
          title="Active Companies"
          value={loadingActiveCompanies ? "Loading..." : activeCompanies}
          icon={<Briefcase className="h-6 w-6" />}
          className="bg-white/10 border-orange-400/20 border text-white backdrop-blur-md"
          loading={loadingActiveCompanies}
          linkTo="/admin/companies"
          lastUpdated="just now"
        />
        
        {/* New Users This Week */}
        <StatCard
          title="New Users This Week"
          value={loadingNewUsers ? "Loading..." : newUsers}
          icon={<UserPlus className="h-6 w-6" />}
          className="bg-white/10 border-amber-400/20 border text-white backdrop-blur-md"
          loading={loadingNewUsers}
          linkTo="/admin/users?filter=new"
          lastUpdated="just now"
        />
        
        {/* Monthly Orders Total */}
        <StatCard
          title="Monthly Orders Total"
          value={loadingMonthlyOrders ? "Loading..." : monthlyOrders}
          icon={<ListOrdered className="h-6 w-6" />}
          className="bg-white/10 border-blue-400/20 border text-white backdrop-blur-md"
          loading={loadingMonthlyOrders}
          linkTo="/admin/orders"
          lastUpdated="just now"
        />
        
        {/* Total Revenue This Month */}
        <StatCard
          title="Total Revenue This Month"
          value={loadingMonthlyRevenue ? "Loading..." : `$${monthlyRevenue}`}
          icon={<DollarSign className="h-6 w-6" />}
          className="bg-white/10 border-green-400/20 border text-white backdrop-blur-md"
          loading={loadingMonthlyRevenue}
          linkTo="/admin/invoices"
          lastUpdated="just now"
        />
      </div>
    </div>
  );
};

export default ProviderDashboardPage;
