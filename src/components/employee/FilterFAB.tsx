
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const filterOptions: FilterOption[] = [
    { id: 'all', name: 'Todos', icon: <Clock className="h-4 w-4" /> },
    { id: 'popular', name: 'Más pedidos', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'special', name: 'Especial', icon: <Award className="h-4 w-4" /> },
    { id: 'recommended', name: 'Recomendados', icon: <Star className="h-4 w-4" /> }
  ];

  const handleFilterSelect = (filterId: string) => {
    onFilterChange(filterId);
  };

  // Find the active filter name
  const activeFilterName = filterOptions.find(option => option.id === activeFilter)?.name || 'Filtrar';

  return (
    <div className="fixed bottom-20 right-4 z-30">
      {/* Filter options always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="space-y-2 flex flex-col items-end"
      >
        {filterOptions.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => handleFilterSelect(option.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeFilter === option.id
                ? 'bg-white/40 text-white'
                : 'bg-white/20 text-white/90'
            } backdrop-blur-sm border border-white/30 shadow-sm text-sm min-w-[140px] justify-between`}
          >
            <span>{option.name}</span>
            {option.icon}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default FilterFAB;
