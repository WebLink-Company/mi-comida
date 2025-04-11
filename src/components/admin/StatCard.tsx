
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { TopMeal } from '@/hooks/useProviderDashboardStats';

interface StatCardProps {
  title: string;
  value: number | string | TopMeal | undefined;
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  linkTo?: string;
  className?: string;
  borderColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  loading = false,
  trend,
  linkTo,
  className,
  borderColor,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (linkTo) {
      navigate(linkTo);
    }
  };

  const formatValue = (val: number | string | TopMeal | undefined): string => {
    if (val === undefined || val === null) return '0';
    
    if (typeof val === 'number') {
      if (val === 0) return '0';
      if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('facturación')) {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(val);
      }
      return val.toString();
    }
    
    if (typeof val === 'object' && val !== null && 'name' in val) {
      return val.name; // Extract just the name from TopMeal object
    }
    
    return String(val);
  };

  const displayValue = (val: number | string | TopMeal | undefined): React.ReactNode => {
    if (loading) {
      return <Skeleton className="h-8 w-20" />;
    }
    
    return formatValue(val);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer border",
        borderColor ? borderColor : "border-primary/10",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <h3 className="text-2xl font-semibold mt-1 text-white">
              {displayValue(value)}
            </h3>
            {description && (
              <p className="text-xs text-white/60 mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span className={`text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {trend.isPositive ? '+' : '-'}{trend.value}%
                </span>
                <span className="text-xs text-white/60 ml-1">vs. último mes</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="bg-white/10 p-2 rounded-lg">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
