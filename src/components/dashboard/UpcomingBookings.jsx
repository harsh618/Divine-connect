import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Clock, MapPin, Video, Flame, CalendarDays } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingBookings({ userId }) {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['upcoming-bookings', userId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return base44.entities.Booking.filter({
        user_id: userId,
        is_deleted: false,
        status: { $in: ['pending', 'confirmed', 'in_progress'] }
      }, 'date');
    }
  });

  const getBookingIcon = (type) => {
    switch (type) {
      case 'pooja': return Flame;
      case 'consultation': return Video;
      case 'temple_visit': return MapPin;
      default: return Calendar;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!bookings?.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Bookings</h3>
          <p className="text-gray-500 mb-4">You don't have any scheduled appointments</p>
          <Link to={createPageUrl('Temples')}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Explore Services
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const Icon = getBookingIcon(booking.booking_type);
        return (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Icon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 capitalize">
                        {booking.booking_type.replace('_', ' ')}
                      </h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{booking.total_amount}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(booking.date).toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    {booking.time_slot && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.time_slot}</span>
                      </div>
                    )}
                    {booking.meeting_link && booking.status === 'confirmed' && (
                      <a 
                        href={booking.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Join Meeting →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}