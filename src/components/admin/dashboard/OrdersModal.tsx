
import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrdersModalProps {
  onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <DialogContent className="sm:max-w-md neo-blur text-white border-white/20">
      <DialogHeader>
        <DialogTitle className="text-gradient">View Orders</DialogTitle>
        <DialogDescription className="text-white/70">
          Monitor and manage all orders
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-4">
        <p className="text-sm">This will redirect you to the reports page where you can view all order activity.</p>
        <p className="text-xs text-muted-foreground">You can filter orders by date, company, provider, and status.</p>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="modal-button border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation('/admin/reports');
            }}
            className="modal-button bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Go to Orders
          </Button>
        </div>
      </div>

      <DialogFooter className="flex flex-wrap gap-2 justify-end mt-4 border-t border-white/10 pt-4">
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('/admin/reports');
          }}
        >
          <ShoppingBag size={14} className="mr-1" />
          Orders
        </Badge>
        <Badge 
          variant="secondary"
          className="py-2 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('/admin/providers');
          }}
        >
          <ChefHat size={14} className="mr-1" />
          Providers
        </Badge>
      </DialogFooter>
    </DialogContent>
  );
};
