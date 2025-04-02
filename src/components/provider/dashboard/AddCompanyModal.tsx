
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface AddCompanyModalProps {
  onClose: () => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    subsidyPercentage: 0,
    logo: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'subsidyPercentage' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally submit to the database
    toast({
      title: 'Company Created',
      description: `${formData.name} has been successfully created.`,
    });
    
    onClose();
  };

  return (
    <DialogContent className="neo-blur modal-glassmorphism text-white border-white/20 sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-white flex items-center justify-between">
          <span>Add New Company</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X size={16} />
          </Button>
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Company Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter company name"
            value={formData.name}
            onChange={handleInputChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subsidyPercentage" className="text-white">Subsidy Percentage</Label>
          <Input
            id="subsidyPercentage"
            name="subsidyPercentage"
            type="number"
            min="0"
            max="100"
            placeholder="Enter subsidy percentage"
            value={formData.subsidyPercentage}
            onChange={handleInputChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo" className="text-white">Logo URL (optional)</Label>
          <Input
            id="logo"
            name="logo"
            placeholder="Enter logo URL"
            value={formData.logo}
            onChange={handleInputChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            Create Company
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
