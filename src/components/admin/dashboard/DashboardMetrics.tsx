
import React from 'react';
import StatCard from '@/components/admin/StatCard';
import { 
  Calendar, ShoppingBag, Building, Award, 
  Clock, Briefcase, UserPlus, ListOrdered, DollarSign 
} from 'lucide-react';
import { TopMeal } from '@/hooks/useProviderDashboardStats';

interface DashboardMetricsProps {
  ordersToday: number | undefined;
  loadingOrdersToday: boolean;
  totalMealsToday: number | undefined;
  loadingMealsToday: boolean;
  companiesWithOrdersToday: number | undefined;
  loadingCompaniesOrders: boolean;
  topOrderedMeal: TopMeal | undefined;
  loadingTopMeal: boolean;
  pendingOrders: number | undefined;
  loadingPending: boolean;
  activeCompanies: number | undefined;
  loadingActiveCompanies: boolean;
  newUsers: number | undefined;
  loadingNewUsers: boolean;
  monthlyOrders: number | undefined;
  loadingMonthlyOrders: boolean;
  monthlyRevenue: number | undefined;
  loadingMonthlyRevenue: boolean;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
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
}) => {
  const formatTopMeal = (meal: TopMeal | undefined): string => {
    if (!meal) return 'No data yet';
    return meal.name;
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Helper to ensure 0 values display as "0" rather than empty
  const formatNumber = (value: number | undefined): string => {
    if (value === 0) return "0";
    if (!value) return "0";
    return value.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {/* Orders Today */}
      <StatCard
        title="Orders Today"
        value={formatNumber(ordersToday)}
        icon={<Calendar className="h-6 w-6" />}
        className="bg-white/10 border-blue-400/20 border text-white backdrop-blur-md"
        loading={loadingOrdersToday}
        linkTo="/provider/orders"
      />
      
      {/* Total Meals Today */}
      <StatCard
        title="Total Meals Today"
        value={formatNumber(totalMealsToday)}
        icon={<ShoppingBag className="h-6 w-6" />}
        className="bg-white/10 border-green-400/20 border text-white backdrop-blur-md"
        loading={loadingMealsToday}
        linkTo="/provider/orders"
      />
      
      {/* Companies with Orders Today */}
      <StatCard
        title="Companies Ordering Today"
        value={formatNumber(companiesWithOrdersToday)}
        icon={<Building className="h-6 w-6" />}
        className="bg-white/10 border-yellow-400/20 border text-white backdrop-blur-md"
        loading={loadingCompaniesOrders}
        linkTo="/provider/companies"
      />
      
      {/* Top Ordered Meal Today */}
      <StatCard
        title="Top Ordered Meal Today"
        value={loadingTopMeal ? "Loading..." : formatTopMeal(topOrderedMeal)}
        icon={<Award className="h-6 w-6" />}
        className="bg-white/10 border-purple-400/20 border text-white backdrop-blur-md"
        loading={loadingTopMeal}
        linkTo="/provider/menu"
      />
      
      {/* Pending Orders */}
      <StatCard
        title="Pending Orders"
        value={formatNumber(pendingOrders)}
        icon={<Clock className="h-6 w-6" />}
        className="bg-white/10 border-red-400/20 border text-white backdrop-blur-md"
        loading={loadingPending}
        linkTo="/provider/orders?status=pending"
      />
      
      {/* Active Companies Total */}
      <StatCard
        title="Active Companies"
        value={formatNumber(activeCompanies)}
        icon={<Briefcase className="h-6 w-6" />}
        className="bg-white/10 border-orange-400/20 border text-white backdrop-blur-md"
        loading={loadingActiveCompanies}
        linkTo="/provider/companies"
      />
      
      {/* New Users This Week */}
      <StatCard
        title="New Users This Week"
        value={formatNumber(newUsers)}
        icon={<UserPlus className="h-6 w-6" />}
        className="bg-white/10 border-amber-400/20 border text-white backdrop-blur-md"
        loading={loadingNewUsers}
        linkTo="/provider/users?filter=new"
      />
      
      {/* Monthly Orders Total */}
      <StatCard
        title="Monthly Orders Total"
        value={formatNumber(monthlyOrders)}
        icon={<ListOrdered className="h-6 w-6" />}
        className="bg-white/10 border-blue-400/20 border text-white backdrop-blur-md"
        loading={loadingMonthlyOrders}
        linkTo="/provider/orders"
      />
      
      {/* Total Revenue This Month */}
      <StatCard
        title="Total Revenue This Month"
        value={monthlyRevenue === 0 ? "$0.00" : formatCurrency(monthlyRevenue)}
        icon={<DollarSign className="h-6 w-6" />}
        className="bg-white/10 border-green-400/20 border text-white backdrop-blur-md"
        loading={loadingMonthlyRevenue}
        linkTo="/provider/invoices"
      />
    </div>
  );
};

export default DashboardMetrics;
