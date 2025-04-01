
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import AdminSidebar from '@/components/AdminSidebar';
import NavigationBar from '@/components/NavigationBar';

const AdminLayout = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationBar 
        userRole="admin" 
        userName={`${user?.first_name || ''} ${user?.last_name || ''}`} 
      />
      
      <div className="flex flex-1 pt-16">
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <main className={`flex-1 transition-all duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
