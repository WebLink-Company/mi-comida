
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClockDisplayProps {
  user: { first_name?: string; provider_id?: string } | null;
  quickActions: Array<{
    label: string;
    icon: LucideIcon;
    action: () => void;
    path: string;
  }>;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ user, quickActions }) => {
  const [time, setTime] = useState(new Date());

  // Fetch the provider business name
  const { data: providerData } = useQuery({
    queryKey: ['provider', user?.provider_id],
    queryFn: async () => {
      if (!user?.provider_id) return null;
      
      const { data, error } = await supabase
        .from('providers')
        .select('business_name')
        .eq('id', user.provider_id)
        .single();
        
      if (error) {
        console.error('Error fetching provider data:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.provider_id,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getFirstName = () => {
    return user?.first_name || 'Proveedor';
  };

  return (
    <div className="win11-clock-container flex-grow flex flex-col items-center justify-center pb-4">
      <div className="text-center">
        <div className="win11-clock text-gradient fade-up">{getFirstName()}</div>
        
        {providerData?.business_name && (
          <div className="text-primary text-lg mt-1 fade-up" style={{ animationDelay: "0.15s" }}>
            {providerData.business_name}
          </div>
        )}
        
        <div className="win11-date fade-up" style={{ animationDelay: "0.1s" }}>
          {format(time, 'EEEE, d MMMM', { locale: es })}
        </div>
        
        {/* Removed the time display to reduce API requests */}

        <div className="mt-4 text-white/80 text-lg font-light fade-up" style={{ animationDelay: "0.3s" }}>
          {getGreeting()}, {getFirstName()} 👋
        </div>
        
        <div className="mt-2 text-white/60 text-base font-light fade-up" style={{ animationDelay: "0.4s" }}>
          ¿En qué te gustaría trabajar hoy?
        </div>
      </div>
    </div>
  );
};
