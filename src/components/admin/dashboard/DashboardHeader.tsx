
import React from 'react';
import { RefreshCw, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';

interface DashboardHeaderProps {
  user: { first_name?: string } | null;
  quickActions: Array<{
    label: string;
    icon: LucideIcon;
    action: () => void;
    path: string;
  }>;
  refreshData: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  quickActions,
  refreshData
}) => {
  return (
    <>
      <div className="mb-8">
        <ClockDisplay user={user} quickActions={quickActions} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white fade-up" style={{ animationDelay: "0.1s" }}>Vista General del Panel</h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Datos
        </Button>
      </div>
    </>
  );
};
