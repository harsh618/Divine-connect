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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon, MapPin, Star, Hotel, Navigation,
  Check, ChevronRight, ArrowLeft, Wifi, Car, Coffee, IndianRupee
} from 'lucide-react';
import { format, addDays } from 'date-fns';

const GOLD = '#FF9933';

const STEPS = {
  VISIT_DETAILS: 1,
  HOTEL_PROMPT: 2,
  HOTEL_SELECT: 3,
  SUMMARY: 4,
};

export default function BookVisitWithHotelModal({ isOpen, onClose, temple }) {
  const [step, setStep] = useState(STEPS.VISIT_DETAILS);
  const [visitDate, setVisitDate] = useState(null);
  const [wantHotel, setWantHotel] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  const queryClient = useQueryClient();

  // Fetch hotels near temple
  const { data: hotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels', temple?.city],
    queryFn: () => base44.entities.Hotel.filter({
      city: temple?.city,
      is_active: true,
      is_deleted: false
    }),
    enabled: !!temple?.city && step === STEPS.HOTEL_SELECT
  });

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        status: 'pending',
        payment_status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('Booking confirmed!');
      queryClient.invalidateQueries(['bookings']);
      handleClose();
    },
    onError: () => {
      toast.error('Failed to create booking');
    }
  });

  const handleClose = () => {
    setStep(STEPS.VISIT_DETAILS);
    setVisitDate(null);
    setWantHotel(null);
    setSelectedHotel(null);
    setSelectedRoom(null);
    setCheckInDate(null);
    setCheckOutDate(null);
    onClose();
  };

  const handleNext = () => {
    if (step === STEPS.VISIT_DETAILS) {
      setStep(STEPS.HOTEL_PROMPT);
    } else if (step === STEPS.HOTEL_PROMPT) {
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
    if (step === STEPS.HOTEL_PROMPT) setStep(STEPS.VISIT_DETAILS);
    else if (step === STEPS.HOTEL_SELECT) setStep(STEPS.HOTEL_PROMPT);
    else if (step === STEPS.SUMMARY) setStep(wantHotel ? STEPS.HOTEL_SELECT : STEPS.HOTEL_PROMPT);
  };

  const handleConfirmBooking = async () => {
    const bookingData = {
      temple_id: temple.id,
      booking_type: 'temple_visit',
      date: format(visitDate, 'yyyy-MM-dd'),
    };

    // If hotel selected, we could create a separate booking or include details
    if (selectedHotel && selectedRoom) {
      // For simplicity, adding hotel info to special_requirements
      bookingData.special_requirements = `Hotel: ${selectedHotel.name} (${selectedRoom.room_type}) - Check-in: ${format(checkInDate, 'MMM d')}, Check-out: ${format(checkOutDate, 'MMM d')}`;
      bookingData.total_amount = selectedRoom.price_per_night;
    }

    bookingMutation.mutate(bookingData);
  };

  if (!temple) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: GOLD }}>
            {step === STEPS.VISIT_DETAILS && 'Book Temple Visit'}
            {step === STEPS.HOTEL_PROMPT && 'Need Accommodation?'}
            {step === STEPS.HOTEL_SELECT && 'Select Hotel'}
            {step === STEPS.SUMMARY && 'Booking Summary'}
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
              className="space-y-6"
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

              <Button
                className="w-full h-12 text-white"
                style={{ backgroundColor: GOLD }}
                disabled={!visitDate}
                onClick={handleNext}
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Hotel Prompt */}
          {step === STEPS.HOTEL_PROMPT && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center p-6">
                <Hotel className="w-16 h-16 mx-auto mb-4" style={{ color: GOLD }} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Would you like to book a hotel near {temple.name}?
                </h3>
                <p className="text-gray-500">
                  We have {hotels?.length || 'several'} hotels available in {temple.city}
                </p>
              </div>

              <RadioGroup
                value={wantHotel === true ? 'yes' : wantHotel === false ? 'no' : ''}
                onValueChange={(val) => setWantHotel(val === 'yes')}
                className="space-y-3"
              >
                <Label
                  htmlFor="yes"
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    wantHotel === true ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <RadioGroupItem value="yes" id="yes" />
                  <div>
                    <p className="font-semibold">Yes, show me hotels</p>
                    <p className="text-sm text-gray-500">Find accommodation near the temple</p>
                  </div>
                </Label>
                <Label
                  htmlFor="no"
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    wantHotel === false ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <RadioGroupItem value="no" id="no" />
                  <div>
                    <p className="font-semibold">No, just the temple visit</p>
                    <p className="text-sm text-gray-500">I'll arrange my own stay</p>
                  </div>
                </Label>
              </RadioGroup>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1 text-white"
                  style={{ backgroundColor: GOLD }}
                  disabled={wantHotel === null}
                  onClick={handleNext}
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Hotel Selection */}
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
                        onSelect={setCheckInDate}
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
              {hotelsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                  {(hotels?.length > 0 ? hotels : [
                    { id: '1', name: 'Temple View Inn', rating_average: 4.5, room_inventory: [{ room_type: 'STANDARD', price_per_night: 1500 }], distance_to_temple: { distance_km: 0.5 } },
                    { id: '2', name: 'Pilgrim Stay', rating_average: 4.2, room_inventory: [{ room_type: 'DELUXE', price_per_night: 2500 }], distance_to_temple: { distance_km: 1.2 } }
                  ]).map((hotel) => (
                    <Card
                      key={hotel.id}
                      className={`cursor-pointer transition-all ${
                        selectedHotel?.id === hotel.id ? 'ring-2 ring-orange-500' : 'hover:shadow-md'
                      }`}
                      onClick={() => {
                        setSelectedHotel(hotel);
                        setSelectedRoom(hotel.room_inventory?.[0] || { room_type: 'STANDARD', price_per_night: 1500 });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{hotel.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {hotel.rating_average || 4.5}
                              <span>•</span>
                              <Navigation className="w-3 h-3" />
                              {hotel.distance_to_temple?.distance_km || 1} km
                            </div>
                          </div>
                          {selectedHotel?.id === hotel.id && (
                            <Check className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">
                            {hotel.room_inventory?.[0]?.room_type || 'Standard'}
                          </span>
                          <span className="font-bold" style={{ color: GOLD }}>
                            ₹{hotel.room_inventory?.[0]?.price_per_night || 1500}/night
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
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

          {/* Step 4: Summary */}
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
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Temple</span>
                    <span className="font-semibold">{temple.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Visit Date</span>
                    <span className="font-semibold">{visitDate && format(visitDate, 'MMM d, yyyy')}</span>
                  </div>
                  {selectedHotel && (
                    <>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Hotel</span>
                        <span className="font-semibold">{selectedHotel.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Room</span>
                        <span className="font-semibold">{selectedRoom?.room_type}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Stay</span>
                        <span className="font-semibold">
                          {checkInDate && format(checkInDate, 'MMM d')} - {checkOutDate && format(checkOutDate, 'MMM d')}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-4 border-t-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl" style={{ color: GOLD }}>
                      ₹{selectedRoom?.price_per_night || 0}
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