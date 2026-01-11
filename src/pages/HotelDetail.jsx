import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  MapPin, Star, Hotel, Wifi, Car, Utensils, 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Users, Check, Loader2, Phone, Mail, CheckCircle, X
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const GOLD = '#FF9933';

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  restaurant: Utensils,
};

export default function HotelDetail() {
  const hotelId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }, []);

  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guests, setGuests] = useState(2);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      const hotels = await base44.entities.Hotel.filter({ is_deleted: false });
      return hotels.find(h => h.id === hotelId) || null;
    },
    enabled: !!hotelId
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        booking_type: 'temple_visit',
        status: 'confirmed',
        payment_status: 'completed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      setShowSuccessPopup(true);
    },
    onError: () => {
      toast.error('Failed to book hotel');
    }
  });

  const nights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;
  const totalPrice = selectedRoom ? selectedRoom.price_per_night * nights : 0;

  const handleBookNow = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin();
      return;
    }

    if (!checkInDate || !checkOutDate || !selectedRoom) {
      toast.error('Please select dates and room type');
      return;
    }

    bookingMutation.mutate({
      date: format(checkInDate, 'yyyy-MM-dd'),
      special_requirements: `Hotel: ${hotel.name} | Room: ${selectedRoom.room_type} | Check-out: ${format(checkOutDate, 'yyyy-MM-dd')} | Guests: ${guests}`,
      total_amount: totalPrice,
      num_devotees: guests
    });
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectedRoom(null);
  };

  const images = hotel?.images?.length > 0 
    ? hotel.images 
    : [hotel?.thumbnail_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Hotel className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hotel Not Found</h2>
        <Link to={createPageUrl('Yatra')}>
          <Button className="mt-4" style={{ backgroundColor: GOLD }}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Hotels
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Image Gallery */}
      <div className="relative h-[50vh] bg-black">
        <img
          src={images[currentImageIndex]}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Link to={createPageUrl('Yatra')} className="absolute top-6 left-6 z-10">
          <Button variant="ghost" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hotel Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              {hotel.is_featured && (
                <Badge className="bg-orange-500 text-white">Featured</Badge>
              )}
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-semibold">{hotel.rating_average || 4.5}</span>
                <span className="text-white/70 text-sm">({hotel.total_reviews || 0} reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{hotel.name}</h1>
            <p className="text-white/80 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {hotel.address || `${hotel.city}, ${hotel.state}`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About This Hotel</h2>
              <p className="text-gray-600 leading-relaxed">
                {hotel.description || `Welcome to ${hotel.name}, a comfortable stay option in ${hotel.city}. Enjoy modern amenities and excellent service during your pilgrimage journey.`}
              </p>
            </Card>

            {/* Amenities */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities?.map((amenity, idx) => {
                  const IconComponent = amenityIcons[amenity.toLowerCase()] || Hotel;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <IconComponent className="w-5 h-5" style={{ color: GOLD }} />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Room Types */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {hotel.room_inventory?.map((room, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRoom?.room_type === room.room_type
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{room.room_type}</h3>
                        <p className="text-sm text-gray-500">
                          Max {room.max_occupancy || 2} guests • {room.available_rooms || 5} rooms available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: GOLD }}>
                          ₹{room.price_per_night}
                        </p>
                        <p className="text-sm text-gray-500">per night</p>
                      </div>
                    </div>
                    {selectedRoom?.room_type === room.room_type && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                ))}
                {(!hotel.room_inventory || hotel.room_inventory.length === 0) && (
                  <div
                    onClick={() => setSelectedRoom({ room_type: 'STANDARD', price_per_night: 1500, max_occupancy: 2 })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRoom?.room_type === 'STANDARD'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">Standard Room</h3>
                        <p className="text-sm text-gray-500">Max 2 guests</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: GOLD }}>₹1,500</p>
                        <p className="text-sm text-gray-500">per night</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contact</h2>
              <div className="space-y-3">
                {hotel.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{hotel.contact_phone}</span>
                  </div>
                )}
                {hotel.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{hotel.contact_email}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden border-2 border-orange-200">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
                  <h3 className="text-xl font-bold text-white">Book Your Stay</h3>
                </div>
                <CardContent className="p-5 space-y-4">
                  {/* Check-in Date */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Check-in</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                          {checkInDate ? format(checkInDate, 'MMM d, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={(date) => {
                            setCheckInDate(date);
                            if (date && (!checkOutDate || checkOutDate <= date)) {
                              setCheckOutDate(addDays(date, 1));
                            }
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Check-out</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                          {checkOutDate ? format(checkOutDate, 'MMM d, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          disabled={(date) => date <= (checkInDate || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Guests</label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                      >-</Button>
                      <span className="flex-1 text-center font-semibold">{guests}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                      >+</Button>
                    </div>
                  </div>

                  {/* Selected Room Display */}
                  {selectedRoom && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Room</span>
                        <span className="font-semibold">{selectedRoom.room_type}</span>
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  {nights > 0 && selectedRoom && (
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">₹{selectedRoom.price_per_night} × {nights} nights</span>
                        <span>₹{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span style={{ color: GOLD }}>₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-12 text-white font-bold"
                    style={{ backgroundColor: GOLD }}
                    onClick={handleBookNow}
                    disabled={!checkInDate || !checkOutDate || !selectedRoom || bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Book Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-white/80">Your stay at {hotel?.name} has been booked successfully</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Hotel</span>
                <span className="font-semibold">{hotel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in</span>
                <span className="font-semibold">{checkInDate && format(checkInDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out</span>
                <span className="font-semibold">{checkOutDate && format(checkOutDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Room</span>
                <span className="font-semibold">{selectedRoom?.room_type}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total Paid</span>
                <span className="font-bold" style={{ color: GOLD }}>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl('MyBookings')} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Bookings
                </Button>
              </Link>
              <Button
                className="flex-1 text-white"
                style={{ backgroundColor: GOLD }}
                onClick={handleSuccessClose}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}