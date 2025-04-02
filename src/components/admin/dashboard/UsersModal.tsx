
import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserForm from '@/components/admin/UserForm';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_URL } from '@/lib/constants';

interface UsersModalProps {
  onClose: () => void;
}

export const UsersModal: React.FC<UsersModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const createUser = async (formData: any) => {
    try {
      if (!formData.email || !formData.first_name || !formData.last_name || !formData.role || !formData.password) {
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
          password: formData.password
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }
      
      onClose();
      toast({
        title: 'Success',
        description: 'User created successfully.',
      });
      
      setTimeout(() => navigate('/admin/users'), 100);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const handleNavigation = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 100);
  };

  return (
    <DialogContent 
      className="sm:max-w-md modal-glassmorphism overflow-y-auto max-h-[90vh] bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-white/10 shadow-xl backdrop-blur-md"
      onInteractOutside={(e) => {
        e.preventDefault();
        handleClose();
      }}
      onEscapeKeyDown={(e) => {
        e.preventDefault();
        handleClose();
      }}
    >
      <div className="absolute inset-0 rounded-lg bg-blue-500/5 z-[-1]"></div>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-[-1]"></div>
      
      <DialogHeader className="pb-4 border-b border-white/10">
        <DialogTitle className="text-gradient text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Create New User
        </DialogTitle>
        <DialogDescription className="text-white/70">
          Add a new user to the system
        </DialogDescription>
      </DialogHeader>

      <div className="py-3">
        <UserForm 
          onSubmit={createUser}
          onCancel={handleClose}
          isAdmin={isAdmin}
        />
      </div>

      <DialogFooter className="flex flex-wrap gap-2 justify-end mt-4 border-t border-white/10 pt-4">
        <Badge 
          variant="secondary"
          className="py-2 z-50 cursor-pointer hover:bg-primary/20 modal-button transition-all duration-300 bg-white/10 hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('/admin/users');
          }}
        >
          <Users size={14} className="mr-1" />
          Users
        </Badge>
        <Badge 
          variant="secondary"
          className="py-2 z-50 cursor-pointer hover:bg-primary/20 modal-button transition-all duration-300 bg-white/10 hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('/admin/settings');
          }}
        >
          <FileText size={14} className="mr-1" />
          Permissions
        </Badge>
      </DialogFooter>
    </DialogContent>
  );
};
