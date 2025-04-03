
import React from 'react';
import { motion } from 'framer-motion';
import { LunchOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

interface DishCardProps {
  dish: LunchOption;
  subsidizedPrice: number;
  onSelect: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, subsidizedPrice, onSelect }) => {
  return (
    <motion.div 
      className="rounded-lg overflow-hidden bg-white/70 shadow-sm border border-primary/10 hover:shadow-md transition-all duration-200 flex flex-col"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-24 bg-gradient-to-b from-primary/5 to-primary/10">
        {dish.image ? (
          <img 
            src={dish.image} 
            alt={dish.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-primary/5">
            <ShoppingBag className="h-8 w-8 text-primary/40" />
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-medium text-sm line-clamp-1">{dish.name}</h3>
        
        <div className="mt-1 mb-2">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {dish.description}
          </p>
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground line-through">
              ${dish.price.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-primary">
              ${subsidizedPrice.toFixed(2)}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs px-2" 
            onClick={onSelect}
          >
            Seleccionar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DishCard;
