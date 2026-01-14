import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { 
  Flame, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Star,
  TrendingUp,
  DollarSign,
  CheckCircle,
  FileText,
  Settings,
  User,
  Package,
  Wallet,
  Bell,
  AlertCircle
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { toast } from 'sonner';
import PriestCalendarManager from '@/components/priest/PriestCalendarManager';
import PriestArticleManager from '@/components/priest/PriestArticleManager';
import PriestProfileEditor from '@/components/priest/PriestProfileEditor';
import PriestServicesManager from '@/components/priest/PriestServicesManager';
import PriestEarnings from '@/components/priest/PriestEarnings';
import PriestBookingManager from '@/components/priest/PriestBookingManager';

export default function PriestDashboard() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['priest-profile', user?.id],
    queryFn: async () => {
      const profiles = await base44.entities.ProviderProfile.filter({ 
        user_id: user.id, 
        provider_type: 'priest',
        is_deleted: false 
      });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: bookings } = useQuery({
    queryKey: ['priest-bookings', profile?.id],
    queryFn: () => base44.entities.Booking.filter({ 
      provider_id: profile.id,
      booking_type: 'pooja',
      is_deleted: false 
    }, '-created_date'),
    enabled: !!profile
  });

  const upcomingBookings = bookings?.filter(b => 
    b.status === 'confirmed' || b.status === 'pending'
  ) || [];

  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-bookings']);
      toast.success('Booking updated successfully');
    }
  });

  const todayBookings = upcomingBookings.filter(b => {
    if (!b.date) return false;
    return format(new Date(b.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  // Get today's schedule
  const todaysSchedule = bookings?.filter(b => {
    if (!b.date || b.status === 'cancelled') return false;
    return isToday(new Date(b.date));
  }) || [];

  // Pending requests count
  const pendingRequests = bookings?.filter(b => b.status === 'pending').length || 0;

  // Month earnings
  const thisMonthEarnings = completedBookings
    .filter(b => {
      if (!b.date) return false;
      const d = new Date(b.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Flame className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-1">
                  Welcome, {profile?.display_name || 'Panditji'}
                </h1>
                <p className="text-white/90">Manage your poojas and bookings</p>
              </div>
            </div>
            
            {/* Notifications */}
            {pendingRequests > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                <Bell className="w-5 h-5 text-white" />
                <span className="text-white font-medium">{pendingRequests} new request{pendingRequests > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 -mt-8">
        {/* Today's Schedule Quick View */}
        {todaysSchedule.length > 0 && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Today's Schedule ({todaysSchedule.length} pooja{todaysSchedule.length > 1 ? 's' : ''})</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {todaysSchedule.map((b) => (
                <Badge key={b.id} className="bg-white text-orange-700 border border-orange-200 px-3 py-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {b.time_slot || 'Time TBD'}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-5 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-100">
                <Bell className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
                <p className="text-xs text-gray-500">New Requests</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100">
                <CalendarIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
                <p className="text-xs text-gray-500">Upcoming</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{profile?.rating_average || 4.8}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 bg-white shadow-lg col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{thisMonthEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 max-w-4xl">
            <TabsTrigger value="bookings" className="flex items-center gap-2 relative">
              <Flame className="w-4 h-4" />
              <span className="hidden md:inline">Bookings</span>
              {pendingRequests > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {pendingRequests}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden md:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden md:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden md:inline">Earnings</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <PriestBookingManager bookings={bookings || []} />
          </TabsContent>

          {/* Calendar Management Tab */}
          <TabsContent value="calendar">
            {profile ? (
              <PriestCalendarManager profile={profile} bookings={bookings || []} />
            ) : (
              <Card className="p-12 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Loading calendar...</p>
              </Card>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            {profile ? (
              <PriestServicesManager profile={profile} />
            ) : (
              <Card className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Loading services...</p>
              </Card>
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            {profile ? (
              <PriestEarnings profile={profile} bookings={bookings || []} />
            ) : (
              <Card className="p-12 text-center">
                <Wallet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Loading earnings...</p>
              </Card>
            )}
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles">
            {profile ? (
              <PriestArticleManager profile={profile} />
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Loading articles...</p>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {profile ? (
              <PriestProfileEditor profile={profile} />
            ) : (
              <Card className="p-12 text-center">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Loading profile...</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}