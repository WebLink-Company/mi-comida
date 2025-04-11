
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, PencilIcon, Trash2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Company {
  id: string;
  name: string;
  logo: string | null;
  created_at: string;
  subsidy_percentage: number;
  fixed_subsidy_amount: number;
}

const CompaniesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (user?.provider_id) {
      fetchCompanies();
    }
  }, [user?.provider_id]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      console.log(`Buscando empresas para provider_id: ${user?.provider_id}`);
      
      // Debug: imprimir la consulta que se está haciendo
      console.log(`QUERY: SELECT * FROM companies WHERE provider_id = '${user?.provider_id}'`);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('provider_id', user?.provider_id)
        .order('name');

      if (error) {
        console.error('Error en consulta de empresas:', error);
        throw error;
      }
      
      console.log('Empresas encontradas:', data);
      setCompanies(data || []);
    } catch (error) {
      console.error('Error al buscar empresas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las empresas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!currentCompany.name) {
      toast({
        title: 'Campos faltantes',
        description: 'El nombre de la empresa es obligatorio.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.provider_id) {
      toast({
        title: 'Error de autenticación',
        description: 'Debe iniciar sesión como proveedor para crear empresas.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const isNew = !currentCompany.id;
      
      // Para usuarios proveedores, SIEMPRE usamos su propio provider_id
      // Esto es crucial para satisfacer la política RLS
      const companyData = {
        name: currentCompany.name,
        provider_id: user.provider_id, // Siempre use el ID del proveedor autenticado
        subsidy_percentage: currentCompany.subsidy_percentage || 0,
        fixed_subsidy_amount: currentCompany.fixed_subsidy_amount || 0,
      };

      console.log('Creando/actualizando empresa con datos:', companyData);

      if (isNew) {
        // Para nuevas empresas, insertar con el ID del proveedor
        const { data, error } = await supabase
          .from('companies')
          .insert(companyData);

        if (error) {
          console.error('Error en operación de empresa:', error);
          throw error;
        }

        console.log('Operación de empresa exitosa:', data);
      } else {
        // Para actualizaciones, aseguramos que provider_id esté configurado correctamente
        // y solo estamos actualizando la empresa si pertenece a este proveedor (RLS aplicará esto)
        const { data, error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', currentCompany.id);

        if (error) {
          console.error('Error en operación de empresa:', error);
          throw error;
        }

        console.log('Operación de empresa exitosa:', data);
      }
      
      toast({
        title: isNew ? 'Empresa creada' : 'Empresa actualizada',
        description: `${isNew ? 'Creada' : 'Actualizada'} exitosamente la empresa "${currentCompany.name}".`,
      });

      fetchCompanies();
      setIsDialogOpen(false);
      resetCompanyForm();
    } catch (error) {
      console.error('Error al guardar empresa:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la empresa',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!currentCompany.id) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', currentCompany.id);

      if (error) throw error;

      toast({
        title: 'Empresa eliminada',
        description: `Se eliminó exitosamente la empresa "${currentCompany.name}".`,
      });

      fetchCompanies();
      setIsDeleteDialogOpen(false);
      resetCompanyForm();
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la empresa',
        variant: 'destructive',
      });
    }
  };

  const resetCompanyForm = () => {
    setCurrentCompany({});
  };

  const openCreateDialog = () => {
    resetCompanyForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (company: Company) => {
    setCurrentCompany({
      id: company.id,
      name: company.name,
      subsidy_percentage: company.subsidy_percentage,
      fixed_subsidy_amount: company.fixed_subsidy_amount,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setCurrentCompany({
      id: company.id,
      name: company.name,
    });
    setIsDeleteDialogOpen(true);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Gestión de Empresas</h1>
          <p className="text-white/70">Administre sus empresas y su configuración</p>
        </div>
        <Button className="mt-4 md:mt-0 glass" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Empresa
        </Button>
      </div>

      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Sus Empresas</CardTitle>
          <div className="w-72">
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table className="blue-glass-table">
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">Nombre de Empresa</TableHead>
                  <TableHead className="text-white">Subsidio %</TableHead>
                  <TableHead className="text-white">Subsidio Fijo</TableHead>
                  <TableHead className="text-white">Creada</TableHead>
                  <TableHead className="text-right text-white">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-white">
                      Cargando empresas...
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-white">
                      {searchTerm ? 'No hay empresas que coincidan con su búsqueda' : 'No se encontraron empresas. ¡Agregue su primera empresa!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="border-white/10 table-row-hover">
                      <TableCell className="font-medium text-white">{company.name}</TableCell>
                      <TableCell className="text-white">{company.subsidy_percentage}%</TableCell>
                      <TableCell className="text-white">${company.fixed_subsidy_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-white">
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 mr-2 bg-white/10 border-white/20 hover:bg-white/20"
                          onClick={() => openEditDialog(company)}
                        >
                          <PencilIcon className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-white/10 border-white/20 hover:bg-white/20 hover:text-red-500"
                          onClick={() => openDeleteDialog(company)}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Diálogo Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="neo-blur text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gradient">{currentCompany.id ? 'Editar Empresa' : 'Crear Empresa'}</DialogTitle>
            <DialogDescription className="text-white/70">
              {currentCompany.id ? 'Actualizar información de la empresa' : 'Agregar una nueva empresa a su portafolio'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-white/70">
                Nombre
              </label>
              <Input
                id="name"
                value={currentCompany.name || ''}
                onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                className="col-span-3 bg-white/20 border-white/20"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="subsidy" className="text-right text-white/70">
                Subsidio %
              </label>
              <Input
                id="subsidy"
                type="number"
                min="0"
                max="100"
                value={currentCompany.subsidy_percentage || 0}
                onChange={(e) => setCurrentCompany({
                  ...currentCompany,
                  subsidy_percentage: parseFloat(e.target.value)
                })}
                className="col-span-3 bg-white/20 border-white/20"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="fixed" className="text-right text-white/70">
                Subsidio Fijo $
              </label>
              <Input
                id="fixed"
                type="number"
                min="0"
                step="0.01"
                value={currentCompany.fixed_subsidy_amount || 0}
                onChange={(e) => setCurrentCompany({
                  ...currentCompany,
                  fixed_subsidy_amount: parseFloat(e.target.value)
                })}
                className="col-span-3 bg-white/20 border-white/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="glass-dark">
              Cancelar
            </Button>
            <Button onClick={handleCreateOrUpdate} className="glass">
              {currentCompany.id ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="neo-blur text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gradient">Eliminar Empresa</DialogTitle>
            <DialogDescription className="text-white/70">
              ¿Está seguro que desea eliminar "{currentCompany.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="glass-dark">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompaniesPage;
