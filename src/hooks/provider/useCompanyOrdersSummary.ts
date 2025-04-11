
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CompanyOrderSummary } from '@/lib/types';

export const useCompanyOrdersSummary = (companyIds: string[] = []) => {
  const { user } = useAuth();
  const [companyOrders, setCompanyOrders] = useState<CompanyOrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || companyIds.length === 0) return;
    
    const fetchCompanyOrderSummaries = async () => {
      setLoading(true);
      
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Buscar empresas por proveedor
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds);
          
        if (companiesError) throw companiesError;
        
        if (!companiesData || companiesData.length === 0) {
          setCompanyOrders([]);
          setLoading(false);
          return;
        }
        
        // Para cada empresa, obtener estadísticas de pedidos
        const summaries = await Promise.all(
          companiesData.map(async (company) => {
            // Obtener todos los pedidos para esta empresa
            const { data: orders, error: ordersError } = await supabase
              .from('orders')
              .select('id, user_id, status')
              .eq('company_id', company.id);
              
            if (ordersError) {
              console.error(`Error al buscar pedidos para la empresa ${company.id}:`, ordersError);
              return null;
            }
            
            if (!orders || orders.length === 0) {
              return null; // Omitir empresas sin pedidos
            }
            
            // Contar usuarios únicos
            const uniqueUsers = [...new Set(orders.map(order => order.user_id))].length;
            
            // Contar pedidos enviados vs pendientes
            const dispatched = orders.filter(order => 
              order.status === 'prepared' || order.status === 'delivered'
            ).length;
            
            const pending = orders.length - dispatched;
            
            return {
              id: company.id,
              name: company.name,
              orders: orders.length,
              users: uniqueUsers,
              dispatched,
              pending
            };
          })
        );
        
        // Filtrar valores nulos
        const filteredSummaries = summaries.filter(Boolean) as CompanyOrderSummary[];
        setCompanyOrders(filteredSummaries);
      } catch (err) {
        console.error('Error al buscar resúmenes de pedidos de empresas:', err);
        setError('Error al buscar resúmenes de pedidos de empresas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyOrderSummaries();
  }, [user, companyIds]);

  return {
    companyOrders,
    loading,
    error
  };
};
