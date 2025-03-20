
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AddAdminButton = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const { toast } = useToast();

  const createAdminUser = async () => {
    setIsCreating(true);
    try {
      // Check if the user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'qaadmin@lunchwise.app')
        .limit(1);

      if (existingUser && existingUser.length > 0) {
        toast({
          title: 'Admin user already exists',
          description: 'The qaadmin@lunchwise.app user is already in the database.',
        });
        setIsCreated(true);
        return;
      }

      // Create the user in auth
      const { data, error } = await supabase.auth.signUp({
        email: 'qaadmin@lunchwise.app',
        password: 'Prueba33',
        options: {
          data: {
            first_name: 'QA',
            last_name: 'Admin',
            role: 'admin'
          },
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;

      // The profile should be created automatically via trigger,
      // but let's verify
      if (data.user) {
        toast({
          title: 'Admin user created',
          description: 'QA Admin user has been created successfully.',
        });
        setIsCreated(true);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create admin user',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Create QA Admin User</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a specific admin user with email: qaadmin@lunchwise.app and password: Prueba33
      </p>
      
      <Button 
        onClick={createAdminUser} 
        disabled={isCreating || isCreated}
        variant="default"
        className="w-full"
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating admin user...
          </>
        ) : isCreated ? (
          'Admin User Created'
        ) : (
          'Create QA Admin User'
        )}
      </Button>
    </div>
  );
};

export default AddAdminButton;
