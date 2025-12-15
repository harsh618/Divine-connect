import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Video, MapPin, History } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function PastBookings({ userId }) {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['past-bookings', userId],
    queryFn: () => base44.entities.Booking.filter({
      user_id: userId,
      is_deleted: false,
      status: { $in: ['completed', 'cancelled'] }
    }, '-date', 20)
  });

  const getBookingIcon = (type) => {
    switch (type) {
      case 'pooja': return Flame;
      case 'consultation': return Video;
      case 'temple_visit': return MapPin;
      default: return Calendar;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Bookings</h3>
          <p className="text-gray-500">Your booking history will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const Icon = getBookingIcon(booking.booking_type);
        return (
          <Card key={booking.id} className="opacity-75 hover:opacity-100 transition-opacity">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {booking.booking_type.replace('_', ' ')}
                      </h3>
                      <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      ₹{booking.total_amount}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {new Date(booking.date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
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