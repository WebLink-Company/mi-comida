
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, CheckCircle, Clock } from 'lucide-react';

interface CompanyOrderSummary {
  id: string;
  name: string;
  orders: number;
  users: number;
  dispatched: number;
  pending: number;
}

interface CompanyOrderCardProps {
  company: CompanyOrderSummary;
  onClick: () => void;
}

const CompanyOrderCard = ({ company, onClick }: CompanyOrderCardProps) => {
  const isFullyDispatched = company.pending === 0 && company.dispatched > 0;

  return (
    <Card 
      onClick={onClick}
      className={`cursor-pointer transition-all hover:shadow-md ${isFullyDispatched ? 'border-green-300' : 'border-blue-200'}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">
            {company.name}
          </CardTitle>
          {company.pending > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-300">
              {company.pending} pendientes
            </Badge>
          )}
          {isFullyDispatched && (
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">
              Todos despachados
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Pedidos totales:</span>
          </div>
          <div className="font-medium text-right">{company.orders}</div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Usuarios pidieron:</span>
          </div>
          <div className="font-medium text-right">{company.users}</div>

          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Despachados:</span>
          </div>
          <div className="font-medium text-right">{company.dispatched}</div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Pendientes:</span>
          </div>
          <div className="font-medium text-right">{company.pending}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyOrderCard;
