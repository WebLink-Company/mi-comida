
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    return user?.first_name || 'Admin';
  };

  return (
    <div className="win11-clock-container flex-grow flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-white/90 text-2xl font-light mb-1 fade-up">{getFirstName()}</h1>
        <div className="win11-clock fade-up">{format(time, 'h:mm')}</div>
        <div className="win11-date fade-up">{format(time, 'EEEE, MMMM d')}</div>

        <div className="mt-4 text-white/80 text-lg font-light fade-up">
          {getGreeting()}, {getFirstName()} 👋
        </div>
        <div className="mt-2 text-white/60 text-base font-light fade-up">
          What would you like to work on today?
        </div>

        {/* Quick action badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 fade-up" style={{ animationDelay: "0.5s" }}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Badge
                key={index}
                variant="default"
                onClick={action.action}
                className="py-2 px-4 cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Icon size={16} />
                {action.label}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};
