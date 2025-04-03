
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, CreditCard, PieChart } from 'lucide-react';

interface Invoice {
  id: string;
  company_name: string;
  invoice_number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

const BillingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        company_name: 'Acme Inc.',
        invoice_number: 'INV-2023-001',
        date: '2023-10-01',
        amount: 2500.00,
        status: 'paid'
      },
      {
        id: '2',
        company_name: 'Globex Corp',
        invoice_number: 'INV-2023-002',
        date: '2023-10-15',
        amount: 3200.00,
        status: 'paid'
      },
      {
        id: '3',
        company_name: 'Stark Industries',
        invoice_number: 'INV-2023-003',
        date: '2023-11-01',
        amount: 4100.00,
        status: 'pending'
      },
      {
        id: '4',
        company_name: 'Wayne Enterprises',
        invoice_number: 'INV-2023-004',
        date: '2023-11-15',
        amount: 3800.00,
        status: 'pending'
      },
      {
        id: '5',
        company_name: 'LexCorp',
        invoice_number: 'INV-2023-005',
        date: '2023-12-01',
        amount: 2900.00,
        status: 'overdue'
      }
    ];

    // Simulate loading data
    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      case 'overdue':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const downloadInvoice = (invoiceId: string) => {
    toast({
      title: "Descargando factura",
      description: `Se ha iniciado la descarga de la factura ${invoiceId}`,
    });
  };

  const currentMonthTotal = invoices
    .filter(inv => {
      const invDate = new Date(inv.date);
      const currentDate = new Date();
      return invDate.getMonth() === currentDate.getMonth() && 
             invDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Facturación</h1>
        <p className="text-muted-foreground">
          Gestiona tus facturas y pagos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Facturación del mes</CardDescription>
            <CardTitle className="text-2xl font-bold">${currentMonthTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendiente de pago</CardDescription>
            <CardTitle className="text-2xl font-bold">${pendingAmount.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Total pendiente de cobro
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Facturación anual</CardDescription>
            <CardTitle className="text-2xl font-bold">
              ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Total año {new Date().getFullYear()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="invoices" className="text-base">
            <FileText className="h-4 w-4 mr-2" />
            Facturas
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="text-base">
            <CreditCard className="h-4 w-4 mr-2" />
            Métodos de pago
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-base">
            <PieChart className="h-4 w-4 mr-2" />
            Reportes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Historial de facturas</CardTitle>
              <CardDescription>
                Todas las facturas emitidas y su estado de pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.company_name}</TableCell>
                        <TableCell>{format(new Date(invoice.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-right">${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status === 'paid' && 'Pagada'}
                            {invoice.status === 'pending' && 'Pendiente'}
                            {invoice.status === 'overdue' && 'Vencida'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => downloadInvoice(invoice.invoice_number)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {invoices.length} facturas
              </div>
              <Button variant="outline">Exportar todas</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de pago</CardTitle>
              <CardDescription>
                Gestiona tus métodos de pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No hay métodos de pago registrados</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Añade un método de pago para facilitar el proceso de facturación automática
                </p>
                <Button>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Añadir método de pago
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes financieros</CardTitle>
              <CardDescription>
                Visualiza tus reportes financieros y estadísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PieChart className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Reportes financieros</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Los reportes detallados estarán disponibles próximamente
                </p>
                <Button variant="outline">
                  Solicitar reporte personalizado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingPage;
