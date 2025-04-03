
import React from 'react';
import { motion } from 'framer-motion';
import { LunchOption } from '@/lib/types';
import { ShoppingBag, Check } from 'lucide-react';

interface DishCardProps {
  dish: LunchOption;
  subsidizedPrice: number;
  onSelect: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, subsidizedPrice, onSelect }) => {
  return (
    <motion.div 
      className="rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 hover:shadow-lg transition-all duration-200 flex flex-col relative"
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
            <ShoppingBag className="h-8 w-8 text-white/60" />
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-medium text-sm line-clamp-1 text-white">{dish.name}</h3>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-white/60 line-through">
              ${dish.price.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-white">
              ${subsidizedPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Floating action button for selection */}
      <motion.button
        onClick={onSelect}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary/70 hover:bg-primary border border-white/30 flex items-center justify-center transition-all duration-200 backdrop-blur-sm text-white shadow-sm"
        aria-label="Seleccionar"
      >
        <Check className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};

export default DishCard;
