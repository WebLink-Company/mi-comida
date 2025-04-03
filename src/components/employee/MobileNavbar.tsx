
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Clock, User, Menu, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { motion } from 'framer-motion';

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleSignOut = () => {
    signOut();
  };
  
  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t z-50">
        <div className="container h-full flex items-center justify-around">
          <Link 
            to="/employee"
            className={`flex flex-col items-center justify-center w-16 pt-1 ${
              isActive('/employee') 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground transition-colors'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs mt-1">Menú</span>
          </Link>
          
          <Link 
            to="/employee/orders"
            className={`flex flex-col items-center justify-center w-16 pt-1 ${
              isActive('/employee/orders') 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground transition-colors'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs mt-1">Pedidos</span>
          </Link>
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <motion.button 
                className="flex flex-col items-center justify-center w-16 pt-1 text-muted-foreground hover:text-foreground transition-colors relative"
                onMouseEnter={() => setMenuHovered(true)}
                onMouseLeave={() => setMenuHovered(false)}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <Menu className="h-5 w-5" />
                  <motion.div 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ 
                      opacity: menuHovered || open ? 1 : 0,
                      y: menuHovered || open ? 0 : 5
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronUp className="h-4 w-4 text-primary" />
                  </motion.div>
                </div>
                <span className="text-xs mt-1">Más</span>
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto pb-8 rounded-t-xl bg-white/90 backdrop-blur-md border-white/30">
              <div className="pt-6">
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <SheetClose asChild>
                    <Link 
                      to="/employee/profile" 
                      className="flex items-center py-2 px-1 hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span>Mi Perfil</span>
                    </Link>
                  </SheetClose>
                  
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center py-2 px-1 text-destructive hover:text-destructive/80 transition-colors w-full text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default MobileNavbar;
