
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ChevronLeft,
  LayoutDashboard, 
  Users, 
  Building, 
  ChefHat, 
  BarChart3,
  Settings,
  Menu,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import RoleBasedLink from './RoleBasedLink';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar = ({ collapsed, setCollapsed }: AdminSidebarProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const role = user?.role || 'admin';
  
  // Different sidebar items based on user role
  const getSidebarItems = () => {
    // Admin sidebar items
    if (role === 'admin') {
      return [
        { 
          name: 'Dashboard', 
          icon: LayoutDashboard, 
          path: '/admin',
          exact: true 
        },
        { 
          name: 'Users', 
          icon: Users, 
          path: '/admin/users' 
        },
        { 
          name: 'Companies', 
          icon: Building, 
          path: '/admin/companies' 
        },
        { 
          name: 'Providers', 
          icon: ChefHat, 
          path: '/admin/providers' 
        },
        { 
          name: 'Reports', 
          icon: BarChart3, 
          path: '/admin/reports' 
        },
        { 
          name: 'Settings', 
          icon: Settings, 
          path: '/admin/settings' 
        }
      ];
    }
    // Provider sidebar items
    else if (role === 'provider') {
      return [
        { 
          name: 'Dashboard', 
          icon: LayoutDashboard, 
          path: '/provider', 
          exact: true
        },
        { 
          name: 'Menu', 
          icon: Menu, 
          path: '/provider/menu' 
        },
        { 
          name: 'Orders', 
          icon: ClipboardList, 
          path: '/provider/orders' 
        },
        { 
          name: 'Companies', 
          icon: Building, 
          path: '/provider/companies' 
        },
        { 
          name: 'Assign Menus', 
          icon: ChefHat, 
          path: '/provider/assign-menus' 
        },
        { 
          name: 'Delivery', 
          icon: ChefHat, 
          path: '/provider/delivery-settings' 
        },
        { 
          name: 'Settings', 
          icon: Settings, 
          path: '/provider/settings' 
        }
      ];
    }
    
    // Default sidebar items if role doesn't match
    return [];
  };
  
  const sidebarItems = getSidebarItems();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className={cn(
            "font-semibold text-xl transition-opacity", 
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            {role === 'admin' ? 'Admin' : 'Provider'}
          </h2>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft 
              className={cn(
                "h-5 w-5 transition-transform",
                collapsed ? "rotate-180" : "rotate-0"
              )} 
            />
          </button>
        </div>
        
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <TooltipProvider delayDuration={0}>
              {sidebarItems.map(item => {
                const isActive = item.exact 
                  ? location.pathname === item.path 
                  : location.pathname.startsWith(item.path);
                
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <RoleBasedLink
                        adminPath={item.path}
                        className={cn(
                          "flex items-center p-2 my-1 rounded-md transition-colors group hover:bg-accent",
                          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                        )}
                        end={item.exact}
                      >
                        <item.icon className="flex-shrink-0 h-5 w-5" />
                        <span className={cn(
                          "ml-3 transition-all duration-300",
                          collapsed ? "opacity-0 w-0" : "opacity-100"
                        )}>
                          {item.name}
                        </span>
                      </RoleBasedLink>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>
        </div>
        
        <div className={cn(
          "border-t border-border p-4 transition-opacity",
          collapsed ? "opacity-75" : "opacity-100"
        )}>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {role === 'admin' ? 'A' : 'P'}
            </div>
            <div className={cn(
              "ml-3 transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              <p className="text-sm font-medium">{role === 'admin' ? 'Admin' : 'Provider'} Panel</p>
              <p className="text-xs text-muted-foreground">v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
