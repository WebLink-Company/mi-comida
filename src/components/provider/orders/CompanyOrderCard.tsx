
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Package, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CompanyOrderCardProps {
  company: {
    id: string;
    name: string;
    orders: number;
    users: number;
    dispatched: number;
    pending: number;
    approved?: number; // Make approved optional since it might not be in all card data
  };
  onClick: () => void;
}

const CompanyOrderCard: React.FC<CompanyOrderCardProps> = ({ company, onClick }) => {
  // Calculate percentage of orders that are in progress (dispatched or approved)
  const inProgressCount = (company.dispatched || 0) + (company.approved || 0);
  const totalOrders = company.orders || 1; // Prevent division by zero
  const inProgressPercentage = Math.round((inProgressCount / totalOrders) * 100);
  
  // Calculate pending percentage
  const pendingPercentage = Math.round((company.pending / totalOrders) * 100);
  
  return (
    <Card 
      className="glass hover:shadow-lg transition-all cursor-pointer hover:border-blue-500/40"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-blue-400 mr-2" />
            <h3 className="font-semibold text-white truncate max-w-[200px]">{company.name}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4 text-white/70" />
            <span className="text-white font-semibold">{company.orders}</span>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          {/* Order Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center text-sm text-white/80">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Pendientes: {company.pending}</span>
              </div>
              <span className="text-xs text-white/60">{pendingPercentage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-amber-400/80 h-2 rounded-full" 
                style={{ width: `${pendingPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* In Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center text-sm text-white/80">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                <span>
                  En proceso: {inProgressCount} 
                  {company.approved !== undefined && ` (${company.approved} aprobados)`}
                </span>
              </div>
              <span className="text-xs text-white/60">{inProgressPercentage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-green-400/80 h-2 rounded-full" 
                style={{ width: `${inProgressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-white/60">
            {company.users} {company.users === 1 ? 'usuario' : 'usuarios'}
          </div>
          <div className="text-xs text-white/60">
            Click para ver detalles
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyOrderCard;
