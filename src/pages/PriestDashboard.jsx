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
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import PriestCalendarManager from '@/components/priest/PriestCalendarManager';
import PriestArticleManager from '@/components/priest/PriestArticleManager';

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

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white mb-1">
                Welcome, {profile?.display_name || 'Panditji'}
              </h1>
              <p className="text-white/90">Manage your poojas and bookings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 -mt-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100">
                <CalendarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
                <p className="text-sm text-gray-500">Upcoming</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{profile?.rating_average || 4.8}</p>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Earnings</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bookings List */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="upcoming" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Pooja Booking</h3>
                          <p className="text-sm text-gray-500">Booking ID: {booking.id.slice(0, 8)}</p>
                        </div>
                        <Badge className={
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{booking.date ? format(new Date(booking.date), 'PPP') : 'Date TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time_slot || 'Time TBD'}</span>
                        </div>
                        {booking.service_mode === 'in_person' && booking.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{booking.location}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <p className="font-semibold text-orange-600">₹{booking.total_amount}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <Button 
                            onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'confirmed' })}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button 
                            onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'completed' })}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No upcoming bookings</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedBookings.length > 0 ? (
                  completedBookings.slice(0, 10).map((booking) => (
                    <Card key={booking.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">Pooja Booking</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <span>{booking.date ? format(new Date(booking.date), 'PP') : '-'}</span>
                            <span>•</span>
                            <span>₹{booking.total_amount}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No completed bookings yet</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Calendar Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Calendar</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-lg border"
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Today's Schedule</h3>
              {todayBookings.length > 0 ? (
                <div className="space-y-3">
                  {todayBookings.map((booking) => (
                    <div key={booking.id} className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium">{booking.time_slot || 'Time TBD'}</p>
                      <p className="text-xs text-gray-600 mt-1">{booking.service_mode || 'Pooja'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No bookings for this day</p>
              )}
            </Card>
          </div>
            </div>
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
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-6">Profile Information</h3>
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Display Name</p>
                    <p className="font-medium">{profile.display_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{profile.city || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{profile.years_of_experience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-medium">{profile.languages?.join(', ') || 'Not set'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium">{profile.bio || 'No bio added'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Specializations</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.specializations?.map((spec, i) => (
                        <Badge key={i} variant="secondary">{spec}</Badge>
                      )) || 'Not set'}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}