import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  BedDouble,
  Clock,
  Settings,
  Image,
  Tag,
  FileText,
  Bell,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Percent,
  BarChart3,
  Loader2
} from 'lucide-react';
import { format, isToday, addDays } from 'date-fns';
import { toast } from 'sonner';
import HotelPropertySetup from '@/components/hotel/HotelPropertySetup';
import HotelBookingManager from '@/components/hotel/HotelBookingManager';
import HotelPromotions from '@/components/hotel/HotelPromotions';
import HotelReports from '@/components/hotel/HotelReports';

export default function HotelDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  // Fetch hotel profile
  const { data: hotel, isLoading: hotelLoading } = useQuery({
    queryKey: ['hotel-profile', user?.id],
    queryFn: async () => {
      const hotels = await base44.entities.Hotel.filter({
        admin_user_id: user.id,
        is_deleted: false
      });
      return hotels[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch bookings for this hotel
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['hotel-bookings', hotel?.id],
    queryFn: () => base44.entities.Booking.filter({
      temple_id: hotel.id, // Using temple_id field for hotel reference
      booking_type: 'hotel',
      is_deleted: false
    }),
    enabled: !!hotel?.id
  });

  // Calculate stats
  const todayCheckIns = bookings.filter(b => 
    b.date && isToday(new Date(b.date)) && b.status === 'confirmed'
  ).length;

  const todayCheckOuts = bookings.filter(b => {
    if (!b.delivery_date) return false; // Using delivery_date as checkout date
    return isToday(new Date(b.delivery_date)) && b.status === 'in_progress';
  }).length;

  const totalRooms = hotel?.room_inventory?.reduce((sum, r) => sum + (r.total_rooms || 0), 0) || 0;
  const occupiedRooms = bookings.filter(b => b.status === 'in_progress').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const thisMonthRevenue = bookings
    .filter(b => {
      if (!b.date || b.status === 'cancelled') return false;
      const d = new Date(b.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const upcomingBookings = bookings.filter(b => {
    if (!b.date || b.status === 'cancelled') return false;
    const bookingDate = new Date(b.date);
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return bookingDate >= new Date() && bookingDate <= thirtyDaysFromNow;
  }).length;

  const pendingConfirmations = bookings.filter(b => b.status === 'pending').length;

  if (hotelLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Hotel Profile Found</h2>
            <p className="text-gray-600 mb-6">You need to set up your hotel profile to access the dashboard.</p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Create Hotel Profile
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                {hotel.thumbnail_url ? (
                  <img src={hotel.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-1">
                  {hotel.name}
                </h1>
                <p className="text-white/90">{hotel.city}, {hotel.state}</p>
              </div>
            </div>
            
            {pendingConfirmations > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                <Bell className="w-5 h-5 text-white" />
                <span className="text-white font-medium">{pendingConfirmations} pending confirmation{pendingConfirmations > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 -mt-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-5 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <LogIn className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{todayCheckIns}</p>
                <p className="text-xs text-gray-500">Check-ins Today</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-100">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{todayCheckOuts}</p>
                <p className="text-xs text-gray-500">Check-outs Today</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{occupancyRate}%</p>
                <p className="text-xs text-gray-500">Occupancy Rate</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{(thisMonthRevenue/1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500">This Month</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 bg-white shadow-lg col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingBookings}</p>
                <p className="text-xs text-gray-500">Next 30 Days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 max-w-3xl">
            <TabsTrigger value="bookings" className="flex items-center gap-2 relative">
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Bookings</span>
              {pendingConfirmations > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {pendingConfirmations}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="property" className="flex items-center gap-2">
              <BedDouble className="w-4 h-4" />
              <span className="hidden md:inline">Property</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden md:inline">Promotions</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <HotelBookingManager hotel={hotel} bookings={bookings} />
          </TabsContent>

          <TabsContent value="property">
            <HotelPropertySetup hotel={hotel} />
          </TabsContent>

          <TabsContent value="promotions">
            <HotelPromotions hotel={hotel} />
          </TabsContent>

          <TabsContent value="reports">
            <HotelReports hotel={hotel} bookings={bookings} />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-6">Hotel Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notification Preferences</h4>
                  <p className="text-sm text-gray-600">Manage how you receive booking notifications</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Settings</h4>
                  <p className="text-sm text-gray-600">Configure payout methods and schedules</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Cancellation Policy</h4>
                  <p className="text-sm text-gray-600">Set your hotel's cancellation terms</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}