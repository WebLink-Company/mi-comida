
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  ShoppingBag, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Clock, 
  Globe, 
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalProviders: 0,
    totalOrders: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    avgOrdersPerProvider: 0,
    inactiveProviders: 0,
    providersWithNoCompanies: 0,
    pendingInvoices: 0,
    billingThisMonth: 0,
    mostActiveProvider: 'N/A',
    topCompanyByConsumption: 'N/A'
  });

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Fetch company count
      const { count: companyCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      // Fetch provider count
      const { count: providerCount } = await supabase
        .from('providers')
        .select('*', { count: 'exact', head: true });
      
      // Fetch order count
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      // This is mock data - in a real app, you would calculate these properly
      setStats({
        totalUsers: userCount || 0,
        totalCompanies: companyCount || 0,
        totalProviders: providerCount || 0,
        totalOrders: orderCount || 0,
        ordersToday: Math.floor(Math.random() * 50),
        ordersThisWeek: Math.floor(Math.random() * 250),
        avgOrdersPerProvider: Math.floor(Math.random() * 15),
        inactiveProviders: Math.floor(Math.random() * 5),
        providersWithNoCompanies: Math.floor(Math.random() * 3),
        pendingInvoices: Math.floor(Math.random() * 10),
        billingThisMonth: Math.floor(Math.random() * 10000),
        mostActiveProvider: 'Foodie Delights',
        topCompanyByConsumption: 'Acme Corp'
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    return user?.first_name || 'Admin';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col pb-8" 
         style={{
           backgroundImage: `url('/win11-background.svg')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      {/* Windows 11 style clock and date */}
      <div className="win11-clock-container flex-grow flex flex-col items-center justify-center">
        <div className="win11-clock fade-up">{format(time, 'h:mm')}</div>
        <div className="win11-date fade-up">{format(time, 'EEEE, MMMM d')}</div>
        
        {/* Subtle greeting text */}
        <div className="mt-4 text-white/80 text-lg font-light fade-up">
          {getGreeting()}, {getFirstName()} 👋
        </div>
      </div>

      {/* Windows 11 style widgets at bottom */}
      <div className="win11-widget-container p-4">
        {/* Platform Overview Widget */}
        <div className="win11-widget fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="win11-widget-header">
            <div className="win11-widget-title">Platform Overview</div>
            <Globe size={16} className="text-white/80" />
          </div>
          <div className="win11-widget-content">
            <div className="grid grid-cols-2 gap-y-2 mt-2">
              <div className="text-xs">Users</div>
              <div className="text-xs font-medium text-right">{formatNumber(stats.totalUsers)}</div>
              
              <div className="text-xs">Companies</div>
              <div className="text-xs font-medium text-right">{formatNumber(stats.totalCompanies)}</div>
              
              <div className="text-xs">Providers</div>
              <div className="text-xs font-medium text-right">{formatNumber(stats.totalProviders)}</div>
              
              <div className="text-xs">Total Orders</div>
              <div className="text-xs font-medium text-right">{formatNumber(stats.totalOrders)}</div>
            </div>
            <Button variant="link" size="sm" className="w-full mt-2 text-white/90 p-0 justify-end hover:text-white">
              View Details <ChevronRight size={14} />
            </Button>
          </div>
        </div>

        {/* Provider Performance Widget */}
        <div className="win11-widget fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="win11-widget-header">
            <div className="win11-widget-title">Provider Performance</div>
            <Building size={16} className="text-white/80" />
          </div>
          <div className="win11-widget-content">
            <div className="grid grid-cols-2 gap-y-2 mt-2">
              <div className="text-xs">Most Active</div>
              <div className="text-xs font-medium text-right">{stats.mostActiveProvider}</div>
              
              <div className="text-xs">Inactive Providers</div>
              <div className="text-xs font-medium text-right">{stats.inactiveProviders}</div>
              
              <div className="text-xs">Without Companies</div>
              <div className="text-xs font-medium text-right">{stats.providersWithNoCompanies}</div>
            </div>
            <Button variant="link" size="sm" className="w-full mt-2 text-white/90 p-0 justify-end hover:text-white">
              View Details <ChevronRight size={14} />
            </Button>
          </div>
        </div>

        {/* Order Metrics Widget */}
        <div className="win11-widget fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="win11-widget-header">
            <div className="win11-widget-title">Order Metrics</div>
            <ShoppingBag size={16} className="text-white/80" />
          </div>
          <div className="win11-widget-content">
            <div className="grid grid-cols-2 gap-y-2 mt-2">
              <div className="text-xs">Orders Today</div>
              <div className="text-xs font-medium text-right">{stats.ordersToday}</div>
              
              <div className="text-xs">Orders This Week</div>
              <div className="text-xs font-medium text-right">{stats.ordersThisWeek}</div>
              
              <div className="text-xs">Avg per Provider</div>
              <div className="text-xs font-medium text-right">{stats.avgOrdersPerProvider}</div>
            </div>
            <Button variant="link" size="sm" className="w-full mt-2 text-white/90 p-0 justify-end hover:text-white">
              View Details <ChevronRight size={14} />
            </Button>
          </div>
        </div>

        {/* Finance Insights Widget */}
        <div className="win11-widget fade-up" style={{ animationDelay: "0.4s" }}>
          <div className="win11-widget-header">
            <div className="win11-widget-title">Finance Insights</div>
            <DollarSign size={16} className="text-white/80" />
          </div>
          <div className="win11-widget-content">
            <div className="grid grid-cols-2 gap-y-2 mt-2">
              <div className="text-xs">Billing This Month</div>
              <div className="text-xs font-medium text-right">${formatNumber(stats.billingThisMonth)}</div>
              
              <div className="text-xs">Pending Invoices</div>
              <div className="text-xs font-medium text-right">{stats.pendingInvoices}</div>
              
              <div className="text-xs">Top Consumer</div>
              <div className="text-xs font-medium text-right">{stats.topCompanyByConsumption}</div>
            </div>
            <Button variant="link" size="sm" className="w-full mt-2 text-white/90 p-0 justify-end hover:text-white">
              View Details <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
