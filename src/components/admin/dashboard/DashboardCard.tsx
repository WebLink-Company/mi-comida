
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  data: Array<{ label: string; value: string | number | null | undefined; path: string }>;
  animationDelay: string;
  path: string;
  onOpenDialog: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  data,
  animationDelay,
  path,
  onOpenDialog,
}) => {
  const navigate = useNavigate();

  const formatValue = (value: string | number | null | undefined): string => {
    if (value === undefined || value === null) return "No data";
    
    if (typeof value === 'number') {
      // Handle currency values (assume values with $ prefix should be formatted as currency)
      if (String(value).startsWith('$') || title.toLowerCase().includes('revenue') || 
          title.toLowerCase().includes('billing')) {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return value.toLocaleString();
    }
    
    return value.toString();
  };

  return (
    <div
      className="rounded-xl backdrop-blur-md border border-white/20 p-4 fade-up dashboard-card"
      style={{ animationDelay }}
      onClick={() => navigate(path)}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="text-white font-semibold text-base">{title}</div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog();
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ExternalLink size={16} />
          </button>
          <div className="text-white/90">{icon}</div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-y-3">
          {data.map((item, index) => (
            <React.Fragment key={index}>
              <div className="text-sm text-white/70">{item.label}</div>
              <div
                className="text-sm font-medium text-right text-white cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(item.path);
                }}
              >
                {formatValue(item.value)}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-end mt-3">
          <Button variant="link" size="sm" className="text-white p-0 hover:text-white/80 font-medium">
            View Details <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
