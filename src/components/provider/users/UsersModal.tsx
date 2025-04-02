
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
  
  return (
    <DialogContent 
      className="sm:max-w-3xl modal-glassmorphism overflow-y-auto max-h-[90vh] bg-gradient-to-br from-slate-50/90 to-white/90 dark:from-slate-900/90 dark:to-slate-800/90 border border-white/10 shadow-xl backdrop-blur-md"
      onInteractOutside={(e) => {
        e.preventDefault();
        onClose();
      }}
      onEscapeKeyDown={onClose}
    >
      <div className="absolute inset-0 rounded-lg bg-blue-500/5 z-[-1]"></div>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-[-1]"></div>
      
      <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center">
          <Button 
            variant="ghost"
            size="sm"
            className="mr-2 rounded-full p-0 h-8 w-8"
            onClick={onClose}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {company.name || `Company ${company.id.substring(0, 6)}`}
            </DialogTitle>
            <DialogDescription>
              Managing {company.userCount} users in this company
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="py-3">
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[280px]"
            />
          </div>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add User
          </Button>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            <Table className="w-full">
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="w-[100px]">Role</TableHead>
                  <TableHead className="hidden sm:table-cell w-[120px]">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={() => onUserClick(user)}
                  >
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">
                      {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No users found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              {searchTerm ? 'Try adjusting your search term' : 'There are no users in this company yet'}
            </p>
          </div>
        )}
      </div>

      <DialogFooter className="border-t border-gray-200 dark:border-gray-700/50 pt-4">
        <div className="text-xs text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default UsersModal;
