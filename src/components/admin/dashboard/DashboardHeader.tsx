
import React from 'react';
import { RefreshCw, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';
import { Badge } from '@/components/ui/badge';

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
        <h2 className="text-2xl font-semibold text-white fade-up" style={{ animationDelay: "0.1s" }}>Panel General</h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="text-white glass"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Datos
        </Button>
      </div>

      {/* Acciones rápidas como badges */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 fade-up" style={{ animationDelay: "0.2s" }}>
        {quickActions.slice(0, 6).map((action, index) => {
          const Icon = action.icon;
          return (
            <Badge
              key={index}
              variant="outline"
              onClick={action.action}
              className="quick-action-badge glass-dark"
            >
              <Icon className="h-4 w-4 mr-1" />
              {action.label}
            </Badge>
          );
        })}
      </div>
    </>
  );
};
