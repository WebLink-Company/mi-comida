
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ChevronLeft,
  LayoutDashboard, 
  Users, 
  Building, 
  Package, 
  Receipt,
  Settings,
  BarChart3,
  Truck,
  Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';
import RoleBasedLink from './RoleBasedLink';

interface GlassSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userRole?: string;
}

const GlassSidebar = ({ collapsed, setCollapsed, userRole = 'admin' }: GlassSidebarProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  // Define sidebar items with correct paths for each role
  const getSidebarItems = () => {
    const items = [
      { 
        name: 'Dashboard', 
        displayName: 'Panel Principal',
        icon: LayoutDashboard, 
        adminPath: '/admin',
        providerPath: '/provider',
        exact: true,
        roles: ['admin', 'provider'] 
      }
    ];

    // Items shown to admin users
    if (userRole === 'admin') {
      items.push(
        { 
          name: 'Users', 
          displayName: 'Usuarios',
          icon: Users, 
          adminPath: '/admin/users',
          providerPath: '/provider/users',
          exact: false,
          roles: ['admin'] 
        },
        { 
          name: 'Companies', 
          displayName: 'Empresas',
          icon: Building, 
          adminPath: '/admin/companies',
          providerPath: '/provider/companies',
          exact: false,
          roles: ['admin'] 
        },
        { 
          name: 'Providers', 
          displayName: 'Proveedores',
          icon: Package, 
          adminPath: '/admin/providers',
          providerPath: '/provider/providers',
          exact: false,
          roles: ['admin'] 
        },
        { 
          name: 'Reports', 
          displayName: 'Reportes',
          icon: BarChart3, 
          adminPath: '/admin/reports',
          providerPath: '/provider/reports',
          exact: false,
          roles: ['admin'] 
        },
        { 
          name: 'Settings', 
          displayName: 'Configuración',
          icon: Settings, 
          adminPath: '/admin/settings',
          providerPath: '/provider/settings',
          exact: false,
          roles: ['admin'] 
        }
      );
    }

    // Items shown to provider users
    if (userRole === 'provider') {
      items.push(
        { 
          name: 'Users', 
          displayName: 'Usuarios',
          icon: Users, 
          adminPath: '/admin/users',
          providerPath: '/provider/users',
          exact: false,
          roles: ['provider'] 
        },
        { 
          name: 'Companies', 
          displayName: 'Empresas',
          icon: Building, 
          adminPath: '/admin/companies',
          providerPath: '/provider/companies',
          exact: false,
          roles: ['provider'] 
        },
        { 
          name: 'Menu Management', 
          displayName: 'Gestión de Menú',
          icon: Utensils, 
          adminPath: '/admin/menu',
          providerPath: '/provider/menu',
          exact: false,
          roles: ['provider'] 
        },
        { 
          name: 'Orders', 
          displayName: 'Pedidos',
          icon: Package, 
          adminPath: '/admin/orders',
          providerPath: '/provider/orders',
          exact: false,
          roles: ['provider'] 
        },
        { 
          name: 'Assign Menus', 
          displayName: 'Asignar Menús',
          icon: Building, 
          adminPath: '/admin/assign-menus',
          providerPath: '/provider/assign-menus',
          exact: false,
          roles: ['provider'] 
        },
        { 
          name: 'Delivery Settings', 
          displayName: 'Configuración de Entrega',
          icon: Truck, 
          adminPath: '/admin/delivery',
          providerPath: '/provider/delivery-settings',
          exact: false,
          roles: ['provider'] 
        },
        { 
          name: 'Invoices', 
          displayName: 'Facturas',
          icon: Receipt, 
          adminPath: '/admin/invoices',
          providerPath: '/provider/billing',
          exact: false,
          roles: ['provider'] 
        },
        { 
          name: 'Reports', 
          displayName: 'Reportes',
          icon: BarChart3, 
          adminPath: '/admin/provider-reports',
          providerPath: '/provider/reports',
          exact: false,
          roles: ['provider'] 
        }
      );
    }

    // Filter items based on user role
    return items.filter(item => item.roles.includes(userRole));
  };

  const sidebarItems = getSidebarItems();
  
  // Update localStorage when sidebar state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
    setMounted(true);
  }, [collapsed]);
  
  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-30 transition-all duration-300 ease-in-out",
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
            {userRole === 'admin' ? 'Admin' : 'Proveedor'}
          </h2>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-md hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
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
          "flex-1 py-6 overflow-y-auto",
          collapsed && "flex justify-center"
        )}>
          <nav className={cn(
            "px-2 space-y-1",
            collapsed ? "flex flex-col items-center" : ""
          )}>
            {sidebarItems.map(item => (
              <RoleBasedLink
                key={item.adminPath}
                adminPath={item.adminPath}
                providerPath={item.providerPath}
                end={item.exact}
                className={({ isActive }) => cn(
                  "flex items-center p-2 my-2 rounded-md transition-all duration-200 group hover:scale-105",
                  isActive 
                    ? "bg-white/10 text-white border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                  collapsed ? "justify-center w-10 h-10" : "px-4 w-full"
                )}
                title={collapsed ? item.displayName : ""}
              >
                <item.icon className={cn(
                  "flex-shrink-0",
                  collapsed ? "h-6 w-6" : "h-5 w-5"
                )} />
                <span className={cn(
                  "ml-3 transition-all duration-300 whitespace-nowrap",
                  collapsed ? "hidden" : "block"
                )}>
                  {item.displayName}
                </span>
              </RoleBasedLink>
            ))}
          </nav>
        </div>
        
        <div className={cn(
          "border-t border-white/10 p-4 transition-opacity",
          collapsed ? "opacity-75" : "opacity-100"
        )}>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              {userRole === 'admin' ? 'A' : 'P'}
            </div>
            <div className={cn(
              "ml-3 transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              <p className="text-sm font-medium text-white">{userRole === 'admin' ? 'Panel de Admin' : 'Panel de Proveedor'}</p>
              <p className="text-xs text-white/70">v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default GlassSidebar;
