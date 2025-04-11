
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { TopMeal } from '@/hooks/useProviderDashboardStats';

interface StatCardProps {
  title: string;
  value: number | string | TopMeal | undefined;
  icon?: React.ReactNode;
  linkTo?: string;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  loading?: boolean;
  borderColor?: string;
  isCurrency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  linkTo,
  description,
  trend,
  className,
  loading = false,
  borderColor = "border-blue-400/20",
  isCurrency = false,
}) => {
  // Formatear el valor si es un número
  const formattedValue = (val: number | string | TopMeal | undefined): string => {
    if (val === undefined || val === null) return '0';
    
    // Si es un objeto TopMeal
    if (typeof val === 'object' && val !== null && 'name' in val) {
      return val.name;
    }
    
    // Si es un número y debe mostrarse como moneda
    if (typeof val === 'number' && isCurrency) {
      return new Intl.NumberFormat('es-DO', { 
        style: 'currency', 
        currency: 'DOP',
        minimumFractionDigits: 2
      }).format(val);
    }
    
    // Si es un número normal
    if (typeof val === 'number') {
      return val.toString();
    }
    
    // Si es una cadena
    return val;
  };

  // Componente interno para el contenido
  const CardInner = () => (
    <div className="relative h-full w-full overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {icon && (
              <div className="flex items-center justify-center bg-white/10 p-2 rounded-md mr-3">
                {icon}
              </div>
            )}
            <h3 className="text-lg font-medium text-white">{title}</h3>
          </div>
          {linkTo && (
            <Link 
              to={linkTo} 
              className="text-white/70 hover:text-white transition-colors"
              aria-label={`Ver más detalles sobre ${title}`}
            >
              <ChevronRight size={20} />
            </Link>
          )}
        </div>
        
        <div className="mt-4 flex flex-col">
          {loading ? (
            <Skeleton className="h-8 w-24 bg-white/20" />
          ) : (
            <span className={`text-2xl font-bold text-white ${typeof value === 'string' && value.length > 15 ? 'text-lg' : ''}`}>
              {formattedValue(value)}
            </span>
          )}
          
          {description && (
            <span className="text-white/70 text-sm mt-1">{description}</span>
          )}
          
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-400" : "text-red-400"
              )}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Envolver en Link si hay linkTo
  return (
    <Card className={cn(
      "border relative overflow-hidden transition-all duration-300", 
      borderColor,
      className
    )}>
      <CardContent className="p-4 h-full">
        {linkTo ? (
          <Link to={linkTo} className="block h-full">
            <CardInner />
          </Link>
        ) : (
          <CardInner />
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
