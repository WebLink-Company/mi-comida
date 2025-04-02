
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, PencilIcon, Trash2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Company {
  id: string;
  name: string;
  logo: string | null;
  created_at: string;
  subsidy_percentage: number;
  fixed_subsidy_amount: number;
}

const CompaniesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (user?.provider_id) {
      fetchCompanies();
    }
  }, [user?.provider_id]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      console.log(`Fetching companies for provider_id: ${user?.provider_id}`);
      
      // Debug: print the query being made
      console.log(`QUERY: SELECT * FROM companies WHERE provider_id = '${user?.provider_id}'`);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('provider_id', user?.provider_id)
        .order('name');

      if (error) {
        console.error('Error in companies query:', error);
        throw error;
      }
      
      console.log('Companies fetched:', data);
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!currentCompany.name) {
      toast({
        title: 'Missing fields',
        description: 'Company name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.provider_id) {
      toast({
        title: 'Authentication error',
        description: 'You must be logged in as a provider to create companies.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const isNew = !currentCompany.id;
      
      // Important: Use the logged-in user's provider_id - do not allow overriding
      const companyData = {
        ...currentCompany,
        provider_id: user.provider_id, // Always use the authenticated user's provider_id
        name: currentCompany.name,
        subsidy_percentage: currentCompany.subsidy_percentage || 0,
        fixed_subsidy_amount: currentCompany.fixed_subsidy_amount || 0,
      };

      console.log('Creating/updating company with data:', companyData);

      let operation;
      if (isNew) {
        operation = supabase
          .from('companies')
          .insert(companyData)
          .select();
      } else {
        // For updates, make sure we don't change the provider_id
        operation = supabase
          .from('companies')
          .update(companyData)
          .eq('id', currentCompany.id)
          .select();
      }

      const { data, error } = await operation;

      if (error) {
        console.error('Error in company operation:', error);
        throw error;
      }

      console.log('Company operation successful:', data);
      
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

  const openEditDialog = (company: Company) => {
    setCurrentCompany({
      id: company.id,
      name: company.name,
      subsidy_percentage: company.subsidy_percentage,
      fixed_subsidy_amount: company.fixed_subsidy_amount,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setCurrentCompany({
      id: company.id,
      name: company.name,
    });
    setIsDeleteDialogOpen(true);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Company Management</h1>
          <p className="text-white/70">Manage your companies and their settings</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <Card className="bg-white/10 border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Companies</CardTitle>
          <div className="w-72">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/20 border-white/20"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Company Name</TableHead>
                  <TableHead className="text-white/70">Subsidy %</TableHead>
                  <TableHead className="text-white/70">Fixed Subsidy</TableHead>
                  <TableHead className="text-white/70">Created</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-white/70">
                      Loading companies...
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-white/70">
                      {searchTerm ? 'No companies matching your search' : 'No companies found. Add your first company!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.subsidy_percentage}%</TableCell>
                      <TableCell>${company.fixed_subsidy_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 mr-2 bg-white/10 border-white/20 hover:bg-white/20"
                          onClick={() => openEditDialog(company)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-white/10 border-white/20 hover:bg-white/20 hover:text-red-500"
                          onClick={() => openDeleteDialog(company)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white/10 border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{currentCompany.id ? 'Edit Company' : 'Create Company'}</DialogTitle>
            <DialogDescription className="text-white/70">
              {currentCompany.id ? 'Update company information' : 'Add a new company to your portfolio'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-white/70">
                Name
              </label>
              <Input
                id="name"
                value={currentCompany.name || ''}
                onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                className="col-span-3 bg-white/20 border-white/20"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="subsidy" className="text-right text-white/70">
                Subsidy %
              </label>
              <Input
                id="subsidy"
                type="number"
                min="0"
                max="100"
                value={currentCompany.subsidy_percentage || 0}
                onChange={(e) => setCurrentCompany({
                  ...currentCompany,
                  subsidy_percentage: parseFloat(e.target.value)
                })}
                className="col-span-3 bg-white/20 border-white/20"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="fixed" className="text-right text-white/70">
                Fixed $
              </label>
              <Input
                id="fixed"
                type="number"
                min="0"
                step="0.01"
                value={currentCompany.fixed_subsidy_amount || 0}
                onChange={(e) => setCurrentCompany({
                  ...currentCompany,
                  fixed_subsidy_amount: parseFloat(e.target.value)
                })}
                className="col-span-3 bg-white/20 border-white/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {currentCompany.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white/10 border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete "{currentCompany.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function handleDelete() {
    if (!currentCompany.id) return;

    supabase
      .from('companies')
      .delete()
      .eq('id', currentCompany.id)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting company:', error);
          toast({
            title: 'Error',
            description: 'Failed to delete company',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Company deleted',
          description: `Successfully deleted company "${currentCompany.name}".`,
        });

        fetchCompanies();
        setIsDeleteDialogOpen(false);
        resetCompanyForm();
      });
  }

  function resetCompanyForm() {
    setCurrentCompany({});
  }

  function openCreateDialog() {
    resetCompanyForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(company: Company) {
    setCurrentCompany({
      id: company.id,
      name: company.name,
      subsidy_percentage: company.subsidy_percentage,
      fixed_subsidy_amount: company.fixed_subsidy_amount,
    });
    setIsDialogOpen(true);
  }

  function openDeleteDialog(company: Company) {
    setCurrentCompany({
      id: company.id,
      name: company.name,
    });
    setIsDeleteDialogOpen(true);
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export default CompaniesPage;
