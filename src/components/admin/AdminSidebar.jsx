import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, Users, TrendingUp, Heart, Building2, Flame,
  Calendar, UserCheck, FileText, Settings, Trash2, Bell, Moon, Sun,
  HelpCircle, LogOut, ChevronRight, Shield, BarChart3, Megaphone, Hotel
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, collapsed, setCollapsed, darkMode, setDarkMode }) {
  // Fetch real counts for badges
  const { data: pendingProviders = [] } = useQuery({
    queryKey: ['sidebar-pending-providers'],
    queryFn: async () => {
      const providers = await base44.entities.ProviderProfile.filter({ is_deleted: false, is_verified: false });
      return providers;
    },
  });

  const { data: pendingBookings = [] } = useQuery({
    queryKey: ['sidebar-pending-bookings'],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ is_deleted: false, status: 'pending' });
      return bookings;
    },
  });

  const { data: pendingArticles = [] } = useQuery({
    queryKey: ['sidebar-pending-articles'],
    queryFn: async () => {
      const articles = await base44.entities.Article.filter({ is_deleted: false, status: 'pending' });
      return articles;
    },
  });

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
      ]
    },
    {
      title: 'User Management',
      items: [
        { id: 'users', label: 'Users', icon: Users, badge: null },
        { id: 'providers', label: 'Providers & Hotels', icon: UserCheck, badge: pendingProviders.length > 0 ? pendingProviders.length.toString() : null, badgeColor: 'bg-orange-500' },
      ]
    },
    {
      title: 'Services',
      items: [
        { id: 'temples', label: 'Temples', icon: Building2, badge: null },
        { id: 'poojas', label: 'Poojas', icon: Flame, badge: null },
        { id: 'bookings', label: 'All Bookings', icon: Calendar, badge: pendingBookings.length > 0 ? pendingBookings.length.toString() : null, badgeColor: 'bg-blue-500' },
        { id: 'pooja_bookings', label: 'Pooja Bookings', icon: Calendar, badge: null },
      ]
    },
    {
      title: 'Donations',
      items: [
        { id: 'donations', label: 'Campaigns', icon: Heart, badge: null },
      ]
    },
    {
      title: 'Content',
      items: [
        { id: 'articles', label: 'Articles', icon: FileText, badge: pendingArticles.length > 0 ? pendingArticles.length.toString() : null, badgeColor: 'bg-purple-500' },
        { id: 'auspicious', label: 'Auspicious Days', icon: Calendar, badge: null },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, badge: null },
        { id: 'trash', label: 'Trash', icon: Trash2, badge: null },
      ]
    }
  ];
  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-50`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">Divine Admin</h1>
              <p className="text-xs text-gray-400">Super Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6 px-3">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx}>
              {!collapsed && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      activeTab === item.id
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-orange-400' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        {item.badge && (
                          <Badge className={`${item.badgeColor} text-white text-xs px-1.5 py-0.5`}>
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button 
          onClick={() => setDarkMode?.(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Theme</span>}
        </button>
        <button 
          onClick={() => setCollapsed?.(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <ChevronRight className={`w-5 h-5 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </div>
  );
}