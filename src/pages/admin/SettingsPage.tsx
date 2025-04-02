
import { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Globe, 
  Shield,
  Mail,
  Database,
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { useAuth } from '@/context/AuthContext';
import { supabase, PlatformSettings } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'LunchWise Admin',
    languageDefault: 'English',
    enableDarkMode: true,
    enableBetaFeatures: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    userRegistrations: true,
    securityAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireMFA: false,
    sessionTimeout: 60,
    passwordPolicyStrength: 'strong',
  });

  // Fetch settings from Supabase on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        // Use type assertion for platform_settings table
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .maybeSingle() as { data: PlatformSettings | null, error: any };

        if (error) {
          console.error('Error fetching settings:', error);
          toast({
            title: 'Error',
            description: 'Failed to load settings. Please try again.',
            variant: 'destructive',
          });
          return;
        }

        if (data) {
          setGeneralSettings({
            systemName: data.system_name || 'LunchWise Admin',
            languageDefault: data.default_language || 'English',
            enableDarkMode: data.dark_mode || true,
            enableBetaFeatures: data.beta_features || false,
          });
          
          setNotificationSettings({
            emailNotifications: data.email_notifications || true,
            orderUpdates: data.order_updates || true,
            userRegistrations: data.user_registration_alerts || true,
            securityAlerts: data.security_alerts || true,
          });
          
          setSecuritySettings({
            requireMFA: data.multi_factor_auth || false,
            sessionTimeout: data.session_timeout || 60,
            passwordPolicyStrength: data.password_policy || 'strong',
          });
        }
      } catch (err) {
        console.error('Error in fetchSettings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  // Save settings to Supabase
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          system_name: generalSettings.systemName,
          default_language: generalSettings.languageDefault,
          dark_mode: generalSettings.enableDarkMode,
          beta_features: generalSettings.enableBetaFeatures,
          email_notifications: notificationSettings.emailNotifications,
          order_updates: notificationSettings.orderUpdates,
          user_registration_alerts: notificationSettings.userRegistrations,
          security_alerts: notificationSettings.securityAlerts,
          multi_factor_auth: securitySettings.requireMFA,
          session_timeout: securitySettings.sessionTimeout,
          password_policy: securitySettings.passwordPolicyStrength,
          updated_at: new Date().toISOString()
        } as any)
        .eq('provider_id', null);

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to save settings. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Settings saved successfully.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Error in saveSettings:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset to defaults
  const resetDefaults = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .update({
          system_name: 'LunchWise Admin',
          default_language: 'English',
          dark_mode: true,
          beta_features: false,
          email_notifications: true,
          order_updates: true,
          user_registration_alerts: true,
          security_alerts: true,
          multi_factor_auth: false,
          session_timeout: 60,
          password_policy: 'strong',
          updated_at: new Date().toISOString()
        } as any)
        .eq('provider_id', null)
        .select() as { data: PlatformSettings[] | null, error: any };

      if (error) {
        console.error('Error resetting settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to reset settings. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (data && data[0]) {
        setGeneralSettings({
          systemName: 'LunchWise Admin',
          languageDefault: 'English',
          enableDarkMode: true,
          enableBetaFeatures: false,
        });
        
        setNotificationSettings({
          emailNotifications: true,
          orderUpdates: true,
          userRegistrations: true,
          securityAlerts: true,
        });
        
        setSecuritySettings({
          requireMFA: false,
          sessionTimeout: 60,
          passwordPolicyStrength: 'strong',
        });
      }

      toast({
        title: 'Success',
        description: 'Settings reset to defaults.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Error in resetDefaults:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage global platform configurations and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Security Section */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Configure basic platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="systemName" className="text-sm font-medium">
                  System Name
                </label>
                <Input 
                  id="systemName"
                  value={generalSettings.systemName}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    systemName: e.target.value
                  })}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="languageDefault" className="text-sm font-medium">
                  Default Language
                </label>
                <select 
                  id="languageDefault"
                  className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                  value={generalSettings.languageDefault}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    languageDefault: e.target.value
                  })}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="darkMode" className="text-sm font-medium">
                    Dark Mode
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode by default
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={generalSettings.enableDarkMode}
                  onCheckedChange={(checked) => setGeneralSettings({
                    ...generalSettings,
                    enableDarkMode: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="betaFeatures" className="text-sm font-medium">
                    Beta Features
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Enable experimental features
                  </p>
                </div>
                <Switch
                  id="betaFeatures"
                  checked={generalSettings.enableBetaFeatures}
                  onCheckedChange={(checked) => setGeneralSettings({
                    ...generalSettings,
                    enableBetaFeatures: checked
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Email Notifications</label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to admins
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => setNotificationSettings({
                  ...notificationSettings,
                  emailNotifications: checked
                })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Order Updates</label>
                <p className="text-sm text-muted-foreground">
                  Receive updates for order status changes
                </p>
              </div>
              <Switch
                checked={notificationSettings.orderUpdates}
                onCheckedChange={(checked) => setNotificationSettings({
                  ...notificationSettings,
                  orderUpdates: checked
                })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">New User Registrations</label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new users sign up
                </p>
              </div>
              <Switch
                checked={notificationSettings.userRegistrations}
                onCheckedChange={(checked) => setNotificationSettings({
                  ...notificationSettings,
                  userRegistrations: checked
                })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Security Alerts</label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for suspicious activities
                </p>
              </div>
              <Switch
                checked={notificationSettings.securityAlerts}
                onCheckedChange={(checked) => setNotificationSettings({
                  ...notificationSettings,
                  securityAlerts: checked
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Multi-Factor Authentication</label>
                <p className="text-sm text-muted-foreground">
                  Require MFA for all admin users
                </p>
              </div>
              <Switch
                checked={securitySettings.requireMFA}
                onCheckedChange={(checked) => setSecuritySettings({
                  ...securitySettings,
                  requireMFA: checked
                })}
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <label htmlFor="sessionTimeout" className="text-sm font-medium">
                Session Timeout (minutes)
              </label>
              <Input 
                id="sessionTimeout"
                type="number"
                min="15"
                max="240"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  sessionTimeout: parseInt(e.target.value)
                })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="passwordPolicy" className="text-sm font-medium">
                Password Policy
              </label>
              <select 
                id="passwordPolicy"
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                value={securitySettings.passwordPolicyStrength}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  passwordPolicyStrength: e.target.value
                })}
              >
                <option value="basic">Basic (8+ characters)</option>
                <option value="medium">Medium (8+ chars, mixed case, numbers)</option>
                <option value="strong">Strong (12+ chars, mixed case, numbers, symbols)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={resetDefaults} 
            disabled={isLoading}
          >
            Reset Defaults
          </Button>
          <Button 
            onClick={saveSettings} 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
