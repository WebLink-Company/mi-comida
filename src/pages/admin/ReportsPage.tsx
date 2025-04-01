
import { Calendar, Download, BarChart4, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ReportsPage = () => {
  const reportTypes = [
    {
      title: 'User Activity',
      description: 'User registrations, logins, and activity over time',
      icon: LineChart,
      formats: ['CSV', 'PDF', 'Excel']
    },
    {
      title: 'Order Analytics',
      description: 'Order volumes, popular meals, and trends',
      icon: BarChart4,
      formats: ['CSV', 'PDF', 'Excel']
    },
    {
      title: 'Company Engagement',
      description: 'Company participation and subsidy utilization',
      icon: PieChart,
      formats: ['CSV', 'PDF', 'Excel']
    },
    {
      title: 'Provider Performance',
      description: 'Provider order fulfillment and ratings',
      icon: LineChart,
      formats: ['CSV', 'PDF', 'Excel']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and export reports for platform analytics and insights.
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
                      <span className="text-sm font-medium">From</span>
                      <input 
                        type="date" 
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">To</span>
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
          <CardTitle>Report Under Construction</CardTitle>
          <CardDescription>
            Advanced reporting features are currently being developed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 bg-muted/20 rounded-lg">
            <div className="text-center">
              <BarChart4 className="mx-auto h-16 w-16 text-muted-foreground/60" />
              <p className="mt-4 text-muted-foreground">
                This section is under construction. More advanced reporting features will be available soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
