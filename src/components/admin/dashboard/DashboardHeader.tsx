
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
        <div className="flex items-center">
          <div className="mr-4">
            <h1 className="text-2xl font-bold text-white fade-up" style={{ animationDelay: "0.1s" }}>
              MiComida<span className="text-primary text-xl">.online</span>
            </h1>
            <p className="text-sm text-white/70">Panel General</p>
          </div>
        </div>
        
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

      {/* Acciones rápidas como badges con mejor contraste */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 fade-up" style={{ animationDelay: "0.2s" }}>
        {quickActions.slice(0, 6).map((action, index) => {
          const Icon = action.icon;
          return (
            <Badge
              key={index}
              variant="outline"
              onClick={action.action}
              className="quick-action-badge glass-dark hover:bg-primary/20 hover:border-primary/40 text-white border-white/30"
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
