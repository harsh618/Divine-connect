import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import EnhancedAdminStats from '@/components/admin/EnhancedAdminStats';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
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
import AdminSettings from '@/components/admin/AdminSettings';
import AdminAuditLog from '@/components/admin/AdminAuditLog';
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnhancedAdminStats onNavigate={setActiveTab} />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'users':
        return <AdminUsers />;
      case 'temples':
        return <AdminTemples />;
      case 'poojas':
        return <AdminPoojas />;
      case 'pooja_bookings':
        return <AdminPoojaBookings />;
      case 'providers':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to={createPageUrl('AdminProviderOnboarding')}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Provider
                </Button>
              </Link>
            </div>
            <AdminProviders />
          </div>
        );
      case 'bookings':
        return <AdminBookings />;
      case 'donations':
        return <AdminDonations />;
      case 'articles':
        return <AdminArticles />;
      case 'auspicious':
        return <AdminAuspiciousDays />;
      case 'settings':
        return <AdminSettings />;
      case 'audit':
        return <AdminAuditLog />;
      case 'trash':
        return <AdminTrash />;
      default:
        return <EnhancedAdminStats onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <AdminHeader user={user} collapsed={collapsed} />

        {/* Page Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}