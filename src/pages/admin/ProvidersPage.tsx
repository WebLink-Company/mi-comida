
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Search, ChefHat, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Provider {
  id: string;
  business_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  logo: string;
  is_active: boolean;
  address: string;
  created_at: string;
  company_count: number;
}

const ProvidersPage = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        // First, fetch providers
        const { data: providersData, error: providersError } = await supabase
          .from('providers')
          .select('*')
          .order('business_name', { ascending: true });
        
        if (providersError) throw providersError;
        
        // Then, for each provider, count their associated companies
        const providersWithCounts = await Promise.all(
          (providersData || []).map(async (provider) => {
            const { count, error: countError } = await supabase
              .from('companies')
              .select('*', { count: 'exact', head: true })
              .eq('provider_id', provider.id);
            
            return {
              ...provider,
              company_count: count || 0
            };
          })
        );
        
        setProviders(providersWithCounts);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Filter providers based on search
  const filteredProviders = providers.filter((provider) =>
    search === '' || 
    provider.business_name.toLowerCase().includes(search.toLowerCase()) ||
    provider.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
        <p className="text-muted-foreground mt-2">
          Manage all food service providers in the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChefHat className="mr-2 h-5 w-5" />
            Food Service Providers
          </CardTitle>
          <div className="relative max-w-sm mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
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
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading providers...</TableCell>
                </TableRow>
              ) : filteredProviders.length > 0 ? (
                filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {provider.logo && (
                          <div className="w-10 h-10 mr-3 rounded-full overflow-hidden flex-shrink-0 bg-slate-100">
                            <img src={provider.logo} alt={provider.business_name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{provider.business_name}</div>
                          {provider.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {provider.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        provider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Mail className="mr-1 h-3 w-3" />
                          {provider.contact_email}
                        </div>
                        {provider.contact_phone && (
                          <div className="flex items-center text-xs">
                            <Phone className="mr-1 h-3 w-3" />
                            {provider.contact_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{provider.company_count}</TableCell>
                    <TableCell>
                      <div className="text-sm line-clamp-1">
                        {provider.address || 'No address provided'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No providers found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProvidersPage;
