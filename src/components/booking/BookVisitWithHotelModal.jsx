import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon, MapPin, Star, Hotel, 
  Check, ChevronRight, ArrowLeft, Wifi, Car, Utensils, CheckCircle
} from 'lucide-react';
import { format, addDays } from 'date-fns';

const GOLD = '#FF9933';

const STEPS = {
  VISIT_DETAILS: 1,
  HOTEL_SELECT: 2,
  SUMMARY: 3,
};

export default function BookVisitWithHotelModal({ isOpen, onClose, temple }) {
  const [step, setStep] = useState(STEPS.VISIT_DETAILS);
  const [visitDate, setVisitDate] = useState(null);
  const [wantHotel, setWantHotel] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  const queryClient = useQueryClient();

  // Fetch hotels near temple
  const { data: hotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels-near-temple', temple?.city],
    queryFn: () => base44.entities.Hotel.filter({
      is_deleted: false
    }, '-rating_average', 20),
    enabled: !!temple?.city && isOpen
  });

  // Filter hotels by temple city, fallback to all hotels
  const cityHotels = hotels?.filter(h => h.city === temple?.city) || [];
  const displayHotels = cityHotels.length > 0 ? cityHotels : hotels?.slice(0, 6) || [];

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        status: 'confirmed',
        payment_status: 'completed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('Booking confirmed!');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to create booking');
    }
  });

  const handleClose = () => {
    setStep(STEPS.VISIT_DETAILS);
    setVisitDate(null);
    setWantHotel(false);
    setSelectedHotel(null);
    setCheckInDate(null);
    setCheckOutDate(null);
    onClose();
  };

  const handleNext = () => {
    if (step === STEPS.VISIT_DETAILS) {
      if (wantHotel) {
        setCheckInDate(visitDate);
        setCheckOutDate(addDays(visitDate, 1));
        setStep(STEPS.HOTEL_SELECT);
      } else {
        setStep(STEPS.SUMMARY);
      }
    } else if (step === STEPS.HOTEL_SELECT) {
      setStep(STEPS.SUMMARY);
    }
  };

  const handleBack = () => {
    if (step === STEPS.HOTEL_SELECT) setStep(STEPS.VISIT_DETAILS);
    else if (step === STEPS.SUMMARY) setStep(wantHotel ? STEPS.HOTEL_SELECT : STEPS.VISIT_DETAILS);
  };

  const handleConfirmBooking = async () => {
    const bookingData = {
      temple_id: temple.id,
      booking_type: 'temple_visit',
      date: format(visitDate, 'yyyy-MM-dd'),
    };

    if (selectedHotel) {
      bookingData.special_requirements = `Hotel: ${selectedHotel.name} - Check-in: ${format(checkInDate, 'MMM d')}, Check-out: ${format(checkOutDate, 'MMM d')}`;
      const roomPrice = selectedHotel.room_inventory?.[0]?.price_per_night || selectedHotel.price_per_night || 1500;
      bookingData.total_amount = roomPrice;
    }

    bookingMutation.mutate(bookingData);
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity?.toLowerCase()) {
      case 'wifi': return <Wifi className="w-3 h-3" />;
      case 'parking': return <Car className="w-3 h-3" />;
      case 'restaurant': return <Utensils className="w-3 h-3" />;
      default: return null;
    }
  };

  if (!temple) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: GOLD }}>
            {step === STEPS.VISIT_DETAILS && 'Book Temple Visit'}
            {step === STEPS.HOTEL_SELECT && 'Select Hotel'}
            {step === STEPS.SUMMARY && 'Confirm Booking'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Visit Details */}
          {step === STEPS.VISIT_DETAILS && (
            <motion.div
              key="visit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                <img
                  src={temple.thumbnail_url || temple.images?.[0] || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100'}
                  alt={temple.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-bold text-gray-800">{temple.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {temple.city}, {temple.state}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Select Visit Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-12">
                      <CalendarIcon className="w-4 h-4 mr-2" style={{ color: GOLD }} />
                      {visitDate ? format(visitDate, 'EEEE, MMMM d, yyyy') : 'Choose a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={visitDate}
                      onSelect={setVisitDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Hotel Option */}
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  wantHotel ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => setWantHotel(!wantHotel)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    wantHotel ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                  }`}>
                    {wantHotel && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-5 h-5" style={{ color: GOLD }} />
                      <span className="font-semibold text-gray-800">Add Hotel Stay</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {displayHotels.length} hotels available near {temple.city}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 text-white"
                style={{ backgroundColor: GOLD }}
                disabled={!visitDate}
                onClick={handleNext}
              >
                {wantHotel ? 'Select Hotel' : 'Continue'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Hotel Selection */}
          {step === STEPS.HOTEL_SELECT && (
            <motion.div
              key="hotels"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Date Selection */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-gray-500">Check-in</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {checkInDate ? format(checkInDate, 'MMM d') : 'Select'}
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
                <div className="flex-1">
                  <Label className="text-xs text-gray-500">Check-out</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {checkOutDate ? format(checkOutDate, 'MMM d') : 'Select'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        disabled={(date) => date <= checkInDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Hotels List */}
              <Label className="text-sm font-medium">Hotels in {temple.city}</Label>
              {hotelsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {displayHotels.map((hotel) => {
                    const roomPrice = hotel.room_inventory?.[0]?.price_per_night || hotel.price_per_night || 1500;
                    return (
                      <Card
                        key={hotel.id}
                        className={`cursor-pointer transition-all ${
                          selectedHotel?.id === hotel.id ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedHotel(hotel)}
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <img
                              src={hotel.thumbnail_url || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                              alt={hotel.name}
                              className="w-24 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-gray-800 truncate">{hotel.name}</h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      {hotel.rating_average || 4.5}
                                    </div>
                                    <span>•</span>
                                    <span>{hotel.city}</span>
                                  </div>
                                </div>
                                {selectedHotel?.id === hotel.id && (
                                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                )}
                              </div>
                              
                              {/* Amenities */}
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {hotel.amenities?.slice(0, 3).map((amenity, i) => (
                                  <span key={i} className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                                    {getAmenityIcon(amenity)} {amenity}
                                  </span>
                                ))}
                              </div>

                              {/* Price */}
                              <div className="mt-2">
                                <span className="font-bold" style={{ color: GOLD }}>
                                  ₹{roomPrice}
                                </span>
                                <span className="text-xs text-gray-500">/night</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1 text-white"
                  style={{ backgroundColor: GOLD }}
                  disabled={!selectedHotel}
                  onClick={handleNext}
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Summary */}
          {step === STEPS.SUMMARY && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card className="border-orange-200">
                <CardContent className="p-4 space-y-3">
                  {/* Temple Info */}
                  <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                    <img
                      src={temple.thumbnail_url || temple.images?.[0] || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100'}
                      alt={temple.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800">{temple.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {temple.city}, {temple.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Visit Date</span>
                    <span className="font-semibold">{visitDate && format(visitDate, 'EEE, MMM d, yyyy')}</span>
                  </div>

                  {/* Hotel Info if selected */}
                  {selectedHotel && (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <img
                          src={selectedHotel.thumbnail_url || selectedHotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100'}
                          alt={selectedHotel.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{selectedHotel.name}</h4>
                          <p className="text-xs text-gray-500">
                            {checkInDate && format(checkInDate, 'MMM d')} - {checkOutDate && format(checkOutDate, 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Hotel Stay</span>
                        <span className="font-semibold">
                          ₹{selectedHotel.room_inventory?.[0]?.price_per_night || selectedHotel.price_per_night || 1500}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-3 border-t-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl" style={{ color: GOLD }}>
                      {selectedHotel 
                        ? `₹${selectedHotel.room_inventory?.[0]?.price_per_night || selectedHotel.price_per_night || 1500}`
                        : 'Free Entry'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1 text-white"
                  style={{ backgroundColor: GOLD }}
                  onClick={handleConfirmBooking}
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                  <Check className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}