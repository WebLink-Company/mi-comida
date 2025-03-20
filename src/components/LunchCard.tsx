
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { LunchOption } from '@/lib/types';
import { Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LunchCardProps {
  lunchOption?: LunchOption;
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  subsidizedPrice?: number;
  isSelected?: boolean;
  onSelect?: (id?: string) => void;
  subsidyPercentage?: number;
  fixedSubsidyAmount?: number;
  className?: string;
  showControls?: boolean;
  tags?: string[];
}

const LunchCard = ({ 
  lunchOption, 
  name,
  description,
  imageUrl,
  price,
  subsidizedPrice,
  isSelected = false, 
  onSelect, 
  subsidyPercentage = 0,
  fixedSubsidyAmount = 0,
  className,
  showControls = true,
  tags = []
}: LunchCardProps) => {
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use either direct props or lunchOption object
  const displayName = name || lunchOption?.name || '';
  const displayDescription = description || lunchOption?.description || '';
  const displayImageUrl = imageUrl || lunchOption?.image || '';
  const displayPrice = price ?? lunchOption?.price ?? 0;
  const displayTags = tags.length > 0 ? tags : lunchOption?.tags || [];
  const available = lunchOption ? lunchOption.available : true;
  
  // Calculate prices with support for both percentage and fixed subsidies
  const originalPrice = displayPrice;
  let discountedPrice = subsidizedPrice;
  
  if (!discountedPrice) {
    if (fixedSubsidyAmount > 0) {
      // Apply fixed subsidy amount, but don't go below zero
      discountedPrice = Math.max(0, displayPrice - fixedSubsidyAmount);
    } else if (subsidyPercentage > 0) {
      // Apply percentage subsidy
      discountedPrice = displayPrice * (1 - subsidyPercentage / 100);
    } else {
      discountedPrice = displayPrice;
    }
  }

  const handleSelect = () => {
    if (available && onSelect) {
      onSelect(lunchOption?.id);
      toast({
        title: "Almuerzo seleccionado",
        description: `Has seleccionado: ${displayName}`,
      });
    } else if (!available) {
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
        !available && "opacity-80",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={displayImageUrl}
          alt={displayName}
          className={cn(
            "object-cover w-full h-full transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {displayTags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {displayTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-medium text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {!available && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-background/90 text-foreground px-4 py-2 rounded-lg flex items-center">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">No disponible hoy</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1">{displayName}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {displayDescription}
        </p>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">${discountedPrice.toFixed(2)}</span>
              {(subsidyPercentage > 0 || fixedSubsidyAmount > 0) && (
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
            
            {fixedSubsidyAmount > 0 && (
              <p className="text-xs text-green-600 font-medium">
                ${fixedSubsidyAmount.toFixed(2)} subsidiado por tu empresa
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
              disabled={!available}
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
