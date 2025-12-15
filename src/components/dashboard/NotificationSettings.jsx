import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings({ userId }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    booking_reminders: true,
    auspicious_day_alerts: true,
    promotional_emails: false
  });

  const { data: userPrefs, isLoading } = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_id: userId });
      return prefs[0];
    }
  });

  useEffect(() => {
    if (userPrefs) {
      setPreferences({
        email_notifications: userPrefs.email_notifications ?? true,
        booking_reminders: userPrefs.booking_reminders ?? true,
        auspicious_day_alerts: userPrefs.auspicious_day_alerts ?? true,
        promotional_emails: userPrefs.promotional_emails ?? false
      });
    }
  }, [userPrefs]);

  const updatePrefsMutation = useMutation({
    mutationFn: async (newPrefs) => {
      if (userPrefs) {
        return base44.entities.UserPreferences.update(userPrefs.id, newPrefs);
      } else {
        return base44.entities.UserPreferences.create({ user_id: userId, ...newPrefs });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-preferences']);
      toast.success('Notification settings updated');
    }
  });

  const handleToggle = (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    updatePrefsMutation.mutate(newPrefs);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive updates and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-600 mt-1" />
            <div>
              <Label htmlFor="email_notifications" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive general updates via email</p>
            </div>
          </div>
          <Switch
            id="email_notifications"
            checked={preferences.email_notifications}
            onCheckedChange={() => handleToggle('email_notifications')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-600 mt-1" />
            <div>
              <Label htmlFor="booking_reminders" className="font-medium">Booking Reminders</Label>
              <p className="text-sm text-gray-500">Get reminders for upcoming appointments</p>
            </div>
          </div>
          <Switch
            id="booking_reminders"
            checked={preferences.booking_reminders}
            onCheckedChange={() => handleToggle('booking_reminders')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-gray-600 mt-1" />
            <div>
              <Label htmlFor="auspicious_day_alerts" className="font-medium">Auspicious Day Alerts</Label>
              <p className="text-sm text-gray-500">Notifications for festivals and special days</p>
            </div>
          </div>
          <Switch
            id="auspicious_day_alerts"
            checked={preferences.auspicious_day_alerts}
            onCheckedChange={() => handleToggle('auspicious_day_alerts')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-gray-600 mt-1" />
            <div>
              <Label htmlFor="promotional_emails" className="font-medium">Promotional Content</Label>
              <p className="text-sm text-gray-500">Offers, news, and featured services</p>
            </div>
          </div>
          <Switch
            id="promotional_emails"
            checked={preferences.promotional_emails}
            onCheckedChange={() => handleToggle('promotional_emails')}
          />
        </div>
      </CardContent>
    </Card>
  );
}