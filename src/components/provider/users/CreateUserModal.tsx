import React, { useState } from 'react';
import { 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_URL } from '@/lib/constants';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

interface CreateUserModalProps {
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ 
  companyId, 
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'employee',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user?.provider_id) {
        throw new Error('Provider ID not found');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authenticated session');
      }
      
      const payload = {
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role,
        provider_id: user.provider_id,
        company_id: companyId,
        password: formData.password
      };
      
      console.log("Creating user with payload:", JSON.stringify({
        ...payload,
        password: "***REDACTED***"
      }));
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log("Create user response:", result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }
      
      toast({
        title: 'Success',
        description: 'User created successfully.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialogContent 
      className="blue-glass-modal max-w-md overflow-y-auto max-h-[90vh]"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <AlertDialogHeader className="pb-4 border-b border-white/20">
        <div className="flex items-center">
          <Button 
            variant="ghost"
            size="sm"
            className="mr-2 rounded-full p-0 h-8 w-8 text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <AlertDialogTitle className="text-2xl font-bold text-white">
              Add New User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Create a new user for this company
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>

      <form 
        onSubmit={(e) => {
          e.stopPropagation();
          handleSubmit(e);
        }} 
        className="py-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>
          <div onClick={(e) => e.stopPropagation()}>
            <label className="block text-sm font-medium text-white mb-1">
              First Name
            </label>
            <Input 
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`bg-white/10 border-white/20 text-white ${errors.first_name ? 'border-red-500' : ''}`}
              placeholder="First name"
              onClick={(e) => e.stopPropagation()}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>
            )}
          </div>
          
          <div onClick={(e) => e.stopPropagation()}>
            <label className="block text-sm font-medium text-white mb-1">
              Last Name
            </label>
            <Input 
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`bg-white/10 border-white/20 text-white ${errors.last_name ? 'border-red-500' : ''}`}
              placeholder="Last name"
              onClick={(e) => e.stopPropagation()}
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>
            )}
          </div>
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <label className="block text-sm font-medium text-white mb-1">
            Email
          </label>
          <Input 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            type="email"
            className={`bg-white/10 border-white/20 text-white ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Email address"
            onClick={(e) => e.stopPropagation()}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <label className="block text-sm font-medium text-white mb-1">
            Role
          </label>
          <select 
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="supervisor">Supervisor</option>
            <option value="employee">Employee</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-400">{errors.role}</p>
          )}
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <label className="block text-sm font-medium text-white mb-1">
            Password
          </label>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Input 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              type={showPassword ? 'text' : 'password'}
              className={`bg-white/10 border-white/20 text-white pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Create password"
              onClick={(e) => e.stopPropagation()}
            />
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto text-white/70 hover:text-white hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <label className="block text-sm font-medium text-white mb-1">
            Confirm Password
          </label>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Input 
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              type={showPassword ? 'text' : 'password'}
              className={`bg-white/10 border-white/20 text-white pr-10 ${errors.confirm_password ? 'border-red-500' : ''}`}
              placeholder="Confirm password"
              onClick={(e) => e.stopPropagation()}
            />
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto text-white/70 hover:text-white hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.confirm_password && (
            <p className="mt-1 text-sm text-red-400">{errors.confirm_password}</p>
          )}
        </div>
        
        <AlertDialogFooter className="pt-4" onClick={(e) => e.stopPropagation()}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white bg-white/10 border-white/20 hover:bg-white/20"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Create User
          </Button>
        </AlertDialogFooter>
      </form>
    </AlertDialogContent>
  );
};

export default CreateUserModal;
