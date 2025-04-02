import React, { useState, useEffect } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Provider } from '@/lib/types';
import { CompanyForm } from '@/components/admin/companies/CompanyForm';
import { useToast } from '@/hooks/use-toast';

interface CompaniesModalProps {
  onClose: () => void;
  providerId?: string;
}

export const CompaniesModal: React.FC<CompaniesModalProps> = ({ onClose, providerId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [currentCompany, setCurrentCompany] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (providerId) {
      setCurrentCompany(prev => ({ ...prev, provider_id: providerId }));
    }
  }, [providerId]);

  const handleUpdateCompany = (key: string, value: any) => {
    setCurrentCompany(prev => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    if (!currentCompany.name) {
      toast({
        title: "Missing information",
        description: "Company name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('companies').insert({
        name: currentCompany.name,
        provider_id: currentCompany.provider_id || null,
        subsidy_percentage: currentCompany.subsidy_percentage || 0,
        fixed_subsidy_amount: currentCompany.fixed_subsidy_amount || 0
      });

      if (error) throw error;
      
      toast({
        title: "Company created",
        description: "The company has been successfully created",
      });
      
      navigateToCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToCompanies = () => {
    onClose();
    setTimeout(() => navigate('/admin/companies'), 100);
  };

  return (
    <DialogContent 
      className="sm:max-w-md modal-glassmorphism"
      onInteractOutside={handleClose}
      onEscapeKeyDown={handleClose}
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
        onSave={handleSave}
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
