
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { UserRole } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  ClipboardList, 
  ChefHat,
  LogOut,
  Building,
  Users,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NavigationBarProps {
  userRole: UserRole;
  userName: string;
}

const NavigationBar = ({ userRole, userName }: NavigationBarProps) => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll for transparent to solid transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.'
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al cerrar sesión.',
        variant: 'destructive'
      });
    }
  };

  const getNavigationLinks = () => {
    switch (userRole) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: <BarChart className="w-5 h-5 mr-2" /> },
          { name: 'Usuarios', path: '/admin?tab=users', icon: <Users className="w-5 h-5 mr-2" /> },
          { name: 'Empresas', path: '/admin?tab=companies', icon: <Building className="w-5 h-5 mr-2" /> },
          { name: 'Proveedores', path: '/admin?tab=providers', icon: <ChefHat className="w-5 h-5 mr-2" /> },
        ];
      case 'employee':
        return [
          { name: 'Mi Perfil', path: '/employee', icon: <User className="w-5 h-5 mr-2" /> },
          { name: 'Mis Pedidos', path: '/employee/orders', icon: <ClipboardList className="w-5 h-5 mr-2" /> },
        ];
      case 'supervisor':
        return [
          { name: 'Dashboard', path: '/supervisor', icon: <ClipboardList className="w-5 h-5 mr-2" /> },
          { name: 'Aprobar Pedidos', path: '/supervisor/approve', icon: <ClipboardList className="w-5 h-5 mr-2" /> },
          { name: 'Reportes', path: '/supervisor/reports', icon: <ClipboardList className="w-5 h-5 mr-2" /> },
        ];
      case 'provider':
        return [
          { name: 'Dashboard', path: '/provider', icon: <ClipboardList className="w-5 h-5 mr-2" /> },
          { name: 'Menú del Día', path: '/provider/menu', icon: <ChefHat className="w-5 h-5 mr-2" /> },
          { name: 'Pedidos', path: '/provider/orders', icon: <ClipboardList className="w-5 h-5 mr-2" /> },
          { name: 'Facturación', path: '/provider/billing', icon: <ClipboardList className="w-5 h-5 mr-2" /> },
        ];
      default:
        return [];
    }
  };

  const links = getNavigationLinks();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-3",
        {
          "bg-white/80 backdrop-blur-lg shadow-sm": scrolled,
          "bg-transparent": !scrolled
        }
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <span className="text-xl font-medium">Lunch</span>
          <span className="text-xl font-bold text-primary">Wise</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center text-sm font-medium transition-colors py-2 px-3 rounded-lg",
                location.pathname === link.path
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <div className="h-6 border-l border-muted-foreground/20 mx-2"></div>
          <div className="text-sm font-medium text-muted-foreground">
            {userName}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden text-foreground p-2 rounded-lg hover:bg-muted"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile navigation */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/95 backdrop-blur-sm z-40 md:hidden transition-all duration-300 transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ top: '56px' }}
      >
        <div className="p-6 pt-10 space-y-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className={cn(
                "flex items-center text-lg font-medium transition-colors py-3 px-4 rounded-lg",
                location.pathname === link.path
                  ? "text-primary bg-primary/10"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <div className="border-t border-border my-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                {userName}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
