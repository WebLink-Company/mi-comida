
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, TrendingUp, Award, Star, Clock } from 'lucide-react';

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
  const fabRef = useRef<HTMLDivElement>(null);

  const filterOptions: FilterOption[] = [
    { id: 'all', name: 'Todos', icon: <Clock className="h-4 w-4" /> },
    { id: 'popular', name: 'Más pedidos', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'special', name: 'Especial', icon: <Award className="h-4 w-4" /> },
    { id: 'recommended', name: 'Recomendados', icon: <Star className="h-4 w-4" /> }
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterSelect = (filterId: string) => {
    onFilterChange(filterId);
    setIsOpen(false);
  };

  // Find the active filter name
  const activeFilterName = filterOptions.find(option => option.id === activeFilter)?.name || 'Filtrar';

  return (
    <div ref={fabRef} className="fixed bottom-20 right-4 z-30">
      {/* Active filter chip (visible when menu is closed) */}
      {!isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs shadow-sm">
            {activeFilterName}
          </div>
        </motion.div>
      )}

      {/* FAB button */}
      <motion.button
        onClick={toggleMenu}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          rotate: isOpen ? 45 : 0,
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'
        }}
        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg text-white"
      >
        <Filter className="h-5 w-5" />
      </motion.button>

      {/* Filter options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-2 space-y-2 flex flex-col items-end"
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterFAB;
