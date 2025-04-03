
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { LunchOption } from '@/lib/types';
import DishCard from '@/components/employee/DishCard';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

interface DishListingProps {
  isLoading: boolean;
  displayedOptions: LunchOption[];
  filteredOptions: LunchOption[];
  showMore: boolean;
  toggleShowMore: () => void;
  calculateSubsidizedPrice: (price: number) => number;
  handleSelectDish: (dish: LunchOption) => void;
  activeFilter: string;
  handleFilterChange: (filter: string) => void;
}

const DishListing: React.FC<DishListingProps> = ({
  isLoading,
  displayedOptions,
  filteredOptions,
  showMore,
  toggleShowMore,
  calculateSubsidizedPrice,
  handleSelectDish,
  activeFilter,
  handleFilterChange
}) => {
  const [open, setOpen] = useState(false);

  const filterItems = [
    { value: 'all', label: 'Todos' },
    { value: 'popular', label: 'Más pedidos' },
    { value: 'special', label: 'Especial' },
    { value: 'recommended', label: 'Recomendados' }
  ];

  const currentFilterLabel = filterItems.find(item => item.value === activeFilter)?.label || 'Todo';

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
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
          className="grid grid-cols-3 gap-3"
        >
          {displayedOptions.map((option) => (
            <DishCard
              key={option.id}
              dish={option}
              subsidizedPrice={calculateSubsidizedPrice(option.price)}
              onSelect={() => handleSelectDish(option)}
            />
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

      <div className="relative">
        {filteredOptions.length > 3 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center my-6 pb-16"
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
        
        <div className="absolute bottom-4 w-full flex justify-center">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="text-white/80 text-xs cursor-pointer hover:text-white transition-colors">
                {currentFilterLabel}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 backdrop-blur-xl bg-white/10 border border-white/10 shadow-lg text-white">
              <Command className="rounded-lg bg-transparent">
                <CommandGroup>
                  {filterItems && filterItems.map((item) => (
                    <CommandItem
                      key={item.value}
                      onSelect={() => {
                        handleFilterChange(item.value);
                        setOpen(false);
                      }}
                      className={`rounded-md cursor-pointer ${
                        activeFilter === item.value ? 'bg-white/20' : 'hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
};

export default DishListing;
