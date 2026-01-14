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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Video, 
  Users, 
  Flame,
  Check,
  Loader2,
  MapPin,
  Clock,
  Package,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

import TimeSlotPicker from './TimeSlotPicker';

/**
 * Enhanced Pooja Booking Flow with complete Logic Tree
 * 
 * Booking Modes:
 * 1. Virtual Mode
 *    - Option A: With Devotee (Live video link shared 24h prior)
 *    - Option B: Without Devotee (Priest performs on behalf, video recorded)
 * 
 * 2. Physical Mode
 *    - Option A: In Temple (User travels to temple)
 *    - Option B: At Home (Priest travels to user)
 * 
 * Booking Flow:
 * 1. Select Mode -> Enter Details -> Payment Hold (Escrow)
 * 2. Priest allocation 24h before slot
 * 3. Priest marks complete -> Payment release (Weekly/Monthly)
 */
export default function EnhancedPoojaBookingFlow({ 
  isOpen, 
  onClose, 
  pooja, 
  templeId = null 
}) {
  const queryClient = useQueryClient();
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  
  // Mode selection
  const [serviceMode, setServiceMode] = useState('temple'); // virtual, in_person, temple
  const [virtualOption, setVirtualOption] = useState('with_devotee'); // with_devotee, on_behalf
  const [physicalOption, setPhysicalOption] = useState('in_temple'); // in_temple, at_home
  
  // Booking details
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [numDevotees, setNumDevotees] = useState(1);
  const [location, setLocation] = useState('');
  const [itemsArrangedBy, setItemsArrangedBy] = useState('priest');
  const [specialRequirements, setSpecialRequirements] = useState('');
  
  // Sankalp details
  const [sankalpDetails, setSankalpDetails] = useState({
    family_names: [''],
    gotra: '',
    nakshatra: ''
  });
  
  // Priest allocation
  const [allocatedPriest, setAllocatedPriest] = useState(null);
  const [isAllocating, setIsAllocating] = useState(false);
  
  // Success state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Calculate price based on selections
  const calculatePrice = () => {
    let basePrice = 0;
    
    if (serviceMode === 'virtual') {
      basePrice = pooja.base_price_virtual || 0;
    } else if (serviceMode === 'in_person') {
      basePrice = pooja.base_price_in_person || 0;
    } else {
      basePrice = pooja.base_price_temple || 0;
    }
    
    // Add items arrangement cost
    if (itemsArrangedBy === 'priest' && pooja.items_arrangement_cost) {
      basePrice += pooja.items_arrangement_cost;
    }
    
    return basePrice;
  };

  // Allocate priest when date/time selected
  const allocatePriest = async () => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    setIsAllocating(true);
    try {
      const response = await base44.functions.invoke('allocatePriest', {
        poojaId: pooja.id,
        templeId: templeId,
        serviceMode: serviceMode === 'in_person' ? physicalOption : serviceMode,
        selectedDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot,
        userCity: location ? location.split(',')[0].trim() : null
      });
      
      if (response.data.success && response.data.allocatedPriest) {
        setAllocatedPriest(response.data);
        toast.success(`Priest ${response.data.allocatedPriest.display_name} available!`);
      } else {
        toast.info('A priest will be assigned 24 hours before your booking');
      }
    } catch (error) {
      console.error('Allocation error:', error);
      toast.info('A priest will be assigned 24 hours before your booking');
    }
    setIsAllocating(false);
  };

  useEffect(() => {
    if (selectedDate && selectedTimeSlot && currentStep === 2) {
      allocatePriest();
    }
  }, [selectedDate, selectedTimeSlot]);

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('lockBookingSlot', {
        priestId: allocatedPriest?.allocatedPriest?.id || null,
        poojaId: pooja.id,
        templeId: templeId,
        selectedDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot,
        serviceMode: serviceMode === 'in_person' ? 
          (physicalOption === 'at_home' ? 'in_person' : 'temple') : 
          serviceMode,
        totalAmount: calculatePrice(),
        sankalpDetails: sankalpDetails,
        location: serviceMode === 'in_person' && physicalOption === 'at_home' ? location : null,
        numDevotees: numDevotees,
        specialRequirements: `${virtualOption === 'on_behalf' ? '[On Behalf - Record Video] ' : ''}${specialRequirements}`,
        itemsArrangedBy: itemsArrangedBy
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      setBookingDetails(data);
      setBookingSuccess(true);
      
      // Send notification to priest
      base44.functions.invoke('sendBookingNotifications', {
        notificationType: 'new_booking',
        bookingId: data.booking.id
      });
      
      queryClient.invalidateQueries(['bookings']);
    },
    onError: (error) => {
      if (error.response?.data?.slotTaken) {
        toast.error('This slot was just booked. Please select another time.');
        setSelectedTimeSlot('');
      } else {
        toast.error('Booking failed: ' + (error.message || 'Unknown error'));
      }
    }
  });

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate mode selection
      if (serviceMode === 'in_person' && physicalOption === 'at_home' && !location) {
        toast.error('Please enter your location for at-home pooja');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDate || !selectedTimeSlot) {
        toast.error('Please select date and time slot');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Final confirmation
      bookingMutation.mutate();
    }
  };

  const renderModeSelection = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold mb-4 block">Select Service Mode</Label>
        <RadioGroup value={serviceMode} onValueChange={setServiceMode}>
          {/* Virtual Option */}
          {pooja.base_price_virtual > 0 && (
            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              serviceMode === 'virtual' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}>
              <div className="flex items-start gap-4">
                <RadioGroupItem value="virtual" id="virtual" />
                <div className="flex-1">
                  <Label htmlFor="virtual" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold">Virtual Pooja</span>
                      <Badge className="bg-purple-100 text-purple-700">₹{pooja.base_price_virtual}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Join the pooja online via video call</p>
                  </Label>
                  
                  {serviceMode === 'virtual' && (
                    <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                      <RadioGroup value={virtualOption} onValueChange={setVirtualOption}>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <RadioGroupItem value="with_devotee" id="with_devotee" />
                          <Label htmlFor="with_devotee" className="cursor-pointer flex-1">
                            <span className="font-medium">With Live Participation</span>
                            <p className="text-xs text-gray-500">Video link shared 24 hours prior</p>
                          </Label>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <RadioGroupItem value="on_behalf" id="on_behalf" />
                          <Label htmlFor="on_behalf" className="cursor-pointer flex-1">
                            <span className="font-medium">Performed on Your Behalf</span>
                            <p className="text-xs text-gray-500">Priest performs, video recording provided</p>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* In-Person Option */}
          {pooja.base_price_in_person > 0 && (
            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              serviceMode === 'in_person' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
            }`}>
              <div className="flex items-start gap-4">
                <RadioGroupItem value="in_person" id="in_person" />
                <div className="flex-1">
                  <Label htmlFor="in_person" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold">Physical/In-Person</span>
                      <Badge className="bg-orange-100 text-orange-700">₹{pooja.base_price_in_person}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Attend the pooja physically</p>
                  </Label>
                  
                  {serviceMode === 'in_person' && (
                    <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                      <RadioGroup value={physicalOption} onValueChange={setPhysicalOption}>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <RadioGroupItem value="in_temple" id="in_temple" />
                          <Label htmlFor="in_temple" className="cursor-pointer flex-1">
                            <span className="font-medium">At Temple</span>
                            <p className="text-xs text-gray-500">You travel to the temple</p>
                          </Label>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <RadioGroupItem value="at_home" id="at_home" />
                          <Label htmlFor="at_home" className="cursor-pointer flex-1">
                            <span className="font-medium">At Your Home</span>
                            <p className="text-xs text-gray-500">Priest travels to your location</p>
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {physicalOption === 'at_home' && (
                        <div className="mt-3">
                          <Label className="text-sm">Your Address</Label>
                          <Input
                            placeholder="Enter your complete address"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Temple Option */}
          {pooja.base_price_temple > 0 && (
            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              serviceMode === 'temple' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
            }`}>
              <div className="flex items-start gap-4">
                <RadioGroupItem value="temple" id="temple" />
                <Label htmlFor="temple" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold">At Temple (Traditional)</span>
                    <Badge className="bg-amber-100 text-amber-700">₹{pooja.base_price_temple}</Badge>
                    <Badge className="bg-green-100 text-green-700 text-xs">Recommended</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Experience the full ritual at the sacred temple</p>
                </Label>
              </div>
            </div>
          )}
        </RadioGroup>
      </div>

      {/* Items Arrangement */}
      {pooja.items_arrangement_cost > 0 && (
        <div>
          <Label className="font-semibold mb-3 block">Pooja Samagri (Items)</Label>
          <RadioGroup value={itemsArrangedBy} onValueChange={setItemsArrangedBy}>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <RadioGroupItem value="user" id="user_items" />
              <Label htmlFor="user_items" className="cursor-pointer flex-1">
                <span className="font-medium">I will arrange items</span>
              </Label>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <RadioGroupItem value="priest" id="priest_items" />
              <Label htmlFor="priest_items" className="cursor-pointer flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Priest will arrange</span>
                  <span className="text-amber-600 font-semibold">+₹{pooja.items_arrangement_cost}</span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div>
        <Label className="font-semibold mb-3 block">Select Date</Label>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => date < addDays(new Date(), pooja.min_notice_days || 1)}
          className="rounded-lg border"
        />
        {pooja.min_notice_days > 1 && (
          <p className="text-xs text-gray-500 mt-2">
            * Minimum {pooja.min_notice_days} days advance booking required
          </p>
        )}
      </div>

      <TimeSlotPicker
        value={selectedTimeSlot}
        onChange={setSelectedTimeSlot}
        label="Select Time Slot"
      />

      {/* Priest Allocation Status */}
      {selectedDate && selectedTimeSlot && (
        <div className={`p-4 rounded-xl border ${
          allocatedPriest?.success ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
        }`}>
          {isAllocating ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-700">Finding available priest...</span>
            </div>
          ) : allocatedPriest?.success ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">
                  {allocatedPriest.allocatedPriest.display_name}
                </p>
                <p className="text-sm text-green-600">
                  {allocatedPriest.allocatedPriest.years_of_experience || 5}+ years experience • 
                  Rating: {allocatedPriest.allocatedPriest.rating_average || 4.5}★
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700">A priest will be assigned 24 hours before your booking</span>
            </div>
          )}
        </div>
      )}

      {/* Number of Devotees */}
      <div>
        <Label className="font-semibold mb-3 block">Number of Devotees</Label>
        <Input
          type="number"
          min="1"
          max="20"
          value={numDevotees}
          onChange={(e) => setNumDevotees(Number(e.target.value))}
        />
      </div>
    </div>
  );

  const renderSankalpDetails = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-2">Sankalp Details (Optional)</h4>
        <p className="text-sm text-amber-700">
          These details help the priest perform the Sankalp (sacred intention) correctly
        </p>
      </div>

      <div>
        <Label className="font-semibold mb-3 block">Family Members' Names</Label>
        {sankalpDetails.family_names.map((name, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Input
              placeholder={`Family member ${idx + 1}`}
              value={name}
              onChange={(e) => {
                const newNames = [...sankalpDetails.family_names];
                newNames[idx] = e.target.value;
                setSankalpDetails(prev => ({ ...prev, family_names: newNames }));
              }}
            />
            {idx === sankalpDetails.family_names.length - 1 && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSankalpDetails(prev => ({
                  ...prev,
                  family_names: [...prev.family_names, '']
                }))}
              >
                +
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Gotra (Optional)</Label>
          <Input
            placeholder="e.g., Kashyap"
            value={sankalpDetails.gotra}
            onChange={(e) => setSankalpDetails(prev => ({ ...prev, gotra: e.target.value }))}
          />
        </div>
        <div>
          <Label>Nakshatra (Optional)</Label>
          <Input
            placeholder="e.g., Rohini"
            value={sankalpDetails.nakshatra}
            onChange={(e) => setSankalpDetails(prev => ({ ...prev, nakshatra: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label className="font-semibold mb-3 block">Special Requirements</Label>
        <Textarea
          placeholder="Any special requests or requirements..."
          value={specialRequirements}
          onChange={(e) => setSpecialRequirements(e.target.value)}
          rows={3}
        />
      </div>

      {/* Price Summary */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Service Mode</span>
            <span className="font-medium capitalize">
              {serviceMode === 'virtual' ? 
                (virtualOption === 'with_devotee' ? 'Virtual (Live)' : 'Virtual (On Behalf)') :
                serviceMode === 'in_person' ? 
                (physicalOption === 'at_home' ? 'At Home' : 'At Temple') :
                'At Temple'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time</span>
            <span className="font-medium">
              {selectedDate && format(selectedDate, 'MMM d, yyyy')} • {selectedTimeSlot}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Base Price</span>
            <span>₹{pooja[`base_price_${serviceMode === 'in_person' ? 'in_person' : serviceMode}`] || 0}</span>
          </div>
          {itemsArrangedBy === 'priest' && pooja.items_arrangement_cost > 0 && (
            <div className="flex justify-between">
              <span>Items Arrangement</span>
              <span>₹{pooja.items_arrangement_cost}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t font-semibold text-lg">
            <span>Total (Held in Escrow)</span>
            <span className="text-amber-600">₹{calculatePrice()}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Payment will be held and released to priest after successful completion
        </p>
      </Card>
    </div>
  );

  if (bookingSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Congratulations!</h2>
            <p className="text-gray-600 mb-6">Your pooja has been booked successfully</p>
            
            <Card className="p-4 text-left bg-gray-50 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-mono">{bookingDetails?.booking?.id?.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span>{bookingDetails?.booking?.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span>{bookingDetails?.booking?.time_slot}</span>
                </div>
                {bookingDetails?.booking?.meeting_link && (
                  <div className="pt-2 border-t">
                    <p className="text-gray-500 mb-1">Meeting Link</p>
                    <p className="text-blue-600 text-xs break-all">{bookingDetails.booking.meeting_link}</p>
                  </div>
                )}
              </div>
            </Card>
            
            <Button onClick={onClose} className="w-full bg-amber-600 hover:bg-amber-700">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Book {pooja?.name}</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Select Service Mode' :
              currentStep === 2 ? 'Choose Date & Time' :
              'Confirm Details'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`flex-1 h-2 rounded-full ${
                step <= currentStep ? 'bg-amber-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="py-4">
          {currentStep === 1 && renderModeSelection()}
          {currentStep === 2 && renderDateTimeSelection()}
          {currentStep === 3 && renderSankalpDetails()}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={bookingMutation.isPending}
            className={`flex-1 ${currentStep === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {bookingMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : currentStep === 3 ? (
              <CreditCard className="w-4 h-4 mr-2" />
            ) : null}
            {currentStep === 3 ? 'Confirm & Pay' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}