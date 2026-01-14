import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  LogIn,
  LogOut,
  BedDouble,
  MessageSquare,
  Send,
  AlertCircle,
  Users
} from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function HotelBookingManager({ hotel, bookings = [] }) {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [preArrivalMessage, setPreArrivalMessage] = useState('');

  // Categorize bookings
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const checkedInBookings = bookings.filter(b => b.status === 'in_progress');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hotel-bookings']);
      toast.success('Booking updated!');
    }
  });

  const handleConfirm = (booking) => {
    updateBookingMutation.mutate({ id: booking.id, data: { status: 'confirmed' } });
  };

  const handleCheckIn = (booking) => {
    updateBookingMutation.mutate({ id: booking.id, data: { status: 'in_progress' } });
  };

  const handleCheckOut = (booking) => {
    updateBookingMutation.mutate({ id: booking.id, data: { status: 'completed' } });
  };

  const handleCancel = (booking) => {
    updateBookingMutation.mutate({ id: booking.id, data: { status: 'cancelled' } });
  };

  const handleSendMessage = () => {
    if (!preArrivalMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success('Pre-arrival message sent to guest');
    setPreArrivalMessage('');
    setShowMessageModal(false);
  };

  const getNights = (booking) => {
    if (!booking.date || !booking.delivery_date) return 1;
    return differenceInDays(new Date(booking.delivery_date), new Date(booking.date)) || 1;
  };

  const BookingCard = ({ booking, showActions = true }) => {
    const nights = getNights(booking);
    const isCheckInToday = booking.date && isToday(new Date(booking.date));
    const isCheckOutToday = booking.delivery_date && isToday(new Date(booking.delivery_date));

    return (
      <Card className={`p-5 ${isCheckInToday ? 'border-green-400 bg-green-50' : isCheckOutToday ? 'border-red-400 bg-red-50' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <BedDouble className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold">Booking #{booking.id?.slice(0, 8)}</h4>
              <p className="text-sm text-gray-500">{nights} night{nights > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={
              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              booking.status === 'completed' ? 'bg-gray-100 text-gray-700' :
              'bg-red-100 text-red-700'
            }>
              {booking.status === 'in_progress' ? 'Checked In' : booking.status}
            </Badge>
            {isCheckInToday && booking.status === 'confirmed' && (
              <Badge className="bg-green-500 text-white text-xs">Check-in Today</Badge>
            )}
            {isCheckOutToday && booking.status === 'in_progress' && (
              <Badge className="bg-red-500 text-white text-xs">Check-out Today</Badge>
            )}
          </div>
        </div>

        {/* Guest Info */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{booking.delivery_address?.full_name || booking.created_by || 'Guest'}</span>
          </div>
          {booking.delivery_address?.phone && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{booking.delivery_address.phone}</span>
            </div>
          )}
          {booking.num_devotees > 1 && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{booking.num_devotees} guests</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <LogIn className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-gray-500 text-xs">Check-in</p>
              <p className="font-medium">
                {booking.date ? format(new Date(booking.date), 'MMM d, yyyy') : 'TBD'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-gray-500 text-xs">Check-out</p>
              <p className="font-medium">
                {booking.delivery_date ? format(new Date(booking.delivery_date), 'MMM d, yyyy') : 'TBD'}
              </p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between py-3 border-t mb-4">
          <span className="text-gray-600">Total Amount</span>
          <span className="font-bold text-blue-600 text-lg">₹{booking.total_amount?.toLocaleString() || 0}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedBooking(booking);
                setShowDetailsModal(true);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Details
            </Button>

            {booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleConfirm(booking)}
                  disabled={updateBookingMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200"
                  onClick={() => handleCancel(booking)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleCheckIn(booking)}
                  disabled={updateBookingMutation.isPending}
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Check In
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowMessageModal(true);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </>
            )}

            {booking.status === 'in_progress' && (
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => handleCheckOut(booking)}
                disabled={updateBookingMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Check Out
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingBookings.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="checked_in">Checked In</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-gray-600">No pending bookings</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="confirmed">
          {confirmedBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No confirmed bookings</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checked_in">
          {checkedInBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checkedInBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BedDouble className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No guests currently checked in</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedBookings.slice(0, 10).map(booking => (
                <BookingCard key={booking.id} booking={booking} showActions={false} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No completed bookings yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {cancelledBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cancelledBookings.slice(0, 10).map(booking => (
                <BookingCard key={booking.id} booking={booking} showActions={false} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <XCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No cancelled bookings</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-3">Guest Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{selectedBooking.delivery_address?.full_name || 'Guest'}</span>
                  </div>
                  {selectedBooking.delivery_address?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{selectedBooking.delivery_address.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedBooking.created_by}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">
                    {selectedBooking.date ? format(new Date(selectedBooking.date), 'PPP') : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">
                    {selectedBooking.delivery_date ? format(new Date(selectedBooking.delivery_date), 'PPP') : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{selectedBooking.num_devotees || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{getNights(selectedBooking)}</span>
                </div>
              </div>

              {selectedBooking.special_requirements && (
                <div>
                  <span className="text-gray-600 block mb-1">Special Requests</span>
                  <p className="text-sm bg-yellow-50 p-3 rounded">{selectedBooking.special_requirements}</p>
                </div>
              )}

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{selectedBooking.total_amount?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pre-Arrival Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Pre-Arrival Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Send a welcome message to the guest before their arrival
            </p>
            <Textarea
              placeholder="Dear Guest, we're excited to welcome you! Here are some things to know before your arrival..."
              value={preArrivalMessage}
              onChange={(e) => setPreArrivalMessage(e.target.value)}
              rows={5}
            />
            <Button 
              onClick={handleSendMessage}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}