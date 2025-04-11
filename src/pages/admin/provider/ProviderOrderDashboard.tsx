import { useState, useEffect } from 'react';
import { format, isToday, isThisWeek, subDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Package, PlusCircle, Search, Users, AlertTriangle } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import OrdersModal from '@/components/provider/orders/OrdersModal';
import CompanyOrderCard from '@/components/provider/orders/CompanyOrderCard';

interface CompanyOrderSummary {
  id: string;
  name: string;
  orders: number;
  users: number;
  dispatched: number;
  pending: number;
}

const ProviderOrderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [companyOrders, setCompanyOrders] = useState<CompanyOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOrderSummary | null>(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompanyOrders();
    } else {
      setError("No user found. Please login again.");
      setLoading(false);
    }
  }, [user, selectedDate]);

  const fetchCompanyOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user?.provider_id) {
        setError("Provider ID not found in user profile");
        setLoading(false);
        return;
      }
      
      console.log("Fetching companies for provider:", user.provider_id);
      
      // First get companies for this provider
      const { data: providerCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('provider_id', user?.provider_id);

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        setError(`Failed to load companies: ${companiesError.message}`);
        setLoading(false);
        return;
      }

      if (!providerCompanies || providerCompanies.length === 0) {
        console.log("No companies found for provider");
        setCompanyOrders([]);
        setLoading(false);
        return;
      }

      console.log(`Found ${providerCompanies.length} companies for provider`);
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // For each company, get order stats
      const companiesWithOrders = await Promise.all(
        providerCompanies.map(async (company) => {
          // Get all orders for this company on the selected date
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, user_id, status')
            .eq('company_id', company.id)
            .eq('date', selectedDateStr);

          if (ordersError) {
            console.error(`Error fetching orders for company ${company.id}:`, ordersError);
            return null;
          }

          if (!orders || orders.length === 0) {
            return null; // Skip companies with no orders
          }

          // Count unique users
          const uniqueUsers = [...new Set(orders.map(order => order.user_id))].length;
          
          // Count dispatched vs pending orders
          const dispatched = orders.filter(order => 
            order.status === 'prepared' || order.status === 'delivered'
          ).length;
          
          const pending = orders.length - dispatched;

          return {
            id: company.id,
            name: company.name,
            orders: orders.length,
            users: uniqueUsers,
            dispatched,
            pending
          };
        })
      );

      // Filter out null values and companies with no orders
      const filteredCompanies = companiesWithOrders.filter(Boolean) as CompanyOrderSummary[];
      console.log(`Found ${filteredCompanies.length} companies with orders on ${selectedDateStr}`);
      setCompanyOrders(filteredCompanies);
    } catch (error) {
      console.error('Error fetching company orders:', error);
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: 'Error',
        description: 'Failed to load company orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyClick = (company: CompanyOrderSummary) => {
    setSelectedCompany(company);
    setIsOrdersModalOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-destructive">Error Loading Orders</h3>
            <p className="text-muted-foreground text-center max-w-md mt-2">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchCompanyOrders}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filterCompanies = (companies: CompanyOrderSummary[], filterFn: (date: Date) => boolean) => {
    return companies.filter(company => {
      // Implementation would depend on how we track dates for companies
      // For now, just return all companies
      return true;
    });
  };

  const todayCompanies = companyOrders;
  const thisWeekCompanies = companyOrders;
  const earlierCompanies = companyOrders;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Provider Order Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your client orders across all companies
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DatePicker 
            date={selectedDate}
            onSelect={setSelectedDate}
            className="w-[180px]"
          />
          <Button variant="outline" onClick={fetchCompanyOrders}>
            <Filter className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading company orders...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today's Orders */}
          {companyOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Orders for {format(selectedDate, 'PPP')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyOrders.map(company => (
                  <CompanyOrderCard 
                    key={company.id} 
                    company={company}
                    onClick={() => handleCompanyClick(company)}
                  />
                ))}
              </div>
            </div>
          )}

          {companyOrders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-lg font-medium">No orders found</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  There are no orders for the selected date. Try selecting a different date or check back later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Orders Modal */}
      {selectedCompany && isOrdersModalOpen && (
        <OrdersModal
          company={{ 
            id: selectedCompany.id, 
            name: selectedCompany.name,
            orderCount: selectedCompany.orders
          }}
          date={selectedDate}
          onClose={() => {
            setIsOrdersModalOpen(false);
            setSelectedCompany(null);
          }}
          onOrderStatusChange={() => {
            // Refresh order data when an order status changes
            fetchCompanyOrders();
          }}
        />
      )}
    </div>
  );
};

export default ProviderOrderDashboard;
