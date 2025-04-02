
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

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const navigateToCompanies = () => {
    onClose();
    setTimeout(() => navigate('/admin/companies'), 100);
  };

  return (
    <DialogContent 
      className="sm:max-w-md modal-glassmorphism"
      onInteractOutside={(e) => {
        e.preventDefault();
        handleClose();
      }}
      onEscapeKeyDown={(e) => {
        e.preventDefault();
        handleClose();
      }}
    >
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
        onCancel={handleClose}
      />

      <DialogFooter className="flex flex-wrap gap-2 justify-end mt-4 border-t border-white/10 pt-4">
        <Badge 
          variant="secondary"
          className="py-2 z-50 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            setTimeout(() => navigate('/admin/companies'), 100);
          }}
        >
          <Building size={14} className="mr-1" />
          Companies
        </Badge>
        <Badge 
          variant="secondary"
          className="py-2 z-50 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            setTimeout(() => navigate('/admin/providers'), 100);
          }}
        >
          <ChefHat size={14} className="mr-1" />
          Providers
        </Badge>
      </DialogFooter>
    </DialogContent>
  );
};
