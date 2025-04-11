
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { TopMeal } from '@/hooks/useProviderDashboardStats';

interface StatCardProps {
  title: string;
  value: string | number | TopMeal | null;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  linkTo?: string;
  className?: string;
  borderColor?: string;
  lastUpdated?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  loading = false,
  linkTo,
  className,
  borderColor,
  lastUpdated
}) => {
  // Format value for display
  const displayValue = () => {
    if (loading) return <Skeleton className="h-7 w-20" />;
    
    if (value === null || value === undefined) return "Sin datos";
    
    // Handle TopMeal object type - convert it to string for rendering
    if (typeof value === 'object' && value !== null && 'name' in value) {
      return value.name;
    }
    
    // Handle currency-related titles
    if (title.toLowerCase().includes('facturación') || 
        title.toLowerCase().includes('ingreso') ||
        title.toLowerCase().includes('revenue')) {
      if (typeof value === 'number') {
        return `$${value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
      return value;
    }
    
    // Handle regular number formatting
    if (typeof value === 'number') {
      return value.toLocaleString('es-ES');
    }
    
    return value;
  };

  const cardContent = (
    <div className={cn(
      "relative p-6 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg",
      className || "glass",
      borderColor ? `border ${borderColor}` : "border border-gray-100/20"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="text-2xl font-bold text-white mt-2">
            {displayValue()}
          </div>
        </div>
        {icon && (
          <div className="p-2 rounded-full bg-white/10 text-white">
            {icon}
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-white/70 mt-2">
          {loading ? <Skeleton className="h-4 w-full" /> : description}
        </p>
      )}
      
      {trend && !loading && (
        <div className={`text-sm mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {trend.isPositive ? '+' : '-'}{trend.value}% desde el mes pasado
        </div>
      )}
      
      {lastUpdated && (
        <div className="text-xs text-white/50 mt-3">
          Actualizado: {lastUpdated}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block transition-transform duration-300 hover:scale-[1.01]">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default StatCard;
