
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Provider } from '@/lib/types';

interface CompaniesFilterProps {
  search: string;
  selectedProvider: string;
  providers: Provider[];
  isAdmin: boolean;
  onSearchChange: (value: string) => void;
  onProviderFilterChange: (value: string) => void;
}

export const CompaniesFilter: React.FC<CompaniesFilterProps> = ({
  search,
  selectedProvider,
  providers,
  isAdmin,
  onSearchChange,
  onProviderFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresas..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {isAdmin && (
        <div className="w-full sm:w-64">
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={selectedProvider}
              onChange={(e) => onProviderFilterChange(e.target.value)}
            >
              <option value="">Todos los Proveedores</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.business_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
