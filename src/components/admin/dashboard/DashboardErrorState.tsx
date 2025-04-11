import React, { useState, useEffect } from 'react';
import { AlertTriangle, InfoIcon, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testSupabaseConnection, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface DashboardErrorStateProps {
  errorMessage: string;
  refreshData: () => void;
  debugInfo: any;
}

export const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({
  errorMessage,
  refreshData,
  debugInfo
}) => {
  const { toast } = useToast();
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [diagnoseStarted, setDiagnoseStarted] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any[]>([]);
  
  const isCorsError = errorMessage.includes('CORS') || 
                       errorMessage.includes('NetworkError') ||
                       errorMessage.includes('fetch failed') || 
                       (debugInfo?.possibleCorsError === true) || 
                       (testResult?.error?.message && (
                         testResult.error.message.includes('fetch failed') || 
                         testResult.error.message.includes('NetworkError') ||
                         testResult.error.message.includes('Failed to fetch')
                       ));
                       
  const currentOrigin = window.location.origin;
  const projectId = (SUPABASE_URL || "").includes("supabase.co") 
    ? (SUPABASE_URL || "").split('.')[0].split('//')[1]
    : "su-proyecto";
    
  const runConnectionTest = async () => {
    setIsTesting(true);
    try {
      toast({
        title: "Probando conexión",
        description: "Verificando la conexión con Supabase...",
      });
      
      const result = await testSupabaseConnection();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Prueba exitosa",
          description: "La conexión a Supabase funciona correctamente",
        });
        // If test succeeds, try the original refresh
        refreshData();
      } else {
        toast({
          title: "Prueba fallida",
          description: `No se pudo conectar a Supabase: ${result.error?.message || "Error desconocido"}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error during connection test:", error);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al intentar probar la conexión",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const runDiagnostics = async () => {
    setDiagnoseStarted(true);
    setDiagnosticResults([]);
    
    // 1. Check environment variables
    const envCheck = {
      name: "Variables de entorno",
      status: !!SUPABASE_URL && !!SUPABASE_ANON_KEY ? "success" : "error",
      details: {
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabaseKey: !!SUPABASE_ANON_KEY,
        urlLength: SUPABASE_URL?.length || 0,
        keyLength: SUPABASE_ANON_KEY?.length || 0
      }
    };
    setDiagnosticResults(prev => [...prev, envCheck]);
    
    // 2. Check window location/origin
    const originCheck = {
      name: "Origen de la aplicación",
      status: "info",
      details: {
        origin: window.location.origin,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        isLovablePreview: window.location.hostname.includes('lovableproject.com'),
        isProd: window.location.hostname === 'micomida.online'
      }
    };
    setDiagnosticResults(prev => [...prev, originCheck]);
    
    // 3. Test a simple Supabase request
    try {
      const testResult = await testSupabaseConnection();
      const connectionCheck = {
        name: "Prueba de conexión",
        status: testResult.success ? "success" : "error",
        details: testResult
      };
      setDiagnosticResults(prev => [...prev, connectionCheck]);
      
      // If main test failed, try additional diagnostics
      if (!testResult.success) {
        // Try a direct browser fetch to see if it's a CORS issue
        try {
          const corsTest = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=count`, {
            method: 'HEAD',
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY || ''}`,
            }
          });
          
          const corsCheck = {
            name: "Prueba CORS directa",
            status: corsTest.ok ? "success" : "error",
            details: {
              status: corsTest.status,
              statusText: corsTest.statusText,
              headers: Array.from(corsTest.headers.entries())
            }
          };
          setDiagnosticResults(prev => [...prev, corsCheck]);
        } catch (error) {
          const corsCheck = {
            name: "Prueba CORS directa",
            status: "error",
            details: {
              error: error instanceof Error ? error.message : String(error),
              possibleCorsIssue: true
            }
          };
          setDiagnosticResults(prev => [...prev, corsCheck]);
        }
      }
    } catch (error) {
      const connectionCheck = {
        name: "Prueba de conexión",
        status: "error",
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
      setDiagnosticResults(prev => [...prev, connectionCheck]);
    }
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{errorMessage}</p>
          
          {isCorsError ? (
            <div className="bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 p-4 rounded-md text-amber-800 dark:text-amber-300 mt-4">
              <div className="flex gap-2 items-start">
                <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error de CORS Detectado</p>
                  <p className="text-sm mt-1">
                    La URL actual <strong>{currentOrigin}</strong> no está agregada como origen permitido en la configuración CORS de Supabase.
                  </p>
                  <p className="text-sm mt-2">
                    Para usar esta aplicación con esta URL, debe agregarla a los orígenes CORS permitidos en Supabase:
                  </p>
                  <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                    <li>Vaya a su Panel de Supabase</li>
                    <li>Navegue a Configuración del Proyecto &gt; API</li>
                    <li>Desplácese hasta "Orígenes CORS"</li>
                    <li>Añada su dominio actual: <strong className="font-mono bg-amber-200/30 px-1 rounded">{currentOrigin}</strong></li>
                    <li>Si solo tiene configurado 'micomida.online', añada también este dominio de vista previa</li>
                    <li>Guarde los cambios</li>
                    <li>Haga clic en "Probar Conexión" a continuación</li>
                  </ol>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/settings/api`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ir a Configuración de API de Supabase
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Por favor, verifique sus variables de entorno de Netlify y asegúrese de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas correctamente.
              También asegúrese de que su proyecto Supabase tenga su dominio de Netlify agregado a los orígenes CORS permitidos.
            </p>
          )}
          
          {/* Diagnostic Results */}
          {diagnosticResults.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="text-sm font-medium mb-2">Resultados del diagnóstico</h3>
              <div className="space-y-2">
                {diagnosticResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className={`h-4 w-4 rounded-full ${
                      result.status === 'success' ? 'bg-green-500' : 
                      result.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></span>
                    <div>
                      <p className="text-sm font-medium">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.status === 'success' ? 'Éxito' : 
                         result.status === 'error' ? 'Error' : 'Información'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <div className="flex gap-2 mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
              >
                {showDebugInfo ? "Ocultar Información de Depuración" : "Mostrar Información de Depuración"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={runDiagnostics}
                disabled={isTesting}
              >
                {diagnoseStarted ? "Volver a Diagnosticar" : "Ejecutar Diagnóstico"}
              </Button>
            </div>
            
            {showDebugInfo && (
              <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                <pre className="text-xs">{JSON.stringify({
                  ...debugInfo,
                  currentUrl: window.location.href,
                  currentOrigin: window.location.origin,
                  currentHostname: window.location.hostname,
                  currentPathname: window.location.pathname,
                  supabaseUrl: SUPABASE_URL,
                  hasSupabaseKey: !!SUPABASE_ANON_KEY,
                  supabaseKeyLength: SUPABASE_ANON_KEY?.length,
                  connectionTestResult: testResult,
                  diagnosticResults,
                  timestamp: new Date().toISOString()
                }, null, 2)}</pre>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-sm font-medium">Cómo solucionarlo:</h3>
            <ol className="list-decimal list-inside text-sm space-y-2">
              <li>
                Verifique si VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY están configurados en las variables de entorno de Netlify
              </li>
              <li>
                <strong>Verifique que su proyecto Supabase tenga CORS configurado para permitir solicitudes desde su dominio actual: {currentOrigin}</strong>
              </li>
              <li>
                Si solo tiene configurado 'micomida.online' como origen permitido, deberá agregar también esta URL de desarrollo: {currentOrigin}
              </li>
              <li>
                Intente cerrar sesión e iniciar sesión nuevamente
              </li>
              <li>
                Verifique la consola del navegador para ver mensajes de error más detallados
              </li>
            </ol>
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button 
              variant="default" 
              onClick={refreshData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar Conexión
            </Button>
            
            <Button
              variant="outline"
              onClick={runConnectionTest}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Probando...
                </>
              ) : (
                <>
                  {testResult?.success ? (
                    <>
                      <InfoIcon className="h-4 w-4 mr-2" />
                      Prueba Exitosa
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Probar Conexión
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
