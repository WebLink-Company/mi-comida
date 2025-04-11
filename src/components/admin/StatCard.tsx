
import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
  linkTo?: string;
  lastUpdated?: string;
  quickViewComponent?: ReactNode;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  className,
  loading = false,
  linkTo,
  lastUpdated,
  quickViewComponent
}: StatCardProps) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (linkTo) {
      navigate(linkTo);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const formatValue = (val: string | number | undefined): string => {
    if (val === undefined || val === null) return "Sin datos";
    
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('ingreso') || title.toLowerCase().includes('facturación')) {
        return `$${val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return val.toLocaleString('es-ES');
    }
    
    // If value already has formatting (like "$X" or "X x Y")
    if (typeof val === 'string') {
      if (val === "Loading...") return "Cargando...";
      if (val.startsWith('$')) {
        const numericPart = parseFloat(val.substring(1));
        if (!isNaN(numericPart)) {
          return `$${numericPart.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      }
    }
    
    return String(val);
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-200", 
          linkTo && "hover:shadow-md hover:border-primary/30 cursor-pointer backdrop-blur-md bg-white/10 border-white/20", 
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-6 relative">
          {quickViewComponent && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 opacity-70 hover:opacity-100" 
              onClick={handleQuickViewClick}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
              <div className="flex items-baseline">
                {loading ? (
                  <Skeleton className="h-8 w-16 bg-white/20" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatValue(value)}</h3>
                )}
                {!loading && trend && (
                  <span className={cn(
                    "ml-2 text-xs font-medium",
                    trend.isPositive ? "text-green-400" : "text-red-400"
                  )}>
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-1 text-xs text-white/70">{description}</p>
              )}
              {lastUpdated && (
                <p className="mt-2 text-xs text-white/50">Actualizado {lastUpdated}</p>
              )}
            </div>
            
            <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center text-white/90">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>

      {quickViewComponent && (
        <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
          <DialogContent className="max-w-3xl modal-glassmorphism">
            <DialogHeader>
              <DialogTitle>Vista previa de {title}</DialogTitle>
              <DialogDescription>
                {title.toLowerCase()} recientes en la plataforma
              </DialogDescription>
            </DialogHeader>
            {quickViewComponent}
            {linkTo && (
              <div className="flex justify-end mt-4">
                <Button onClick={() => {
                  setIsQuickViewOpen(false);
                  navigate(linkTo);
                }}
                className="modal-button-primary"
                >
                  Ver Todo
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default StatCard;
