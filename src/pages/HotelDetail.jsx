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
  Check, Loader2, Phone, Mail, CheckCircle, Sparkles
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 rounded-[2rem] mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Hotel className="w-10 h-10 text-stone-400" />
        </div>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Hotel Not Found</h2>
        <p className="text-gray-500 font-light mb-6">This hotel may have been removed.</p>
        <Link to={createPageUrl('Yatra')}>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Hotels
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24 font-sans">
      {/* Cinematic Hero */}
      <section className="relative h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <img
            src={images[currentImageIndex]}
            alt={hotel.name}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-black/30 to-transparent" />
        </div>

        {/* Back Button */}
        <Link to={createPageUrl('Yatra')} className="absolute top-6 left-6 z-20">
          <Button variant="ghost" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-full border border-white/20">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 border border-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 border border-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Title Overlay */}
        <div className="relative z-10 container mx-auto px-6 max-w-7xl pb-16">
          <div className="flex items-center gap-2 mb-3">
            {hotel.is_featured && (
              <Badge className="bg-amber-400 text-black border-0 px-3 py-1 text-xs font-medium">
                Featured
              </Badge>
            )}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-semibold">{hotel.rating_average || 4.5}</span>
              <span className="text-white/70 text-sm">({hotel.total_reviews || 0} reviews)</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-3 leading-none drop-shadow-xl">
            {hotel.name}
          </h1>
          <p className="text-white/80 flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            {hotel.address || `${hotel.city}, ${hotel.state}`}
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-7xl relative z-20 -mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="rounded-[2rem] border border-gray-100 overflow-hidden">
              <CardContent className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium uppercase tracking-widest mb-4">
                  <Sparkles className="w-3 h-3" />
                  About This Hotel
                </div>
                <p className="text-gray-600 leading-relaxed font-light text-lg">
                  {hotel.description || `Welcome to ${hotel.name}, a comfortable stay option in ${hotel.city}. Enjoy modern amenities and excellent service during your pilgrimage journey.`}
                </p>
              </CardContent>
            </Card>

            {/* Amenities Card */}
            <Card className="rounded-[2rem] border border-gray-100 overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif text-gray-900 mb-6">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities?.map((amenity, idx) => {
                    const IconComponent = amenityIcons[amenity.toLowerCase()] || Hotel;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Room Types Card */}
            <Card className="rounded-[2rem] border border-gray-100 overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif text-gray-900 mb-6">Available Rooms</h2>
                <div className="space-y-4">
                  {hotel.room_inventory?.map((room, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedRoom?.room_type === room.room_type
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-100 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-xl text-gray-900">{room.room_type}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Max {room.max_occupancy || 2} guests • {room.available_rooms || 5} rooms available
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-serif text-amber-600">
                            ₹{room.price_per_night?.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">per night</p>
                        </div>
                      </div>
                      {selectedRoom?.room_type === room.room_type && (
                        <div className="mt-4 pt-4 border-t border-amber-200 flex items-center gap-2 text-amber-600">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!hotel.room_inventory || hotel.room_inventory.length === 0) && (
                    <div
                      onClick={() => setSelectedRoom({ room_type: 'STANDARD', price_per_night: 1500, max_occupancy: 2 })}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedRoom?.room_type === 'STANDARD'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-100 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-xl text-gray-900">Standard Room</h3>
                          <p className="text-sm text-gray-500 mt-1">Max 2 guests</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-serif text-amber-600">₹1,500</p>
                          <p className="text-sm text-gray-500">per night</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            {(hotel.contact_phone || hotel.contact_email) && (
              <Card className="rounded-[2rem] border border-gray-100 overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-serif text-gray-900 mb-6">Contact</h2>
                  <div className="space-y-4">
                    {hotel.contact_phone && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-gray-700 text-lg">{hotel.contact_phone}</span>
                      </div>
                    )}
                    {hotel.contact_email && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-gray-700 text-lg">{hotel.contact_email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="rounded-[2rem] border-2 border-amber-200 overflow-hidden shadow-xl shadow-amber-100/50">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                  <h3 className="text-2xl font-serif text-white">Book Your Stay</h3>
                </div>
                <CardContent className="p-6 space-y-5">
                  {/* Check-in Date */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Check-in</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-gray-200">
                          <CalendarIcon className="w-4 h-4 mr-2 text-amber-500" />
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
                        <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-gray-200">
                          <CalendarIcon className="w-4 h-4 mr-2 text-amber-500" />
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
                        className="rounded-full"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                      >-</Button>
                      <span className="flex-1 text-center font-serif text-xl">{guests}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                      >+</Button>
                    </div>
                  </div>

                  {/* Selected Room Display */}
                  {selectedRoom && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Selected Room</span>
                        <span className="font-serif font-semibold text-amber-700">{selectedRoom.room_type}</span>
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  {nights > 0 && selectedRoom && (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">₹{selectedRoom.price_per_night?.toLocaleString()} × {nights} nights</span>
                        <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-serif text-xl pt-3 border-t border-gray-100">
                        <span>Total</span>
                        <span className="text-amber-600">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-14 text-white font-semibold text-lg rounded-2xl bg-amber-600 hover:bg-amber-700"
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
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2rem]">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-serif mb-2">Congratulations!</h2>
            <p className="text-white/80">Your stay has been booked successfully</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Hotel</span>
                <span className="font-semibold">{hotel?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Check-in</span>
                <span className="font-semibold">{checkInDate && format(checkInDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Check-out</span>
                <span className="font-semibold">{checkOutDate && format(checkOutDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Room</span>
                <span className="font-semibold">{selectedRoom?.room_type}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="font-semibold">Total Paid</span>
                <span className="font-serif text-xl text-amber-600">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Link to={createPageUrl('MyBookings')} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl h-12">
                  View Bookings
                </Button>
              </Link>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-12"
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