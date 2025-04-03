
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LunchOption } from '@/lib/types';
import { ShoppingBag, Check, X } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

interface DishCardProps {
  dish: LunchOption;
  subsidizedPrice: number;
  onSelect: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, subsidizedPrice, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isMobile) return;
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsExpanded(false);
  };

  const handleBackdropClick = () => {
    setIsExpanded(false);
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <>
      {/* Backdrop when card is expanded (mobile only) */}
      {isMobile && isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={handleBackdropClick}
        />
      )}
      
      <motion.div 
        className={`relative ${isExpanded ? 'z-50' : 'z-10'}`}
        layout
        transition={{ 
          layout: { duration: 0.4, type: "spring" }
        }}
      >
        <motion.div
          className="rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
          whileHover={!isMobile ? { scale: 1.02, transition: { duration: 0.2 } } : undefined}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          layout="position"
          onClick={handleCardClick}
          style={{
            width: isExpanded ? (isMobile ? '100%' : '200%') : '100%',
            zIndex: isExpanded ? 10 : 1,
          }}
          transition={{
            layout: {
              duration: 0.4,
              type: "spring",
              stiffness: 200,
              damping: 25
            }
          }}
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

            {/* Close button when expanded */}
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
                onClick={handleCloseClick}
              >
                <X className="h-3 w-3 text-white" />
              </motion.button>
            )}
          </div>
          
          <div className="p-3 flex flex-col flex-1">
            <motion.h3 
              layout="position"
              className={`font-medium text-sm ${isExpanded ? '' : 'line-clamp-1'} text-white`}
            >
              {dish.name}
            </motion.h3>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2"
                >
                  <p className="text-xs text-white/80 mb-3">{dish.description}</p>
                  
                  <motion.button
                    onClick={handleSelectClick}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 px-4 rounded-md bg-primary/70 hover:bg-primary/90 border border-white/30 flex items-center justify-center transition-all duration-200 backdrop-blur-sm text-white shadow-sm text-sm"
                    aria-label="Seleccionar"
                  >
                    <Check className="h-4 w-4 mr-2" /> Seleccionar
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={`${isExpanded ? 'mt-auto' : ''} flex items-center justify-between`}>
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

          {/* Floating action button for selection (only shown when not expanded) */}
          {!isExpanded && (
            <motion.button
              onClick={handleSelectClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary/70 hover:bg-primary border border-white/30 flex items-center justify-center transition-all duration-200 backdrop-blur-sm text-white shadow-sm"
              aria-label="Seleccionar"
            >
              <Check className="h-4 w-4" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default DishCard;
