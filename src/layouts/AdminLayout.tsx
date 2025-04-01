
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar';
import NavigationBar from '@/components/NavigationBar';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { toast } = useToast();

  // Handle page title based on the current route
  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const title = path.charAt(0).toUpperCase() + path.slice(1);
    document.title = `Admin | ${title}`;
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationBar 
        userRole="admin" 
        userName={`${user?.first_name || ''} ${user?.last_name || ''}`} 
      />
      
      <div className="flex flex-1 pt-16">
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <main className={`flex-1 transition-all duration-300 p-4 md:p-6 ${collapsed ? 'md:ml-[70px]' : 'md:ml-[240px]'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
