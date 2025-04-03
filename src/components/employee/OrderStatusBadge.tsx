
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'delivered': return 'primary';
      default: return 'default';
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente de aprobación';
      case 'rejected': return 'Rechazado';
      case 'delivered': return 'Entregado';
      default: return 'Desconocido';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'delivered': return <Check className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Badge 
      variant={getStatusColor(status) as any} 
      className="flex items-center gap-1 bg-white/20 text-white backdrop-blur-md"
    >
      {getStatusIcon(status)} {getStatusText(status)}
    </Badge>
  );
};

export default OrderStatusBadge;
