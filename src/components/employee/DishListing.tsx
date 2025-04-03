
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { LunchOption } from '@/lib/types';
import DishCard from '@/components/employee/DishCard';

interface DishListingProps {
  isLoading: boolean;
  displayedOptions: LunchOption[];
  filteredOptions: LunchOption[];
  showMore: boolean;
  toggleShowMore: () => void;
  calculateSubsidizedPrice: (price: number) => number;
  handleSelectDish: (dish: LunchOption) => void;
}

const DishListing: React.FC<DishListingProps> = ({
  isLoading,
  displayedOptions,
  filteredOptions,
  showMore,
  toggleShowMore,
  calculateSubsidizedPrice,
  handleSelectDish
}) => {
  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, i) => (
            <div 
              key={i} 
              className="bg-white/20 animate-pulse rounded-lg h-32"
            />
          ))}
        </div>
      ) : displayedOptions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          layout
        >
          {displayedOptions.map((option) => (
            <motion.div
              key={option.id}
              layout
              transition={{ duration: 0.4 }}
            >
              <DishCard
                dish={option}
                subsidizedPrice={calculateSubsidizedPrice(option.price)}
                onSelect={() => handleSelectDish(option)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-white/80">No se encontraron opciones de almuerzo.</p>
          <button 
            className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-md text-white transition-colors"
            onClick={() => window.location.reload()}
          >
            Mostrar todas las opciones
          </button>
        </motion.div>
      )}

      {filteredOptions.length > 3 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center mt-6"
        >
          <span className="text-xs text-white/80">Ver más</span>
          <motion.button
            onClick={toggleShowMore}
            className="flex items-center justify-center cursor-pointer mt-1"
            initial={{ y: 0 }}
            animate={{ y: [0, 3, 0] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatType: "loop", 
              ease: "easeInOut" 
            }}
          >
            <ChevronDown className="h-5 w-5 text-blue-400" />
          </motion.button>
        </motion.div>
      )}
    </>
  );
};

export default DishListing;
