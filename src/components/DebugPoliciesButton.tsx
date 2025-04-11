
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DebugPoliciesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleDebugPolicies = async () => {
    setIsLoading(true);
    try {
      // First try to get the raw SQL policies
      const { data: policiesData, error: policiesError } = await supabase.rpc(
        'get_policies_info' as any,
        { target_table: 'profiles' }
      );

      if (policiesError) {
        throw policiesError;
      }

      setResults(policiesData);
      console.log('Datos de políticas:', policiesData);
      
      toast({
        title: 'Políticas recuperadas',
        description: 'Consulta la consola para obtener información detallada sobre las políticas',
      });
    } catch (error) {
      console.error('Error al depurar políticas:', error);
      
      // Try a simple query to see if we can get any response
      try {
        const { data, error: testError } = await supabase
          .from('profiles')
          .select('count(*)')
          .limit(1);
          
        if (testError) {
          console.error('Error en consulta de prueba:', testError);
          setResults({ error: 'La consulta de prueba falló', details: testError });
        } else {
          setResults({ message: 'La consulta de prueba tuvo éxito pero la consulta de política falló', data });
        }
      } catch (testError) {
        console.error('Excepción en consulta de prueba:', testError);
        setResults({ error: 'Todas las consultas fallaron', original_error: error });
      }
      
      toast({
        title: 'Error al depurar políticas',
        description: error instanceof Error ? error.message : 'Error al recuperar información de políticas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Depurar Políticas RLS</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Esta herramienta ayudará a identificar políticas RLS problemáticas en la base de datos.
      </p>
      
      <Button 
        onClick={handleDebugPolicies} 
        disabled={isLoading}
        variant="default"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Depurando políticas...
          </>
        ) : (
          'Depurar Políticas RLS'
        )}
      </Button>
      
      {results && (
        <div className="mt-4 p-3 bg-muted rounded-md overflow-auto max-h-[400px]">
          <h3 className="font-medium mb-2">Información de Políticas:</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPoliciesButton;
