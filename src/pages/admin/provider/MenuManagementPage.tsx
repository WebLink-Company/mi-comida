
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, Trash2, Pencil, Tag, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Category {
  id: string;
  name: string;
  description?: string;
  provider_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  tags: string[];
  menu_type: 'predefined' | 'component';
  is_extra: boolean;
  category_id: string | null;
  provider_id: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  menu_categories?: { name: string };
}

const MenuManagementPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [openDialog, setOpenDialog] = useState<'newItem' | 'editItem' | 'newCategory' | 'editCategory' | null>(null);
  
  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    image: '/placeholder.svg',
    available: true,
    tags: [],
    menu_type: 'predefined',
    is_extra: false,
    category_id: null,
  });
  
  // Category state
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    sort_order: 0,
  });
  
  // Tag input for menu items
  const [tagInput, setTagInput] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('provider_id', user?.id)
        .order('sort_order');
        
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('lunch_options')
        .select(`
          *,
          menu_categories(name)
        `)
        .eq('provider_id', user?.id);
        
      if (menuError) throw menuError;
      
      // Format menu items with category name and ensure menu_type is correctly typed
      const formattedMenuItems: MenuItem[] = (menuData || []).map(item => ({
        ...item,
        menu_type: (item.menu_type || 'predefined') as 'predefined' | 'component',
        category_name: item.menu_categories?.name || 'Uncategorized'
      }));
      
      setMenuItems(formattedMenuItems);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch menu data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !currentItem.tags?.includes(tagInput)) {
      setCurrentItem({
        ...currentItem,
        tags: [...(currentItem.tags || []), tagInput],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setCurrentItem({
      ...currentItem,
      tags: currentItem.tags?.filter(t => t !== tag) || [],
    });
  };

  const handleMenuItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  const handleMenuTypeChange = (value: string) => {
    setCurrentItem({
      ...currentItem,
      menu_type: value as 'predefined' | 'component',
    });
  };

  const handleCategorySelect = (value: string) => {
    setCurrentItem({
      ...currentItem,
      category_id: value === 'null' ? null : value,
    });
  };

  const handleExtrasToggle = (checked: boolean) => {
    setCurrentItem({
      ...currentItem,
      is_extra: checked,
    });
  };

  const handleAvailableToggle = (checked: boolean) => {
    setCurrentItem({
      ...currentItem,
      available: checked,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCategory({
      ...currentCategory,
      [name]: name === 'sort_order' ? parseInt(value) : value,
    });
  };

  const saveMenuItem = async () => {
    if (!user?.id || !currentItem.name || !currentItem.description || currentItem.price === undefined) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const itemData = {
        ...currentItem,
        provider_id: user.id,
        name: currentItem.name,
        description: currentItem.description,
        price: currentItem.price,
        image: currentItem.image || '/placeholder.svg',
      };
      
      if (currentItem.id) {
        // Update existing item
        const { data, error } = await supabase
          .from('lunch_options')
          .update(itemData)
          .eq('id', currentItem.id)
          .select(`
            *,
            menu_categories(name)
          `)
          .single();
          
        if (error) throw error;
        
        // Update state with properly typed menu_type
        const updatedItem: MenuItem = {
          ...data,
          menu_type: (data.menu_type || 'predefined') as 'predefined' | 'component',
          category_name: data.menu_categories?.name || 'Uncategorized'
        };
        
        setMenuItems(menuItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ));
        
        toast({
          title: 'Success',
          description: 'Menu item updated successfully',
        });
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('lunch_options')
          .insert(itemData)
          .select(`
            *,
            menu_categories(name)
          `)
          .single();
          
        if (error) throw error;
        
        // Update state with properly typed menu_type
        const newItem: MenuItem = {
          ...data,
          menu_type: (data.menu_type || 'predefined') as 'predefined' | 'component',
          category_name: data.menu_categories?.name || 'Uncategorized'
        };
        
        setMenuItems([...menuItems, newItem]);
        
        toast({
          title: 'Success',
          description: 'New menu item added successfully',
        });
      }
      
      // Reset form and close dialog
      setCurrentItem({
        name: '',
        description: '',
        price: 0,
        image: '/placeholder.svg',
        available: true,
        tags: [],
        menu_type: 'predefined',
        is_extra: false,
        category_id: null,
      });
      setOpenDialog(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save menu item',
        variant: 'destructive',
      });
    }
  };

  const saveCategory = async () => {
    if (!user?.id || !currentCategory.name) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const categoryData = {
        ...currentCategory,
        provider_id: user.id,
        name: currentCategory.name,
      };
      
      if (currentCategory.id) {
        // Update existing category
        const { data, error } = await supabase
          .from('menu_categories')
          .update(categoryData)
          .eq('id', currentCategory.id)
          .select()
          .single();
          
        if (error) throw error;
        
        // Update state
        setCategories(categories.map(category => 
          category.id === data.id ? data : category
        ));
        
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        // Create new category
        const { data, error } = await supabase
          .from('menu_categories')
          .insert(categoryData)
          .select()
          .single();
          
        if (error) throw error;
        
        // Update state
        setCategories([...categories, data]);
        
        toast({
          title: 'Success',
          description: 'New category added successfully',
        });
      }
      
      // Reset form and close dialog
      setCurrentCategory({
        name: '',
        description: '',
        sort_order: categories.length,
      });
      setOpenDialog(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  const editMenuItem = (item: MenuItem) => {
    setCurrentItem(item);
    setOpenDialog('editItem');
  };

  const editCategory = (category: Category) => {
    setCurrentCategory(category);
    setOpenDialog('editCategory');
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lunch_options')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update state
      setMenuItems(menuItems.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Check if category has menu items
      const { count, error: countError } = await supabase
        .from('lunch_options')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast({
          title: 'Cannot Delete',
          description: 'This category has menu items. Please remove or reassign them first.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update state
      setCategories(categories.filter(category => category.id !== id));
      
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Menu Management</h1>
          <p className="text-white/70">Create and manage your menu items and categories</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="menu" className="text-white data-[state=active]:bg-white/10">
            Menu Items
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-white data-[state=active]:bg-white/10">
            Categories
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="menu" className="space-y-6">
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                setCurrentItem({
                  name: '',
                  description: '',
                  price: 0,
                  image: '/placeholder.svg',
                  available: true,
                  tags: [],
                  menu_type: 'predefined',
                  is_extra: false,
                  category_id: null,
                });
                setOpenDialog('newItem');
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Menu Item
            </Button>
          </div>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription className="text-white/70">
                View and manage your menu offerings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-white/70" />
                </div>
              ) : menuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-white/70">
                  <AlertCircle className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No menu items found</p>
                  <p className="text-sm mt-2">Create your first menu item to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white/70">Name</TableHead>
                      <TableHead className="text-white/70">Category</TableHead>
                      <TableHead className="text-white/70">Price</TableHead>
                      <TableHead className="text-white/70">Type</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                      <TableHead className="text-white/70">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
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
                        <TableCell>
                          {item.available ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="destructive">Unavailable</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => editMenuItem(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteMenuItem(item.id)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                setCurrentCategory({
                  name: '',
                  description: '',
                  sort_order: categories.length,
                });
                setOpenDialog('newCategory');
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Menu Categories</CardTitle>
              <CardDescription className="text-white/70">
                Organize your menu with categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-white/70" />
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-white/70">
                  <AlertCircle className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No categories found</p>
                  <p className="text-sm mt-2">Create your first category to organize your menu</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white/70">Name</TableHead>
                      <TableHead className="text-white/70">Description</TableHead>
                      <TableHead className="text-white/70">Sort Order</TableHead>
                      <TableHead className="text-white/70">Items</TableHead>
                      <TableHead className="text-white/70">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>{category.sort_order}</TableCell>
                        <TableCell>
                          {menuItems.filter(item => item.category_id === category.id).length}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => editCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteCategory(category.id)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Menu Item Dialog */}
      <Dialog open={openDialog === 'newItem' || openDialog === 'editItem'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>{openDialog === 'newItem' ? 'Add New Menu Item' : 'Edit Menu Item'}</DialogTitle>
            <DialogDescription className="text-white/70">
              {openDialog === 'newItem' 
                ? 'Create a new menu item to offer to your customers' 
                : 'Update this menu item\'s details'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={currentItem.name || ''} 
                  onChange={handleMenuItemChange} 
                  className="bg-white/20 border-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  name="price"
                  type="number" 
                  value={currentItem.price || 0} 
                  onChange={handleMenuItemChange} 
                  className="bg-white/20 border-white/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                value={currentItem.description || ''} 
                onChange={handleMenuItemChange} 
                className="bg-white/20 border-white/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={handleCategorySelect}
                  value={currentItem.category_id || 'null'}
                >
                  <SelectTrigger id="category" className="bg-white/20 border-white/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Uncategorized</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="menu-type">Menu Type</Label>
                <Select 
                  onValueChange={handleMenuTypeChange}
                  value={currentItem.menu_type}
                >
                  <SelectTrigger id="menu-type" className="bg-white/20 border-white/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="predefined">Predefined</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is-extra" 
                  checked={currentItem.is_extra}
                  onCheckedChange={handleExtrasToggle}
                />
                <Label htmlFor="is-extra">Is an extra / add-on item</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="available" 
                  checked={currentItem.available}
                  onCheckedChange={handleAvailableToggle}
                />
                <Label htmlFor="available">Available on menu</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tag-input">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="E.g., Vegetarian, Gluten-Free"
                  className="bg-white/20 border-white/20"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Tag className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {(currentItem.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(currentItem.tags || []).map(tag => (
                    <div key={tag} className="bg-white/20 text-white px-2 py-1 rounded-md text-sm flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-white/70 hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={saveMenuItem}>
              {openDialog === 'newItem' ? 'Create Item' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Category Dialog */}
      <Dialog open={openDialog === 'newCategory' || openDialog === 'editCategory'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>{openDialog === 'newCategory' ? 'Add New Category' : 'Edit Category'}</DialogTitle>
            <DialogDescription className="text-white/70">
              {openDialog === 'newCategory' 
                ? 'Create a new category to organize your menu' 
                : 'Update this category\'s details'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input 
                id="category-name" 
                name="name"
                value={currentCategory.name || ''} 
                onChange={handleCategoryChange} 
                className="bg-white/20 border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-description">Description (Optional)</Label>
              <Textarea 
                id="category-description" 
                name="description"
                value={currentCategory.description || ''} 
                onChange={handleCategoryChange} 
                className="bg-white/20 border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort-order">Sort Order</Label>
              <Input 
                id="sort-order" 
                name="sort_order"
                type="number" 
                value={currentCategory.sort_order || 0} 
                onChange={handleCategoryChange} 
                className="bg-white/20 border-white/20"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={saveCategory}>
              {openDialog === 'newCategory' ? 'Create Category' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagementPage;
