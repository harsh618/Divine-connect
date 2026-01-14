import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Video, 
  Phone, 
  MessageCircle,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Star
} from 'lucide-react';
import { format, addDays, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { toast } from 'sonner';

const CONSULTATION_TYPES = [
  { 
    id: 'basic', 
    name: 'Basic Consultation', 
    duration: 30, 
    price: 500,
    description: 'Quick guidance on a specific question',
    includes: ['One topic discussion', 'Basic remedies if needed']
  },
  { 
    id: 'detailed', 
    name: 'Detailed Consultation', 
    duration: 60, 
    price: 1000,
    description: 'In-depth analysis and guidance',
    includes: ['Multiple topics', 'Detailed chart analysis', 'Comprehensive remedies', 'Written summary']
  },
  { 
    id: 'follow_up', 
    name: 'Follow-up Session', 
    duration: 20, 
    price: 300,
    description: 'Continue previous discussion',
    includes: ['Progress review', 'Additional questions', 'Updated guidance']
  }
];

const CONSULTATION_MODES = [
  { id: 'video', name: 'Video Call', icon: Video, description: 'Face-to-face via video (Preferred)', color: 'purple' },
  { id: 'audio', name: 'Audio Call', icon: Phone, description: 'Voice call only', color: 'blue' },
  { id: 'chat', name: 'Chat Only', icon: MessageCircle, description: 'Text-based consultation', color: 'green' }
];

// Generate time slots for a day
const generateTimeSlots = (date) => {
  const slots = [];
  const now = new Date();
  
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = setMinutes(setHours(new Date(date), hour), minute);
      if (isAfter(slotTime, now)) {
        slots.push({
          time: format(slotTime, 'HH:mm'),
          label: format(slotTime, 'h:mm a'),
          available: Math.random() > 0.3 // Mock availability
        });
      }
    }
  }
  return slots;
};

export default function AstrologerBookingFlow({ provider, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMode, setSelectedMode] = useState('video');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [question, setQuestion] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
      setSelectedTime(null);
    }
  }, [selectedDate]);

  const createBookingMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Booking.create({
        booking_type: 'consultation',
        provider_id: provider.id,
        service_mode: data.mode,
        date: format(data.date, 'yyyy-MM-dd'),
        time_slot: data.time,
        total_amount: data.type.price,
        special_requirements: data.question,
        status: 'confirmed',
        sankalp_details: {
          consultation_type: data.type.id,
          duration_minutes: data.type.duration
        }
      });
    },
    onSuccess: (booking) => {
      setBookingDetails(booking);
      setBookingComplete(true);
      queryClient.invalidateQueries(['user-bookings']);
      toast.success('Consultation booked successfully!');
    }
  });

  const handleBook = () => {
    createBookingMutation.mutate({
      type: selectedType,
      mode: selectedMode,
      date: selectedDate,
      time: selectedTime,
      question
    });
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedMode('video');
    setSelectedDate(null);
    setSelectedTime(null);
    setQuestion('');
    setBookingComplete(false);
    setBookingDetails(null);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedType !== null;
      case 2: return selectedMode !== null;
      case 3: return selectedDate && selectedTime;
      case 4: return true;
      default: return false;
    }
  };

  if (bookingComplete && bookingDetails) {
    return (
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your consultation has been scheduled</p>

            <Card className="p-4 text-left mb-6 bg-purple-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Astrologer</span>
                  <span className="font-medium">{provider.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{selectedType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode</span>
                  <span className="font-medium capitalize">{selectedMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium">{format(selectedDate, 'PPP')} at {selectedTime}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total Paid</span>
                  <span className="font-bold text-purple-600">₹{selectedType?.price}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                You'll receive a {selectedMode === 'video' ? 'meeting link' : 'call'} 15 minutes before your scheduled time.
              </p>
              <Button onClick={resetAndClose} className="w-full bg-purple-600 hover:bg-purple-700">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Consultation with {provider?.display_name}</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s < step ? 'bg-purple-600 text-white' :
                s === step ? 'bg-purple-100 text-purple-600 border-2 border-purple-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-purple-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Consultation Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Choose Consultation Type</h3>
            <div className="space-y-3">
              {CONSULTATION_TYPES.map((type) => (
                <Card 
                  key={type.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedType?.id === type.id 
                      ? 'border-2 border-purple-500 bg-purple-50' 
                      : 'hover:border-purple-200'
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{type.name}</h4>
                        <Badge variant="secondary">{type.duration} mins</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {type.includes.map((item, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">₹{type.price}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose Mode */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Choose Consultation Mode</h3>
            <RadioGroup value={selectedMode} onValueChange={setSelectedMode}>
              <div className="space-y-3">
                {CONSULTATION_MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Card 
                      key={mode.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedMode === mode.id 
                          ? 'border-2 border-purple-500 bg-purple-50' 
                          : 'hover:border-purple-200'
                      }`}
                      onClick={() => setSelectedMode(mode.id)}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={mode.id} id={mode.id} />
                        <div className={`p-3 rounded-lg bg-${mode.color}-100`}>
                          <Icon className={`w-6 h-6 text-${mode.color}-600`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{mode.name}</h4>
                          <p className="text-sm text-gray-600">{mode.description}</p>
                        </div>
                        {mode.id === 'video' && (
                          <Badge className="ml-auto bg-purple-100 text-purple-700">Recommended</Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 3: Choose Date & Time */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Choose Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, new Date()) || isAfter(date, addDays(new Date(), 30))}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label className="mb-2 block">Available Time Slots</Label>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.label)}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === slot.label
                            ? 'bg-purple-600 text-white'
                            : slot.available
                              ? 'bg-gray-100 hover:bg-purple-100 text-gray-700'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Select a date to see available slots</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Your Question (Optional) */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Question (Optional)</h3>
            <div>
              <Label>Share your question or topic in advance</Label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Describe what you'd like to discuss during the consultation... This helps the astrologer prepare better."
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                You can also discuss this during the consultation if you prefer not to share now.
              </p>
            </div>

            {/* Booking Summary */}
            <Card className="p-4 bg-purple-50">
              <h4 className="font-semibold mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation</span>
                  <span className="font-medium">{selectedType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{selectedType?.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode</span>
                  <span className="font-medium capitalize">{selectedMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium">{selectedDate && format(selectedDate, 'PPP')} at {selectedTime}</span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-purple-600">₹{selectedType?.price}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {step < 4 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleBook}
              disabled={createBookingMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createBookingMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirm & Pay ₹{selectedType?.price}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}