
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
  value: string | number;
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

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-200", 
          linkTo && "hover:shadow-md hover:border-primary/30 cursor-pointer", 
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
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <div className="flex items-baseline">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-2xl font-bold">{value}</h3>
                )}
                {!loading && trend && (
                  <span className={cn(
                    "ml-2 text-xs font-medium",
                    trend.isPositive ? "text-green-500" : "text-red-500"
                  )}>
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              )}
              {lastUpdated && (
                <p className="mt-2 text-xs text-muted-foreground/70">Updated {lastUpdated}</p>
              )}
            </div>
            
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>

      {quickViewComponent && (
        <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{title} Preview</DialogTitle>
              <DialogDescription>
                Recent {title.toLowerCase()} on the platform
              </DialogDescription>
            </DialogHeader>
            {quickViewComponent}
            {linkTo && (
              <div className="flex justify-end mt-4">
                <Button onClick={() => {
                  setIsQuickViewOpen(false);
                  navigate(linkTo);
                }}>
                  View All
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
