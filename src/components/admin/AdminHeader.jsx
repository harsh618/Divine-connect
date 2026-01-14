import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search, Bell, HelpCircle, ChevronDown, LogOut, User, 
  Settings, ExternalLink, Check, X, Calendar, Heart, UserPlus, Building2, Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, formatDistanceToNow } from 'date-fns';

export default function AdminHeader({ user, collapsed }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data for notifications
  const { data: recentBookings = [] } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: () => base44.entities.Booking.filter({ is_deleted: false }, '-created_date', 5),
  });

  const { data: recentDonations = [] } = useQuery({
    queryKey: ['admin-recent-donations'],
    queryFn: () => base44.entities.Donation.list('-created_date', 5),
  });

  const { data: pendingProviders = [] } = useQuery({
    queryKey: ['admin-pending-providers'],
    queryFn: async () => {
      const providers = await base44.entities.ProviderProfile.filter({ is_deleted: false, is_verified: false });
      return providers;
    },
  });

  const { data: recentUsers = [] } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: () => base44.entities.User.list('-created_date', 5),
  });

  // Generate real notifications from data
  const notifications = useMemo(() => {
    const notifs = [];
    
    // Recent bookings
    recentBookings.slice(0, 2).forEach(booking => {
      notifs.push({
        id: `booking-${booking.id}`,
        type: 'booking',
        title: 'New booking received',
        desc: `${booking.booking_type?.replace('_', ' ')} - ₹${booking.total_amount?.toLocaleString() || 0}`,
        time: booking.created_date ? formatDistanceToNow(new Date(booking.created_date), { addSuffix: true }) : 'recently',
        read: false
      });
    });

    // Recent donations
    recentDonations.slice(0, 2).forEach(donation => {
      notifs.push({
        id: `donation-${donation.id}`,
        type: 'donation',
        title: 'Donation received',
        desc: `₹${donation.amount?.toLocaleString() || 0} received`,
        time: donation.created_date ? formatDistanceToNow(new Date(donation.created_date), { addSuffix: true }) : 'recently',
        read: false
      });
    });

    // Pending verifications
    pendingProviders.slice(0, 2).forEach(provider => {
      notifs.push({
        id: `provider-${provider.id}`,
        type: 'provider',
        title: 'Provider verification pending',
        desc: `${provider.display_name} requires approval`,
        time: provider.created_date ? formatDistanceToNow(new Date(provider.created_date), { addSuffix: true }) : 'recently',
        read: true
      });
    });

    // Recent users
    recentUsers.slice(0, 2).forEach(u => {
      notifs.push({
        id: `user-${u.id}`,
        type: 'user',
        title: 'New user registered',
        desc: `${u.full_name || u.email} joined`,
        time: u.created_date ? formatDistanceToNow(new Date(u.created_date), { addSuffix: true }) : 'recently',
        read: true
      });
    });

    // Sort by most recent and limit
    return notifs.slice(0, 8);
  }, [recentBookings, recentDonations, pendingProviders, recentUsers]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'donation': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'provider': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'user': return <User className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <header className={`bg-white border-b sticky top-0 z-40 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users, bookings, temples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-gray-50 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-600">System Online</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <span className="text-gray-500">{format(new Date(), 'EEE, MMM d')}</span>
            </div>

            {/* Help */}
            <Button variant="ghost" size="icon" className="text-gray-500">
              <HelpCircle className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-orange-500">
                    Mark all read
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-orange-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 truncate">{notif.desc}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t">
                  <Button variant="ghost" className="w-full text-sm">
                    View All Notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-orange-500 text-white">
                      {user?.full_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link to={createPageUrl('Home')}>
                  <DropdownMenuItem>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Back to App
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}