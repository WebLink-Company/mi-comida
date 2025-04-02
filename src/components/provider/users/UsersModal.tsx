
import React, { useState } from 'react';
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Users, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AlertDialog } from '@/components/ui/alert-dialog';
import CreateUserModal from './CreateUserModal';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  userCount: number;
}

interface UsersModalProps {
  company: Company;
  users: User[];
  onUserClick: (user: User) => void;
  onClose: () => void;
}

const UsersModal: React.FC<UsersModalProps> = ({ 
  company, 
  users, 
  onUserClick,
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           user.email.toLowerCase().includes(searchLower) || 
           user.role.toLowerCase().includes(searchLower);
  });

  const getRoleBadgeVariant = (role: string) => {
    switch(role.toLowerCase()) {
      case 'admin':
        return 'default';
      case 'supervisor':
        return 'secondary';
      case 'provider':
        return 'success';
      case 'employee':
      default:
        return 'outline';
    }
  };

  const handleCreateUserSuccess = () => {
    setIsCreateUserOpen(false);
    // The parent component should refresh users
    // We can add a callback to the parent component if needed
  };
  
  return (
    <>
      <DialogContent 
        className="sm:max-w-3xl blue-glass-modal overflow-y-auto max-h-[90vh] shadow-2xl backdrop-blur-2xl"
        onInteractOutside={(e) => {
          e.preventDefault();
          onClose();
        }}
        onEscapeKeyDown={onClose}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="pb-4 border-b border-white/20">
          <div className="flex items-center">
            <Button 
              variant="ghost"
              size="sm"
              className="mr-2 rounded-full p-0 h-8 w-8 text-white hover:bg-white/10"
              onClick={onClose}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {company.name || `Company ${company.id.substring(0, 6)}`}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Managing {company.userCount} users in this company
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[280px] bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <Button 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateUserOpen(true);
              }}
            >
              <Plus className="mr-1 h-4 w-4" /> Add User
            </Button>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="rounded-md border border-white/20 overflow-hidden blue-glass-table">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[250px] text-white">Name</TableHead>
                    <TableHead className="hidden md:table-cell text-white">Email</TableHead>
                    <TableHead className="w-[100px] text-white">Role</TableHead>
                    <TableHead className="hidden sm:table-cell w-[120px] text-white">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id}
                      className="cursor-pointer hover:bg-white/10 table-row-hover"
                      onClick={() => onUserClick(user)}
                    >
                      <TableCell className="font-medium text-white">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-white/80">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize bg-white/20 text-white">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-white/80">
                        {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-lg">
              <Users className="h-12 w-12 text-white/40 mb-4" />
              <p className="text-lg font-medium text-white">No users found</p>
              <p className="text-sm text-white/70 mt-1 max-w-sm">
                {searchTerm ? 'Try adjusting your search term' : 'There are no users in this company yet'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-white/20 pt-4">
          <div className="text-xs text-white/60">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Create User Modal */}
      <AlertDialog 
        open={isCreateUserOpen}
        onOpenChange={(open) => {
          if (!open) setIsCreateUserOpen(false);
        }}
      >
        <CreateUserModal
          companyId={company.id}
          onClose={() => setIsCreateUserOpen(false)}
          onSuccess={handleCreateUserSuccess}
        />
      </AlertDialog>
    </>
  );
};

export default UsersModal;
