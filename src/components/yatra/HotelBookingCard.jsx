import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Star, Navigation, Wifi, Car, Coffee, MapPin, 
  Calendar as CalendarIcon, Check, Users, Loader2
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const GOLD = '#FF9933';

const AMENITY_ICONS = {
  'WiFi': Wifi,
  'Parking': Car,
  'Restaurant': Coffee,
};

export default function HotelBookingCard({ hotel, onSelect, isSelected, showBookNow = false }) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guests, setGuests] = useState(2);

  const queryClient = useQueryClient();

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = selectedRoom ? selectedRoom.price_per_night * nights : 0;

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        user_id: user.id,
        booking_type: 'prasad', // Using prasad as hotel booking placeholder
        date: format(checkIn, 'yyyy-MM-dd'),
        status: 'pending',
        payment_status: 'pending',
        total_amount: totalPrice,
        special_requirements: `Hotel Booking: ${hotel.name} - ${selectedRoom?.room_type} Room
Check-in: ${format(checkIn, 'MMM d, yyyy')}
Check-out: ${format(checkOut, 'MMM d, yyyy')}
Guests: ${guests}
Total: ₹${totalPrice}`,
        delivery_address: {
          full_name: hotel.name,
          address_line1: hotel.address || hotel.city,
          city: hotel.city,
          state: hotel.state
        }
      });
    },
    onSuccess: () => {
      toast.success('Hotel booked successfully!');
      queryClient.invalidateQueries(['bookings']);
      setShowBookingModal(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to book hotel');
    }
  });

  const resetForm = () => {
    setCheckIn(null);
    setCheckOut(null);
    setSelectedRoom(null);
    setGuests(2);
  };

  const roomInventory = hotel.room_inventory?.length > 0 
    ? hotel.room_inventory 
    : [
        { room_type: 'STANDARD', price_per_night: 1500, available_rooms: 5, max_occupancy: 2 },
        { room_type: 'DELUXE', price_per_night: 2500, available_rooms: 3, max_occupancy: 3 }
      ];

  return (
    <>
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Card className={`overflow-hidden transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-md'
        }`}>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 h-48 md:h-auto relative">
              <img
                src={hotel.thumbnail_url || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              {hotel.is_featured && (
                <Badge className="absolute top-2 left-2 bg-orange-500 text-white">Featured</Badge>
              )}
            </div>
            
            <CardContent className="flex-1 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{hotel.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {hotel.city}{hotel.state ? `, ${hotel.state}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{hotel.rating_average || 4.5}</span>
                  <span className="text-xs text-gray-400">({hotel.total_reviews || 0})</span>
                </div>
              </div>

              {/* Distance to temple if available */}
              {hotel.distance_to_temple?.temple_name && (
                <Badge className="bg-green-100 text-green-700 mb-3">
                  <Navigation className="w-3 h-3 mr-1" />
                  {hotel.distance_to_temple.distance_km} km to {hotel.distance_to_temple.temple_name}
                </Badge>
              )}

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {hotel.amenities?.slice(0, 5).map((amenity, i) => {
                  const Icon = AMENITY_ICONS[amenity] || Wifi;
                  return (
                    <span key={i} className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <Icon className="w-3 h-3" /> {amenity}
                    </span>
                  );
                })}
              </div>

              {/* Price & Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <span className="text-sm text-gray-500">Starting from</span>
                  <div>
                    <span className="text-2xl font-bold" style={{ color: GOLD }}>
                      ₹{roomInventory[0]?.price_per_night || 1500}
                    </span>
                    <span className="text-sm text-gray-500">/night</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {onSelect && (
                    <Button
                      variant="outline"
                      onClick={() => onSelect(hotel, roomInventory[0])}
                      className="border-orange-300"
                    >
                      Select
                    </Button>
                  )}
                  {showBookNow && (
                    <Button
                      onClick={() => setShowBookingModal(true)}
                      className="text-white"
                      style={{ backgroundColor: GOLD }}
                    >
                      Book Now
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: GOLD }}>Book {hotel.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Check-in</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Check-out</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date <= (checkIn || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Guests</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                >
                  -
                </Button>
                <span className="font-semibold">{guests}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setGuests(Math.min(6, guests + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Room Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Room</label>
              <div className="space-y-2">
                {roomInventory.map((room, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRoom?.room_type === room.room_type
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{room.room_type}</span>
                        <p className="text-xs text-gray-500">
                          <Users className="w-3 h-3 inline mr-1" />
                          Up to {room.max_occupancy || 2} guests • {room.available_rooms || 5} available
                        </p>
                      </div>
                      <span className="font-bold" style={{ color: GOLD }}>
                        ₹{room.price_per_night}/night
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {nights > 0 && selectedRoom && (
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>₹{selectedRoom.price_per_night} × {nights} nights</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span style={{ color: GOLD }}>₹{totalPrice}</span>
                </div>
              </div>
            )}

            {/* Book Button */}
            <Button
              onClick={() => bookingMutation.mutate()}
              disabled={!checkIn || !checkOut || !selectedRoom || bookingMutation.isPending}
              className="w-full h-12 text-white font-semibold"
              style={{ backgroundColor: GOLD }}
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>Confirm Booking - ₹{totalPrice}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}