
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NoOrdersCardProps {
  activeCompanies: number;
}

export const NoOrdersCard: React.FC<NoOrdersCardProps> = ({ activeCompanies }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="mt-8 border-blue-500/20">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Package className="h-16 w-16 text-blue-400 mb-4 opacity-50" />
        <h3 className="text-lg font-medium">No Hay Pedidos Hoy</h3>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          No hay pedidos para hoy todavía. Tiene {activeCompanies} empresas activas que pueden realizar pedidos.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/provider/companies')}
        >
          <Building className="h-4 w-4 mr-2" />
          Administrar Empresas
        </Button>
      </CardContent>
    </Card>
  );
};
