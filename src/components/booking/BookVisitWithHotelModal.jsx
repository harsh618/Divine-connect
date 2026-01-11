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
import HotelSuggestionPopup from './HotelSuggestionPopup';

const GOLD = '#FF9933';

const STEPS = {
  VISIT_DETAILS: 1,
  SUMMARY: 2,
};

export default function BookVisitWithHotelModal({ isOpen, onClose, temple }) {
  const [step, setStep] = useState(STEPS.VISIT_DETAILS);
  const [visitDate, setVisitDate] = useState(null);
  const [showHotelSuggestion, setShowHotelSuggestion] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const queryClient = useQueryClient();

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
      setBookingComplete(true);
      // Show hotel suggestion popup after short delay
      setTimeout(() => {
        setShowHotelSuggestion(true);
      }, 500);
    },
    onError: () => {
      toast.error('Failed to create booking');
    }
  });

  const handleClose = () => {
    setStep(STEPS.VISIT_DETAILS);
    setVisitDate(null);
    setShowHotelSuggestion(false);
    setBookingComplete(false);
    onClose();
  };

  const handleNext = () => {
    if (step === STEPS.VISIT_DETAILS) {
      setStep(STEPS.SUMMARY);
    }
  };

  const handleBack = () => {
    if (step === STEPS.SUMMARY) setStep(STEPS.VISIT_DETAILS);
  };

  const handleConfirmBooking = async () => {
    const bookingData = {
      temple_id: temple.id,
      booking_type: 'temple_visit',
      date: format(visitDate, 'yyyy-MM-dd'),
    };

    bookingMutation.mutate(bookingData);
  };

  const handleHotelPopupClose = () => {
    setShowHotelSuggestion(false);
    handleClose();
  };

  if (!temple) return null;

  // Show hotel suggestion popup instead of main modal when booking is complete
  if (bookingComplete && showHotelSuggestion) {
    return (
      <HotelSuggestionPopup
        isOpen={true}
        onClose={handleHotelPopupClose}
        temple={temple}
        bookingDetails={{ date: visitDate }}
      />
    );
  }

  return (
    <Dialog open={isOpen && !bookingComplete} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: GOLD }}>
            {step === STEPS.VISIT_DETAILS && 'Book Temple Visit'}
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

          {/* Step 2: Summary */}
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
                  <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg mb-2">
                    <img
                      src={temple.thumbnail_url || temple.images?.[0] || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100'}
                      alt={temple.name}
                      className="w-16 h-16 rounded-lg object-cover"
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
                    <span className="font-semibold">{visitDate && format(visitDate, 'EEEE, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Booking Type</span>
                    <span className="font-semibold">Temple Darshan</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl" style={{ color: GOLD }}>
                      Free Entry
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