
import { Calendar, Download, BarChart4, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ReportsPage = () => {
  const reportTypes = [
    {
      title: 'Actividad de Usuarios',
      description: 'Registros de usuarios, inicios de sesión y actividad a lo largo del tiempo',
      icon: LineChart,
      formats: ['CSV', 'PDF', 'Excel']
    },
    {
      title: 'Análisis de Pedidos',
      description: 'Volumen de pedidos, comidas populares y tendencias',
      icon: BarChart4,
      formats: ['CSV', 'PDF', 'Excel']
    },
    {
      title: 'Participación de Empresas',
      description: 'Participación de empresas y utilización de subsidios',
      icon: PieChart,
      formats: ['CSV', 'PDF', 'Excel']
    },
    {
      title: 'Rendimiento de Proveedores',
      description: 'Cumplimiento de pedidos y calificaciones de proveedores',
      icon: LineChart,
      formats: ['CSV', 'PDF', 'Excel']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Informes</h1>
        <p className="text-muted-foreground mt-2">
          Genera y exporta informes para análisis e información de la plataforma.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <report.icon className="mr-2 h-5 w-5" />
                {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Desde</span>
                      <input 
                        type="date" 
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Hasta</span>
                      <input 
                        type="date" 
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  {report.formats.map((format) => (
                    <button
                      key={format}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{format}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informe en Construcción</CardTitle>
          <CardDescription>
            Las funciones avanzadas de informes están en desarrollo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 bg-muted/20 rounded-lg">
            <div className="text-center">
              <BarChart4 className="mx-auto h-16 w-16 text-muted-foreground/60" />
              <p className="mt-4 text-muted-foreground">
                Esta sección está en construcción. Más funciones avanzadas de informes estarán disponibles pronto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
