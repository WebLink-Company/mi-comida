
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { DialogFooter } from '@/components/ui/dialog';
import { Company } from '@/lib/types';

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
  isAdmin: boolean;
}

const UserForm = ({ initialData, onSubmit, onCancel, isAdmin }: UserFormProps) => {
  const [formData, setFormData] = useState<Partial<User>>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'employee',
    company_id: initialData?.company_id || undefined
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Only fetch companies if the user is an admin
    if (isAdmin) {
      const fetchCompanies = async () => {
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('id, name')
            .order('name', { ascending: true });
            
          if (error) throw error;
          setCompanies(data || []);
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      };
      
      fetchCompanies();
    }
  }, [isAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user makes a change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (isAdmin && ['employee', 'supervisor'].includes(formData.role || '') && !formData.company_id) {
      newErrors.company_id = 'Company is required for employee and supervisor roles';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (validate()) {
      onSubmit(formData);
    }
    
    setLoading(false);
  };

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'company', label: 'Company' },
    { value: 'provider', label: 'Provider' }
  ];
  
  // Only admins can create other admins
  if (isAdmin) {
    roleOptions.unshift({ value: 'admin', label: 'Admin' });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium mb-1">First Name</label>
            <Input
              id="first_name"
              name="first_name"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleChange}
              className={errors.first_name ? 'border-destructive' : ''}
            />
            {errors.first_name && (
              <p className="text-destructive text-xs mt-1">{errors.first_name}</p>
            )}
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium mb-1">Last Name</label>
            <Input
              id="last_name"
              name="last_name"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleChange}
              className={errors.last_name ? 'border-destructive' : ''}
            />
            {errors.last_name && (
              <p className="text-destructive text-xs mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'border-destructive' : ''}
            // Disable email editing for existing users (would be handled by auth system)
            disabled={!!initialData?.id}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border ${errors.role ? 'border-destructive' : 'border-input'} bg-background`}
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-destructive text-xs mt-1">{errors.role}</p>
          )}
        </div>
        
        {isAdmin && (
          <div>
            <label htmlFor="company_id" className="block text-sm font-medium mb-1">Company</label>
            <select
              id="company_id"
              name="company_id"
              value={formData.company_id || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md border ${errors.company_id ? 'border-destructive' : 'border-input'} bg-background`}
            >
              <option value="">Select a company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.company_id && (
              <p className="text-destructive text-xs mt-1">{errors.company_id}</p>
            )}
            <p className="text-muted-foreground text-xs mt-1">
              Required for employee and supervisor roles
            </p>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel} className="mr-2">
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {initialData ? 'Update' : 'Create'} User
        </Button>
      </DialogFooter>
    </form>
  );
};

export default UserForm;
