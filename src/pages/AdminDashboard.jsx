import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar,
  Heart,
  Trash2,
  Settings,
  TrendingUp,
  DollarSign,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import AdminStats from '@/components/admin/AdminStats';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminTemples from '@/components/admin/AdminTemples';
import AdminPoojas from '@/components/admin/AdminPoojas';
import AdminPoojaBookings from '@/components/admin/AdminPoojaBookings';
import AdminProviders from '@/components/admin/AdminProviders';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminDonations from '@/components/admin/AdminDonations';
import AdminArticles from '@/components/admin/AdminArticles';
import AdminAuspiciousDays from '@/components/admin/AdminAuspiciousDays';
import AdminTrash from '@/components/admin/AdminTrash';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'user_analytics', label: 'User Analytics', icon: TrendingUp },
  { id: 'temples', label: 'Temples', icon: Building2 },
  { id: 'poojas', label: 'Poojas', icon: Settings },
  { id: 'pooja_bookings', label: 'Pooja Bookings', icon: Calendar },
  { id: 'providers', label: 'Providers', icon: UserCheck },
  { id: 'bookings', label: 'All Bookings', icon: Calendar },
  { id: 'donations', label: 'Donations', icon: Heart },
  { id: 'articles', label: 'Articles', icon: TrendingUp },
  { id: 'auspicious', label: 'Auspicious Days', icon: Calendar },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        setUser(userData);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Manage Divine Platform</p>
            </div>
            <Link to={createPageUrl('Home')}>
              <Button variant="outline">Back to App</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Navigation Tabs */}
          <TabsList className="grid grid-cols-4 lg:grid-cols-12 h-auto p-1 bg-white rounded-xl mb-8">
            {navItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="mt-0">
            <AdminStats />
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="mt-0">
            <AdminUsers />
          </TabsContent>

          {/* User Analytics */}
          <TabsContent value="user_analytics" className="mt-0">
            <div className="text-center py-12 bg-white rounded-lg">
              <TrendingUp className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">User Analytics Dashboard</h3>
              <p className="text-gray-600 mb-6">View detailed user behavior, engagement metrics, and interaction patterns</p>
              <Link to={createPageUrl('AdminUserAnalytics')}>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Open User Analytics
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Temples */}
          <TabsContent value="temples" className="mt-0">
            <AdminTemples />
          </TabsContent>

          {/* Poojas */}
          <TabsContent value="poojas" className="mt-0">
            <AdminPoojas />
          </TabsContent>

          {/* Pooja Bookings */}
          <TabsContent value="pooja_bookings" className="mt-0">
            <AdminPoojaBookings />
          </TabsContent>

          {/* Providers */}
          <TabsContent value="providers" className="mt-0">
            <AdminProviders />
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings" className="mt-0">
            <AdminBookings />
          </TabsContent>

          {/* Donations */}
          <TabsContent value="donations" className="mt-0">
            <AdminDonations />
          </TabsContent>

          {/* Articles */}
          <TabsContent value="articles" className="mt-0">
            <AdminArticles />
          </TabsContent>

          {/* Auspicious Days */}
          <TabsContent value="auspicious" className="mt-0">
            <AdminAuspiciousDays />
          </TabsContent>

          {/* Trash */}
          <TabsContent value="trash" className="mt-0">
            <AdminTrash />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}