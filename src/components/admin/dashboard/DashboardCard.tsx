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

  const formatValue = (value: string | number | null | undefined, label: string): string => {
    if (value === undefined || value === null) return "No data";
    
    const isCurrency = label.toLowerCase().includes('revenue') || 
                      label.toLowerCase().includes('billing') || 
                      label.toLowerCase().includes('amount') ||
                      label.toLowerCase().includes('invoice');
    
    if (isCurrency) {
      if (typeof value === 'number') {
        return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
      }
      if (typeof value === 'string' && value.startsWith('$')) return value;
      return `$${value}`;
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return value.toString();
  };

  return (
    <div
      className="rounded-xl backdrop-blur-md bg-white/8 border border-white/20 p-4 fade-up dashboard-card"
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
                {formatValue(item.value, item.label)}
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
