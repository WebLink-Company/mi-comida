
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';

interface DialogContentProps {
  dialogId: string;
  stats: {
    totalCompanies: number;
    totalUsers: number;
    ordersThisWeek: number;
    totalBilledThisMonth: number;
    pendingInvoices: number;
    topCompanyByOrders: string;
    recentActivities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
    }>;
  };
  onClose: () => void;
  navigateTo: (path: string) => void;
}

export const ProviderDialogContent: React.FC<DialogContentProps> = ({
  dialogId,
  stats,
  onClose,
  navigateTo,
}) => {
  const renderContent = () => {
    switch (dialogId) {
      case 'provider-overview':
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Provider Overview</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Detailed statistics about your companies and users.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Total Companies</div>
                  <div className="text-2xl font-semibold text-white">{stats.totalCompanies}</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Total Users</div>
                  <div className="text-2xl font-semibold text-white">{stats.totalUsers}</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Orders This Week</div>
                  <div className="text-2xl font-semibold text-white">{stats.ordersThisWeek}</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Top Company</div>
                  <div className="text-xl font-semibold text-white">{stats.topCompanyByOrders}</div>
                </div>
              </div>
              <Button 
                onClick={() => navigateTo('/provider/companies')}
                className="w-full bg-white/20 hover:bg-white/30 text-white mt-4"
              >
                Manage Companies
              </Button>
            </div>
          </>
        );
      case 'provider-finance':
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Finance Overview</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Information about your billing and invoices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Total Billed This Month</div>
                  <div className="text-2xl font-semibold text-white">${stats.totalBilledThisMonth.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Pending Invoices</div>
                  <div className="text-2xl font-semibold text-white">{stats.pendingInvoices}</div>
                </div>
                <div className="col-span-2 bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Top Company by Order Volume</div>
                  <div className="text-xl font-semibold text-white">{stats.topCompanyByOrders}</div>
                </div>
              </div>
              <Button 
                onClick={() => navigateTo('/provider/finance')} 
                className="w-full bg-white/20 hover:bg-white/30 text-white mt-4"
              >
                View Finance Details
              </Button>
            </div>
          </>
        );
      case 'provider-activity':
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Recent Activity</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Recent actions and events in your provider account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-6 space-y-4">
              <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="bg-white/10 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium text-white">{activity.type}</div>
                      <div className="text-xs text-white/60">{activity.timestamp}</div>
                    </div>
                    <div className="text-sm text-white/80 mt-1">{activity.description}</div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => navigateTo('/provider/activity')}
                className="w-full bg-white/20 hover:bg-white/30 text-white mt-4"
              >
                View All Activity
              </Button>
            </div>
          </>
        );
      default:
        return (
          <div className="text-white">No content available for this dialog.</div>
        );
    }
  };

  return (
    <div className="relative p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-4 top-4 text-white/80 hover:text-white hover:bg-white/10"
      >
        <X size={18} />
      </Button>
      {renderContent()}
    </div>
  );
};
