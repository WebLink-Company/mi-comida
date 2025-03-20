
import { Order, LunchOption, User } from '@/lib/types';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderSummaryProps {
  order: Order;
  lunchOption: LunchOption;
  user?: User;
  className?: string;
  onApprove?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  showActions?: boolean;
}

const OrderSummary = ({
  order,
  lunchOption,
  user,
  className,
  onApprove,
  onReject,
  showActions = false
}: OrderSummaryProps) => {
  const formattedDate = format(new Date(order.date), "EEEE d 'de' MMMM", { locale: es });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-amber-600 bg-amber-50';
      case 'delivered':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'delivered':
        return <Check className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'Pendiente';
      case 'delivered':
        return 'Entregado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl border border-border p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-lg overflow-hidden w-20 h-20">
          <img 
            src={lunchOption.image} 
            alt={lunchOption.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">{lunchOption.name}</h3>
            <div 
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium flex items-center",
                getStatusColor(order.status)
              )}
            >
              {getStatusIcon(order.status)}
              <span className="ml-1">{getStatusText(order.status)}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            Para el {formattedDate}
          </p>
          
          {user && (
            <p className="text-sm font-medium">
              Solicitado por: {user.name}
            </p>
          )}
          
          <div className="mt-2 flex items-center">
            <span className="font-bold">${lunchOption.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {showActions && order.status === 'pending' && (
        <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onReject && onReject(order.id)}
          >
            <X className="w-4 h-4 mr-1" />
            Rechazar
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onApprove && onApprove(order.id)}
          >
            <Check className="w-4 h-4 mr-1" />
            Aprobar
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
