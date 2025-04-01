import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { User, Company, UserRole, Provider } from '@/lib/types';
import { Search, User as UserIcon, Mail, Building2, Edit, Eye, Plus, Trash } from 'lucide-react';
import UserForm from '@/components/admin/UserForm';
import { SUPABASE_URL } from '@/lib/constants';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const canManageUsers = user && (user.role === 'admin' || user.role === 'provider');

  const fetchProviders = async () => {
    try {
      let query = supabase.from('providers').select('*');
      
      if (user && user.role === 'provider' && user.provider_id) {
        query = query.eq('id', user.provider_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load provider data',
        variant: 'destructive',
      });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('first_name');
      
      if (user && user.role === 'provider' && user.provider_id) {
        query = query.eq('provider_id', user.provider_id);
      } else if (user && user.role === 'company' && user.company_id) {
        query = query.eq('company_id', user.company_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      let query = supabase
        .from('companies')
        .select('id, name, subsidy_percentage, provider_id')
        .order('name');
      
      if (user && user.role === 'provider' && user.provider_id) {
        query = query.eq('provider_id', user.provider_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company data',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
    fetchProviders();
  }, [user, toast]);

  const filteredUsers = users.filter((user) =>
    search === '' ||
    user.first_name.toLowerCase().includes(search.toLowerCase()) ||
    user.last_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const createUser = async (formData: Partial<User>) => {
    try {
      if (!formData.email || !formData.first_name || !formData.last_name || !formData.role) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      if (formData.role === 'provider' && !formData.provider_id) {
        toast({
          title: 'Error',
          description: 'Provider ID is required for provider role',
          variant: 'destructive',
        });
        return;
      }
      
      if (['supervisor', 'employee'].includes(formData.role as string) && 
          (!formData.provider_id || !formData.company_id)) {
        toast({
          title: 'Error',
          description: 'Provider and Company are required for this role',
          variant: 'destructive',
        });
        return;
      }
      
      const tempPassword = Math.random().toString(36).slice(-10);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authenticated session');
      }
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          provider_id: formData.provider_id,
          company_id: formData.company_id,
          tempPassword
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }
      
      setIsCreateOpen(false);
      toast({
        title: 'Success',
        description: 'User created successfully with a temporary password. The user will need to reset their password on first login.',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const updateUser = async (formData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      if (formData.role === 'provider' && !formData.provider_id) {
        toast({
          title: 'Error',
          description: 'Provider ID is required for provider role',
          variant: 'destructive',
        });
        return;
      }
      
      if (['supervisor', 'employee'].includes(formData.role as string) && 
          (!formData.provider_id || !formData.company_id)) {
        toast({
          title: 'Error',
          description: 'Provider and Company are required for this role',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role as UserRole,
          company_id: formData.company_id || null,
          provider_id: formData.provider_id || null
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setIsEditOpen(false);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authenticated session');
      }
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      setIsDeleteOpen(false);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getProviderName = (providerId?: string) => {
    if (!providerId) return 'N/A';
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.business_name : 'N/A';
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return 'N/A';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage users and their roles within the system.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canManageUsers && (
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            <span>New User</span>
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              {(user?.role === 'admin' || user?.role === 'provider') && (
                <TableHead>Provider</TableHead>
              )}
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={user?.role === 'admin' ? 6 : 5} className="text-center py-4">Loading...</TableCell>
              </TableRow>
            )}
            {!loading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={user?.role === 'admin' ? 6 : 5} className="text-center py-4">No users found.</TableCell>
              </TableRow>
            )}
            {filteredUsers.map((userItem) => (
              <TableRow key={userItem.id}>
                <TableCell className="font-medium">{userItem.first_name} {userItem.last_name}</TableCell>
                <TableCell>{userItem.email}</TableCell>
                <TableCell>{userItem.role}</TableCell>
                {(user?.role === 'admin' || user?.role === 'provider') && (
                  <TableCell>{getProviderName(userItem.provider_id)}</TableCell>
                )}
                <TableCell>{getCompanyName(userItem.company_id)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedUser(userItem);
                    setIsViewOpen(true);
                  }}>
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  {canManageUsers && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedUser(userItem);
                        setIsEditOpen(true);
                      }}>
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => {
                        setSelectedUser(userItem);
                        setIsDeleteOpen(true);
                      }}>
                        <Trash className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p>{selectedUser.first_name} {selectedUser.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Role</p>
                <p>{selectedUser.role}</p>
              </div>
              {selectedUser.provider_id && (
                <div>
                  <p className="text-sm font-medium">Provider</p>
                  <p>{getProviderName(selectedUser.provider_id)}</p>
                </div>
              )}
              {selectedUser.company_id && (
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p>{getCompanyName(selectedUser.company_id)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user's information here.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm 
              initialData={selectedUser}
              onSubmit={updateUser}
              onCancel={() => setIsEditOpen(false)}
              isAdmin={user?.role === 'admin'}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="bg-muted/50 p-4 rounded flex items-center gap-3 my-2">
              <UserIcon size={24} className="text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system.
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            onSubmit={createUser}
            onCancel={() => setIsCreateOpen(false)}
            isAdmin={user?.role === 'admin'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
