
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
    business_name: '',
    contact_email: '',
    contact_phone: '',
    description: ''
  });

  const handleNavigation = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 100);
  };

  const handleClose = () => {
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProvider(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider.business_name || !provider.contact_email) {
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
        business_name: provider.business_name,
        contact_email: provider.contact_email,
        contact_phone: provider.contact_phone,
        description: provider.description
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
          <Label htmlFor="business_name" className="text-white">Business Name</Label>
          <Input 
            id="business_name"
            value={provider.business_name}
            onChange={handleChange}
            placeholder="Enter business name"
            className="modal-input bg-white/10 border-white/20 text-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_email" className="text-white">Contact Email</Label>
          <Input 
            id="contact_email"
            type="email"
            value={provider.contact_email}
            onChange={handleChange}
            placeholder="Enter email address"
            className="modal-input bg-white/10 border-white/20 text-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_phone" className="text-white">Phone Number</Label>
          <Input 
            id="contact_phone"
            value={provider.contact_phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="modal-input bg-white/10 border-white/20 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">Description</Label>
          <textarea
            id="description"
            value={provider.description}
            onChange={handleChange}
            placeholder="Brief description of the provider"
            className="w-full h-20 px-3 py-2 modal-input bg-white/10 border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="modal-button modal-button-primary bg-gradient-to-r from-blue-500 to-purple-600 text-white"
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
