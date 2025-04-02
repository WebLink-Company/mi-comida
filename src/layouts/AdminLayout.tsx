
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import GlassSidebar from '@/components/GlassSidebar';
import NavigationBar from '@/components/NavigationBar';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true); // Default to collapsed
  const { toast } = useToast();

  // Handle page title based on the current route
  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const title = path.charAt(0).toUpperCase() + path.slice(1);
    document.title = `Admin | ${title}`;
  }, [location]);

  // Retrieve sidebar state from localStorage
  useEffect(() => {
    const storedState = localStorage.getItem('sidebarCollapsed');
    if (storedState !== null) {
      setCollapsed(storedState === 'true');
    }
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #1877F2 0%, #1158D1 50%, #7B3FE4 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <NavigationBar 
        userRole="admin" 
        userName={`${user?.first_name || ''} ${user?.last_name || ''}`} 
      />
      
      <div className="flex flex-1 pt-16">
        <GlassSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <main className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 ${collapsed ? 'ml-[70px]' : 'ml-[240px]'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
