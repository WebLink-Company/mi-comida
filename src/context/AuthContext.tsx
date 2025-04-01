
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // Add this flag to prevent loops
  const { toast } = useToast();

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }
        
        if (profile) {
          setUser({
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            role: profile.role,
            company_id: profile.company_id,
            companyId: profile.company_id,
            created_at: profile.created_at,
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        import('@/lib/mockData').then(({ getCurrentUser }) => {
          const mockUser = getCurrentUser();
          setUser(mockUser);
        });
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      setAuthChecked(true); // Mark auth check as completed
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      await refreshUser();
    };

    if (!authChecked) { // Only run this if we haven't checked auth yet
      fetchUser();
    }

    // Set up auth listener only once
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [authChecked]); // Only depend on authChecked, not on refreshUser

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar sesión. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
