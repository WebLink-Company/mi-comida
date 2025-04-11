
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useProviderUserStats = () => {
  const { user } = useAuth();
  const [newUsers, setNewUsers] = useState<number>(0);
  const [loadingNewUsers, setLoadingNewUsers] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserStats = async () => {
      setLoadingNewUsers(true);
      
      try {
        // Por ahora, estamos estableciendo un valor ficticio
        // En una implementación real, obtendríamos esto de la base de datos
        // Por ejemplo, usuarios creados en los últimos 7 días
        setNewUsers(5);
      } catch (err) {
        console.error('Error al obtener estadísticas de usuarios:', err);
        setError('Error al obtener estadísticas de usuarios');
      } finally {
        setLoadingNewUsers(false);
      }
    };
    
    fetchUserStats();
  }, [user]);

  return {
    newUsers,
    loadingNewUsers,
    error
  };
};
