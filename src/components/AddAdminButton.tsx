
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AddAdminButton = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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
          description: 'QA Admin user has been created successfully with password: Prueba33',
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

  const resetAdminPassword = async () => {
    setIsResetting(true);
    try {
      // First try to sign in with admin credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'qaadmin@lunchwise.app',
        password: 'Prueba33',
      });

      // If sign in fails, try to reset the password
      if (signInError) {
        console.log('Sign in failed, attempting password reset');
        
        // First check if the user exists
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'qaadmin@lunchwise.app')
          .limit(1);
        
        if (!userData || userData.length === 0) {
          throw new Error('Admin user does not exist');
        }
        
        // Use password reset functionality
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          'qaadmin@lunchwise.app',
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );
        
        if (resetError) throw resetError;
        
        toast({
          title: 'Password reset email sent',
          description: 'Check qaadmin@lunchwise.app inbox for password reset instructions',
        });
      } else {
        // If sign in succeeds, we can update the password directly
        const { error: updateError } = await supabase.auth.updateUser({
          password: 'Prueba33'
        });
        
        if (updateError) throw updateError;
        
        toast({
          title: 'Password reset successful',
          description: 'The password has been reset to: Prueba33',
        });
        
        // Sign out after password reset
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error resetting admin password:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset admin password',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Create QA Admin User</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create a specific admin user with email: qaadmin@lunchwise.app and password: Prueba33
      </p>
      
      <div className="space-y-2">
        <Button 
          onClick={createAdminUser} 
          disabled={isCreating || isResetting}
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
        
        <Button 
          onClick={resetAdminPassword} 
          disabled={isCreating || isResetting}
          variant="outline"
          className="w-full"
        >
          {isResetting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            'Reset Admin Password'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddAdminButton;
