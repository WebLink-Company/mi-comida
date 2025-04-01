
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CompanyWithProvider } from '@/lib/types';
import { Edit, Trash2 } from 'lucide-react';

interface CompaniesTableProps {
  companies: CompanyWithProvider[];
  loading: boolean;
  onEdit: (company: CompanyWithProvider) => void;
  onDelete: (company: CompanyWithProvider) => void;
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  loading,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Subsidy %</TableHead>
          <TableHead>Fixed Amount</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Added Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">Loading companies...</TableCell>
          </TableRow>
        ) : companies.length > 0 ? (
          companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium flex items-center">
                {company.logo && (
                  <div className="w-8 h-8 mr-2 rounded-full overflow-hidden flex-shrink-0">
                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {company.name}
              </TableCell>
              <TableCell>{company.subsidy_percentage}%</TableCell>
              <TableCell>
                {company.fixed_subsidy_amount ? 
                `$${company.fixed_subsidy_amount}` : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-primary/10">
                  {company.provider_name}
                </Badge>
              </TableCell>
              <TableCell>{new Date(company.created_at || '').toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(company)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(company)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center">No companies found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
