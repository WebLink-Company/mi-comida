
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  const refreshInProgress = useRef(false);
  const lastRefreshAttempt = useRef(0);
  const MIN_REFRESH_INTERVAL = 2000; // 2 seconds

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
    // Prevent concurrent refresh calls
    if (refreshInProgress.current) return;
    
    // Check if we're trying to refresh too frequently
    const now = Date.now();
    if (now - lastRefreshAttempt.current < MIN_REFRESH_INTERVAL) {
      console.log('Refresh attempted too soon, skipping...');
      return;
    }
    
    lastRefreshAttempt.current = now;
    
    try {
      refreshInProgress.current = true;
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
            provider_id: profile.provider_id,
            created_at: profile.created_at,
          });
          
          // If the user is an admin, update their JWT claims
          if (profile.role === 'admin') {
            setTimeout(() => {
              updateJwtClaimsIfAdmin();
            }, 100);
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
      refreshInProgress.current = false;
    }
  };

  useEffect(() => {
    // Create a flag to prevent multiple initializations
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    // Handle the initial session check and set up the auth listener
    const setupAuth = async () => {
      try {
        // Only fetch the initial session once to prevent loops
        if (!authChecked) {
          const { data } = await supabase.auth.getSession();
          
          if (!isMounted) return;
          
          if (data.session) {
            refreshUser();
          } else {
            setUser(null);
            setIsLoading(false);
            setAuthChecked(true);
          }
        }
        
        // Set up auth listener only once with better error handling
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isMounted) return;
          
          console.log("Auth state change:", event);
          
          // Prevent handling the same events multiple times
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !refreshInProgress.current) {
            // Use setTimeout to prevent potential deadlocks with Supabase client
            setTimeout(() => {
              refreshUser();
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setAuthChecked(true);
            setIsLoading(false);
          }
        });
        
        authSubscription = data.subscription;
      } catch (error) {
        console.error("Auth setup error:", error);
        if (isMounted) {
          setIsLoading(false);
          setAuthChecked(true);
          setUser(null);
        }
      }
    };
    
    setupAuth();
    
    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
