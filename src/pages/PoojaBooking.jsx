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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, 
  Package, 
  Video, 
  MapPin,
  Home,
  Building2,
  CheckCircle,
  Loader2,
  Flame,
  Users,
  Star,
  ChevronRight,
  ChevronLeft,
  CreditCard
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';

const BOOKING_STAGES = {
  POOJA_SELECT: 1,
  MODE_SELECT: 2,
  DATE_TIME: 3,
  PRIEST_SELECT: 4,
  DETAILS: 5,
  ITEMS: 6,
  LOCATION: 7,
  PAYMENT: 8,
  CONFIRMATION: 9
};

export default function PoojaBooking() {
  const urlParams = new URLSearchParams(window.location.search);
  const poojaId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [currentStage, setCurrentStage] = useState(BOOKING_STAGES.MODE_SELECT);
  const [serviceMode, setServiceMode] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [familyNames, setFamilyNames] = useState(['']);
  const [gotra, setGotra] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [itemsArrangedBy, setItemsArrangedBy] = useState('user');
  const [location, setLocation] = useState('');
  const [additionalRequests, setAdditionalRequests] = useState('');
  const [numDevotees, setNumDevotees] = useState(1);

  const { data: pooja, isLoading: poojaLoading } = useQuery({
    queryKey: ['pooja', poojaId],
    queryFn: async () => {
      const poojas = await base44.entities.Pooja.filter({ id: poojaId });
      return poojas[0];
    },
    enabled: !!poojaId
  });

  const { data: priestMappings, isLoading: priestsLoading } = useQuery({
    queryKey: ['priest-mappings', poojaId],
    queryFn: () => base44.entities.PriestPoojaMapping.filter({ pooja_id: poojaId, is_active: true, is_deleted: false }),
    enabled: !!poojaId && currentStage >= BOOKING_STAGES.PRIEST_SELECT
  });

  const { data: priests } = useQuery({
    queryKey: ['priests', priestMappings],
    queryFn: async () => {
      if (!priestMappings?.length) return [];
      const priestIds = priestMappings.map(m => m.priest_id);
      const allPriests = await base44.entities.ProviderProfile.filter({ provider_type: 'priest', is_deleted: false, is_hidden: false });
      return allPriests.filter(p => priestIds.includes(p.id));
    },
    enabled: !!priestMappings?.length
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        pooja_id: poojaId,
        provider_id: selectedPriest?.id,
        booking_type: 'pooja',
        status: 'pending',
        payment_status: 'completed'
      });
    },
    onSuccess: () => {
      setCurrentStage(BOOKING_STAGES.CONFIRMATION);
      queryClient.invalidateQueries(['bookings']);
    },
    onError: (error) => {
      toast.error('Booking failed. Please try again.');
    }
  });

  const calculateTotalAmount = () => {
    if (!pooja) return 0;
    let basePrice = 0;
    if (serviceMode === 'virtual') basePrice = pooja.base_price_virtual || 0;
    else if (serviceMode === 'in_person') basePrice = pooja.base_price_in_person || 0;
    else if (serviceMode === 'temple') basePrice = pooja.base_price_temple || 0;

    const itemsCost = itemsArrangedBy === 'priest' ? (pooja.items_arrangement_cost || 0) : 0;
    return basePrice + itemsCost;
  };

  const handleNext = () => {
    if (currentStage === BOOKING_STAGES.MODE_SELECT && !serviceMode) {
      toast.error('Please select a service mode');
      return;
    }
    if (currentStage === BOOKING_STAGES.DATE_TIME && !selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (currentStage === BOOKING_STAGES.PRIEST_SELECT && !selectedPriest) {
      toast.error('Please select a priest');
      return;
    }
    if (currentStage === BOOKING_STAGES.DETAILS) {
      const cleanedNames = familyNames.filter(n => n.trim());
      if (cleanedNames.length === 0) {
        toast.error('Please add at least one family member name');
        return;
      }
    }
    if (currentStage === BOOKING_STAGES.LOCATION && serviceMode === 'in_person' && !location) {
      toast.error('Please enter your location');
      return;
    }

    if (currentStage === BOOKING_STAGES.PAYMENT) {
      handleBooking();
    } else {
      setCurrentStage(currentStage + 1);
    }
  };

  const handleBack = () => {
    if (currentStage > BOOKING_STAGES.MODE_SELECT) {
      setCurrentStage(currentStage - 1);
    }
  };

  const handleBooking = () => {
    const cleanedFamilyNames = familyNames.filter(name => name.trim());
    
    bookingMutation.mutate({
      service_mode: serviceMode,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTimeSlot || 'Morning (6 AM - 10 AM)',
      sankalp_details: {
        family_names: cleanedFamilyNames,
        gotra: gotra,
        nakshatra: nakshatra
      },
      location: serviceMode === 'in_person' ? location : undefined,
      items_arranged_by: itemsArrangedBy,
      num_devotees: numDevotees,
      special_requirements: additionalRequests,
      total_amount: calculateTotalAmount()
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

  if (poojaLoading) {
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
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <BackButton label="Back" />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
                Book {pooja.name}
              </h1>
              <p className="text-white/90">Complete your booking in {9 - currentStage + 1} steps</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-2">
            {Array(8).fill(0).map((_, idx) => (
              <div key={idx} className="flex-1">
                <div className={`h-2 rounded-full transition-all ${
                  idx < currentStage - 1 ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        {currentStage === BOOKING_STAGES.CONFIRMATION ? (
          /* Confirmation Stage */
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your pooja has been booked successfully. You will receive a confirmation email and WhatsApp message shortly.
            </p>
            <div className="bg-orange-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                <strong>Next Steps:</strong><br/>
                • A priest will confirm your booking within 24 hours<br/>
                • You'll receive the meeting link 1 hour before the pooja<br/>
                • Photos and completion certificate will be shared after the pooja
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = createPageUrl('MyBookings')}>
                View Bookings
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => window.location.href = createPageUrl('Home')}>
                Go Home
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 md:p-8">
            {/* Stage Content */}
            <div className="mb-8">
              {currentStage === BOOKING_STAGES.MODE_SELECT && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Select Service Mode</h2>
                  <p className="text-gray-600 mb-6">Choose how you would like the pooja to be conducted</p>
                  
                  <RadioGroup value={serviceMode} onValueChange={setServiceMode}>
                    <div className="space-y-4">
                      {pooja.base_price_virtual > 0 && (
                        <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          serviceMode === 'virtual' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                        }`}>
                          <RadioGroupItem value="virtual" id="virtual" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Video className="w-5 h-5 text-orange-500" />
                              <span className="font-semibold">Virtual Pooja</span>
                              <Badge>₹{pooja.base_price_virtual}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">Priest performs at temple, you join via video call</p>
                          </div>
                        </label>
                      )}

                      {pooja.base_price_in_person > 0 && (
                        <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          serviceMode === 'in_person' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                        }`}>
                          <RadioGroupItem value="in_person" id="in_person" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Home className="w-5 h-5 text-orange-500" />
                              <span className="font-semibold">In-Person (At Your Home)</span>
                              <Badge>₹{pooja.base_price_in_person}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">Priest comes to your location</p>
                          </div>
                        </label>
                      )}

                      {pooja.base_price_temple > 0 && (
                        <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          serviceMode === 'temple' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                        }`}>
                          <RadioGroupItem value="temple" id="temple" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="w-5 h-5 text-orange-500" />
                              <span className="font-semibold">At Temple</span>
                              <Badge>₹{pooja.base_price_temple}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">You visit the temple for the pooja</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {currentStage === BOOKING_STAGES.DATE_TIME && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
                  <p className="text-gray-600 mb-6">Choose a preferred date and time slot</p>
                  
                  <div className="mb-6">
                    <Label className="mb-2 block">Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < addDays(new Date(), pooja.min_notice_days || 1)}
                      className="rounded-lg border"
                    />
                  </div>

                  {pooja.best_time && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-blue-900">
                        <strong>Recommended:</strong> {pooja.best_time}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 block">Preferred Time Slot</Label>
                    <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (6 AM - 10 AM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 3 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5 PM - 7 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStage === BOOKING_STAGES.PRIEST_SELECT && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Select Priest</h2>
                  <p className="text-gray-600 mb-6">Choose from available priests for your pooja</p>
                  
                  {priestsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                  ) : priests?.length > 0 ? (
                    <div className="space-y-4">
                      {priests.map((priest) => {
                        const mapping = priestMappings.find(m => m.priest_id === priest.id);
                        return (
                          <label
                            key={priest.id}
                            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPriest?.id === priest.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="priest"
                              checked={selectedPriest?.id === priest.id}
                              onChange={() => setSelectedPriest(priest)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold">{priest.display_name}</h3>
                                  <p className="text-sm text-gray-600">{mapping?.years_experience || priest.years_of_experience} years experience</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold">{priest.rating_average || 4.5}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">{mapping?.total_performed || 0} bookings</p>
                                </div>
                              </div>
                              {priest.specializations?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {priest.specializations.slice(0, 3).map((spec, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{spec}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No priests available for this pooja at the moment.</p>
                    </div>
                  )}
                </div>
              )}

              {currentStage === BOOKING_STAGES.DETAILS && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Family Details</h2>
                  <p className="text-gray-600 mb-6">Enter details for personalized mantras and sankalp</p>
                  
                  <div className="space-y-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Gotra (Optional)</Label>
                        <Input
                          placeholder="Enter your gotra"
                          value={gotra}
                          onChange={(e) => setGotra(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Nakshatra (Optional)</Label>
                        <Input
                          placeholder="Enter nakshatra"
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
                        onChange={(e) => setNumDevotees(parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Special Requirements (Optional)</Label>
                      <Textarea
                        placeholder="Any specific prayers or customizations..."
                        value={additionalRequests}
                        onChange={(e) => setAdditionalRequests(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStage === BOOKING_STAGES.ITEMS && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Pooja Items</h2>
                  <p className="text-gray-600 mb-6">Who will arrange the required items?</p>
                  
                  {pooja.required_items?.length > 0 && (
                    <Card className="p-4 mb-6 bg-gray-50">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-orange-500" />
                        Required Items:
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {pooja.required_items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <RadioGroup value={itemsArrangedBy} onValueChange={setItemsArrangedBy}>
                    <div className="space-y-4">
                      <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        itemsArrangedBy === 'user' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                      }`}>
                        <RadioGroupItem value="user" id="user-items" />
                        <div className="flex-1">
                          <span className="font-semibold">I'll arrange the items</span>
                          <p className="text-sm text-gray-600 mt-1">You will provide all required items</p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        itemsArrangedBy === 'priest' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                      }`}>
                        <RadioGroupItem value="priest" id="priest-items" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Priest will arrange</span>
                            <Badge className="bg-orange-500">+₹{pooja.items_arrangement_cost || 0}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">All items will be provided by the priest</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {currentStage === BOOKING_STAGES.LOCATION && serviceMode === 'in_person' && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Location</h2>
                  <p className="text-gray-600 mb-6">Enter the address where the pooja will be performed</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Full Address *</Label>
                      <Textarea
                        placeholder="Enter complete address with landmarks"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStage === BOOKING_STAGES.PAYMENT && (
                <div>
                  <h2 className="text-2xl font-bold mb-2">Review & Payment</h2>
                  <p className="text-gray-600 mb-6">Review your booking details and proceed to payment</p>
                  
                  <Card className="p-6 bg-gray-50 mb-6">
                    <h3 className="font-semibold mb-4">Booking Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pooja:</span>
                        <span className="font-medium">{pooja.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Mode:</span>
                        <span className="font-medium capitalize">{serviceMode.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{selectedDate ? format(selectedDate, 'PPP') : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedTimeSlot || 'Morning'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priest:</span>
                        <span className="font-medium">{selectedPriest?.display_name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items Arranged By:</span>
                        <span className="font-medium capitalize">{itemsArrangedBy}</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Amount:</span>
                          <span className="text-orange-600">₹{calculateTotalAmount()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Your booking will be confirmed after payment. You'll receive WhatsApp and email confirmation with all details.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStage > BOOKING_STAGES.MODE_SELECT && currentStage !== BOOKING_STAGES.CONFIRMATION && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {currentStage !== BOOKING_STAGES.CONFIRMATION && (
                <Button 
                  onClick={handleNext}
                  disabled={bookingMutation.isPending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {bookingMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                  ) : currentStage === BOOKING_STAGES.PAYMENT ? (
                    <><CreditCard className="w-4 h-4 mr-2" /> Pay ₹{calculateTotalAmount()}</>
                  ) : (
                    <>Continue <ChevronRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}