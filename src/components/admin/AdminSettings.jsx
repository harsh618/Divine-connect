import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, Bell, Mail, CreditCard, Shield, Database, 
  Globe, Server, Users, Lock, CheckCircle, AlertCircle,
  RefreshCw, Download, Upload, Trash2, Key, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

function DataExportSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('exportAllData', {});
      setExportData(response.data.exports);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = (entityName, csvContent) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${entityName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadAll = () => {
    if (!exportData) return;
    Object.entries(exportData).forEach(([name, data]) => {
      if (data.csv && data.count > 0) {
        setTimeout(() => downloadCSV(name, data.csv), 100);
      }
    });
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium">Export All Data</p>
          <p className="text-sm text-gray-500">Download all platform data as CSV files</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting} variant="outline">
          {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          {isExporting ? 'Exporting...' : 'Export All Data'}
        </Button>
      </div>

      {exportData && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">Available Downloads:</p>
            <Button size="sm" onClick={downloadAll} variant="outline">
              <Download className="w-3 h-3 mr-1" />
              Download All
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {Object.entries(exportData).map(([name, data]) => (
              <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div>
                  <span className="font-medium">{name}</span>
                  <span className="text-gray-500 ml-1">({data.count})</span>
                </div>
                {data.count > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => downloadCSV(name, data.csv)} className="h-6 px-2">
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const defaultSettings = {
  platformName: 'Divine Connector',
  contactEmail: 'admin@divineconnector.com',
  supportPhone: '+91 98765 43210',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: true,
  pushNotifications: true,
  maintenanceMode: false,
  twoFactorAuth: false,
  autoBackup: true,
  platformFee: 5,
  paymentGatewayFee: 2,
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings from database
  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const allSettings = await base44.entities.PlatformSettings.list();
      const settingsObj = { ...defaultSettings };
      allSettings.forEach(s => {
        try {
          settingsObj[s.setting_key] = JSON.parse(s.setting_value);
        } catch {
          settingsObj[s.setting_key] = s.setting_value;
        }
      });
      return settingsObj;
    },
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async (newSettings) => {
      const existingSettings = await base44.entities.PlatformSettings.list();
      const existingKeys = existingSettings.reduce((acc, s) => {
        acc[s.setting_key] = s.id;
        return acc;
      }, {});

      for (const [key, value] of Object.entries(newSettings)) {
        const stringValue = JSON.stringify(value);
        if (existingKeys[key]) {
          await base44.entities.PlatformSettings.update(existingKeys[key], { setting_value: stringValue });
        } else {
          await base44.entities.PlatformSettings.create({ setting_key: key, setting_value: stringValue, setting_type: 'general' });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platform-settings']);
      toast.success('Settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500">Manage your platform configuration and preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Platform Information
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input 
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input 
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Phone</Label>
                  <Input 
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">IST (UTC+5:30)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding</CardTitle>
              <CardDescription>Customize your platform appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Channels
              </CardTitle>
              <CardDescription>Configure how notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send notifications via email', icon: Mail },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS to users', icon: Bell },
                { key: 'whatsappNotifications', label: 'WhatsApp Notifications', desc: 'Send WhatsApp messages', icon: Bell },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: Bell },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings[item.key]}
                    onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize notification email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Welcome Email', 'Booking Confirmation', 'Payment Receipt', 'Password Reset', 'Newsletter'].map((template) => (
                  <Button key={template} variant="outline" className="justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    {template}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Platform Fee (%)</Label>
                  <Input 
                    type="number"
                    value={settings.platformFee}
                    onChange={(e) => setSettings({ ...settings, platformFee: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Razorpay', status: 'active', badge: 'Active' },
                { name: 'Stripe', status: 'test', badge: 'Test Mode' },
                { name: 'PayPal', status: 'inactive', badge: 'Inactive' },
              ].map((gateway) => (
                <div key={gateway.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">{gateway.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      gateway.status === 'active' ? 'bg-green-100 text-green-700' :
                      gateway.status === 'test' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {gateway.badge}
                    </Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <Switch 
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <Label>Max Login Attempts</Label>
                <Input type="number" defaultValue={5} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['FREEASTROLOGYAPI_KEY', 'GOOGLE_API_KEY', 'PERPLEXITY_API_KEY'].map((key) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-sm">{key}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configured
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'API Server', status: 'online' },
                  { label: 'Database', status: 'online' },
                  { label: 'Payment Gateway', status: 'online' },
                  { label: 'Email Service', status: 'online' },
                ].map((service) => (
                  <div key={service.label} className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      service.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <p className="text-sm font-medium">{service.label}</p>
                    <p className="text-xs text-gray-500 capitalize">{service.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup & Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Auto Backup</p>
                  <p className="text-sm text-gray-500">Daily backup at 2:00 AM IST</p>
                </div>
                <Switch 
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Backup: Today, 2:15 AM</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Backup Now
                  </Button>
                </div>
              </div>

              <DataExportSection />
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <p className="font-medium text-red-600">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">Take platform offline for maintenance</p>
                </div>
                <Switch 
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setSettings(savedSettings || defaultSettings)}>Cancel</Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-orange-500 hover:bg-orange-600">
          {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}