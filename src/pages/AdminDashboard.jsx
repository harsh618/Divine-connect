import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import AdminServices from '@/components/admin/AdminServices';
import AdminProviders from '@/components/admin/AdminProviders';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminDonations from '@/components/admin/AdminDonations';
import AdminTrash from '@/components/admin/AdminTrash';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'temples', label: 'Temples', icon: Building2 },
  { id: 'services', label: 'Services', icon: Settings },
  { id: 'providers', label: 'Providers', icon: UserCheck },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'donations', label: 'Donations', icon: Heart },
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
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-white rounded-xl mb-8">
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

          {/* Temples */}
          <TabsContent value="temples" className="mt-0">
            <AdminTemples />
          </TabsContent>

          {/* Services */}
          <TabsContent value="services" className="mt-0">
            <AdminServices />
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

          {/* Trash */}
          <TabsContent value="trash" className="mt-0">
            <AdminTrash />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}