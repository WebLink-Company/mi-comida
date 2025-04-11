
import React, { useState } from 'react';
import { AlertTriangle, InfoIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

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
          <p className="text-muted-foreground text-sm">
            Por favor, verifique sus variables de entorno de Netlify y asegúrese de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas correctamente.
            También asegúrese de que su proyecto Supabase tenga su dominio de Netlify agregado a los orígenes CORS permitidos.
          </p>
          
          <div className="bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 p-4 rounded-md text-amber-800 dark:text-amber-300 mt-4">
            <div className="flex gap-2 items-start">
              <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Configuración CORS Requerida</p>
                <p className="text-sm mt-1">Si está alojando esta aplicación en un dominio diferente al que se desarrolló, debe agregar su dominio a los orígenes permitidos en la configuración de su proyecto Supabase.</p>
                <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                  <li>Vaya a su Panel de Supabase</li>
                  <li>Navegue a Configuración del Proyecto &gt; API</li>
                  <li>Desplácese hasta "Orígenes CORS"</li>
                  <li>Añada su dominio: {window.location.origin}</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              {showDebugInfo ? "Ocultar Información de Depuración" : "Mostrar Información de Depuración"}
            </Button>
            
            {showDebugInfo && (
              <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
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
                Verifique que su proyecto Supabase tenga CORS configurado para permitir solicitudes desde su dominio: {window.location.origin}
              </li>
              <li>
                Intente cerrar sesión e iniciar sesión nuevamente
              </li>
              <li>
                Verifique la consola del navegador para ver mensajes de error más detallados
              </li>
            </ol>
          </div>
          
          <div className="mt-6">
            <Button 
              variant="default" 
              onClick={refreshData}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar Conexión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
