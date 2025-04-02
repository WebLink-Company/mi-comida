
import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import GlassSidebar from '@/components/GlassSidebar';
import NavigationBar from '@/components/NavigationBar';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true); // Default to collapsed
  const { toast } = useToast();
  const userRole = user?.role || "admin";

  // Handle page title based on the current route
  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const title = path.charAt(0).toUpperCase() + path.slice(1);
    document.title = `${userRole === 'admin' ? 'Admin' : 'Provider'} | ${title}`;
  }, [location, userRole]);

  // Redirect to correct section based on user role
  useEffect(() => {
    if (user) {
      const isInAdminSection = location.pathname.startsWith('/admin');
      const isInProviderSection = location.pathname.startsWith('/provider');
      
      if (user.role === 'admin' && isInProviderSection) {
        navigate('/admin');
      } else if (user.role === 'provider' && isInAdminSection) {
        navigate('/provider');
      }
    }
  }, [user, location.pathname, navigate]);

  // Retrieve sidebar state from localStorage
  useEffect(() => {
    const storedState = localStorage.getItem('sidebarCollapsed');
    if (storedState !== null) {
      setCollapsed(storedState === 'true');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* This div applies the blue gradient background to the entire screen */}
      <div className="blue-gradient-bg"></div>
      
      <NavigationBar 
        userRole={userRole} 
        userName={`${user?.first_name || ''} ${user?.last_name || ''}`} 
      />
      
      <div className="flex flex-1 pt-16">
        <GlassSidebar collapsed={collapsed} setCollapsed={setCollapsed} userRole={userRole} />
        
        <main className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 ${collapsed ? 'ml-[70px]' : 'ml-[240px]'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
