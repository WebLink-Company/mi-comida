
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
    // Make sure we close the modal first
    onClose();
    // Then navigate with a slight delay to ensure the modal is closed
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
        <DialogTitle className="text-gradient">Ver Pedidos</DialogTitle>
        <DialogDescription className="text-white/70">
          Monitorea y gestiona todos los pedidos
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-4">
        <p className="text-sm text-white">Esto te redirigirá a la página de informes donde podrás ver toda la actividad de pedidos.</p>
        <p className="text-xs text-white/70">Puedes filtrar pedidos por fecha, empresa, proveedor y estado.</p>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="modal-button modal-button-cancel"
          >
            Cancelar
          </Button>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation('/admin/reports');
            }}
            className="modal-button modal-button-primary"
          >
            Ir a Pedidos
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
          <ShoppingBag size={14} className="mr-1" />
          Pedidos
        </Badge>
        <Badge 
          variant="secondary"
          className="py-2 z-50 cursor-pointer hover:bg-primary/20 modal-button"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation('/admin/providers');
          }}
        >
          <ChefHat size={14} className="mr-1" />
          Proveedores
        </Badge>
      </DialogFooter>
    </DialogContent>
  );
};
