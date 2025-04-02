
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';

interface DialogContentProps {
  dialogId: string;
  stats: {
    ordersCreatedToday: number;
    pendingOrders: number;
    companyName: string;
    providerName: string;
    providerLogo: string;
    teamMembers: Array<{ id: string; name: string; role: string }>;
    billingHistory: Array<{ id: string; date: string; amount: number; status: string }>;
  };
  onClose: () => void;
  navigateTo: (path: string) => void;
}

export const SupervisorDialogContent: React.FC<DialogContentProps> = ({
  dialogId,
  stats,
  onClose,
  navigateTo,
}) => {
  const renderContent = () => {
    switch (dialogId) {
      case 'supervisor-snapshot':
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Today's Snapshot</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Current status of orders and pending approvals.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Orders Created Today</div>
                  <div className="text-2xl font-semibold text-white">{stats.ordersCreatedToday}</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Pending Orders</div>
                  <div className="text-2xl font-semibold text-white">{stats.pendingOrders}</div>
                </div>
                <div className="col-span-2 bg-white/10 p-4 rounded-lg">
                  <div className="text-sm text-white/60">Company</div>
                  <div className="text-xl font-semibold text-white">{stats.companyName}</div>
                </div>
              </div>
              <Button 
                onClick={() => navigateTo('/supervisor/orders')}
                className="w-full bg-white/20 hover:bg-white/30 text-white mt-4"
              >
                View All Orders
              </Button>
            </div>
          </>
        );
      case 'supervisor-provider':
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Provider Details</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Information about your assigned provider.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-6 space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                  {stats.providerLogo ? (
                    <img src={stats.providerLogo} alt={stats.providerName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl text-white">{stats.providerName.charAt(0)}</div>
                  )}
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg text-center">
                <div className="text-sm text-white/60">Provider Name</div>
                <div className="text-xl font-semibold text-white">{stats.providerName}</div>
              </div>
              <Button 
                onClick={() => navigateTo('/supervisor/provider')}
                className="w-full bg-white/20 hover:bg-white/30 text-white mt-4"
              >
                Contact Provider
              </Button>
            </div>
          </>
        );
      case 'supervisor-team':
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Team Overview</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Members of your company team.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-6 space-y-4">
              <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                {stats.teamMembers.map((member) => (
                  <div key={member.id} className="bg-white/10 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-white">{member.name}</div>
                      <div className="text-xs text-white/60 px-2 py-1 bg-white/10 rounded-full">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => navigateTo('/supervisor/team')}
                className="w-full bg-white/20 hover:bg-white/30 text-white mt-4"
              >
                Manage Team
              </Button>
            </div>
          </>
        );
      case 'supervisor-billing':
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Billing Details</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Recent billing history and invoices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-6 space-y-4">
              <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                {stats.billingHistory.map((bill) => (
                  <div key={bill.id} className="bg-white/10 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-white">{bill.date}</div>
                      <div className="text-sm text-white">${bill.amount.toLocaleString()}</div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-white/60">Invoice #{bill.id.substring(0, 8)}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        bill.status === 'Paid' ? 'bg-green-500/20 text-green-300' : 
                        bill.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' : 
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {bill.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => navigateTo('/supervisor/billing')}
                className="w-full bg-white/20 hover:bg-white/30 text-white mt-4"
              >
                View All Invoices
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
