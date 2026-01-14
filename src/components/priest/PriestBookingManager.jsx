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
  MapPin, 
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
  Loader2,
  Video,
  Home,
  Building2,
  AlertCircle,
  Send,
  FileText
} from 'lucide-react';
import { format, isToday, isTomorrow, addHours, isPast } from 'date-fns';
import { toast } from 'sonner';

export default function PriestBookingManager({ bookings = [] }) {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Categorize bookings
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const inProgressBookings = bookings.filter(b => b.status === 'in_progress');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  // Calculate time until booking needs response (12 hours)
  const getResponseDeadline = (booking) => {
    const createdAt = new Date(booking.created_date);
    return addHours(createdAt, 12);
  };

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-bookings']);
      toast.success('Booking updated successfully!');
    }
  });

  const handleAccept = (booking) => {
    updateBookingMutation.mutate({ 
      id: booking.id, 
      data: { status: 'confirmed' } 
    });
  };

  const handleDecline = (booking) => {
    updateBookingMutation.mutate({ 
      id: booking.id, 
      data: { status: 'cancelled' } 
    });
  };

  const handleMarkComplete = (booking) => {
    updateBookingMutation.mutate({ 
      id: booking.id, 
      data: { 
        status: 'completed',
        completion_notes: 'Pooja completed successfully'
      } 
    });
  };

  const handleSendFollowUp = () => {
    if (!followUpMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    // In real app, this would send email/SMS
    toast.success('Follow-up message sent to devotee');
    setFollowUpMessage('');
    setShowMessageModal(false);
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'virtual': return <Video className="w-4 h-4 text-purple-600" />;
      case 'in_person': return <Home className="w-4 h-4 text-orange-600" />;
      case 'temple': return <Building2 className="w-4 h-4 text-amber-600" />;
      default: return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'virtual': return 'Virtual';
      case 'in_person': return 'At Home';
      case 'temple': return 'At Temple';
      default: return mode;
    }
  };

  const BookingCard = ({ booking, showActions = true }) => {
    const deadline = getResponseDeadline(booking);
    const isUrgent = booking.status === 'pending' && !isPast(deadline);
    const timeUntilDeadline = deadline - new Date();
    const hoursLeft = Math.max(0, Math.floor(timeUntilDeadline / (1000 * 60 * 60)));

    return (
      <Card className={`p-5 ${isUrgent ? 'border-yellow-400 bg-yellow-50' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getModeIcon(booking.service_mode)}
            <div>
              <h4 className="font-semibold">Pooja Booking</h4>
              <p className="text-xs text-gray-500">ID: {booking.id?.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === 'pending' && hoursLeft > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700">
                <AlertCircle className="w-3 h-3 mr-1" />
                {hoursLeft}h to respond
              </Badge>
            )}
            <Badge className={
              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }>
              {booking.status}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {booking.date ? (
                <>
                  {format(new Date(booking.date), 'PPP')}
                  {isToday(new Date(booking.date)) && (
                    <Badge className="ml-2 bg-red-100 text-red-700 text-xs">Today</Badge>
                  )}
                  {isTomorrow(new Date(booking.date)) && (
                    <Badge className="ml-2 bg-orange-100 text-orange-700 text-xs">Tomorrow</Badge>
                  )}
                </>
              ) : 'Date TBD'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{booking.time_slot || 'Time TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            {getModeIcon(booking.service_mode)}
            <span>{getModeLabel(booking.service_mode)}</span>
          </div>
          {booking.location && (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span className="line-clamp-2">{booking.location}</span>
            </div>
          )}
          {booking.num_devotees > 1 && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>{booking.num_devotees} devotees</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between py-3 border-t border-b mb-4">
          <span className="text-gray-600">Dakshina</span>
          <span className="font-bold text-orange-600 text-lg">₹{booking.total_amount?.toLocaleString() || 0}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
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
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  onClick={() => handleAccept(booking)}
                  disabled={updateBookingMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDecline(booking)}
                  disabled={updateBookingMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </>
            )}

            {booking.status === 'confirmed' && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 flex-1"
                onClick={() => handleMarkComplete(booking)}
                disabled={updateBookingMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Complete
              </Button>
            )}

            {booking.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowMessageModal(true);
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Send Follow-up
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
            New Requests
            {pendingBookings.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
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
              <p className="text-gray-600">No pending requests</p>
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

        <TabsContent value="in_progress">
          {inProgressBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No bookings in progress</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedBookings.slice(0, 10).map(booking => (
                <BookingCard key={booking.id} booking={booking} />
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
              {/* User Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Devotee Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{selectedBooking.created_by || 'Anonymous'}</span>
                  </div>
                  {selectedBooking.sankalp_details?.family_names && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-500">Family Members:</p>
                        <p>{selectedBooking.sankalp_details.family_names.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Info */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">
                    {selectedBooking.date ? format(new Date(selectedBooking.date), 'PPP') : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{selectedBooking.time_slot || 'TBD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode</span>
                  <span className="font-medium">{getModeLabel(selectedBooking.service_mode)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Devotees</span>
                  <span className="font-medium">{selectedBooking.num_devotees || 1}</span>
                </div>
                {selectedBooking.location && (
                  <div>
                    <span className="text-gray-600 block mb-1">Location</span>
                    <p className="text-sm bg-orange-50 p-2 rounded">{selectedBooking.location}</p>
                  </div>
                )}
                {selectedBooking.special_requirements && (
                  <div>
                    <span className="text-gray-600 block mb-1">Special Requirements</span>
                    <p className="text-sm bg-blue-50 p-2 rounded">{selectedBooking.special_requirements}</p>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="font-semibold">Total Dakshina</span>
                <span className="text-2xl font-bold text-orange-600">
                  ₹{selectedBooking.total_amount?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Follow-up Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Follow-up Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Send a follow-up message to the devotee after completing the pooja
            </p>
            <Textarea
              placeholder="Thank you for choosing our services. May the blessings of the divine be with you always..."
              value={followUpMessage}
              onChange={(e) => setFollowUpMessage(e.target.value)}
              rows={4}
            />
            <Button 
              onClick={handleSendFollowUp}
              className="w-full bg-orange-500 hover:bg-orange-600"
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