
import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavbar from '@/components/employee/MobileNavbar';
import { motion } from 'framer-motion';
const EmployeeLayout: React.FC = () => {
  return <div className="min-h-screen relative overflow-hidden pb-24">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0 animated-gradient"></div>
      
      {/* Logo at the top center */}
      <motion.div initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5,
      delay: 0.2
    }} className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-36">
        <img alt="MiComida.app" className="w-full opacity-80 hover:opacity-100 transition-opacity duration-300" src="/lovable-uploads/30445604-db34-45b7-b5ac-c8306639cd50.png" />
      </motion.div>
      
      <MobileNavbar />
      
      <div className="relative z-10 pt-16">
        <Outlet />
      </div>
    </div>;
};
export default EmployeeLayout;
