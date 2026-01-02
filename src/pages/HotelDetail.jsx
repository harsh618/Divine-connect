import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Star, Wifi, Utensils, Car, Check, Loader2, ChevronLeft } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function HotelDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [numRooms, setNumRooms] = useState(1);
  const [numGuests, setNumGuests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      const hotels = await base44.entities.Hotel.filter({ id: hotelId });
      return hotels[0];
    },
    enabled: !!hotelId
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.HotelBooking.create({
        ...bookingData,
        user_id: user.id,
        status: 'confirmed',
        payment_status: 'completed'
      });
    },
    onSuccess: () => {
      toast.success('Hotel booked successfully!');
      setShowBookingModal(false);
      queryClient.invalidateQueries(['hotel-bookings']);
    }
  });

  const handleBookNow = () => {
    if (!checkInDate || !checkOutDate || !selectedRoom) {
      toast.error('Please select dates and room type');
      return;
    }

    const nights = differenceInDays(checkOutDate, checkInDate);
    const roomData = hotel.room_types.find(r => r.type === selectedRoom);
    const total = roomData.price_per_night * nights * numRooms;

    bookingMutation.mutate({
      hotel_id: hotelId,
      room_type: selectedRoom,
      check_in_date: format(checkInDate, 'yyyy-MM-dd'),
      check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
      num_rooms: numRooms,
      num_guests: numGuests,
      total_nights: nights,
      price_per_night: roomData.price_per_night,
      total_amount: total,
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_email: guestEmail
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Hotel not found</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const images = hotel.images?.length > 0 ? hotel.images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24">
      
      {/* Hero Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="absolute top-6 left-6 bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="container mx-auto px-8 max-w-7xl">
            <h1 className="text-5xl font-serif text-white mb-4">{hotel.name}</h1>
            <div className="flex items-center gap-4 text-white">
              <div className="flex">
                {Array(hotel.star_rating || 3).fill(0).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {hotel.city}, {hotel.state}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <h2 className="text-2xl font-serif text-amber-600 mb-4">About This Property</h2>
              <p className="text-gray-700 leading-relaxed">{hotel.description || 'A comfortable stay near sacred sites with modern amenities and traditional hospitality.'}</p>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-serif text-amber-600 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(hotel.amenities || ['WiFi', 'Restaurant', 'Parking', 'AC', '24/7 Service', 'Room Service']).map(amenity => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-serif text-amber-600 mb-6">Room Types</h2>
              <div className="space-y-4">
                {(hotel.room_types || [
                  { type: 'Standard Room', price_per_night: 1500, capacity: 2, amenities: ['AC', 'TV', 'WiFi'] },
                  { type: 'Deluxe Room', price_per_night: 2500, capacity: 3, amenities: ['AC', 'TV', 'WiFi', 'Mini Bar'] },
                  { type: 'Suite', price_per_night: 4000, capacity: 4, amenities: ['AC', 'TV', 'WiFi', 'Mini Bar', 'Balcony'] }
                ]).map(room => (
                  <Card key={room.type} className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{room.type}</h3>
                        <p className="text-sm text-gray-600">Sleeps {room.capacity}</p>
                        <div className="flex gap-2 mt-2">
                          {room.amenities?.map(a => (
                            <span key={a} className="text-xs bg-white px-2 py-1 rounded">{a}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">₹{room.price_per_night}</p>
                        <p className="text-sm text-gray-500">per night</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-serif text-gray-900 mb-4">Book Your Stay</h3>
              <Button 
                onClick={async () => {
                  const isAuth = await base44.auth.isAuthenticated();
                  if (!isAuth) {
                    base44.auth.redirectToLogin();
                    return;
                  }
                  setShowBookingModal(true);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-12"
              >
                Check Availability
              </Button>
              
              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Check-in</span>
                  <span className="font-semibold">{hotel.check_in_time || '2:00 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out</span>
                  <span className="font-semibold">{hotel.check_out_time || '11:00 AM'}</span>
                </div>
                {hotel.contact_phone && (
                  <div className="flex justify-between">
                    <span>Contact</span>
                    <span className="font-semibold">{hotel.contact_phone}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book {hotel.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Check-in</Label>
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-lg border"
                />
              </div>
              <div>
                <Label className="mb-2 block">Check-out</Label>
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  onSelect={setCheckOutDate}
                  disabled={(date) => date <= (checkInDate || new Date())}
                  className="rounded-lg border"
                />
              </div>
            </div>

            {checkInDate && checkOutDate && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-900">
                  {differenceInDays(checkOutDate, checkInDate)} night(s)
                </p>
              </div>
            )}

            <div>
              <Label className="mb-2 block">Room Type</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {(hotel.room_types || []).map(room => (
                    <SelectItem key={room.type} value={room.type}>
                      {room.type} - ₹{room.price_per_night}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Number of Rooms</Label>
                <Input
                  type="number"
                  min="1"
                  value={numRooms}
                  onChange={(e) => setNumRooms(Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="mb-2 block">Number of Guests</Label>
                <Input
                  type="number"
                  min="1"
                  value={numGuests}
                  onChange={(e) => setNumGuests(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Guest Name</Label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div>
              <Label className="mb-2 block">Phone</Label>
              <Input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+91 "
              />
            </div>

            <div>
              <Label className="mb-2 block">Email</Label>
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            {checkInDate && checkOutDate && selectedRoom && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-amber-600">
                    ₹{(hotel.room_types.find(r => r.type === selectedRoom)?.price_per_night || 0) * 
                      differenceInDays(checkOutDate, checkInDate) * numRooms}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBookNow}
              disabled={bookingMutation.isPending}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500"
            >
              {bookingMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}