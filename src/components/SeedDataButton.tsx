
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { seedTestData } from '@/utils/seedData';
import { useToast } from '@/hooks/use-toast';

const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedTestData();
      setCredentials(result);
      toast({
        title: 'Datos de prueba creados',
        description: 'Usuarios de prueba, proveedor y empresa han sido creados correctamente.',
      });
    } catch (error) {
      console.error('Error al crear datos:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear datos de prueba',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Creación de Datos de Prueba</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Crea usuarios de prueba para cada rol con dominio @lunchwise.app. También se creará un proveedor y una empresa.
      </p>
      
      <Button 
        onClick={handleSeedData} 
        disabled={isSeeding}
        variant="default"
        className="w-full"
      >
        {isSeeding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando datos de prueba...
          </>
        ) : (
          'Crear Datos de Prueba'
        )}
      </Button>
      
      {credentials && (
        <div className="mt-4 p-3 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Credenciales de Usuarios de Prueba:</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(credentials).map(([role, creds]: [string, any]) => (
              <div key={role} className="flex justify-between">
                <span className="font-medium">{role}:</span>
                <span>{creds.email} / {creds.password}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeedDataButton;
