
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
        // Obtener ID del proveedor
        const providerId = user.provider_id;
        
        if (!providerId) {
          setError('No se encontró ID de proveedor');
          setLoading(false);
          return;
        }
        
        // Buscar empresas asociadas a este proveedor
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('provider_id', providerId);
        
        if (companiesError) throw companiesError;
        
        setCompanies(companiesData || []);
        setActiveCompanies(companiesData?.length || 0);
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
