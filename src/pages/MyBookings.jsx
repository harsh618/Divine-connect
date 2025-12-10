import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video,
  QrCode,
  Download,
  Star,
  Building2,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BackButton from '../components/ui/BackButton';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/components/translations';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

const bookingTypeIcons = {
  temple_visit: Building2,
  pooja: Calendar,
  prasad: Package,
  consultation: Video
};

function BookingCard({ booking, temples }) {
  const Icon = bookingTypeIcons[booking.booking_type] || Calendar;
  const temple = temples?.find(t => t.id === booking.temple_id);
  
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Icon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">
                {booking.booking_type?.replace('_', ' ')}
              </h3>
              {temple && (
                <p className="text-sm text-gray-500">{temple.name}</p>
              )}
            </div>
          </div>
          <Badge className={statusColors[booking.status]}>
            {booking.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {booking.date ? format(new Date(booking.date), 'PPP') : 'Date not set'}
          </div>
          {booking.time_slot && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              {booking.time_slot}
            </div>
          )}
          {booking.num_devotees > 1 && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {booking.num_devotees} devotees
            </div>
          )}
        </div>

        {booking.status === 'confirmed' && booking.booking_type === 'temple_visit' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 flex items-center">
              <QrCode className="w-4 h-4 mr-2" />
              Show QR code at temple entrance
            </p>
          </div>
        )}

        {booking.status === 'completed' && booking.completion_certificate_url && (
          <Button variant="outline" className="w-full mt-4">
            <Download className="w-4 h-4 mr-2" />
            Download Certificate
          </Button>
        )}

        {booking.status === 'completed' && (
          <Button variant="outline" className="w-full mt-4">
            <Star className="w-4 h-4 mr-2" />
            Rate Experience
          </Button>
        )}
      </div>
    </Card>
  );
}

function BookingCardSkeleton() {
  return (
    <Card className="overflow-hidden p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
    </Card>
  );
}

export default function MyBookings() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: () => base44.entities.Booking.filter({ 
      user_id: user.id, 
      is_deleted: false 
    }, '-created_date'),
    enabled: !!user?.id
  });

  const { data: temples } = useQuery({
    queryKey: ['temples-for-bookings'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }),
  });

  const upcomingBookings = bookings?.filter(b => 
    ['pending', 'confirmed'].includes(b.status) && 
    new Date(b.date) >= new Date()
  );
  
  const completedBookings = bookings?.filter(b => b.status === 'completed');
  const cancelledBookings = bookings?.filter(b => b.status === 'cancelled');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to view your bookings</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-16 px-6">
        <div className="container mx-auto">
          <BackButton label={t('common.back', language)} />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            My Bookings
          </h1>
          <p className="text-white/80 text-lg">
            Track your temple visits, poojas, and spiritual services
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <Card className="overflow-hidden border-0 shadow-lg">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="w-full justify-start h-14 rounded-none border-b bg-white px-6">
              <TabsTrigger value="upcoming" className="data-[state=active]:text-orange-600">
                Upcoming ({upcomingBookings?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:text-orange-600">
                Completed ({completedBookings?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="data-[state=active]:text-orange-600">
                Cancelled ({cancelledBookings?.length || 0})
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="upcoming" className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => <BookingCardSkeleton key={i} />)}
                  </div>
                ) : upcomingBookings?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} temples={temples} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                      <Calendar className="w-10 h-10 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                    <p className="text-gray-500 mb-4">Start your spiritual journey today</p>
                    <Link to={createPageUrl('Temples')}>
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        Explore Temples
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                {completedBookings?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} temples={temples} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500">No completed bookings yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="mt-0">
                {cancelledBookings?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cancelledBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} temples={temples} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500">No cancelled bookings</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}