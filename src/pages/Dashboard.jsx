import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, History, Heart, User, Bell, Calendar } from 'lucide-react';

import UpcomingBookings from '../components/dashboard/UpcomingBookings';
import PastBookings from '../components/dashboard/PastBookings';
import SavedProviders from '../components/dashboard/SavedProviders';
import KundliHistory from '../components/dashboard/KundliHistory';
import ProfileSettings from '../components/dashboard/ProfileSettings';
import NotificationSettings from '../components/dashboard/NotificationSettings';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold mb-2">My Dashboard</h1>
          <p className="text-orange-100">Welcome back, {user.full_name}!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
            <TabsTrigger value="upcoming" className="flex flex-col gap-1 py-3">
              <CalendarDays className="w-5 h-5" />
              <span className="text-xs">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex flex-col gap-1 py-3">
              <History className="w-5 h-5" />
              <span className="text-xs">Past</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex flex-col gap-1 py-3">
              <Heart className="w-5 h-5" />
              <span className="text-xs">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="kundli" className="flex flex-col gap-1 py-3">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Kundli</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col gap-1 py-3">
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col gap-1 py-3">
              <Bell className="w-5 h-5" />
              <span className="text-xs">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <UpcomingBookings userId={user.id} />
          </TabsContent>

          <TabsContent value="past">
            <PastBookings userId={user.id} />
          </TabsContent>

          <TabsContent value="saved">
            <SavedProviders userId={user.id} />
          </TabsContent>

          <TabsContent value="kundli">
            <KundliHistory userId={user.id} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSettings user={user} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}