
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company, Provider, CompanyWithProvider } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ProviderSummary {
  id: string;
  name: string;
  companyCount: number;
  avgSubsidy: number;
  totalFixedAmount: number;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<CompanyWithProvider[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerSummaries, setProviderSummaries] = useState<ProviderSummary[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});
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
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (companiesError) throw companiesError;
      
      if (!companiesData) {
        setCompanies([]);
        return;
      }
      
      const providerIds = companiesData.map(company => company.provider_id).filter(Boolean);
      
      let providersMap: Record<string, any> = {};
      
      if (providerIds.length > 0) {
        const { data: providersData, error: providersError } = await supabase
          .from('providers')
          .select('id, business_name, logo')
          .in('id', providerIds);
        
        if (providersError) throw providersError;
        
        if (providersData) {
          providersMap = providersData.reduce((acc: Record<string, any>, provider) => {
            acc[provider.id] = provider;
            return acc;
          }, {});
        }
      }
      
      const companiesWithProvider = companiesData.map(company => {
        const provider = company.provider_id ? providersMap[company.provider_id] : null;
        
        return {
          ...company,
          provider_name: provider ? provider.business_name : 'No Provider',
          subsidy_percentage: company.subsidy_percentage || 0,
          fixed_subsidy_amount: company.fixed_subsidy_amount || 0,
          subsidyPercentage: company.subsidy_percentage || 0,
          fixedSubsidyAmount: company.fixed_subsidy_amount || 0,
          provider: provider
        } as CompanyWithProvider;
      });
      
      setCompanies(companiesWithProvider);
      
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
        .select('id, business_name, contact_email')
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

      const { data: providerExists, error: providerCheckError } = await supabase
        .from('providers')
        .select('id')
        .eq('id', currentCompany.provider_id)
        .single();
      
      if (providerCheckError) {
        console.error('Error checking provider:', providerCheckError);
        toast({
          title: 'Invalid provider',
          description: 'The selected provider could not be verified.',
          variant: 'destructive',
        });
        return;
      }

      if (!providerExists) {
        toast({
          title: 'Invalid provider',
          description: 'The selected provider does not exist.',
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
      
      const { data, error } = await operation;
      
      if (error) {
        console.error('Error saving company:', error);
        throw error;
      }
      
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

  const updateCompanyField = (key: string, value: any) => {
    setCurrentCompany(prev => ({ ...prev, [key]: value }));
  };

  return {
    companies: filteredCompanies,
    providers,
    providerSummaries,
    selectedProvider,
    loading,
    search,
    isDialogOpen,
    isDeleteDialogOpen,
    currentCompany,
    setSearch,
    setSelectedProvider,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    handleCreateOrUpdate,
    handleDelete,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    handleProviderCardClick,
    updateCompanyField
  };
};
