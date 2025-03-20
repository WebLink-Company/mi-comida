
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Users, PieChart, Utensils, UserCheck } from 'lucide-react';

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const features = [
    {
      title: 'Selección Simple',
      description: 'Los empleados eligen su almuerzo desde un catálogo interactivo.',
      icon: <Utensils className="w-10 h-10 text-primary" />
    },
    {
      title: 'Supervisión Eficiente',
      description: 'Aprobación sencilla de pedidos y administración de presupuestos.',
      icon: <UserCheck className="w-10 h-10 text-primary" />
    },
    {
      title: 'Gestión Avanzada',
      description: 'Dashboard completo para empresas proveedoras de almuerzos.',
      icon: <PieChart className="w-10 h-10 text-primary" />
    },
    {
      title: 'Para Toda la Empresa',
      description: 'Configura subsidios y administra a todos los empleados.',
      icon: <Users className="w-10 h-10 text-primary" />
    }
  ];

  const roles = [
    {
      id: 'employee',
      title: 'Empleado',
      description: 'Selecciona tu almuerzo diario fácilmente',
      path: '/employee'
    },
    {
      id: 'supervisor',
      title: 'Supervisor',
      description: 'Administra los pedidos de tu empresa',
      path: '/supervisor'
    },
    {
      id: 'provider',
      title: 'Proveedor',
      description: 'Gestiona los pedidos y menús',
      path: '/provider'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-block mb-4">
              <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                Administración de almuerzos simplificada
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Gestión de Almuerzos Empresariales
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Una plataforma intuitiva para la gestión eficiente de almuerzos corporativos.
              Desde la selección hasta la entrega, todo en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                Comenzar Ahora
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Saber Más
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="LunchWise Dashboard Preview" 
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Características Principales</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nuestra plataforma está diseñada para simplificar todo el proceso 
              de gestión de almuerzos empresariales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow bg-white">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground/70">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">¿Cómo quieres ingresar?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Selecciona tu rol para acceder a las funcionalidades específicas para ti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  className={`h-full cursor-pointer transition-all ${
                    selectedRole === role.id 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'bg-card hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {role.title}
                      {selectedRole === role.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-foreground/70">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link to={role.path} className="w-full">
                      <Button 
                        className="w-full"
                        variant={selectedRole === role.id ? "default" : "outline"}
                      >
                        Ingresar
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <span className="text-2xl font-medium">Lunch</span>
            <span className="text-2xl font-bold text-primary">Wise</span>
          </div>
          <p className="text-muted-foreground mb-6">
            La solución completa para la gestión de almuerzos empresariales.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-foreground/60 hover:text-primary">Términos</a>
            <a href="#" className="text-foreground/60 hover:text-primary">Privacidad</a>
            <a href="#" className="text-foreground/60 hover:text-primary">Contacto</a>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LunchWise. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
