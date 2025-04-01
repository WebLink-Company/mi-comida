
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, Users, Filter, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import UserForm from '@/components/admin/UserForm';

interface UserWithDetails extends User {
  company_name?: string;
}

interface CompanyStats {
  id: string;
  name: string;
  userCount: number;
}

const UsersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Fetch users and calculate stats
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            first_name, 
            last_name, 
            email, 
            role, 
            company_id,
            created_at,
            companies:company_id (name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Format the data to include company name
        const formattedUsers = data?.map(user => ({
          ...user,
          company_name: user.companies?.name || 'N/A'
        })) || [];
        
        setUsers(formattedUsers);
        setTotalUsers(formattedUsers.length);
        
        // Calculate company stats
        const stats = formattedUsers.reduce((acc: CompanyStats[], user) => {
          if (user.company_id && user.company_name) {
            const existingStat = acc.find(stat => stat.id === user.company_id);
            if (existingStat) {
              existingStat.userCount += 1;
            } else {
              acc.push({
                id: user.company_id,
                name: user.company_name,
                userCount: 1
              });
            }
          }
          return acc;
        }, []);
        
        setCompanyStats(stats);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Handler for creating a new user
  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      // In a real app, this would likely be an API call to create a user with auth
      const { data, error } = await supabase
        .from('profiles')
        .insert(userData) // Remove array wrapping to fix the type error
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully"
      });

      // Add the new user to the list with company name
      const newUser = { 
        ...data[0], 
        company_name: userData.company_id ? 
          companyStats.find(c => c.id === userData.company_id)?.name || 'N/A' : 
          'N/A' 
      };
      
      setUsers(prevUsers => [newUser, ...prevUsers]);
      setTotalUsers(prev => prev + 1);
      
      // Update company stats
      if (userData.company_id) {
        setCompanyStats(prev => {
          const existingStat = prev.find(stat => stat.id === userData.company_id);
          if (existingStat) {
            return prev.map(stat => 
              stat.id === userData.company_id 
                ? { ...stat, userCount: stat.userCount + 1 }
                : stat
            );
          } else {
            // This should not happen if company stats were loaded properly
            return prev;
          }
        });
      }
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handler for updating a user
  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                ...userData,
                company_name: userData.company_id !== user.company_id ?
                  companyStats.find(c => c.id === userData.company_id)?.name || 'N/A' :
                  user.company_name
              } 
            : user
        )
      );
      
      // Update company stats if company_id changed
      if (userData.company_id !== selectedUser.company_id) {
        setCompanyStats(prev => {
          let updated = [...prev];
          
          // Decrement count for old company
          if (selectedUser.company_id) {
            updated = updated.map(stat => 
              stat.id === selectedUser.company_id 
                ? { ...stat, userCount: Math.max(0, stat.userCount - 1) }
                : stat
            );
          }
          
          // Increment count for new company
          if (userData.company_id) {
            const existingStat = updated.find(stat => stat.id === userData.company_id);
            if (existingStat) {
              updated = updated.map(stat => 
                stat.id === userData.company_id 
                  ? { ...stat, userCount: stat.userCount + 1 }
                  : stat
              );
            }
          }
          
          return updated;
        });
      }
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handler for deleting a user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      // Remove the user from the list
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setTotalUsers(prev => prev - 1);
      
      // Update company stats
      if (selectedUser.company_id) {
        setCompanyStats(prev => 
          prev.map(stat => 
            stat.id === selectedUser.company_id 
              ? { ...stat, userCount: Math.max(0, stat.userCount - 1) }
              : stat
          )
        );
      }
      
      setIsDeleteAlertOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error", 
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        search === '' || 
        user.first_name.toLowerCase().includes(search.toLowerCase()) ||
        user.last_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
        
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, search, selectedRole]);

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'employee', label: 'Employee' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'company', label: 'Company' },
    { value: 'provider', label: 'Provider' }
  ];

  // Helper function to get badge color based on user role
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'employee': 
        return 'bg-green-100 text-green-800';
      case 'supervisor': 
        return 'bg-purple-100 text-purple-800';
      case 'company': 
        return 'bg-amber-100 text-amber-800';
      case 'provider':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Open edit dialog with user data
  const openEditDialog = (user: UserWithDetails) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (user: UserWithDetails) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage all users registered in the platform across different roles.
        </p>
      </div>

      {/* Stats Cards - Only visible to admins */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Total Users
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          
          {/* Company Stats Cards */}
          {companyStats.map(stat => (
            <Card key={stat.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    {stat.name}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.userCount}</div>
                <p className="text-xs text-muted-foreground">Users</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>User Management</CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="px-3 py-2 rounded-md border border-input bg-background"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading users...</TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => openEditDialog(user)}
                    >
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getRoleBadgeVariant(user.role)}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{user.company_name}</TableCell>
                      <TableCell>{new Date(user.created_at || '').toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(user);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline"
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(user);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user with role and company access.
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            onSubmit={handleCreateUser}
            onCancel={() => setIsCreateDialogOpen(false)}
            isAdmin={user?.role === 'admin'}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm 
              initialData={selectedUser}
              onSubmit={handleUpdateUser}
              onCancel={() => setIsEditDialogOpen(false)}
              isAdmin={user?.role === 'admin'}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteUser}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
