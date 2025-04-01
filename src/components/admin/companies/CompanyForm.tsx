
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Company, Provider } from '@/lib/types';

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
          <label htmlFor="company-name" className="text-sm font-medium">
            Company Name
          </label>
          <Input
            id="company-name"
            value={currentCompany.name || ''}
            onChange={(e) => onUpdateCompany('name', e.target.value)}
            placeholder="Enter company name"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="company-provider" className="text-sm font-medium">
            Provider
          </label>
          <select
            id="company-provider"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={currentCompany.provider_id || ''}
            onChange={(e) => onUpdateCompany('provider_id', e.target.value)}
          >
            <option value="">Select a provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.business_name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label htmlFor="subsidy-percentage" className="text-sm font-medium">
              Subsidy Percentage (%)
            </label>
            <Input
              id="subsidy-percentage"
              type="number"
              min="0"
              max="100"
              value={currentCompany.subsidy_percentage || 0}
              onChange={(e) => onUpdateCompany('subsidy_percentage', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="fixed-amount" className="text-sm font-medium">
              Fixed Amount ($)
            </label>
            <Input
              id="fixed-amount"
              type="number"
              min="0"
              value={currentCompany.fixed_subsidy_amount || 0}
              onChange={(e) => onUpdateCompany('fixed_subsidy_amount', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          {currentCompany.id ? 'Save Changes' : 'Create Company'}
        </Button>
      </DialogFooter>
    </>
  );
};
