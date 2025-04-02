
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building, ShoppingBag, FileText, TrendingUp, AlertTriangle, Calendar, DollarSign, Clock, Globe, ChevronRight, ExternalLink, X, ChefHat } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [time, setTime] = useState(new Date());
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const {
        count: userCount
      } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
      });

      const {
        count: companyCount
      } = await supabase.from('companies').select('*', {
        count: 'exact',
        head: true
      });

      const {
        count: providerCount
      } = await supabase.from('providers').select('*', {
        count: 'exact',
        head: true
      });

      const {
        count: orderCount
      } = await supabase.from('orders').select('*', {
        count: 'exact',
        head: true
      });

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

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const openDialog = (dialogId: string) => {
    setActiveDialog(dialogId);
  };

  // Quick action badges data
  const quickActions = [
    { label: 'Add New User', icon: Users, action: () => navigateTo('/admin/users') },
    { label: 'Create Company', icon: Building, action: () => navigateTo('/admin/companies') },
    { label: 'Add Provider', icon: ChefHat, action: () => navigateTo('/admin/providers') },
    { label: 'View Orders', icon: ShoppingBag, action: () => navigateTo('/admin/reports') },
    { label: 'Review Invoices', icon: DollarSign, action: () => navigateTo('/admin/reports') },
  ];

  const renderDialogContent = () => {
    switch (activeDialog) {
      case 'platform-overview':
        return <>
            <DialogHeader>
              <DialogTitle>Platform Overview</DialogTitle>
              <DialogDescription>Detailed statistics about platform usage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Total Users</h3>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</p>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Total Companies</h3>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalCompanies)}</p>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Total Providers</h3>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalProviders)}</p>
                  <p className="text-xs text-muted-foreground">+3% from last month</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Total Orders</h3>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</p>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigateTo('/admin/reports')}>View Full Reports</Button>
            </div>
          </>;
      case 'provider-performance':
        return <>
            <DialogHeader>
              <DialogTitle>Provider Performance</DialogTitle>
              <DialogDescription>Analytics for service providers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Top Performers</h3>
                <ul className="space-y-2">
                  <li className="p-3 bg-white/10 rounded-lg flex justify-between">
                    <span>{stats.mostActiveProvider}</span>
                    <span className="text-green-400">98% satisfaction</span>
                  </li>
                  <li className="p-3 bg-white/10 rounded-lg flex justify-between">
                    <span>Quick Bites</span>
                    <span className="text-green-400">95% satisfaction</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Needs Attention</h3>
                <ul className="space-y-2">
                  <li className="p-3 bg-white/10 rounded-lg flex justify-between">
                    <span>Inactive Providers</span>
                    <span className="text-amber-400">{stats.inactiveProviders} providers</span>
                  </li>
                  <li className="p-3 bg-white/10 rounded-lg flex justify-between">
                    <span>Without Companies</span>
                    <span className="text-red-400">{stats.providersWithNoCompanies} providers</span>
                  </li>
                </ul>
              </div>
              <Button className="w-full" onClick={() => navigateTo('/admin/providers')}>Manage Providers</Button>
            </div>
          </>;
      case 'order-metrics':
        return <>
            <DialogHeader>
              <DialogTitle>Order Metrics</DialogTitle>
              <DialogDescription>Detailed order statistics</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Today</h3>
                  <p className="text-2xl font-bold">{stats.ordersToday}</p>
                  <p className="text-xs text-muted-foreground">orders placed</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">This Week</h3>
                  <p className="text-2xl font-bold">{stats.ordersThisWeek}</p>
                  <p className="text-xs text-muted-foreground">orders placed</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">By Provider</h3>
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="mb-1">Average orders per provider</p>
                  <p className="text-xl font-bold">{stats.avgOrdersPerProvider}</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigateTo('/admin/reports')}>View Order Reports</Button>
            </div>
          </>;
      case 'finance-insights':
        return <>
            <DialogHeader>
              <DialogTitle>Finance Insights</DialogTitle>
              <DialogDescription>Financial statistics and metrics</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">This Month</h3>
                  <p className="text-2xl font-bold">${formatNumber(stats.billingThisMonth)}</p>
                  <p className="text-xs text-muted-foreground">total billing</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Pending</h3>
                  <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
                  <p className="text-xs text-muted-foreground">invoices</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Top Consumers</h3>
                <div className="p-3 bg-white/10 rounded-lg flex justify-between">
                  <span>{stats.topCompanyByConsumption}</span>
                  <span className="text-primary">${formatNumber(Math.floor(stats.billingThisMonth * 0.3))}</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigateTo('/admin/reports')}>Financial Reports</Button>
            </div>
          </>;
      default:
        return null;
    }
  };

  return <div style={{
    backgroundImage: `url('/win11-background.svg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }} className="">
      <div className="win11-clock-container flex-grow flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-white/90 text-2xl font-light mb-1 fade-up">{getFirstName()}</h1>
          <div className="win11-clock fade-up">{format(time, 'h:mm')}</div>
          <div className="win11-date fade-up">{format(time, 'EEEE, MMMM d')}</div>
          
          <div className="mt-4 text-white/80 text-lg font-light fade-up">
            {getGreeting()}, {getFirstName()} 👋
          </div>
          <div className="mt-2 text-white/60 text-base font-light fade-up">
            What would you like to work on today?
          </div>

          {/* Quick action badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6 fade-up" style={{ animationDelay: "0.5s" }}>
            {quickActions.map((action, index) => (
              <Badge 
                key={index}
                variant="default"
                onClick={action.action}
                className="py-2 px-4 cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <action.icon size={16} />
                {action.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto mt-auto p-4">
        <div className="rounded-xl backdrop-blur-md border border-white/20 p-4 fade-up hover:shadow-lg transition-all duration-300 cursor-pointer" 
            style={{ animationDelay: "0.1s" }} 
            onClick={() => navigateTo('/admin/users')}>
          <div className="flex justify-between items-center">
            <div className="text-white font-medium">Platform Overview</div>
            <div className="flex gap-2">
              <button onClick={e => {
                e.stopPropagation();
                openDialog('platform-overview');
              }} className="text-white/70 hover:text-white">
                <ExternalLink size={16} />
              </button>
              <Globe size={16} className="text-white/80" />
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-sm text-white/80">Users</div>
              <div className="text-sm font-medium text-right text-white">{formatNumber(stats.totalUsers)}</div>
              
              <div className="text-sm text-white/80">Companies</div>
              <div className="text-sm font-medium text-right text-white">{formatNumber(stats.totalCompanies)}</div>
              
              <div className="text-sm text-white/80">Providers</div>
              <div className="text-sm font-medium text-right text-white">{formatNumber(stats.totalProviders)}</div>
              
              <div className="text-sm text-white/80">Total Orders</div>
              <div className="text-sm font-medium text-right text-white">{formatNumber(stats.totalOrders)}</div>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="link" size="sm" className="text-white p-0 hover:text-white/80">
                View Details <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl backdrop-blur-md border border-white/20 p-4 fade-up hover:shadow-lg transition-all duration-300 cursor-pointer" 
            style={{ animationDelay: "0.2s" }} 
            onClick={() => navigateTo('/admin/providers')}>
          <div className="flex justify-between items-center">
            <div className="text-white font-medium">Provider Performance</div>
            <div className="flex gap-2">
              <button onClick={e => {
                e.stopPropagation();
                openDialog('provider-performance');
              }} className="text-white/70 hover:text-white">
                <ExternalLink size={16} />
              </button>
              <Building size={16} className="text-white/80" />
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-sm text-white/80">Most Active</div>
              <div className="text-sm font-medium text-right text-white">{stats.mostActiveProvider}</div>
              
              <div className="text-sm text-white/80">Inactive Providers</div>
              <div className="text-sm font-medium text-right text-white">{stats.inactiveProviders}</div>
              
              <div className="text-sm text-white/80">Without Companies</div>
              <div className="text-sm font-medium text-right text-white">{stats.providersWithNoCompanies}</div>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="link" size="sm" className="text-white p-0 hover:text-white/80">
                View Details <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl backdrop-blur-md border border-white/20 p-4 fade-up hover:shadow-lg transition-all duration-300 cursor-pointer" 
            style={{ animationDelay: "0.3s" }} 
            onClick={() => navigateTo('/admin/reports')}>
          <div className="flex justify-between items-center">
            <div className="text-white font-medium">Order Metrics</div>
            <div className="flex gap-2">
              <button onClick={e => {
                e.stopPropagation();
                openDialog('order-metrics');
              }} className="text-white/70 hover:text-white">
                <ExternalLink size={16} />
              </button>
              <ShoppingBag size={16} className="text-white/80" />
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-sm text-white/80">Orders Today</div>
              <div className="text-sm font-medium text-right text-white">{stats.ordersToday}</div>
              
              <div className="text-sm text-white/80">Orders This Week</div>
              <div className="text-sm font-medium text-right text-white">{stats.ordersThisWeek}</div>
              
              <div className="text-sm text-white/80">Avg per Provider</div>
              <div className="text-sm font-medium text-right text-white">{stats.avgOrdersPerProvider}</div>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="link" size="sm" className="text-white p-0 hover:text-white/80">
                View Details <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl backdrop-blur-md border border-white/20 p-4 fade-up hover:shadow-lg transition-all duration-300 cursor-pointer" 
            style={{ animationDelay: "0.4s" }} 
            onClick={() => navigateTo('/admin/reports')}>
          <div className="flex justify-between items-center">
            <div className="text-white font-medium">Finance Insights</div>
            <div className="flex gap-2">
              <button onClick={e => {
                e.stopPropagation();
                openDialog('finance-insights');
              }} className="text-white/70 hover:text-white">
                <ExternalLink size={16} />
              </button>
              <DollarSign size={16} className="text-white/80" />
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-sm text-white/80">Billing This Month</div>
              <div className="text-sm font-medium text-right text-white">${formatNumber(stats.billingThisMonth)}</div>
              
              <div className="text-sm text-white/80">Pending Invoices</div>
              <div className="text-sm font-medium text-right text-white">{stats.pendingInvoices}</div>
              
              <div className="text-sm text-white/80">Top Consumer</div>
              <div className="text-sm font-medium text-right text-white">{stats.topCompanyByConsumption}</div>
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="link" size="sm" className="text-white p-0 hover:text-white/80">
                View Details <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!activeDialog} onOpenChange={open => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[600px] neo-blur text-white border-white/20">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </div>;
};

export default DashboardPage;
