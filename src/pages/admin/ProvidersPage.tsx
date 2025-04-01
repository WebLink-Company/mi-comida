
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Search, ChefHat, Phone, Mail, Building2, MapPin, Globe, FileText, Edit, Eye, Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Provider } from '@/lib/types';

const ProvidersPage = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const [newProvider, setNewProvider] = useState<Partial<Provider>>({
    business_name: '',
    contact_email: '',
    contact_phone: '',
    description: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    rnc: '',
    legal_name: '',
    logo_url: '',
    email_signature: '',
    is_active: true
  });
  
  // Check if user can edit providers (admin or provider role)
  const canEditProviders = user && (user.role === 'admin' || user.role === 'provider');
  
  useEffect(() => {
    loadData();
  }, [user]); // Fixed: changed currentUser to user
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Get providers data with sorting
      let query = supabase
        .from('providers')
        .select('*')
        .order('business_name', { ascending: true });
      
      // If user is a provider, only show their own provider info
      if (user && user.role === 'provider' && user.provider_id) {
        query = query.eq('id', user.provider_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error',
        description: 'Unable to fetch providers data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter providers based on search
  const filteredProviders = providers.filter((provider) =>
    search === '' || 
    provider.business_name.toLowerCase().includes(search.toLowerCase()) ||
    provider.description?.toLowerCase().includes(search.toLowerCase()) ||
    provider.legal_name?.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleCreateProvider = async () => {
    try {
      // Validation
      if (!newProvider.business_name || !newProvider.contact_email) {
        toast({
          title: 'Missing Fields',
          description: 'Business name and contact email are required',
          variant: 'destructive',
        });
        return;
      }
      
      // Insert new provider - we no longer need to manually create a UUID
      const { error } = await supabase.from('providers').insert({
        business_name: newProvider.business_name,
        contact_email: newProvider.contact_email,
        contact_phone: newProvider.contact_phone,
        description: newProvider.description,
        address: newProvider.address_line_1, // Use address field for backward compatibility
        address_line_1: newProvider.address_line_1,
        address_line_2: newProvider.address_line_2,
        city: newProvider.city,
        state: newProvider.state,
        zip_code: newProvider.zip_code,
        country: newProvider.country,
        rnc: newProvider.rnc,
        legal_name: newProvider.legal_name,
        logo_url: newProvider.logo_url,
        logo: newProvider.logo_url, // Use logo field for backward compatibility
        email_signature: newProvider.email_signature,
        is_active: newProvider.is_active
      });
      
      if (error) throw error;
      
      // Reset form and close dialog
      setNewProvider({
        business_name: '',
        contact_email: '',
        contact_phone: '',
        description: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        rnc: '',
        legal_name: '',
        logo_url: '',
        email_signature: '',
        is_active: true
      });
      setIsCreateOpen(false);
      
      // Refresh providers list
      const { data: updatedProviders } = await supabase
        .from('providers')
        .select('*')
        .order('business_name', { ascending: true });
      
      setProviders(updatedProviders || []);
      
      toast({
        title: 'Success',
        description: 'Provider created successfully',
      });
    } catch (error) {
      console.error('Error creating provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to create provider',
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateProvider = async () => {
    if (!selectedProvider) return;
    
    try {
      const { error } = await supabase
        .from('providers')
        .update({
          business_name: selectedProvider.business_name,
          contact_email: selectedProvider.contact_email,
          contact_phone: selectedProvider.contact_phone,
          description: selectedProvider.description,
          address: selectedProvider.address_line_1, // Update legacy field
          address_line_1: selectedProvider.address_line_1,
          address_line_2: selectedProvider.address_line_2,
          city: selectedProvider.city,
          state: selectedProvider.state,
          zip_code: selectedProvider.zip_code,
          country: selectedProvider.country,
          rnc: selectedProvider.rnc,
          legal_name: selectedProvider.legal_name,
          logo: selectedProvider.logo_url, // Update legacy field
          logo_url: selectedProvider.logo_url,
          email_signature: selectedProvider.email_signature,
          is_active: selectedProvider.is_active
        })
        .eq('id', selectedProvider.id);
      
      if (error) throw error;
      
      // Refresh providers list
      const { data: updatedProviders } = await supabase
        .from('providers')
        .select('*')
        .order('business_name', { ascending: true });
      
      setProviders(updatedProviders || []);
      setIsEditOpen(false);
      
      toast({
        title: 'Success',
        description: 'Provider updated successfully',
      });
    } catch (error) {
      console.error('Error updating provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to update provider',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteProvider = async () => {
    if (!selectedProvider) return;
    
    try {
      // Check if provider has associated companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('provider_id', selectedProvider.id);
      
      if (companiesError) throw companiesError;
      
      if (companies && companies.length > 0) {
        toast({
          title: 'Cannot Delete',
          description: `This provider has ${companies.length} associated companies. Remove them first.`,
          variant: 'destructive',
        });
        setIsDeleteOpen(false);
        return;
      }
      
      // Delete provider
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', selectedProvider.id);
      
      if (error) throw error;
      
      // Update providers list
      setProviders(providers.filter(p => p.id !== selectedProvider.id));
      setIsDeleteOpen(false);
      
      toast({
        title: 'Success',
        description: 'Provider deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete provider',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
        <p className="text-muted-foreground mt-2">
          Manage all food service providers in the system.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {canEditProviders && (
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            <span>New Provider</span>
          </Button>
        )}
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center">
                    {provider.logo_url || provider.logo ? (
                      <div className="w-8 h-8 mr-2 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                        <img 
                          src={provider.logo_url || provider.logo} 
                          alt={provider.business_name} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    ) : (
                      <ChefHat className="mr-2 h-5 w-5" />
                    )}
                    {provider.business_name}
                  </CardTitle>
                  {provider.legal_name && (
                    <CardDescription>{provider.legal_name}</CardDescription>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  provider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {provider.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                {provider.rnc && (
                  <div className="flex items-center text-xs">
                    <FileText className="mr-1 h-3 w-3" />
                    <span className="text-muted-foreground">RNC:</span>
                    <span className="ml-1">{provider.rnc}</span>
                  </div>
                )}
                <div className="flex items-center text-xs">
                  <Mail className="mr-1 h-3 w-3" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-1">{provider.contact_email}</span>
                </div>
                {provider.contact_phone && (
                  <div className="flex items-center text-xs">
                    <Phone className="mr-1 h-3 w-3" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-1">{provider.contact_phone}</span>
                  </div>
                )}
                {provider.address_line_1 && (
                  <div className="flex items-center text-xs">
                    <MapPin className="mr-1 h-3 w-3" />
                    <span className="ml-1 line-clamp-1">{provider.address_line_1}</span>
                  </div>
                )}
                {provider.city && provider.state && (
                  <div className="flex items-center text-xs">
                    <Building2 className="mr-1 h-3 w-3" />
                    <span className="ml-1">{provider.city}, {provider.state}</span>
                    {provider.country && <span className="ml-1">| {provider.country}</span>}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2 space-x-2">
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedProvider(provider);
                setIsViewOpen(true);
              }}>
                <Eye className="mr-1 h-3 w-3" />
                View
              </Button>
              
              {canEditProviders && (
                <>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedProvider({...provider});
                    setIsEditOpen(true);
                  }}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  
                  {user?.role === 'admin' && (
                    <Button variant="destructive" size="sm" onClick={() => {
                      setSelectedProvider(provider);
                      setIsDeleteOpen(true);
                    }}>
                      <Trash className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        ))}
        
        {filteredProviders.length === 0 && !loading && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-center font-medium">No providers found</p>
              <p className="text-muted-foreground text-center mt-1">
                {search ? 'Try adjusting your search term' : 'Get started by adding a new provider'}
              </p>
              {canEditProviders && (
                <Button onClick={() => setIsCreateOpen(true)} className="mt-4">
                  <Plus size={16} className="mr-2" />
                  Add Provider
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Provider Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          
          {selectedProvider && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <ChefHat className="mr-2 h-4 w-4" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-md">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-medium">{selectedProvider.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Legal Name</p>
                    <p className="font-medium">{selectedProvider.legal_name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax ID (RNC)</p>
                    <p className="font-medium">{selectedProvider.rnc || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedProvider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedProvider.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-md">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedProvider.contact_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedProvider.contact_phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
              
              {/* Address Info */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Address
                </h4>
                <div className="grid grid-cols-1 gap-4 p-4 bg-muted/30 rounded-md">
                  <div>
                    <p className="text-sm text-muted-foreground">Street Address</p>
                    <p className="font-medium">{selectedProvider.address_line_1 || "Not provided"}</p>
                  </div>
                  {selectedProvider.address_line_2 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address Line 2</p>
                      <p className="font-medium">{selectedProvider.address_line_2}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{selectedProvider.city || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State/Province</p>
                      <p className="font-medium">{selectedProvider.state || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ZIP/Postal Code</p>
                      <p className="font-medium">{selectedProvider.zip_code || "Not provided"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{selectedProvider.country || "Not provided"}</p>
                  </div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 gap-4 p-4 bg-muted/30 rounded-md">
                  {selectedProvider.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium">{selectedProvider.description}</p>
                    </div>
                  )}
                  {selectedProvider.email_signature && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email Signature</p>
                      <div className="p-2 border rounded mt-1 text-sm">
                        {selectedProvider.email_signature}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Logo */}
              {(selectedProvider.logo_url || selectedProvider.logo) && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Logo</h4>
                  <div className="p-4 bg-muted/30 rounded-md flex justify-center">
                    <div className="w-32 h-32 bg-white rounded shadow-sm p-2 flex items-center justify-center">
                      <img 
                        src={selectedProvider.logo_url || selectedProvider.logo} 
                        alt={`${selectedProvider.business_name} logo`} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            {canEditProviders && selectedProvider && (
              <Button variant="outline" onClick={() => {
                setIsViewOpen(false);
                setIsEditOpen(true);
              }}>
                <Edit className="mr-1 h-4 w-4" />
                Edit Provider
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Provider Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
            <DialogDescription>
              Update provider information and settings.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProvider && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Name*</label>
                    <Input 
                      value={selectedProvider.business_name}
                      onChange={(e) => setSelectedProvider({...selectedProvider, business_name: e.target.value})}
                      placeholder="Business name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Legal Name</label>
                    <Input 
                      value={selectedProvider.legal_name || ''}
                      onChange={(e) => setSelectedProvider({...selectedProvider, legal_name: e.target.value})}
                      placeholder="Legal company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tax ID (RNC)</label>
                    <Input 
                      value={selectedProvider.rnc || ''}
                      onChange={(e) => setSelectedProvider({...selectedProvider, rnc: e.target.value})}
                      placeholder="Tax ID number"
                    />
                  </div>
                  <div className="space-y-2 flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProvider.is_active}
                        onChange={(e) => setSelectedProvider({...selectedProvider, is_active: e.target.checked})}
                        className="mr-2"
                      />
                      <span>Active Provider</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={selectedProvider.description || ''}
                    onChange={(e) => setSelectedProvider({...selectedProvider, description: e.target.value})}
                    placeholder="Brief description of the provider"
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-medium">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address*</label>
                    <Input 
                      value={selectedProvider.contact_email}
                      onChange={(e) => setSelectedProvider({...selectedProvider, contact_email: e.target.value})}
                      placeholder="Email address"
                      type="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input 
                      value={selectedProvider.contact_phone || ''}
                      onChange={(e) => setSelectedProvider({...selectedProvider, contact_phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-medium">Address</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address Line 1</label>
                    <Input 
                      value={selectedProvider.address_line_1 || ''}
                      onChange={(e) => setSelectedProvider({
                        ...selectedProvider, 
                        address_line_1: e.target.value,
                        address: e.target.value // Also update the legacy field
                      })}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address Line 2</label>
                    <Input 
                      value={selectedProvider.address_line_2 || ''}
                      onChange={(e) => setSelectedProvider({...selectedProvider, address_line_2: e.target.value})}
                      placeholder="Apt, suite, building (optional)"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input 
                      value={selectedProvider.city || ''}
                      onChange={(e) => setSelectedProvider({...selectedProvider, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State/Province</label>
                    <Input 
                      value={selectedProvider.state || ''}
                      onChange={(e) => setSelectedProvider({...selectedProvider, state: e.target.value})}
                      placeholder="State/Province"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ZIP/Postal Code</label>
                    <Input 
                      value={selectedProvider.zip_code || ''}
                      onChange={(e) => setSelectedProvider({...selectedProvider, zip_code: e.target.value})}
                      placeholder="ZIP/Postal code"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input 
                    value={selectedProvider.country || ''}
                    onChange={(e) => setSelectedProvider({...selectedProvider, country: e.target.value})}
                    placeholder="Country"
                  />
                </div>
              </div>
              
              {/* Branding */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-medium">Branding</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input 
                    value={selectedProvider.logo_url || selectedProvider.logo || ''}
                    onChange={(e) => setSelectedProvider({
                      ...selectedProvider, 
                      logo_url: e.target.value,
                      logo: e.target.value // Also update the legacy field
                    })}
                    placeholder="URL to logo image"
                  />
                  {(selectedProvider.logo_url || selectedProvider.logo) && (
                    <div className="mt-2 p-2 border rounded flex justify-center">
                      <img 
                        src={selectedProvider.logo_url || selectedProvider.logo} 
                        alt="Preview" 
                        className="h-20 object-contain" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Signature</label>
                  <Textarea 
                    value={selectedProvider.email_signature || ''}
                    onChange={(e) => setSelectedProvider({...selectedProvider, email_signature: e.target.value})}
                    placeholder="Footer text for emails"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateProvider}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Provider Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this provider? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProvider && (
            <div className="bg-muted/50 p-4 rounded flex items-center gap-3 my-2">
              <ChefHat size={24} className="text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedProvider.business_name}</p>
                <p className="text-sm text-muted-foreground">{selectedProvider.contact_email}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProvider}>Delete Provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Provider Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Provider</DialogTitle>
            <DialogDescription>
              Add a new food service provider to the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name*</label>
                  <Input 
                    value={newProvider.business_name}
                    onChange={(e) => setNewProvider({...newProvider, business_name: e.target.value})}
                    placeholder="Business name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Legal Name</label>
                  <Input 
                    value={newProvider.legal_name || ''}
                    onChange={(e) => setNewProvider({...newProvider, legal_name: e.target.value})}
                    placeholder="Legal company name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax ID (RNC)</label>
                  <Input 
                    value={newProvider.rnc || ''}
                    onChange={(e) => setNewProvider({...newProvider, rnc: e.target.value})}
                    placeholder="Tax ID number"
                  />
                </div>
                <div className="space-y-2 flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProvider.is_active}
                      onChange={(e) => setNewProvider({...newProvider, is_active: e.target.checked})}
                      className="mr-2"
                    />
                    <span>Active Provider</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={newProvider.description || ''}
                  onChange={(e) => setNewProvider({...newProvider, description: e.target.value})}
                  placeholder="Brief description of the provider"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-medium">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address*</label>
                  <Input 
                    value={newProvider.contact_email}
                    onChange={(e) => setNewProvider({...newProvider, contact_email: e.target.value})}
                    placeholder="Email address"
                    type="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input 
                    value={newProvider.contact_phone || ''}
                    onChange={(e) => setNewProvider({...newProvider, contact_phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>
            
            {/* Address */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-medium">Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address Line 1</label>
                  <Input 
                    value={newProvider.address_line_1 || ''}
                    onChange={(e) => setNewProvider({...newProvider, address_line_1: e.target.value})}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address Line 2</label>
                  <Input 
                    value={newProvider.address_line_2 || ''}
                    onChange={(e) => setNewProvider({...newProvider, address_line_2: e.target.value})}
                    placeholder="Apt, suite, building (optional)"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={newProvider.city || ''}
                    onChange={(e) => setNewProvider({...newProvider, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State/Province</label>
                  <Input 
                    value={newProvider.state || ''}
                    onChange={(e) => setNewProvider({...newProvider, state: e.target.value})}
                    placeholder="State/Province"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ZIP/Postal Code</label>
                  <Input 
                    value={newProvider.zip_code || ''}
                    onChange={(e) => setNewProvider({...newProvider, zip_code: e.target.value})}
                    placeholder="ZIP/Postal code"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input 
                  value={newProvider.country || ''}
                  onChange={(e) => setNewProvider({...newProvider, country: e.target.value})}
                  placeholder="Country"
                />
              </div>
            </div>
            
            {/* Branding */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-medium">Branding</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium">Logo URL</label>
                <Input 
                  value={newProvider.logo_url || ''}
                  onChange={(e) => setNewProvider({...newProvider, logo_url: e.target.value})}
                  placeholder="URL to logo image"
                />
                {newProvider.logo_url && (
                  <div className="mt-2 p-2 border rounded flex justify-center">
                    <img 
                      src={newProvider.logo_url} 
                      alt="Preview" 
                      className="h-20 object-contain" 
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Signature</label>
                <Textarea 
                  value={newProvider.email_signature || ''}
                  onChange={(e) => setNewProvider({...newProvider, email_signature: e.target.value})}
                  placeholder="Footer text for emails"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProvider}>Create Provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProvidersPage;
