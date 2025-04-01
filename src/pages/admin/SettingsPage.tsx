
import { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Globe, 
  Shield,
  Mail,
  Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SettingsPage = () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage global platform configurations and preferences.
        </p>
      </div>

      <div className="grid gap-6">
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
          <Button variant="outline">Reset Defaults</Button>
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
