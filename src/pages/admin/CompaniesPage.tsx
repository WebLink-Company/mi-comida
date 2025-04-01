import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company, Provider, CompanyWithProvider } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Search, Building, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ProviderSummary {
  id: string;
  name: string;
  companyCount: number;
  avgSubsidy: number;
  totalFixedAmount: number;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<CompanyWithProvider[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerSummaries, setProviderSummaries] = useState<ProviderSummary[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchCompanies();
    fetchProviders();
  }, []);

  useEffect(() => {
    if (companies.length > 0 && providers.length > 0) {
      generateProviderSummaries();
    }
  }, [companies, providers]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('companies')
        .select(`
          *,
          provider:providers(id, business_name, logo, logo_url)
        `)
        .order('name');
      
      if (user && user.role === 'provider' && user.provider_id) {
        query = query.eq('provider_id', user.provider_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const companiesWithProvider = data?.map(company => ({
        ...company,
        provider_name: company.provider ? company.provider.business_name : 'No Provider',
        subsidy_percentage: company.subsidy_percentage || company.subsidyPercentage || 0,
        fixed_subsidy_amount: company.fixed_subsidy_amount || company.fixedSubsidyAmount || 0,
      })) || [];
      
      setCompanies(companiesWithProvider);
      
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('id, business_name');
      
      if (providersError) throw providersError;
      
      const typedProviders: Provider[] = (providersData || []).map(p => ({
        id: p.id,
        business_name: p.business_name,
        contact_email: ''
      }));
      
      setProviders(typedProviders);
      
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id, business_name')
        .order('business_name', { ascending: true });
      
      if (error) throw error;
      
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const generateProviderSummaries = () => {
    const summaries: ProviderSummary[] = providers.map(provider => {
      const providerCompanies = companies.filter(
        company => company.provider_id === provider.id
      );
      
      const companyCount = providerCompanies.length;
      const avgSubsidy = companyCount > 0
        ? providerCompanies.reduce((sum, company) => sum + (company.subsidy_percentage || 0), 0) / companyCount
        : 0;
      const totalFixedAmount = providerCompanies.reduce(
        (sum, company) => sum + (company.fixed_subsidy_amount || 0), 0
      );
      
      return {
        id: provider.id,
        name: provider.business_name,
        companyCount,
        avgSubsidy,
        totalFixedAmount
      };
    });
    
    setProviderSummaries(summaries);
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (!currentCompany.name || !currentCompany.provider_id) {
        toast({
          title: 'Missing fields',
          description: 'Company name and provider are required.',
          variant: 'destructive',
        });
        return;
      }

      const isNew = !currentCompany.id;
      
      let operation;
      if (isNew) {
        operation = supabase
          .from('companies')
          .insert({
            name: currentCompany.name,
            provider_id: currentCompany.provider_id,
            subsidy_percentage: currentCompany.subsidy_percentage || 0,
            fixed_subsidy_amount: currentCompany.fixed_subsidy_amount || 0,
          })
          .select();
      } else {
        operation = supabase
          .from('companies')
          .update({
            name: currentCompany.name,
            provider_id: currentCompany.provider_id,
            subsidy_percentage: currentCompany.subsidy_percentage || 0,
            fixed_subsidy_amount: currentCompany.fixed_subsidy_amount || 0,
          })
          .eq('id', currentCompany.id)
          .select();
      }
      
      const { error } = await operation;
      
      if (error) throw error;
      
      toast({
        title: isNew ? 'Company created' : 'Company updated',
        description: `Successfully ${isNew ? 'created' : 'updated'} company "${currentCompany.name}".`,
      });
      
      fetchCompanies();
      setIsDialogOpen(false);
      resetCompanyForm();
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: 'Error',
        description: 'Failed to save company',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!currentCompany.id) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', currentCompany.id);
      
      if (error) throw error;
      
      toast({
        title: 'Company deleted',
        description: `Successfully deleted company "${currentCompany.name}".`,
      });
      
      fetchCompanies();
      setIsDeleteDialogOpen(false);
      resetCompanyForm();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete company',
        variant: 'destructive',
      });
    }
  };

  const resetCompanyForm = () => {
    setCurrentCompany({});
  };

  const openCreateDialog = () => {
    resetCompanyForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (company: CompanyWithProvider) => {
    setCurrentCompany({
      id: company.id,
      name: company.name,
      provider_id: company.provider_id,
      subsidy_percentage: company.subsidy_percentage,
      fixed_subsidy_amount: company.fixed_subsidy_amount,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (company: CompanyWithProvider) => {
    setCurrentCompany({
      id: company.id,
      name: company.name,
    });
    setIsDeleteDialogOpen(true);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = search === '' || company.name.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = selectedProvider === '' || company.provider_id === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const handleProviderCardClick = (providerId: string) => {
    setSelectedProvider(providerId === selectedProvider ? '' : providerId);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-2">
            Manage all client companies registered in the platform.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="self-start">
          <Plus className="mr-2 h-4 w-4" /> Create New Company
        </Button>
      </div>

      {isAdmin && providerSummaries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providerSummaries.map((summary) => (
            <Card 
              key={summary.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedProvider === summary.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleProviderCardClick(summary.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{summary.name}</h3>
                  <Badge>{summary.companyCount} Companies</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Avg. Subsidy</p>
                    <p className="font-medium">{summary.avgSubsidy.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Fixed</p>
                    <p className="font-medium">${summary.totalFixedAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Companies Management
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isAdmin && (
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <select
                    className="w-full h-10 rounded-md border border-input pl-9 pr-8 py-2 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                  >
                    <option value="">All Providers</option>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading companies...</TableCell>
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
                          onClick={() => openEditDialog(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(company)}
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentCompany.id ? 'Edit Company' : 'Create New Company'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="company-name" className="text-sm font-medium">
                Company Name
              </label>
              <Input
                id="company-name"
                value={currentCompany.name || ''}
                onChange={(e) => setCurrentCompany({...currentCompany, name: e.target.value})}
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
                onChange={(e) => setCurrentCompany({...currentCompany, provider_id: e.target.value})}
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
                  onChange={(e) => setCurrentCompany({
                    ...currentCompany, 
                    subsidy_percentage: parseFloat(e.target.value) || 0
                  })}
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
                  onChange={(e) => setCurrentCompany({
                    ...currentCompany, 
                    fixed_subsidy_amount: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {currentCompany.id ? 'Save Changes' : 'Create Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete <strong>{currentCompany.name}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. All data associated with this company will be permanently removed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompaniesPage;
