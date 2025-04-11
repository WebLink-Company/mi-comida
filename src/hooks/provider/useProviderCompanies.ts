
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Company } from '@/lib/types';

export const useProviderCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanies, setActiveCompanies] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Verificar si es un supervisor (tienen company_id pero no provider_id)
        const isSupervisor = !user.provider_id && user.company_id;
        
        let companiesData = [];
        
        if (isSupervisor) {
          // Para supervisores, solo mostrar su empresa asignada
          if (!user.company_id) {
            setError('No tienes ninguna empresa asignada actualmente.');
            setLoading(false);
            return;
          }
          
          // Buscar la empresa específica del supervisor
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', user.company_id)
            .single();
          
          if (companyError) throw companyError;
          companiesData = companyData ? [companyData] : [];
        } else {
          // Para proveedores, obtener todas sus empresas
          const providerId = user.provider_id;
          
          if (!providerId) {
            setError('No se encontró ID de proveedor');
            setLoading(false);
            return;
          }
          
          // Buscar empresas asociadas a este proveedor
          const { data: providerCompanies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .eq('provider_id', providerId);
          
          if (companiesError) throw companiesError;
          companiesData = providerCompanies || [];
        }
        
        setCompanies(companiesData);
        setActiveCompanies(companiesData.length);
      } catch (err) {
        console.error('Error al buscar empresas:', err);
        setError('Error al buscar empresas. Por favor intente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, [user]);

  return {
    companies,
    activeCompanies,
    loading,
    error
  };
};
