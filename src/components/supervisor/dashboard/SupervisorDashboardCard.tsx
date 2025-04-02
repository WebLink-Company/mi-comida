
import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SupervisorDashboardCardProps {
  title: string;
  icon: React.ReactNode;
  data: Array<{ label: string; value: string | number | React.ReactNode; path: string }>;
  animationDelay: string;
  path: string;
  onOpenDialog: () => void;
  gradientClass?: string;
}

export const SupervisorDashboardCard: React.FC<SupervisorDashboardCardProps> = ({
  title,
  icon,
  data,
  animationDelay,
  path,
  onOpenDialog,
  gradientClass = "from-blue-600/30 to-purple-600/30",
}) => {
  const navigate = useNavigate();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div
      className={`rounded-xl backdrop-blur-md border border-white/20 p-4 fade-up dashboard-card bg-gradient-to-br ${gradientClass}`}
      style={{ animationDelay }}
      onClick={() => navigate(path)}
    >
      <div className="flex justify-between items-center">
        <div className="text-white font-medium">{title}</div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDialog();
            }}
            className="text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <ExternalLink size={16} />
          </button>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        {title === "Provider Information" ? (
          <div className="text-center py-2">
            {data.map((item, index) => (
              <div key={index} className="mb-2">
                {typeof item.value === 'object' ? (
                  item.value
                ) : (
                  <div className="text-sm text-white">{item.value}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-3">
            {data.map((item, index) => (
              <React.Fragment key={index}>
                <div className="text-sm text-white/80">{item.label}</div>
                <div
                  className="text-sm font-medium text-right text-white cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                >
                  {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-3">
          <Button variant="link" size="sm" className="text-white p-0 hover:text-white/80">
            View Details <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
