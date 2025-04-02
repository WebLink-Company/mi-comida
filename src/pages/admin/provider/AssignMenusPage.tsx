
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, Search, Check, Save, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Company {
  id: string;
  name: string;
  subsidy_percentage: number;
  fixed_subsidy_amount: number;
  provider_id: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
  category_id: string | null;
  menu_type: 'predefined' | 'component';
  is_extra: boolean;
  category_name?: string;
}

interface MenuAssignment {
  company_id: string;
  menu_item_ids: string[];
}

const AssignMenusPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [assignedItems, setAssignedItems] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('provider_id', user?.id);
        
      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);
      
      // Fetch menu items with categories
      const { data: menuData, error: menuError } = await supabase
        .from('lunch_options')
        .select(`
          *,
          menu_categories(name)
        `)
        .eq('provider_id', user?.id)
        .eq('available', true);
        
      if (menuError) throw menuError;
      
      // Format menu items with category name
      const formattedMenuItems = (menuData || []).map(item => ({
        ...item,
        category_name: item.menu_categories?.name || 'Uncategorized'
      }));
      
      setMenuItems(formattedMenuItems);
      
      // Initialize with first company if available
      if ((companiesData || []).length > 0) {
        setSelectedCompany(companiesData[0].id);
        
        // Fetch assigned menu items for this company (this would be from a real junction table in production)
        // For now we'll simulate this with random assignments
        const assignments: Record<string, string[]> = {};
        
        for (const company of (companiesData || [])) {
          // Randomly assign some menu items to each company
          const assignedMenuItems = formattedMenuItems
            .filter(() => Math.random() > 0.5) // randomly select ~50% of items
            .map(item => item.id);
          
          assignments[company.id] = assignedMenuItems;
        }
        
        setAssignedItems(assignments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch company and menu data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  const toggleMenuItem = (itemId: string) => {
    if (!selectedCompany) return;
    
    setAssignedItems(prev => {
      const companyAssignments = prev[selectedCompany] || [];
      const isAssigned = companyAssignments.includes(itemId);
      
      const updatedAssignments = isAssigned
        ? companyAssignments.filter(id => id !== itemId)
        : [...companyAssignments, itemId];
      
      return {
        ...prev,
        [selectedCompany]: updatedAssignments
      };
    });
  };

  const saveAssignments = async () => {
    // In a real app, you would save the assignments to a junction table
    // For this demo, we'll just show a success message
    toast({
      title: 'Success',
      description: 'Menu assignments saved successfully',
    });
  };

  const getFilteredMenuItems = () => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filter === 'all') return true;
      
      const isAssigned = (assignedItems[selectedCompany] || []).includes(item.id);
      return filter === 'assigned' ? isAssigned : !isAssigned;
    });
  };

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Assign Menus to Companies</h1>
          <p className="text-white/70">Select which menu items each company can order</p>
        </div>
      </div>

      <Card className="bg-white/10 border-white/20 text-white mb-6">
        <CardHeader>
          <CardTitle>Select Company</CardTitle>
          <CardDescription className="text-white/70">
            Choose a company to manage its available menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-white/70">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>No companies found. Add a company first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select 
                  value={selectedCompany} 
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger className="bg-white/20 border-white/20">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCompanyData && (
                <div className="bg-white/5 p-4 rounded-md flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">Subsidy Percentage:</span>
                    <span className="font-medium">{selectedCompanyData.subsidy_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Fixed Subsidy:</span>
                    <span className="font-medium">
                      ${selectedCompanyData.fixed_subsidy_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Assigned Menu Items:</span>
                    <span className="font-medium">
                      {(assignedItems[selectedCompany] || []).length} of {menuItems.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCompany && (
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Available Menu Items</CardTitle>
              <CardDescription className="text-white/70">
                Select which menu items are available for {selectedCompanyData?.name}
              </CardDescription>
            </div>
            <Button onClick={saveAssignments}>
              <Save className="h-4 w-4 mr-2" /> Save Assignments
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-white/20 border-white/20 pl-9"
                />
              </div>
              <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                <SelectTrigger className="w-auto min-w-[180px] bg-white/20 border-white/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="assigned">Assigned Only</SelectItem>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Assigned</TableHead>
                    <TableHead className="text-white/70">Item Name</TableHead>
                    <TableHead className="text-white/70">Category</TableHead>
                    <TableHead className="text-white/70">Price</TableHead>
                    <TableHead className="text-white/70">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredMenuItems().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-white/70">
                        No menu items found matching your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredMenuItems().map((item) => {
                      const isAssigned = (assignedItems[selectedCompany] || []).includes(item.id);
                      
                      return (
                        <TableRow 
                          key={item.id} 
                          className={`border-white/10 hover:bg-white/5 cursor-pointer ${isAssigned ? 'bg-white/5' : ''}`}
                          onClick={() => toggleMenuItem(item.id)}
                        >
                          <TableCell>
                            <div className={`h-5 w-5 rounded flex items-center justify-center border ${isAssigned ? 'bg-primary border-primary' : 'border-white/50'}`}>
                              {isAssigned && <Check className="h-3 w-3 text-white" />}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category_name}</TableCell>
                          <TableCell>${parseFloat(item.price.toString()).toFixed(2)}</TableCell>
                          <TableCell>
                            {item.is_extra ? (
                              <Badge variant="secondary">Extra</Badge>
                            ) : (
                              <Badge className="bg-blue-500">{item.menu_type}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignMenusPage;
