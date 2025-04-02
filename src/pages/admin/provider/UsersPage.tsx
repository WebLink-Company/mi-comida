import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog } from '@/components/ui/dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import CompanyCard from '@/components/provider/users/CompanyCard';
import UsersModal from '@/components/provider/users/UsersModal';
import UserDetailsModal from '@/components/provider/users/UserDetailsModal';
import { Loader2 } from 'lucide-react';

// Types
interface Company {
  id: string;
  name: string;
  userCount: number;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
}

const ProviderUsersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.provider_id) {
      fetchCompanies();
    }
  }, [user]);

  // Clean up modals on unmount to prevent issues
  useEffect(() => {
    return () => {
      setIsUserModalOpen(false);
      setIsDetailsModalOpen(false);
      setSelectedCompany(null);
      setSelectedUser(null);
    };
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Get all companies for the current provider
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('provider_id', user?.provider_id);

      if (companiesError) throw companiesError;

      // Get user counts for each company
      const companiesWithCounts = await Promise.all(companies.map(async (company) => {
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('provider_id', user?.provider_id);

        if (countError) throw countError;

        return {
          ...company,
          userCount: count || 0
        };
      }));

      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyClick = async (company: Company) => {
    try {
      setSelectedCompany(company);
      
      // Get all users for the selected company
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', company.id)
        .eq('provider_id', user?.provider_id);

      if (error) throw error;
      
      setCompanyUsers(users || []);
      setIsUserModalOpen(true);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company users',
        variant: 'destructive',
      });
    }
  };

  const handleUserClick = async (selectedUser: User) => {
    try {
      setSelectedUser(selectedUser);
      
      // Fetch orders for this user
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, date, status, lunch_option_id')
        .eq('user_id', selectedUser.id)
        .order('date', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Add mock total for now since we don't have a direct total in orders table
      const ordersWithTotal = orders.map(order => ({
        id: order.id,
        date: order.date,
        status: order.status,
        total: Math.floor(Math.random() * 2000) / 100 // Random price between 0-20
      }));
      
      setUserOrders(ordersWithTotal);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user orders',
        variant: 'destructive',
      });
    }
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    
    // Use a small timeout to ensure state is cleaned up after animation
    setTimeout(() => {
      if (!isDetailsModalOpen) {
        setSelectedCompany(null);
        setCompanyUsers([]);
      }
    }, 300); 
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    
    // Use a small timeout to ensure state is cleaned up after animation
    setTimeout(() => {
      setSelectedUser(null);
      setUserOrders([]);
    }, 300);
  };

  const handleBackFromDetails = () => {
    setIsDetailsModalOpen(false);
    
    setTimeout(() => {
      setSelectedUser(null);
      setUserOrders([]);
    }, 300);
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Companies & Users</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((company) => (
              <CompanyCard 
                key={company.id} 
                company={company} 
                onClick={() => handleCompanyClick(company)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg text-gray-300">No companies found for your provider account.</p>
            <p className="text-sm text-gray-400 mt-2">
              Companies will appear here once they are associated with your provider account.
            </p>
          </div>
        )}
      </div>

      {/* Users Modal (Level 2) */}
      <Dialog 
        open={isUserModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleCloseUserModal();
          }
        }}
      >
        {selectedCompany && (
          <UsersModal
            company={selectedCompany}
            users={companyUsers}
            onUserClick={handleUserClick}
            onClose={handleCloseUserModal}
          />
        )}
      </Dialog>

      {/* User Details Modal (Level 3) */}
      <AlertDialog 
        open={isDetailsModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleBackFromDetails();
          }
        }}
      >
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            orders={userOrders}
            onClose={handleBackFromDetails}
          />
        )}
      </AlertDialog>
    </div>
  );
};

export default ProviderUsersPage;
