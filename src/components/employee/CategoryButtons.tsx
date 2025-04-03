
import React from 'react';
import { motion } from 'framer-motion';

interface CategoryButtonsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryButtons: React.FC<CategoryButtonsProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  const categories = [
    { id: 'daily', name: 'Plato del día' },
    { id: 'menu', name: 'A la carta' },
  ];

  return (
    <div className="flex items-center justify-center space-x-6 mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className="relative pb-1 text-sm font-medium focus:outline-none"
        >
          <span className={`${
            activeCategory === category.id 
              ? 'text-white' 
              : 'text-white/70 hover:text-white/90'
          } transition-colors`}>
            {category.name}
          </span>
          {activeCategory === category.id && (
            <motion.div
              layoutId="categoryIndicator"
              className="absolute left-0 right-0 h-0.5 bg-white bottom-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryButtons;
