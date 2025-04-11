
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface ClockDisplayProps {
  user: { first_name?: string } | null;
  quickActions: Array<{
    label: string;
    icon: LucideIcon;
    action: () => void;
    path: string;
  }>;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ user, quickActions }) => {
  const [time, setTime] = useState(new Date());

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
        
        <div className="win11-date fade-up" style={{ animationDelay: "0.1s" }}>
          {format(time, 'EEEE, d MMMM', { locale: es })}
        </div>
        
        <div className="text-white/80 text-xl font-light mt-1 fade-up" style={{ animationDelay: "0.2s" }}>
          {format(time, 'h:mm a')}
        </div>

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
