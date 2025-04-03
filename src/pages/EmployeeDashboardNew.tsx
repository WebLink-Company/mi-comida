
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { useToast } from '@/hooks/use-toast';
import MobileNavbar from '@/components/employee/MobileNavbar';
import FilterFAB from '@/components/employee/FilterFAB';
import CategoryButtons from '@/components/employee/CategoryButtons';
import DashboardHeader from '@/components/employee/DashboardHeader';
import SearchBar from '@/components/employee/SearchBar';
import DishListing from '@/components/employee/DishListing';

const EmployeeDashboardNew: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // Using a ref to track if the toast has been shown
  const toastShownRef = useRef(false);
  
  const {
    isLoading,
    company,
    searchQuery,
    setSearchQuery,
    activeFilter,
    handleFilterChange,
    activeCategory,
    handleCategoryChange,
    filteredOptions,
    displayedOptions,
    showMore,
    toggleShowMore,
    calculateSubsidizedPrice,
    handleSelectDish
  } = useEmployeeDashboard(user?.id);

  // Show company and subsidy info in toast notification only once when the page loads
  useEffect(() => {
    // Only show the toast if we have company data and haven't shown it yet
    if (company && !toastShownRef.current && !isLoading) {
      // Set the ref to true BEFORE showing the toast to prevent loop
      toastShownRef.current = true;
      
      const subsidyText = company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0 
        ? `$${company.fixed_subsidy_amount.toFixed(2)}` 
        : `${company.subsidy_percentage || company.subsidyPercentage || 0}%`;
      
      // Fixed duration to ensure it stays visible long enough and dismisses automatically
      toast({
        title: `🏢 ${company.name}`,
        description: `Subsidio activo: ${subsidyText}`,
        className: "backdrop-blur-md bg-white/10 border border-white/20 text-white",
        duration: 5000, // Ensure toast stays visible for 5 seconds
      });
    }
  }, [company, isLoading]);
  
  // Reset toast ref when component unmounts (for when user navigates away and comes back)
  useEffect(() => {
    return () => {
      toastShownRef.current = false;
    };
  }, []);
  
  // Make sure the arrays are defined before passing them to components
  const safeFilteredOptions = Array.isArray(filteredOptions) ? filteredOptions : [];
  const safeDisplayedOptions = Array.isArray(displayedOptions) ? displayedOptions : [];
  
  return (
    <div className="container px-4 pt-16 pb-24">
      <DashboardHeader userName={user?.first_name} />
      
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6 relative"
      >
        <div className="flex justify-between items-center">
          <CategoryButtons 
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          <FilterFAB 
            activeFilter={activeFilter} 
            onFilterChange={handleFilterChange} 
          />
        </div>
      </motion.div>
      
      <DishListing
        isLoading={isLoading}
        displayedOptions={safeDisplayedOptions}
        filteredOptions={safeFilteredOptions}
        showMore={showMore}
        toggleShowMore={toggleShowMore}
        calculateSubsidizedPrice={calculateSubsidizedPrice}
        handleSelectDish={handleSelectDish}
      />
    </div>
  );
};

export default EmployeeDashboardNew;
