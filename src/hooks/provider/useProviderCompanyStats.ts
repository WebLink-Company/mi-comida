
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useProviderCompanyStats = () => {
  const { user } = useAuth();
  const [companiesWithOrdersToday, setCompaniesWithOrdersToday] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchCompanyStats = async () => {
      setLoading(true);
      
      try {
        // Obtener ID del proveedor
        const providerId = user.provider_id;
        
        if (!providerId) {
          throw new Error('No se encontró ID de proveedor');
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        // Primero obtener empresas para este proveedor
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('provider_id', providerId);
          
        if (companiesError) throw companiesError;
        
        if (!companies || companies.length === 0) {
          setCompaniesWithOrdersToday(0);
          setLoading(false);
          return;
        }
        
        const companyIds = companies.map(company => company.id);
        
        // Buscar pedidos para hoy para estas empresas
        const { data: ordersToday, error: ordersError } = await supabase
          .from('orders')
          .select('company_id')
          .in('company_id', companyIds)
          .eq('date', today);
          
        if (ordersError) throw ordersError;
        
        // Contar empresas únicas con pedidos hoy
        const uniqueCompaniesWithOrders = [...new Set(ordersToday?.map(order => order.company_id) || [])];
        setCompaniesWithOrdersToday(uniqueCompaniesWithOrders.length);
      } catch (err) {
        console.error('Error al obtener estadísticas de empresas:', err);
        setError('Error al obtener estadísticas de empresas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyStats();
  }, [user]);

  return {
    companiesWithOrdersToday,
    loading,
    error
  };
};
