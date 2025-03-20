
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { LunchOption } from '@/lib/types';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LunchCardProps {
  lunchOption: LunchOption;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  subsidyPercentage?: number;
  className?: string;
  showControls?: boolean;
}

const LunchCard = ({ 
  lunchOption, 
  isSelected = false, 
  onSelect, 
  subsidyPercentage = 0,
  className,
  showControls = true
}: LunchCardProps) => {
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Calculate prices
  const originalPrice = lunchOption.price;
  const discountedPrice = lunchOption.price * (1 - subsidyPercentage / 100);

  const handleSelect = () => {
    if (lunchOption.available && onSelect) {
      onSelect(lunchOption.id);
      toast({
        title: "Almuerzo seleccionado",
        description: `Has seleccionado: ${lunchOption.name}`,
      });
    } else if (!lunchOption.available) {
      toast({
        title: "Opción no disponible",
        description: "Este almuerzo no está disponible hoy.",
        variant: "destructive"
      });
    }
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border border-border transition-all duration-300",
        "bg-white backdrop-blur-sm shadow-sm hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2",
        !lunchOption.available && "opacity-80",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={lunchOption.image}
          alt={lunchOption.name}
          className={cn(
            "object-cover w-full h-full transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {lunchOption.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {lunchOption.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-medium text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {!lunchOption.available && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-background/90 text-foreground px-4 py-2 rounded-lg flex items-center">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">No disponible hoy</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1">{lunchOption.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {lunchOption.description}
        </p>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">${discountedPrice.toFixed(2)}</span>
              {subsidyPercentage > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {subsidyPercentage > 0 && (
              <p className="text-xs text-green-600 font-medium">
                {subsidyPercentage}% subsidiado por tu empresa
              </p>
            )}
          </div>
          
          {showControls && (
            <Button 
              onClick={handleSelect}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "min-w-[100px] transition-all",
                isSelected && "bg-primary text-primary-foreground"
              )}
              disabled={!lunchOption.available}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Seleccionado
                </>
              ) : "Seleccionar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LunchCard;
