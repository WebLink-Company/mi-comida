
import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavbar from '@/components/employee/MobileNavbar';

const EmployeeLayout: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0 animated-gradient"></div>
      
      <MobileNavbar />
      
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeLayout;
