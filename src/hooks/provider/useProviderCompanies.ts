
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
        // Get provider ID
        const providerId = user.provider_id;
        
        if (!providerId) {
          setError('No provider ID found');
          setLoading(false);
          return;
        }
        
        // Fetch companies associated with this provider
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('provider_id', providerId);
        
        if (companiesError) throw companiesError;
        
        setCompanies(companiesData || []);
        setActiveCompanies(companiesData?.length || 0);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Error fetching companies. Please try again later.');
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
