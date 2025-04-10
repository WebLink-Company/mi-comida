
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Provider, Company } from '@/lib/types';
import { CompanyForm } from '@/components/admin/companies/CompanyForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface CompaniesModalProps {
  onClose: () => void;
  providerId?: string;
}

export const CompaniesModal: React.FC<CompaniesModalProps> = ({ onClose, providerId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});
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
      console.log(`Setting provider_id in CompaniesModal to: ${providerId}`);
      setCurrentCompany(prev => ({ ...prev, provider_id: providerId }));
    } else if (user?.role === 'provider' && user?.provider_id) {
      // For provider users, set their own provider_id automatically
      console.log(`Setting provider's own provider_id: ${user.provider_id}`);
      setCurrentCompany(prev => ({ ...prev, provider_id: user.provider_id }));
    }
  }, [providerId, user]);

  const handleUpdateCompany = (key: string, value: any) => {
    // Don't allow manual overriding of provider_id from the form if user is a provider
    if (key === 'provider_id' && user?.role === 'provider') {
      // If the user is a provider, we ignore attempts to change provider_id
      console.log('Provider users cannot change provider_id');
      return;
    }
    
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
      // For provider users, always use their own provider_id
      let effectiveProviderId = currentCompany.provider_id;
      
      // If the user is a provider, override with their own provider_id
      if (user?.role === 'provider' && user?.provider_id) {
        effectiveProviderId = user.provider_id;
        console.log(`Provider user detected - using their provider_id: ${effectiveProviderId}`);
      }
      
      const companyData = {
        name: currentCompany.name,
        provider_id: effectiveProviderId,
        subsidy_percentage: currentCompany.subsidy_percentage || 0,
        fixed_subsidy_amount: currentCompany.fixed_subsidy_amount || 0
      };
      
      console.log(`Creating company with data:`, companyData);
      
      const { data, error } = await supabase.from('companies').insert(companyData);

      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }
      
      console.log('Company created successfully:', data);
      
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
    setTimeout(() => navigate('/provider/companies'), 100);
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
            setTimeout(() => navigate('/provider/companies'), 100);
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
