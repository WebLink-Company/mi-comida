
import React from 'react';
import StatCard from '@/components/admin/StatCard';
import { 
  Calendar, ShoppingBag, Building, Award, 
  Clock, Briefcase, UserPlus, ListOrdered, DollarSign 
} from 'lucide-react';
import { TopMealResult } from '@/hooks/useProviderDashboardStats';

interface DashboardMetricsProps {
  ordersToday: number | undefined;
  loadingOrdersToday: boolean;
  totalMealsToday: number | undefined;
  loadingMealsToday: boolean;
  companiesWithOrdersToday: number | undefined;
  loadingCompaniesOrders: boolean;
  topOrderedMeal: TopMealResult | undefined;
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
  const formatTopMeal = (meal: TopMealResult | undefined): string => {
    if (!meal) return 'No data';
    return `${meal.name}${meal.count > 0 ? ` x${meal.count}` : ''}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Orders Today */}
      <StatCard
        title="Orders Today"
        value={ordersToday}
        icon={<Calendar className="h-6 w-6" />}
        className="bg-white/10 border-blue-400/20 border text-white backdrop-blur-md"
        loading={loadingOrdersToday}
        linkTo="/admin/orders"
        lastUpdated="just now"
      />
      
      {/* Total Meals Today */}
      <StatCard
        title="Total Meals Today"
        value={totalMealsToday}
        icon={<ShoppingBag className="h-6 w-6" />}
        className="bg-white/10 border-green-400/20 border text-white backdrop-blur-md"
        loading={loadingMealsToday}
        linkTo="/admin/orders"
        lastUpdated="just now"
      />
      
      {/* Companies with Orders Today */}
      <StatCard
        title="Companies Ordering Today"
        value={companiesWithOrdersToday}
        icon={<Building className="h-6 w-6" />}
        className="bg-white/10 border-yellow-400/20 border text-white backdrop-blur-md"
        loading={loadingCompaniesOrders}
        linkTo="/admin/companies"
        lastUpdated="just now"
      />
      
      {/* Top Ordered Meal Today */}
      <StatCard
        title="Top Ordered Meal Today"
        value={loadingTopMeal ? "Loading..." : formatTopMeal(topOrderedMeal)}
        icon={<Award className="h-6 w-6" />}
        className="bg-white/10 border-purple-400/20 border text-white backdrop-blur-md"
        loading={loadingTopMeal}
        linkTo="/admin/menu"
        lastUpdated="just now"
      />
      
      {/* Pending Orders */}
      <StatCard
        title="Pending Orders"
        value={pendingOrders}
        icon={<Clock className="h-6 w-6" />}
        className="bg-white/10 border-red-400/20 border text-white backdrop-blur-md"
        loading={loadingPending}
        linkTo="/admin/orders?status=pending"
        lastUpdated="just now"
      />
      
      {/* Active Companies Total */}
      <StatCard
        title="Active Companies"
        value={activeCompanies}
        icon={<Briefcase className="h-6 w-6" />}
        className="bg-white/10 border-orange-400/20 border text-white backdrop-blur-md"
        loading={loadingActiveCompanies}
        linkTo="/admin/companies"
        lastUpdated="just now"
      />
      
      {/* New Users This Week */}
      <StatCard
        title="New Users This Week"
        value={newUsers}
        icon={<UserPlus className="h-6 w-6" />}
        className="bg-white/10 border-amber-400/20 border text-white backdrop-blur-md"
        loading={loadingNewUsers}
        linkTo="/admin/users?filter=new"
        lastUpdated="just now"
      />
      
      {/* Monthly Orders Total */}
      <StatCard
        title="Monthly Orders Total"
        value={monthlyOrders}
        icon={<ListOrdered className="h-6 w-6" />}
        className="bg-white/10 border-blue-400/20 border text-white backdrop-blur-md"
        loading={loadingMonthlyOrders}
        linkTo="/admin/orders"
        lastUpdated="just now"
      />
      
      {/* Total Revenue This Month */}
      <StatCard
        title="Total Revenue This Month"
        value={monthlyRevenue}
        icon={<DollarSign className="h-6 w-6" />}
        className="bg-white/10 border-green-400/20 border text-white backdrop-blur-md"
        loading={loadingMonthlyRevenue}
        linkTo="/admin/invoices"
        lastUpdated="just now"
      />
    </div>
  );
};

export default DashboardMetrics;
