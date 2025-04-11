
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar } from 'lucide-react';

interface NoOrdersMessageProps {
  onChangeDateRange: () => void;
  dateRangeText: string;
}

const NoOrdersMessage: React.FC<NoOrdersMessageProps> = ({ 
  onChangeDateRange,
  dateRangeText
}) => {
  return (
    <Card className="glass border-amber-500/30">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500/70 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No hay órdenes aprobadas</h3>
        <p className="text-white/70 max-w-md mb-4">
          No se encontraron órdenes aprobadas para {dateRangeText}.
          Intenta cambiar el rango de fechas o verificar si hay órdenes pendientes.
        </p>
        <Button 
          variant="outline" 
          className="glass hover:bg-blue-500/20"
          onClick={onChangeDateRange}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Cambiar rango de fechas
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoOrdersMessage;
