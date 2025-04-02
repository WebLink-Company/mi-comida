
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
            <DialogTitle className="text-gradient">{currentCompany.id ? 'Edit Company' : 'Create New Company'}</DialogTitle>
            <DialogDescription className="text-white/70">
              Fill in the company details below
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
            <DialogTitle className="text-gradient">Delete Company</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white">Are you sure you want to delete <strong>{currentCompany.name}</strong>?</p>
            <p className="text-sm text-white/70 mt-2">
              This action cannot be undone. All data associated with this company will be permanently removed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDeleteDialog} className="modal-button-cancel">
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
