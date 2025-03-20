
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
        
        // Try to ensure the password is set correctly
        await resetAdminPassword();
        return;
      }

      // Create the user in auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'qaadmin@lunchwise.app',
        password: 'Prueba33',
        email_confirm: true,
        user_metadata: {
          first_name: 'QA',
          last_name: 'Admin',
          role: 'admin'
        }
      });

      if (error) {
        // If admin API fails, try standard signup
        const signUpResult = await supabase.auth.signUp({
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
        
        if (signUpResult.error) throw signUpResult.error;
        data.user = signUpResult.data.user;
      }

      // The profile should be created automatically via trigger
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
      // Check if the admin user exists in auth
      const { data: authData, error: authError } = await supabase.auth.admin.getUserByEmail(
        'qaadmin@lunchwise.app'
      );
      
      if (authError || !authData.user) {
        // If admin API fails or user doesn't exist, check profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'qaadmin@lunchwise.app')
          .limit(1);
          
        if (!profileData || profileData.length === 0) {
          // If user doesn't exist in profiles either, create it
          await createAdminUser();
          return;
        }
        
        // User exists in profiles but not in auth, use password reset
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
        return;
      }
      
      // User exists in auth, use admin API to set password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authData.user.id,
        { password: 'Prueba33', email_confirm: true }
      );
      
      if (updateError) {
        // If admin API fails, try direct update
        const { error: directUpdateError } = await supabase.auth.updateUser({
          password: 'Prueba33'
        });
        
        if (directUpdateError) throw directUpdateError;
      }
      
      toast({
        title: 'Password reset successful',
        description: 'The password has been reset to: Prueba33',
      });
      
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

  const directLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'qaadmin@lunchwise.app',
        password: 'Prueba33',
      });
      
      if (error) throw error;
      
      toast({
        title: 'Login successful',
        description: 'You are now logged in as QA Admin',
      });
      
      // Redirect to admin dashboard or appropriate page
      window.location.href = '/admin';
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Could not log in with QA admin credentials',
        variant: 'destructive',
      });
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
        
        <Button 
          onClick={directLogin} 
          disabled={isCreating || isResetting}
          variant="secondary"
          className="w-full"
        >
          Direct Login as Admin
        </Button>
      </div>
    </div>
  );
};

export default AddAdminButton;
