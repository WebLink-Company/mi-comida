
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Search, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CompanyWithProvider extends Company {
  provider_name?: string;
  // Updated to reflect actual Supabase response structure
  providers?: {
    business_name: string;
  } | null;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<CompanyWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select(`
            id, 
            name, 
            subsidy_percentage,
            fixed_subsidy_amount,
            logo,
            provider_id,
            created_at,
            providers (business_name)
          `)
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        // Format the data to include provider name
        const formattedCompanies = data?.map(company => ({
          ...company,
          // Safely access business_name even if providers is null
          provider_name: company.providers?.business_name || 'N/A'
        })) || [];
        
        setCompanies(formattedCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) =>
    search === '' || company.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground mt-2">
          Manage all client companies registered in the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Companies Management
          </CardTitle>
          <div className="relative max-w-sm mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Subsidy %</TableHead>
                <TableHead>Fixed Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Added Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading companies...</TableCell>
                </TableRow>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
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
                    <TableCell>{company.provider_name}</TableCell>
                    <TableCell>{new Date(company.created_at || '').toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No companies found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompaniesPage;
