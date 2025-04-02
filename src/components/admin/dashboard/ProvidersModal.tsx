
import React, { useState } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProvidersModalProps {
  onClose: () => void;
}

export const ProvidersModal: React.FC<ProvidersModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provider, setProvider] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: ''
  });

  const handleNavigation = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 100);
  };

  const handleClose = () => {
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProvider(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider.businessName || !provider.email) {
      toast({
        title: "Missing information",
        description: "Business name and email are required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('providers').insert({
        business_name: provider.businessName,
        contact_name: provider.contactName,
        email: provider.email,
        phone: provider.phone
      });

      if (error) throw error;
      
      toast({
        title: "Provider created",
        description: "The provider has been successfully created",
      });
      
      handleNavigation('/admin/providers');
    } catch (error) {
      console.error('Error creating provider:', error);
      toast({
        title: "Error",
        description: "Failed to create provider. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent 
      className="sm:max-w-md modal-glassmorphism"
      onInteractOutside={handleClose}
      onEscapeKeyDown={handleClose}
    >
      <DialogHeader>
        <DialogTitle className="text-gradient">Add Provider</DialogTitle>
        <DialogDescription className="text-white/70">
          Register a new food service provider
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 my-4">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-white">Business Name</Label>
          <Input 
            id="businessName"
            value={provider.businessName}
            onChange={handleChange}
            placeholder="Enter business name"
            className="modal-input"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactName" className="text-white">Contact Name</Label>
          <Input 
            id="contactName"
            value={provider.contactName}
            onChange={handleChange}
            placeholder="Enter contact person name"
            className="modal-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input 
            id="email"
            type="email"
            value={provider.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className="modal-input"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">Phone Number</Label>
          <Input 
            id="phone"
            value={provider.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="modal-input"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="modal-button modal-button-cancel"
            type="button"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="modal-button modal-button-primary"
          >
            {isSubmitting ? 'Creating...' : 'Create Provider'}
          </Button>
        </div>
      </form>

      <DialogFooter className="flex flex-wrap gap-2 justify-end mt-4 border-t border-white/10 pt-4">
        <Badge 
          variant="secondary"
          className="py-2 z-50 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('/admin/providers');
          }}
        >
          <ChefHat size={14} className="mr-1" />
          Providers
        </Badge>
        <Badge 
          variant="secondary"
          className="py-2 z-50 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('/admin/companies');
          }}
        >
          <Building size={14} className="mr-1" />
          Companies
        </Badge>
      </DialogFooter>
    </DialogContent>
  );
};
