
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, ChefHat, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Provider } from '@/lib/types';
import { CompanyForm } from '@/components/admin/companies/CompanyForm';

interface CompaniesModalProps {
  onClose: () => void;
}

export const CompaniesModal: React.FC<CompaniesModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [currentCompany, setCurrentCompany] = useState<any>({});

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .order('business_name');
          
        if (error) throw error;
        setProviders(data || []);
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };

    fetchProviders();
  }, []);

  const handleUpdateCompany = (key: string, value: any) => {
    setCurrentCompany(prev => ({ ...prev, [key]: value }));
  };

  const navigateToCompanies = () => {
    onClose();
    navigate('/admin/companies');
  };

  return (
    <DialogContent className="sm:max-w-md neo-blur text-white border-white/20">
      <DialogHeader>
        <DialogTitle className="text-gradient">Create Company</DialogTitle>
        <DialogDescription className="text-white/70">
          Add a new company to the platform
        </DialogDescription>
      </DialogHeader>

      <CompanyForm
        currentCompany={currentCompany}
        providers={providers}
        onUpdateCompany={handleUpdateCompany}
        onSave={navigateToCompanies}
        onCancel={onClose}
      />

      <DialogFooter className="flex flex-wrap gap-2 justify-end mt-4 border-t border-white/10 pt-4">
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20"
          onClick={() => {
            onClose();
            navigate('/admin/companies');
          }}
        >
          <Building size={14} className="mr-1" />
          Companies
        </Badge>
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20"
          onClick={() => {
            onClose();
            navigate('/admin/providers');
          }}
        >
          <ChefHat size={14} className="mr-1" />
          Providers
        </Badge>
      </DialogFooter>
    </DialogContent>
  );
};
