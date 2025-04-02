
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  label: string;
  icon: LucideIcon;
  action: () => void;
  path: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6 fade-up" style={{ animationDelay: "0.5s" }}>
      {actions.map((action, index) => {
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
  );
};

export default QuickActions;
