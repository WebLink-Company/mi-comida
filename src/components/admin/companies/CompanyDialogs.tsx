
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Company, Provider } from '@/lib/types';
import { CompanyForm } from './CompanyForm';

interface CompanyDialogsProps {
  isDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  currentCompany: Partial<Company>;
  providers: Provider[];
  onUpdateCompany: (key: string, value: any) => void;
  onCloseDialog: () => void;
  onCloseDeleteDialog: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export const CompanyDialogs: React.FC<CompanyDialogsProps> = ({
  isDialogOpen,
  isDeleteDialogOpen,
  currentCompany,
  providers,
  onUpdateCompany,
  onCloseDialog,
  onCloseDeleteDialog,
  onSave,
  onDelete,
}) => {
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={onCloseDialog}>
        <DialogContent className="sm:max-w-md modal-glassmorphism">
          <DialogHeader>
            <DialogTitle className="text-gradient">{currentCompany.id ? 'Editar Empresa' : 'Crear Nueva Empresa'}</DialogTitle>
            <DialogDescription className="text-white/70">
              Completa los detalles de la empresa a continuación
            </DialogDescription>
          </DialogHeader>
          <CompanyForm
            currentCompany={currentCompany}
            providers={providers}
            onUpdateCompany={onUpdateCompany}
            onSave={onSave}
            onCancel={onCloseDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
        <DialogContent className="sm:max-w-md modal-glassmorphism">
          <DialogHeader>
            <DialogTitle className="text-gradient">Eliminar Empresa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white">¿Estás seguro de que deseas eliminar <strong>{currentCompany.name}</strong>?</p>
            <p className="text-sm text-white/70 mt-2">
              Esta acción no se puede deshacer. Todos los datos asociados con esta empresa se eliminarán permanentemente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDeleteDialog} className="modal-button-cancel">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Eliminar Empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
