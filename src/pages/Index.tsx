
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to appropriate dashboard based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'provider':
          navigate('/provider');
          break;
        case 'supervisor':
          navigate('/supervisor');
          break;
        case 'employee':
          navigate('/employee');
          break;
        default:
          break;
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-foreground">Lunch</span>
              <span className="text-primary">Wise</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              La solución inteligente para gestionar almuerzos corporativos
            </p>
            <div className="space-y-4">
              <p className="text-foreground/80">
                Simplifica la gestión de alimentos para empresas y empleados con nuestra plataforma integral.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-primary" />
                  <span>Pedidos simples y personalizados</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-primary" />
                  <span>Gestión de subsidios para empresas</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-primary" />
                  <span>Reportes detallados y facturación</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Comenzar ahora
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="bg-card rounded-xl overflow-hidden shadow-2xl border border-border">
              <img 
                src="/placeholder.svg" 
                alt="LunchWise Platform" 
                className="w-full h-[400px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      <footer className="py-6 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-lg font-medium">Lunch</span>
            <span className="text-lg font-bold text-primary">Wise</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LunchWise. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
