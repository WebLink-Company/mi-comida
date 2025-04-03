
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, Star, Clock, ChevronUp, ChevronDown } from 'lucide-react';

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
    <div className="fixed bottom-20 right-4 z-30">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-end"
      >
        {/* Active filter button that acts as toggle */}
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-white/40 text-white backdrop-blur-sm border border-white/30 shadow-sm text-sm min-w-[140px]"
        >
          <span>{activeFilterOption.name}</span>
          <div>{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
        </motion.button>

        {/* Dropdown options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 items-end overflow-hidden"
            >
              {filterOptions
                .filter(option => option.id !== activeFilter)
                .map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleFilterSelect(option.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-white/20 text-white/90 backdrop-blur-sm border border-white/30 shadow-sm text-sm min-w-[140px]"
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
