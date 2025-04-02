
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

interface GlassSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const GlassSidebar = ({ collapsed, setCollapsed }: GlassSidebarProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  // Update localStorage when sidebar state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
    setMounted(true);
  }, [collapsed]);
  
  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-30 backdrop-blur-md transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]",
        "glass-morphism bg-white/5 border-r border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className={cn(
            "font-semibold text-xl transition-opacity text-white", 
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Admin
          </h2>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
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
        
        <div className={cn(
          "flex-1 py-6 overflow-y-auto flex",
          collapsed && "justify-center"
        )}>
          <nav className={cn(
            "px-2 space-y-1 flex-1",
            collapsed && "flex flex-col items-center"
          )}>
            {sidebarItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => cn(
                  "flex items-center p-2 my-2 rounded-md transition-all duration-200 group hover-scale",
                  isActive 
                    ? "bg-white/10 text-white border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                  collapsed ? "justify-center w-10 h-10" : "px-4 w-full"
                )}
              >
                <item.icon className={cn(
                  "flex-shrink-0",
                  collapsed ? "h-6 w-6" : "h-5 w-5"
                )} />
                <span className={cn(
                  "ml-3 transition-all duration-300 whitespace-nowrap",
                  collapsed ? "hidden" : "block"
                )}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className={cn(
          "border-t border-white/10 p-4 transition-opacity",
          collapsed ? "opacity-75" : "opacity-100"
        )}>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              A
            </div>
            <div className={cn(
              "ml-3 transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              <p className="text-sm font-medium text-white">Admin Panel</p>
              <p className="text-xs text-white/70">v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default GlassSidebar;
