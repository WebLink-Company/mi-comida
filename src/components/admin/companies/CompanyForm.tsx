
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Company, Provider } from '@/lib/types';
import { Label } from '@/components/ui/label';

interface CompanyFormProps {
  currentCompany: Partial<Company>;
  providers: Provider[];
  onUpdateCompany: (key: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  currentCompany,
  providers,
  onUpdateCompany,
  onSave,
  onCancel,
}) => {
  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="company-name" className="text-white">
            Nombre de Empresa
          </Label>
          <Input
            id="company-name"
            value={currentCompany.name || ''}
            onChange={(e) => onUpdateCompany('name', e.target.value)}
            placeholder="Ingrese nombre de empresa"
            className="modal-input"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company-provider" className="text-white">
            Proveedor
          </Label>
          <select
            id="company-provider"
            className="flex h-10 w-full rounded-md px-3 py-2 text-sm modal-select"
            value={currentCompany.provider_id || ''}
            onChange={(e) => onUpdateCompany('provider_id', e.target.value)}
          >
            <option value="">Seleccione un proveedor</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.business_name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="subsidy-percentage" className="text-white">
              Porcentaje de Subsidio (%)
            </Label>
            <Input
              id="subsidy-percentage"
              type="number"
              min="0"
              max="100"
              value={currentCompany.subsidy_percentage || 0}
              onChange={(e) => onUpdateCompany('subsidy_percentage', parseFloat(e.target.value) || 0)}
              className="modal-input"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fixed-amount" className="text-white">
              Monto Fijo ($)
            </Label>
            <Input
              id="fixed-amount"
              type="number"
              min="0"
              value={currentCompany.fixed_subsidy_amount || 0}
              onChange={(e) => onUpdateCompany('fixed_subsidy_amount', parseFloat(e.target.value) || 0)}
              className="modal-input"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} className="modal-button-cancel">
          Cancelar
        </Button>
        <Button onClick={onSave} className="modal-button-primary">
          {currentCompany.id ? 'Guardar Cambios' : 'Crear Empresa'}
        </Button>
      </DialogFooter>
    </>
  );
};
