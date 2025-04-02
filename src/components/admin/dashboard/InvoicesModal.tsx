
import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InvoicesModalProps {
  onClose: () => void;
}

export const InvoicesModal: React.FC<InvoicesModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 100);
  };
  
  const handleClose = () => {
    onClose();
  };

  return (
    <DialogContent 
      className="sm:max-w-md modal-glassmorphism"
      onInteractOutside={handleClose}
      onEscapeKeyDown={handleClose}
    >
      <DialogHeader>
        <DialogTitle className="text-gradient">Review Invoices</DialogTitle>
        <DialogDescription className="text-white/70">
          Manage billing and payments
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-4">
        <p className="text-sm text-white">This will redirect you to the finance section where you can review and manage invoices.</p>
        <p className="text-xs text-white/70">You can track payments, generate reports, and manage billing cycles.</p>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="modal-button modal-button-cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation('/admin/reports');
            }}
            className="modal-button modal-button-primary"
          >
            Go to Invoices
          </Button>
        </div>
      </div>

      <DialogFooter className="flex flex-wrap gap-2 justify-end mt-4 border-t border-white/10 pt-4">
        <Badge 
          variant="secondary"
          className="py-2 z-50 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('/admin/reports');
          }}
        >
          <DollarSign size={14} className="mr-1" />
          Finance
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
