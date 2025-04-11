
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProviderSummary {
  id: string;
  name: string;
  companyCount: number;
  avgSubsidy: number;
  totalFixedAmount: number;
}

interface ProviderSummaryCardsProps {
  providerSummaries: ProviderSummary[];
  selectedProvider: string;
  onProviderSelect: (providerId: string) => void;
}

export const ProviderSummaryCards: React.FC<ProviderSummaryCardsProps> = ({
  providerSummaries,
  selectedProvider,
  onProviderSelect,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {providerSummaries.map((summary) => (
        <Card 
          key={summary.id} 
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            selectedProvider === summary.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onProviderSelect(summary.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{summary.name}</h3>
              <Badge>{summary.companyCount} Empresas</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Subsidio Prom.</p>
                <p className="font-medium">{summary.avgSubsidy.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Fijo</p>
                <p className="font-medium">${summary.totalFixedAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
