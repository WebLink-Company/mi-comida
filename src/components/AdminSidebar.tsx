
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChevronLeft,
  LayoutDashboard, 
  Users, 
  Building, 
  ChefHat, 
  BarChart3,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const sidebarItems = [
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

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar = ({ collapsed, setCollapsed }: AdminSidebarProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
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
            Admin
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
              {sidebarItems.map(item => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      className={({ isActive }) => cn(
                        "flex items-center p-2 my-1 rounded-md transition-colors group hover:bg-accent",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="flex-shrink-0 h-5 w-5" />
                      <span className={cn(
                        "ml-3 transition-all duration-300",
                        collapsed ? "opacity-0 w-0" : "opacity-100"
                      )}>
                        {item.name}
                      </span>
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </div>
        
        <div className={cn(
          "border-t border-border p-4 transition-opacity",
          collapsed ? "opacity-75" : "opacity-100"
        )}>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              A
            </div>
            <div className={cn(
              "ml-3 transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              <p className="text-sm font-medium">Admin Panel</p>
              <p className="text-xs text-muted-foreground">v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
