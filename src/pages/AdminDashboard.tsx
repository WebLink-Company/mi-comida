
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardPage from '@/pages/admin/DashboardPage';

const AdminDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Extract tab from URL if present
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1">
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <main className={`flex-1 transition-all duration-300 pt-16`}>
          <DashboardPage />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
