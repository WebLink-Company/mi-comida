
import React from 'react';
import { Server } from 'lucide-react';
import { ClockDisplay } from '@/components/admin/dashboard/ClockDisplay';

interface DashboardLoadingStateProps {
  user: { first_name?: string } | null;
}

export const DashboardLoadingState: React.FC<DashboardLoadingStateProps> = ({ user }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <ClockDisplay user={user} quickActions={[]} />
      </div>
      <div className="text-center py-12">
        <Server className="h-16 w-16 mx-auto mb-4 animate-pulse text-blue-400" />
        <h2 className="text-xl font-medium mb-2">Cargando Datos del Panel...</h2>
        <p className="text-muted-foreground">Conectando a Supabase y recuperando los datos de su proveedor...</p>
      </div>
    </div>
  );
};
