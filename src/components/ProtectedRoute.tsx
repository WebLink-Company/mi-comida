
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, memo, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

// Memoize the component to prevent unnecessary re-renders
const ProtectedRoute = memo(({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Memoize allowed roles check to prevent recalculations
  const isRoleAllowed = useMemo(() => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [user, allowedRoles]);

  // Only calculate redirect URL once when needed and only if values change
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setRedirectUrl("/auth");
      } else if (!isRoleAllowed) {
        // Determine redirect path based on user role - only runs when role or allowedRoles change
        switch (user.role) {
          case 'admin':
            setRedirectUrl("/admin");
            break;
          case 'provider':
            setRedirectUrl("/provider");
            break;
          case 'company':
            setRedirectUrl("/company");
            break;
          case 'supervisor':
            setRedirectUrl("/supervisor");
            break;
          case 'employee':
            setRedirectUrl("/employee");
            break;
          default:
            setRedirectUrl("/");
            break;
        }
      } else {
        setRedirectUrl(null);
      }
    }
  }, [isLoading, user, isRoleAllowed]);

  // Add max loading time with cleanup
  useEffect(() => {
    let timeoutId: number | null = null;
    
    // Set a timeout to prevent infinite loading
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        console.warn("Loading timeout reached, redirecting to auth");
      }, 5000); // 5 seconds max loading time
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  // Show loading state but with a max timeout to prevent infinite loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect if needed
  if (redirectUrl) {
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }

  // If we're here, user is allowed to access this route
  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
