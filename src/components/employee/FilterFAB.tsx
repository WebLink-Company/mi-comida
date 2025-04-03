
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, Star, Clock } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface FilterFABProps {
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

const FilterFAB: React.FC<FilterFABProps> = ({ activeFilter, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const filterOptions: FilterOption[] = [
    { id: 'all', name: 'Todos', icon: <Clock className="h-4 w-4" /> },
    { id: 'popular', name: 'Más pedidos', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'special', name: 'Especial', icon: <Award className="h-4 w-4" /> },
    { id: 'recommended', name: 'Recomendados', icon: <Star className="h-4 w-4" /> }
  ];

  // Find the active filter option
  const activeFilterOption = filterOptions.find(option => option.id === activeFilter) || filterOptions[0];

  const handleFilterSelect = (filterId: string) => {
    onFilterChange(filterId);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="absolute right-0 z-20">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-end"
      >
        {/* Active filter button that acts as toggle - partially visible */}
        <motion.div
          animate={{ x: isOpen ? 0 : 60 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative"
        >
          <motion.button
            onClick={toggleOpen}
            whileHover={{ x: isOpen ? 0 : -10 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between gap-2 px-4 py-2 rounded-l-lg bg-white/40 text-white backdrop-blur-sm border border-white/30 shadow-sm text-sm min-w-[140px]"
          >
            <span>{activeFilterOption.name}</span>
            {activeFilterOption.icon}
          </motion.button>
        </motion.div>

        {/* Dropdown options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 right-0 flex flex-col gap-2 mt-12 items-end"
            >
              {filterOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleFilterSelect(option.id)}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-between gap-2 px-4 py-2 rounded-lg 
                    ${activeFilter === option.id 
                      ? 'bg-white/40 text-white' 
                      : 'bg-white/20 text-white/90'} 
                    backdrop-blur-sm border border-white/30 shadow-sm text-sm min-w-[140px]`}
                >
                  <span>{option.name}</span>
                  {option.icon}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default FilterFAB;
