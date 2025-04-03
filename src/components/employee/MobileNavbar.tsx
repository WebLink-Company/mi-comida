import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Clock, User, ChevronUp, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetClose, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleSignOut = () => {
    signOut();
  };
  
  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };
  
  return (
    <>
      {/* Circular Toggle Button */}
      <motion.button 
        className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg"
        onClick={toggleMenu}
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 0 }}
        animate={{ 
          y: menuHovered && !menuOpen ? -5 : 0,
          rotate: menuOpen ? 180 : 0
        }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setMenuHovered(true)}
        onMouseLeave={() => setMenuHovered(false)}
      >
        <ChevronUp className="h-5 w-5 text-white" />
      </motion.button>

      {/* Slide-up Navigation Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu content */}
            <motion.div 
              className="fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur-xl border-t border-white/20 z-40 pb-20"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30 
              }}
            >
              <div className="container h-16 flex items-center justify-around">
                <Link 
                  to="/employee"
                  className={`flex flex-col items-center justify-center w-16 pt-1 ${
                    isActive('/employee') 
                      ? 'text-primary' 
                      : 'text-white/70 hover:text-white transition-colors'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Menú</span>
                </Link>
                
                <Link 
                  to="/employee/orders"
                  className={`flex flex-col items-center justify-center w-16 pt-1 ${
                    isActive('/employee/orders') 
                      ? 'text-primary' 
                      : 'text-white/70 hover:text-white transition-colors'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-10 h-10">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Pedidos</span>
                </Link>
                
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <motion.button 
                      className="flex flex-col items-center justify-center w-16 pt-1 text-white/70 hover:text-white transition-colors"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="relative flex items-center justify-center">
                        <motion.div 
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
                          animate={{ 
                            backgroundColor: open ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)"
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <User className="h-5 w-5" />
                        </motion.div>
                      </div>
                      <span className="text-xs">Más</span>
                    </motion.button>
                  </SheetTrigger>
                  <SheetContent 
                    side="bottom" 
                    className="h-auto pb-8 rounded-t-xl backdrop-blur-xl bg-white/20 border-white/30"
                  >
                    <AnimatePresence>
                      {open && (
                        <motion.div 
                          className="pt-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center mb-6">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-primary backdrop-blur-sm">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-white">{user?.first_name} {user?.last_name}</p>
                              <p className="text-xs text-white/70">{user?.email}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <SheetClose asChild>
                              <Link 
                                to="/employee/profile" 
                                className="flex items-center py-2 px-1 text-white hover:text-primary transition-colors"
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SheetContent>
                </Sheet>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavbar;
