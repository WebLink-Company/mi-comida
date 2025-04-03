
import { useState, useEffect } from 'react';
import { format, isToday, isThisWeek, subDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Package, PlusCircle, Search, Users } from 'lucide-react';
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
  const [selectedCompany, setSelectedCompany] = useState<CompanyOrderSummary | null>(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompanyOrders();
    }
  }, [user, selectedDate]);

  const fetchCompanyOrders = async () => {
    setLoading(true);
    try {
      // First get companies for this provider
      const { data: providerCompanies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('provider_id', user?.provider_id);

      if (!providerCompanies || providerCompanies.length === 0) {
        setCompanyOrders([]);
        setLoading(false);
        return;
      }

      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // For each company, get order stats
      const companiesWithOrders = await Promise.all(
        providerCompanies.map(async (company) => {
          // Get all orders for this company on the selected date
          const { data: orders } = await supabase
            .from('orders')
            .select('id, user_id, status')
            .eq('company_id', company.id)
            .eq('date', selectedDateStr);

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
      setCompanyOrders(filteredCompanies);
    } catch (error) {
      console.error('Error fetching company orders:', error);
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
          {todayCompanies.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Today's Orders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayCompanies.map(company => (
                  <CompanyOrderCard 
                    key={company.id} 
                    company={company}
                    onClick={() => handleCompanyClick(company)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Week's Orders */}
          {thisWeekCompanies.length > 0 && todayCompanies.length === 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                This Week's Orders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {thisWeekCompanies.map(company => (
                  <CompanyOrderCard 
                    key={company.id} 
                    company={company}
                    onClick={() => handleCompanyClick(company)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Earlier Orders */}
          {earlierCompanies.length > 0 && todayCompanies.length === 0 && thisWeekCompanies.length === 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Earlier
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earlierCompanies.map(company => (
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
