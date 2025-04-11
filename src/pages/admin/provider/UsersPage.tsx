
import React, { useEffect, useState, useCallback } from 'react';
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

  // Use useCallback to memoize the fetchCompanies function
  const fetchCompanies = useCallback(async () => {
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
        description: 'Error al cargar datos de empresas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.provider_id, toast]);

  useEffect(() => {
    if (user?.provider_id) {
      fetchCompanies();
    }
  }, [user, fetchCompanies]);

  // Clean up modals on unmount to prevent issues
  useEffect(() => {
    return () => {
      setIsUserModalOpen(false);
      setIsDetailsModalOpen(false);
      setSelectedCompany(null);
      setSelectedUser(null);
    };
  }, []);

  // Create a fetchUsers function that refreshes the user list for the selected company
  const fetchUsers = useCallback(async (companyId: string) => {
    try {
      // Get all users for the selected company
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId)
        .eq('provider_id', user?.provider_id);

      if (error) throw error;
      
      setCompanyUsers(users || []);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar usuarios de la empresa',
        variant: 'destructive',
      });
    }
  }, [user?.provider_id, toast]);

  const handleCompanyClick = async (company: Company) => {
    try {
      setSelectedCompany(company);
      await fetchUsers(company.id);
      setIsUserModalOpen(true);
    } catch (error) {
      console.error('Error in handleCompanyClick:', error);
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
        description: 'Error al cargar pedidos del usuario',
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
    // Only close the details modal, keeping the user modal open
    setIsDetailsModalOpen(false);
    
    // Use a small timeout to ensure state is cleaned up after animation
    setTimeout(() => {
      setSelectedUser(null);
      setUserOrders([]);
    }, 300);
  };

  const handleUserCreated = async () => {
    if (selectedCompany) {
      // Refresh the users list
      await fetchUsers(selectedCompany.id);
      
      // Also refresh the company list to update user counts
      fetchCompanies();
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Empresas & Usuarios</h1>
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
            <p className="text-lg text-gray-300">No se encontraron empresas para su cuenta de proveedor.</p>
            <p className="text-sm text-gray-400 mt-2">
              Las empresas aparecerán aquí una vez que estén asociadas con su cuenta de proveedor.
            </p>
          </div>
        )}
      </div>

      {/* Users Modal (Level 2) - This should stay open even when details modal is interacted with */}
      <Dialog 
        open={isUserModalOpen} 
        onOpenChange={(open) => {
          if (!open && !isDetailsModalOpen) {
            handleCloseUserModal();
          }
          // If details modal is open, don't change this modal's state when it would close
          else if (!open && isDetailsModalOpen) {
            setIsUserModalOpen(true); // Keep user modal open if details modal is open
          } else if (open) {
            setIsUserModalOpen(true);
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
            handleCloseDetailsModal();
          }
        }}
      >
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            orders={userOrders}
            onClose={handleCloseDetailsModal}
          />
        )}
      </AlertDialog>
    </div>
  );
};

export default ProviderUsersPage;
