import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Trash2, Clock, Calendar, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeliverySettings {
  cutoff_time: string;
  delivery_time: string;
  allow_same_day: boolean;
  min_advance_days: number;
  max_advance_days: number;
  delivery_days: string[];
  blackout_dates: string[];
}

interface BlackoutDate {
  id: string;
  date: Date;
  description: string;
}

const DeliverySettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<DeliverySettings>({
    cutoff_time: '10:00',
    delivery_time: '12:00',
    allow_same_day: false,
    min_advance_days: 1,
    max_advance_days: 7,
    delivery_days: ['1', '2', '3', '4', '5'],
    blackout_dates: [],
  });
  
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [newBlackoutDate, setNewBlackoutDate] = useState<Date | undefined>(undefined);
  const [newBlackoutDescription, setNewBlackoutDescription] = useState<string>('');
  
  const handleSettingChange = (key: keyof DeliverySettings, value: any) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const handleDeliveryDayToggle = (dayNumber: string) => {
    setSettings(prev => {
      const currentDays = [...prev.delivery_days];
      
      if (currentDays.includes(dayNumber)) {
        return {
          ...prev,
          delivery_days: currentDays.filter(day => day !== dayNumber)
        };
      } else {
        return {
          ...prev,
          delivery_days: [...currentDays, dayNumber].sort()
        };
      }
    });
  };

  const addBlackoutDate = () => {
    if (!newBlackoutDate) {
      toast({
        title: 'Error',
        description: 'Please select a date',
        variant: 'destructive',
      });
      return;
    }
    
    const formattedDate = format(newBlackoutDate, 'yyyy-MM-dd');
    
    if (blackoutDates.some(bd => format(bd.date, 'yyyy-MM-dd') === formattedDate)) {
      toast({
        title: 'Error',
        description: 'This date is already in the blackout list',
        variant: 'destructive',
      });
      return;
    }
    
    const newDate: BlackoutDate = {
      id: crypto.randomUUID(),
      date: newBlackoutDate,
      description: newBlackoutDescription || 'Holiday/No Delivery',
    };
    
    setBlackoutDates([...blackoutDates, newDate]);
    setSettings({
      ...settings,
      blackout_dates: [...settings.blackout_dates, formattedDate]
    });
    
    setNewBlackoutDate(undefined);
    setNewBlackoutDescription('');
  };

  const removeBlackoutDate = (id: string) => {
    const dateToRemove = blackoutDates.find(bd => bd.id === id);
    
    if (!dateToRemove) return;
    
    const formattedDate = format(dateToRemove.date, 'yyyy-MM-dd');
    
    setBlackoutDates(blackoutDates.filter(bd => bd.id !== id));
    setSettings({
      ...settings,
      blackout_dates: settings.blackout_dates.filter(date => date !== formattedDate)
    });
  };

  const saveSettings = async () => {
    toast({
      title: 'Success',
      description: 'Delivery settings saved successfully',
    });
  };

  const getDayName = (dayNumber: string) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[parseInt(dayNumber) - 1];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Delivery Settings</h1>
          <p className="text-white/70">Configure your meal delivery schedule and cutoff times</p>
        </div>
        
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle>Ordering Schedule</CardTitle>
            <CardDescription className="text-white/70">
              Set ordering cutoff times and delivery windows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cutoff-time">Order Cutoff Time</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-white/70" />
                  <Input
                    id="cutoff-time"
                    type="time"
                    value={settings.cutoff_time}
                    onChange={(e) => handleSettingChange('cutoff_time', e.target.value)}
                    className="bg-white/20 border-white/20"
                  />
                </div>
                <p className="text-sm text-white/50">Orders must be placed before this time</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery-time">Delivery Time</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-white/70" />
                  <Input
                    id="delivery-time"
                    type="time"
                    value={settings.delivery_time}
                    onChange={(e) => handleSettingChange('delivery_time', e.target.value)}
                    className="bg-white/20 border-white/20"
                  />
                </div>
                <p className="text-sm text-white/50">When meals will be delivered</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="same-day">Allow Same-Day Orders</Label>
                <Switch
                  id="same-day"
                  checked={settings.allow_same_day}
                  onCheckedChange={(checked) => handleSettingChange('allow_same_day', checked)}
                />
              </div>
              <p className="text-sm text-white/50">
                If enabled, customers can place orders for delivery on the same day 
                (before cutoff time)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-days">Minimum Advance Days</Label>
                <Input
                  id="min-days"
                  type="number"
                  min="0"
                  max="30"
                  value={settings.min_advance_days}
                  onChange={(e) => handleSettingChange('min_advance_days', parseInt(e.target.value))}
                  className="bg-white/20 border-white/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-days">Maximum Advance Days</Label>
                <Input
                  id="max-days"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.max_advance_days}
                  onChange={(e) => handleSettingChange('max_advance_days', parseInt(e.target.value))}
                  className="bg-white/20 border-white/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle>Delivery Days</CardTitle>
            <CardDescription className="text-white/70">
              Select which days of the week you deliver meals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {['1', '2', '3', '4', '5', '6', '7'].map(dayNumber => (
                <div key={dayNumber} className="flex items-center space-x-2">
                  <Switch
                    id={`day-${dayNumber}`}
                    checked={settings.delivery_days.includes(dayNumber)}
                    onCheckedChange={() => handleDeliveryDayToggle(dayNumber)}
                  />
                  <Label htmlFor={`day-${dayNumber}`}>{getDayName(dayNumber)}</Label>
                </div>
              ))}
            </div>
            
            {settings.delivery_days.length === 0 && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
                <p className="text-sm text-white">
                  Warning: No delivery days selected. Customers won't be able to place orders.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 border-white/20 text-white md:col-span-2">
          <CardHeader>
            <CardTitle>Blackout Dates</CardTitle>
            <CardDescription className="text-white/70">
              Set dates when no deliveries will be made (holidays, company events, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="blackout-date" className="mb-2 block">Date</Label>
                <DatePicker
                  date={newBlackoutDate}
                  onSelect={setNewBlackoutDate}
                  className="bg-white/20 border-white/20"
                  fromDate={new Date()}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="blackout-description" className="mb-2 block">Description</Label>
                <div className="flex space-x-2">
                  <Input
                    id="blackout-description"
                    value={newBlackoutDescription}
                    onChange={(e) => setNewBlackoutDescription(e.target.value)}
                    placeholder="e.g., National Holiday, Company Event"
                    className="bg-white/20 border-white/20"
                  />
                  <Button onClick={addBlackoutDate}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
              </div>
            </div>
            
            {blackoutDates.length > 0 ? (
              <div className="space-y-2">
                {blackoutDates.map(blackout => (
                  <div 
                    key={blackout.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-md"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-white/70" />
                      <span className="font-medium">{format(blackout.date, 'MMMM d, yyyy')}</span>
                      <span className="mx-2 text-white/50">—</span>
                      <span className="text-white/70">{blackout.description}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeBlackoutDate(blackout.id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-white/50">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No blackout dates added</p>
                <p className="text-sm">Add dates when you won't be delivering meals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliverySettingsPage;
