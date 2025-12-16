import React, { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, 
  User, 
  Calendar as CalendarIcon,
  CheckCircle,
  Loader2,
  Flame,
  Star,
  Video,
  Home,
  Building2
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';

const timeSlots = [
  '6:00 AM - 7:00 AM',
  '7:00 AM - 8:00 AM',
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '5:00 PM - 6:00 PM',
  '6:00 PM - 7:00 PM',
  '7:00 PM - 8:00 PM'
];

export default function PoojaBooking() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const poojaId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedMode, setSelectedMode] = useState('virtual');
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [familyNames, setFamilyNames] = useState(['']);
  const [gotra, setGotra] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [location, setLocation] = useState('');
  const [additionalRequests, setAdditionalRequests] = useState('');

  const { data: pooja, isLoading: loadingPooja } = useQuery({
    queryKey: ['pooja', poojaId],
    queryFn: async () => {
      const poojas = await base44.entities.Pooja.filter({ id: poojaId, is_deleted: false });
      return poojas[0];
    },
    enabled: !!poojaId
  });

  const { data: priestMappings, isLoading: loadingPriests } = useQuery({
    queryKey: ['priest-mappings', poojaId],
    queryFn: () => base44.entities.PriestPoojaMapping.filter({ pooja_id: poojaId, is_active: true, is_deleted: false }),
    enabled: !!poojaId
  });

  const { data: allPriests } = useQuery({
    queryKey: ['priests-for-pooja'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      provider_type: 'priest', 
      is_verified: true, 
      is_deleted: false,
      is_hidden: false 
    }),
    enabled: !!priestMappings?.length
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        pooja_id: poojaId,
        booking_type: 'pooja',
        status: 'pending',
        payment_status: 'completed'
      });
    },
    onSuccess: () => {
      toast.success('Pooja booked successfully!');
      queryClient.invalidateQueries(['bookings']);
      navigate(createPageUrl('MyBookings'));
    }
  });

  const handleBooking = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (!selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }
    if (!selectedPriest) {
      toast.error('Please select a priest');
      return;
    }
    if (selectedMode === 'in_person' && !location) {
      toast.error('Please provide your location for in-person pooja');
      return;
    }

    const cleanedFamilyNames = familyNames.filter(name => name.trim());
    if (cleanedFamilyNames.length === 0) {
      toast.error('Please add at least one family member name');
      return;
    }

    const price = selectedMode === 'virtual' ? pooja.base_price_virtual :
                  selectedMode === 'in_person' ? pooja.base_price_in_person :
                  pooja.base_price_temple;
    
    bookingMutation.mutate({
      provider_id: selectedPriest,
      service_mode: selectedMode,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTimeSlot,
      location: selectedMode === 'in_person' ? location : undefined,
      sankalp_details: {
        family_names: cleanedFamilyNames,
        gotra: gotra,
        nakshatra: nakshatra
      },
      special_requirements: additionalRequests,
      total_amount: price || 0
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

  const availablePriests = priestMappings?.filter(mapping => {
    if (!selectedDate || !selectedTimeSlot) return false;
    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    
    const isDayAvailable = mapping.available_days?.includes(dayOfWeek);
    const isTimeSlotAvailable = mapping.available_time_slots?.includes(selectedTimeSlot);

    return isDayAvailable && isTimeSlotAvailable;
  });

  const getPriestDetails = (priestId) => {
    return allPriests?.find(p => p.id === priestId);
  };

  const getPrice = () => {
    if (!pooja) return 0;
    if (selectedMode === 'virtual') return pooja.base_price_virtual || 0;
    if (selectedMode === 'in_person') return pooja.base_price_in_person || 0;
    return pooja.base_price_temple || 0;
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Mode */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Select Service Mode</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedMode('virtual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMode === 'virtual' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Video className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">Virtual</p>
                  <p className="text-xs text-gray-500">₹{pooja.base_price_virtual || 0}</p>
                </button>
                <button
                  onClick={() => setSelectedMode('in_person')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMode === 'in_person' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">In-Person</p>
                  <p className="text-xs text-gray-500">₹{pooja.base_price_in_person || 0}</p>
                </button>
                <button
                  onClick={() => setSelectedMode('temple')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMode === 'temple' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">Temple</p>
                  <p className="text-xs text-gray-500">₹{pooja.base_price_temple || 0}</p>
                </button>
              </div>
            </Card>

            {/* Date & Time */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Select Date & Time</h3>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-lg border"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Select Time Slot</Label>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          <Clock className="w-4 h-4 inline mr-2" />
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Select Priest */}
            {selectedDate && selectedTimeSlot && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Select Priest</h3>
                {loadingPriests ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                  </div>
                ) : availablePriests?.length > 0 ? (
                  <div className="space-y-3">
                    {availablePriests.map((mapping) => {
                      const priest = getPriestDetails(mapping.priest_id);
                      if (!priest) return null;
                      return (
                        <button
                          key={mapping.id}
                          onClick={() => setSelectedPriest(mapping.priest_id)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            selectedPriest === mapping.priest_id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {priest.avatar_url ? (
                              <img src={priest.avatar_url} alt={priest.display_name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-orange-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{priest.display_name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span>{priest.years_of_experience} years exp</span>
                                {priest.rating_average > 0 && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center">
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                                      {priest.rating_average.toFixed(1)}
                                    </div>
                                  </>
                                )}
                              </div>
                              {mapping.years_experience && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {mapping.years_experience} years experience with this pooja
                                </p>
                              )}
                              <Badge className="mt-2 bg-green-100 text-green-700">
                                Available
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No priests available for selected date/time</p>
                )}
              </Card>
            )}

            {/* Personal Details */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Personal Details</h3>
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
                  <Label className="mb-2 block">Family Names for Sankalp</Label>
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
                  <Label className="mb-2 block">Special Requests (Optional)</Label>
                  <Textarea
                    placeholder="Any special requirements..."
                    value={additionalRequests}
                    onChange={(e) => setAdditionalRequests(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </Card>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode</span>
                  <Badge className="capitalize">{selectedMode.replace('_', ' ')}</Badge>
                </div>
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
                {selectedPriest && getPriestDetails(selectedPriest) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priest</span>
                    <span className="font-medium">{getPriestDetails(selectedPriest).display_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{pooja.duration_minutes} min</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-orange-600">₹{getPrice()}</span>
                </div>
              </div>

              <Button 
                onClick={handleBooking}
                disabled={bookingMutation.isPending || !selectedDate || !selectedTimeSlot || !selectedPriest}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 py-6"
              >
                {bookingMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Confirm & Pay ₹{getPrice()}
              </Button>

              <div className="mt-4 pt-4 border-t space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Meeting link via email</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Completion certificate</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}