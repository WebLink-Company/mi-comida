
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DebugSectionProps {
  debugInfo: any;
  user: any;
  stats: any;
}

export const DebugSection: React.FC<DebugSectionProps> = ({ debugInfo, user, stats }) => {
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  return (
    <div className="mt-8">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDebugInfo(!showDebugInfo)}
        className="text-white/70 hover:text-white"
      >
        {showDebugInfo ? "Ocultar Estado de Conexión" : "Mostrar Estado de Conexión"}
      </Button>
      
      {showDebugInfo && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-md overflow-auto max-h-[200px]">
          <pre className="text-xs text-white/80">{JSON.stringify({ 
            connection: debugInfo.supabaseTestSuccess ? "Conectado" : "Fallido",
            providerId: user?.provider_id,
            environment: import.meta.env.MODE,
            host: window.location.host,
            activeCompanies: stats.activeCompanies,
            timestamp: new Date().toISOString()
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
