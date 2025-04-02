
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
  const [authChecked, setAuthChecked] = useState(false); 
  const { toast } = useToast();

  // Add function to update JWT claims for admin users
  const updateJwtClaimsIfAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Call the edge function to update JWT claims if the user is an admin
      const { error } = await supabase.functions.invoke('handle-auth-jwt');
      if (error) {
        console.error('Error updating JWT claims:', error);
      }
    } catch (error) {
      console.error('Error in updateJwtClaimsIfAdmin:', error);
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle(); 
          
        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }
        
        if (profile) {
          console.log('User profile loaded:', profile);
          setUser({
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            role: profile.role,
            company_id: profile.company_id,
            companyId: profile.company_id,
            provider_id: profile.provider_id,
            created_at: profile.created_at,
          });
          
          // If the user is an admin, update their JWT claims
          if (profile.role === 'admin') {
            updateJwtClaimsIfAdmin();
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Don't use mockData in production to prevent potential issues
      if (process.env.NODE_ENV === 'development') {
        try {
          const { getCurrentUser } = await import('@/lib/mockData');
          const mockUser = getCurrentUser();
          setUser(mockUser);
        } catch (mockError) {
          console.error('Failed to load mock data:', mockError);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      setAuthChecked(true); 
    }
  };

  useEffect(() => {
    // Create a flag to prevent multiple initializations
    let isMounted = true;
    
    // Only fetch the initial session once to prevent loops
    if (!authChecked) {
      supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return;
        
        if (data.session) {
          refreshUser();
        } else {
          setUser(null);
          setIsLoading(false);
          setAuthChecked(true);
        }
      }).catch(error => {
        console.error("Initial auth check failed:", error);
        if (isMounted) {
          setIsLoading(false);
          setAuthChecked(true);
          setUser(null);
        }
      });
    }
    
    // Set up auth listener only once with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      console.log("Auth state change:", event);
      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          refreshUser();
        } else if (event === 'SIGNED_OUT') {
          // Removed 'USER_DELETED' comparison that was causing TypeScript error
          setUser(null);
          setAuthChecked(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (isMounted) {
          setIsLoading(false);
          setAuthChecked(true);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [authChecked]); 

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
