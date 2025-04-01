
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { DialogFooter } from '@/components/ui/dialog';
import { Company, Provider } from '@/lib/types';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: Partial<User> & { password?: string }) => void;
  onCancel: () => void;
  isAdmin: boolean;
}

const UserForm = ({ initialData, onSubmit, onCancel, isAdmin }: UserFormProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Define validation schema based on role and whether we're creating or editing
  const formSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    role: z.enum(['admin', 'provider', 'supervisor', 'employee', 'company'] as const),
    provider_id: z.string().optional(),
    company_id: z.string().optional(),
    password: initialData ? z.string().optional() : z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: initialData ? z.string().optional() : z.string().min(8, 'Please confirm your password'),
  }).refine(data => {
    // Provider role requires provider_id
    if (data.role === 'provider' && !data.provider_id) {
      return false;
    }
    // Supervisor and employee roles require both provider_id and company_id
    if (['supervisor', 'employee'].includes(data.role) && 
        (!data.provider_id || !data.company_id)) {
      return false;
    }
    return true;
  }, {
    message: "Please fill all required fields for the selected role",
    path: ["role"]
  }).refine(data => {
    // Only check password matching when creating a new user
    if (!initialData && data.password !== data.confirm_password) {
      return false;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["confirm_password"]
  });
  
  type FormData = z.infer<typeof formSchema>;
  
  // Initialize form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      role: initialData?.role || 'employee',
      provider_id: initialData?.provider_id || undefined,
      company_id: initialData?.company_id || undefined,
      password: '',
      confirm_password: '',
    },
  });

  const watchRole = form.watch('role');
  const watchProviderId = form.watch('provider_id');
  
  // Fetch providers data
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        let query = supabase.from('providers').select('*').order('business_name');
        
        // If current user is a provider, they can only create/edit users for their own provider account
        if (user && user.role === 'provider' && user.provider_id) {
          query = query.eq('id', user.provider_id);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setProviders(data || []);
        
        // If there's only one provider and user is a provider, auto-select it
        if (data && data.length === 1 && user?.role === 'provider') {
          form.setValue('provider_id', data[0].id);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load providers data',
          variant: 'destructive',
        });
      }
    };
    
    fetchProviders();
  }, [user, toast, form]);

  // Fetch companies data
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        let query = supabase.from('companies').select('*').order('name');
        
        // Filter companies by provider if user is a provider
        if (user?.role === 'provider' && user.provider_id) {
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
    
    fetchCompanies();
  }, [user, toast]);

  // Filter companies when provider changes
  useEffect(() => {
    if (watchProviderId) {
      const filtered = companies.filter(company => company.provider_id === watchProviderId);
      setFilteredCompanies(filtered);
      
      // If current company doesn't belong to selected provider, clear it
      const currentCompanyId = form.getValues('company_id');
      if (currentCompanyId) {
        const companyBelongsToProvider = filtered.some(company => company.id === currentCompanyId);
        if (!companyBelongsToProvider) {
          form.setValue('company_id', undefined);
        }
      }
    } else {
      setFilteredCompanies(companies);
    }
  }, [watchProviderId, companies, form]);

  // Handle role change
  useEffect(() => {
    // Clear provider_id and company_id when role changes to admin
    if (watchRole === 'admin') {
      form.setValue('provider_id', undefined);
      form.setValue('company_id', undefined);
    }
    
    // Clear company_id when role changes to provider
    if (watchRole === 'provider') {
      form.setValue('company_id', undefined);
    }
  }, [watchRole, form]);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      // For admin role, ensure provider_id and company_id are null
      if (data.role === 'admin') {
        data.provider_id = undefined;
        data.company_id = undefined;
      }
      
      // For provider role, ensure company_id is null
      if (data.role === 'provider') {
        data.company_id = undefined;
      }
      
      // Remove confirm_password before submitting
      const { confirm_password, ...submitData } = data;
      
      onSubmit(submitData);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  {...field} 
                  disabled={!!initialData?.id}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!initialData && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <select
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  {...field}
                >
                  {isAdmin && <option value="admin">Admin</option>}
                  <option value="provider">Provider</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="employee">Employee</option>
                  <option value="company">Company</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Provider field - show for provider, supervisor, employee roles */}
        {(watchRole === 'provider' || watchRole === 'supervisor' || watchRole === 'employee') && (
          <FormField
            control={form.control}
            name="provider_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <FormControl>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    {...field}
                    value={field.value || ""}
                    onChange={e => {
                      field.onChange(e.target.value || undefined);
                    }}
                  >
                    <option value="">Select a provider</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.business_name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
                {watchRole === 'provider' && (
                  <FormDescription>
                    Required for provider role
                  </FormDescription>
                )}
              </FormItem>
            )}
          />
        )}
        
        {/* Company field - show for supervisor and employee roles */}
        {(watchRole === 'supervisor' || watchRole === 'employee') && (
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    {...field}
                    value={field.value || ""}
                    onChange={e => {
                      field.onChange(e.target.value || undefined);
                    }}
                    disabled={!watchProviderId}
                  >
                    <option value="">
                      {!watchProviderId 
                        ? "Select a provider first" 
                        : filteredCompanies.length === 0 
                          ? "No companies available for this provider" 
                          : "Select a company"}
                    </option>
                    {filteredCompanies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Required for supervisor and employee roles
                </FormDescription>
              </FormItem>
            )}
          />
        )}
        
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {initialData ? 'Update' : 'Create'} User
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default UserForm;
