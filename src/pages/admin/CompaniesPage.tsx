
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { ProviderSummaryCards } from '@/components/admin/companies/ProviderSummaryCards';
import { CompaniesFilter } from '@/components/admin/companies/CompaniesFilter';
import { CompaniesTable } from '@/components/admin/companies/CompaniesTable';
import { CompanyDialogs } from '@/components/admin/companies/CompanyDialogs';

const CompaniesPage = () => {
  const { 
    companies, 
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
  } = useCompanies();
  
  const { user } = useAuth();
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
        <ProviderSummaryCards
          providerSummaries={providerSummaries}
          selectedProvider={selectedProvider}
          onProviderSelect={handleProviderCardClick}
        />
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Companies Management
          </CardTitle>
          <CompaniesFilter
            search={search}
            selectedProvider={selectedProvider}
            providers={providers}
            isAdmin={isAdmin}
            onSearchChange={setSearch}
            onProviderFilterChange={setSelectedProvider}
          />
        </CardHeader>
        <CardContent>
          <CompaniesTable
            companies={companies}
            loading={loading}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
        </CardContent>
      </Card>

      <CompanyDialogs
        isDialogOpen={isDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        currentCompany={currentCompany}
        providers={providers}
        onUpdateCompany={updateCompanyField}
        onCloseDialog={() => setIsDialogOpen(false)}
        onCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
        onSave={handleCreateOrUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CompaniesPage;
