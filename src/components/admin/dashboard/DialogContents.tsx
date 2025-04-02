import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter 
} from '@/components/ui/alert-dialog';
import { Building, ChefHat, DollarSign, FileText, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DialogConfig {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  badges: Array<{
    label: string;
    icon: React.ComponentType<{ size?: number, className?: string }>;
    path: string;
  }>;
}

interface DialogContentProps {
  dialogId: string;
  stats: any;
  onClose: () => void;
  navigateTo: (path: string) => void;
}

export const DialogContent: React.FC<DialogContentProps> = ({ dialogId, stats, onClose, navigateTo }) => {
  const navigate = useNavigate();
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleNavigate = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    onClose();
    navigateTo(path);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const platformOverviewContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Platform Overview</AlertDialogTitle>
        <AlertDialogDescription>Detailed statistics about platform usage</AlertDialogDescription>
      </AlertDialogHeader>
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
        <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/users')}
          >
            <Users size={14} className="mr-1" />
            Users
          </Badge>
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/companies')}
          >
            <Building size={14} className="mr-1" />
            Companies
          </Badge>
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/reports')}
          >
            <FileText size={14} className="mr-1" />
            Reports
          </Badge>
        </AlertDialogFooter>
      </div>
    </>
  );

  const providerPerformanceContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Provider Performance</AlertDialogTitle>
        <AlertDialogDescription>Analytics for service providers</AlertDialogDescription>
      </AlertDialogHeader>
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
        <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/providers')}
          >
            <ChefHat size={14} className="mr-1" />
            Providers
          </Badge>
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/reports')}
          >
            <TrendingUp size={14} className="mr-1" />
            Analytics
          </Badge>
        </AlertDialogFooter>
      </div>
    </>
  );

  const orderMetricsContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Order Metrics</AlertDialogTitle>
        <AlertDialogDescription>Detailed order statistics</AlertDialogDescription>
      </AlertDialogHeader>
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
        <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/reports')}
          >
            <ShoppingBag size={14} className="mr-1" />
            Orders
          </Badge>
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/providers')}
          >
            <ChefHat size={14} className="mr-1" />
            Providers
          </Badge>
        </AlertDialogFooter>
      </div>
    </>
  );

  const financeInsightsContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Finance Insights</AlertDialogTitle>
        <AlertDialogDescription>Financial statistics and metrics</AlertDialogDescription>
      </AlertDialogHeader>
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
        <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/reports')}
          >
            <DollarSign size={14} className="mr-1" />
            Finance
          </Badge>
          <Badge 
            variant="secondary"
            className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
            onClick={(e) => handleNavigate(e, '/admin/companies')}
          >
            <Building size={14} className="mr-1" />
            Companies
          </Badge>
        </AlertDialogFooter>
      </div>
    </>
  );

  const addUserContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Add New User</AlertDialogTitle>
        <AlertDialogDescription>Create a new user account</AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-4 mt-4">
        <p className="text-sm">This will redirect you to the user management page where you can add a new user to the platform.</p>
        <p className="text-xs text-muted-foreground">Users can have different roles and permissions based on their responsibilities.</p>
      </div>
      <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
        <Button variant="outline" onClick={handleClose} className="modal-button">
          Cancel
        </Button>
        <Button onClick={(e) => handleNavigate(e, '/admin/users')} className="modal-button">
          Go to Users
        </Button>
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => handleNavigate(e, '/admin/settings')}
        >
          <FileText size={14} className="mr-1" />
          Permissions
        </Badge>
      </AlertDialogFooter>
    </>
  );

  const createCompanyContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Create Company</AlertDialogTitle>
        <AlertDialogDescription>Add a new company to the platform</AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-4 mt-4">
        <p className="text-sm">This will redirect you to the companies page where you can create a new company account.</p>
        <p className="text-xs text-muted-foreground">Companies can be assigned to providers and have their own employees.</p>
      </div>
      <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
        <Button variant="outline" onClick={handleClose} className="modal-button">
          Cancel
        </Button>
        <Button onClick={(e) => handleNavigate(e, '/admin/companies')} className="modal-button">
          Go to Companies
        </Button>
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => handleNavigate(e, '/admin/providers')}
        >
          <ChefHat size={14} className="mr-1" />
          Providers
        </Badge>
      </AlertDialogFooter>
    </>
  );

  const addProviderContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Add Provider</AlertDialogTitle>
        <AlertDialogDescription>Register a new food service provider</AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-4 mt-4">
        <p className="text-sm">This will redirect you to the providers page where you can register a new food service provider.</p>
        <p className="text-xs text-muted-foreground">Providers can be linked to companies and create their own menu items.</p>
      </div>
      <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
        <Button variant="outline" onClick={handleClose} className="modal-button">
          Cancel
        </Button>
        <Button onClick={(e) => handleNavigate(e, '/admin/providers')} className="modal-button">
          Go to Providers
        </Button>
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => handleNavigate(e, '/admin/companies')}
        >
          <Building size={14} className="mr-1" />
          Companies
        </Badge>
      </AlertDialogFooter>
    </>
  );

  const viewOrdersContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>View Orders</AlertDialogTitle>
        <AlertDialogDescription>Monitor and manage all orders</AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-4 mt-4">
        <p className="text-sm">This will redirect you to the reports page where you can view all order activity.</p>
        <p className="text-xs text-muted-foreground">You can filter orders by date, company, provider, and status.</p>
      </div>
      <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
        <Button variant="outline" onClick={handleClose} className="modal-button">
          Cancel
        </Button>
        <Button onClick={(e) => handleNavigate(e, '/admin/reports')} className="modal-button">
          Go to Orders
        </Button>
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => handleNavigate(e, '/admin/providers')}
        >
          <ChefHat size={14} className="mr-1" />
          Providers
        </Badge>
      </AlertDialogFooter>
    </>
  );

  const reviewInvoicesContent = (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Review Invoices</AlertDialogTitle>
        <AlertDialogDescription>Manage billing and payments</AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-4 mt-4">
        <p className="text-sm">This will redirect you to the finance section where you can review and manage invoices.</p>
        <p className="text-xs text-muted-foreground">You can track payments, generate reports, and manage billing cycles.</p>
      </div>
      <AlertDialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
        <Button variant="outline" onClick={handleClose} className="modal-button">
          Cancel
        </Button>
        <Button onClick={(e) => handleNavigate(e, '/admin/reports')} className="modal-button">
          Go to Invoices
        </Button>
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => handleNavigate(e, '/admin/companies')}
        >
          <Building size={14} className="mr-1" />
          Companies
        </Badge>
      </AlertDialogFooter>
    </>
  );

  const dialogContents = {
    'platform-overview': platformOverviewContent,
    'provider-performance': providerPerformanceContent,
    'order-metrics': orderMetricsContent,
    'finance-insights': financeInsightsContent,
    'add-user': addUserContent,
    'create-company': createCompanyContent,
    'add-provider': addProviderContent,
    'view-orders': viewOrdersContent,
    'review-invoices': reviewInvoicesContent
  };

  return dialogContents[dialogId as keyof typeof dialogContents] || null;
};
