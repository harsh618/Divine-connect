import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  CheckCircle,
  Loader2,
  Flame,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';
import ServiceModeSelector from '../components/booking/ServiceModeSelector';
import PriestSelector from '../components/booking/PriestSelector';

export default function EnhancedPoojaBooking() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const poojaId = urlParams.get('id');
  const templeId = urlParams.get('templeId');
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedPriestId, setSelectedPriestId] = useState(null);
  const [familyNames, setFamilyNames] = useState(['']);
  const [gotra, setGotra] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [location, setLocation] = useState('');
  const [itemsArrangedBy, setItemsArrangedBy] = useState('user');
  const [numDevotees, setNumDevotees] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState('');

  const { data: pooja, isLoading: loadingPooja } = useQuery({
    queryKey: ['pooja', poojaId],
    queryFn: async () => {
      const poojas = await base44.entities.Pooja.filter({ id: poojaId, is_deleted: false });
      return poojas[0];
    },
    enabled: !!poojaId
  });

  const { data: availabilityData, isLoading: loadingAvailability, refetch: refetchAvailability } = useQuery({
    queryKey: ['availability', poojaId, templeId, selectedMode, selectedDate],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAvailablePoojaSlots', {
        poojaId,
        templeId,
        serviceMode: selectedMode,
        selectedDate: format(selectedDate, 'yyyy-MM-dd')
      });
      return response.data;
    },
    enabled: !!selectedMode && !!selectedDate
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const response = await base44.functions.invoke('createServiceBooking', bookingData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pooja booked successfully!');
      queryClient.invalidateQueries(['bookings']);
      navigate(createPageUrl('MyBookings'));
    },
    onError: (error) => {
      toast.error(error.message || 'Booking failed. Please try again.');
    }
  });

  const handleNext = () => {
    if (currentStep === 1 && !selectedMode) {
      toast.error('Please select a service mode');
      return;
    }
    if (currentStep === 2 && (!selectedDate || !selectedTimeSlot)) {
      toast.error('Please select date and time');
      return;
    }
    if (currentStep === 3 && !selectedPriestId && availabilityData?.availableSlots?.length > 0) {
      // Auto-assign is allowed, so no error
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBooking = () => {
    const cleanedFamilyNames = familyNames.filter(name => name.trim());
    if (cleanedFamilyNames.length === 0) {
      toast.error('Please add at least one family member name');
      return;
    }

    if (selectedMode === 'in_person' && !location) {
      toast.error('Please provide your location for in-person pooja');
      return;
    }

    bookingMutation.mutate({
      poojaId,
      templeId,
      serviceMode: selectedMode,
      date: format(selectedDate, 'yyyy-MM-dd'),
      timeSlot: selectedTimeSlot,
      chosenPriestId: selectedPriestId,
      sankalpDetails: {
        family_names: cleanedFamilyNames,
        gotra,
        nakshatra
      },
      location: selectedMode === 'in_person' ? location : undefined,
      itemsArrangedBy,
      numDevotees,
      specialRequirements
    });
  };

  const addFamilyName = () => {
    setFamilyNames([...familyNames, '']);
  };

  const updateFamilyName = (index, value) => {
    const updated = [...familyNames];
    updated[index] = value;
    setFamilyNames(updated);
  };

  const selectedSlot = availabilityData?.availableSlots?.find(s => s.timeSlot === selectedTimeSlot);

  if (loadingPooja) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!pooja) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pooja not found</h2>
        <Button onClick={() => navigate(createPageUrl('Poojas'))}>Back to Poojas</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <BackButton label="Back" />
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Book {pooja.name}</h1>
              <p className="text-white/80 text-sm">Complete your booking details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 -mt-6">
        {/* Progress Steps */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            {['Service Mode', 'Date & Time', 'Select Priest', 'Details'].map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > idx + 1 ? 'bg-green-500 text-white' :
                  currentStep === idx + 1 ? 'bg-orange-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > idx + 1 ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${currentStep >= idx + 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step}
                </span>
                {idx < 3 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Service Mode */}
            {currentStep === 1 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Select Service Mode</h3>
                <ServiceModeSelector 
                  selectedMode={selectedMode}
                  onSelect={setSelectedMode}
                  templeId={templeId}
                />
              </Card>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Select Date & Time</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTimeSlot(null);
                      }}
                      disabled={(date) => date < new Date()}
                      className="rounded-lg border"
                    />
                  </div>
                  {selectedDate && (
                    <div>
                      <Label className="mb-2 block">Select Time Slot</Label>
                      {loadingAvailability ? (
                        <div className="text-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                        </div>
                      ) : availabilityData?.availableSlots?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {availabilityData.availableSlots.map((slot) => (
                            <Button
                              key={slot.timeSlot}
                              variant={selectedTimeSlot === slot.timeSlot ? 'default' : 'outline'}
                              onClick={() => setSelectedTimeSlot(slot.timeSlot)}
                              className={selectedTimeSlot === slot.timeSlot ? 'bg-orange-500' : ''}
                            >
                              {slot.timeSlot}
                              <Badge variant="secondary" className="ml-2">{slot.priests.length}</Badge>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No available slots for this date</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Step 3: Select Priest */}
            {currentStep === 3 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Select Priest</h3>
                {loadingAvailability ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                  </div>
                ) : selectedSlot?.priests?.length > 0 ? (
                  <PriestSelector
                    availablePriests={selectedSlot.priests}
                    selectedPriestId={selectedPriestId}
                    onSelect={setSelectedPriestId}
                    serviceMode={selectedMode}
                  />
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No priests available</p>
                  </div>
                )}
              </Card>
            )}

            {/* Step 4: Personal Details */}
            {currentStep === 4 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Personal Details</h3>
                <div className="space-y-4">
                  {selectedMode === 'in_person' && (
                    <div>
                      <Label className="mb-2 block">Your Location/Address *</Label>
                      <Textarea
                        placeholder="Enter your complete address"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}
                  <div>
                    <Label className="mb-2 block">Family Names for Sankalp *</Label>
                    {familyNames.map((name, index) => (
                      <div key={index} className="mb-2">
                        <Input
                          placeholder={`Family member ${index + 1}`}
                          value={name}
                          onChange={(e) => updateFamilyName(index, e.target.value)}
                        />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addFamilyName} className="mt-2">
                      + Add Another Name
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Gotra (Optional)</Label>
                      <Input
                        placeholder="Your gotra"
                        value={gotra}
                        onChange={(e) => setGotra(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Nakshatra (Optional)</Label>
                      <Input
                        placeholder="Your nakshatra"
                        value={nakshatra}
                        onChange={(e) => setNakshatra(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Number of Devotees</Label>
                    <Input
                      type="number"
                      min="1"
                      value={numDevotees}
                      onChange={(e) => setNumDevotees(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Special Requests (Optional)</Label>
                    <Textarea
                      placeholder="Any special requirements..."
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleBooking}
                  disabled={bookingMutation.isPending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {bookingMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Confirm Booking</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pooja</span>
                  <span className="font-medium">{pooja.name}</span>
                </div>
                {selectedMode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode</span>
                    <Badge className="capitalize">{selectedMode.replace('_', ' ')}</Badge>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{format(selectedDate, 'PPP')}</span>
                  </div>
                )}
                {selectedTimeSlot && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">{selectedTimeSlot}</span>
                  </div>
                )}
                {selectedPriestId && selectedSlot && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priest</span>
                    <span className="font-medium">
                      {selectedSlot.priests.find(p => p.priestId === selectedPriestId)?.priestName || 'Selected'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{pooja.duration_minutes} min</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-semibold">Estimated Price</span>
                  <span className="font-bold text-orange-600">
                    ₹{selectedSlot?.priests?.[0]?.price || pooja.base_price_virtual || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}