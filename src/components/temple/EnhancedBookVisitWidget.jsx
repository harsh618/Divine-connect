import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  Calendar as CalendarIcon, 
  Users, 
  Hotel, 
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Check,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

import TimeSlotPicker from '../booking/TimeSlotPicker';

/**
 * Enhanced Book Visit Widget for Temple Detail Page
 * 
 * Features:
 * - Number of People input
 * - Date of Visit selection
 * - Priest Allocation Algorithm integration
 * - Cross-sell Hotels (if "Stay required" selected)
 */
export default function EnhancedBookVisitWidget({ 
  isOpen, 
  onClose, 
  temple 
}) {
  const queryClient = useQueryClient();
  
  // Booking details
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [numDevotees, setNumDevotees] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState('');
  
  // Hotel cross-sell
  const [needsHotel, setNeedsHotel] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  
  // Priest allocation
  const [allocatedPriest, setAllocatedPriest] = useState(null);
  const [isAllocating, setIsAllocating] = useState(false);
  
  // Success state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Fetch hotels near temple
  const { data: nearbyHotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels-near-temple', temple?.city],
    queryFn: async () => {
      const hotels = await base44.entities.Hotel.filter({
        is_deleted: false,
        is_active: true
      }, '-rating_average', 20);
      
      // Prioritize hotels in same city
      const cityHotels = hotels.filter(h => 
        h.city?.toLowerCase() === temple?.city?.toLowerCase()
      );
      
      return cityHotels.length > 0 ? cityHotels : hotels.slice(0, 6);
    },
    enabled: !!temple?.city && needsHotel
  });

  // Allocate priest based on priority algorithm
  const allocatePriest = async () => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    setIsAllocating(true);
    try {
      const response = await base44.functions.invoke('allocatePriest', {
        templeId: temple.id,
        serviceMode: 'temple',
        selectedDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot
      });
      
      if (response.data.success && response.data.allocatedPriest) {
        setAllocatedPriest(response.data);
      }
    } catch (error) {
      console.error('Priest allocation error:', error);
    }
    setIsAllocating(false);
  };

  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      allocatePriest();
    }
  }, [selectedDate, selectedTimeSlot]);

  // Calculate total cost
  const calculateTotal = () => {
    let total = 0;
    
    // Temple visit is usually free, but add hotel if selected
    if (selectedHotel && needsHotel) {
      const nights = isMultiDay && selectedEndDate ? 
        Math.ceil((selectedEndDate - selectedDate) / (1000 * 60 * 60 * 24)) : 1;
      const roomPrice = selectedHotel.room_inventory?.[0]?.price_per_night || 1500;
      total += roomPrice * nights;
    }
    
    return total;
  };

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      // Create temple visit booking
      const booking = await base44.entities.Booking.create({
        user_id: user.id,
        temple_id: temple.id,
        booking_type: 'temple_visit',
        date: format(selectedDate, 'yyyy-MM-dd'),
        time_slot: selectedTimeSlot,
        num_devotees: numDevotees,
        special_requirements: specialRequirements,
        provider_id: allocatedPriest?.allocatedPriest?.id || null,
        status: 'confirmed',
        payment_status: calculateTotal() > 0 ? 'pending' : 'completed',
        total_amount: calculateTotal(),
        service_mode: 'temple'
      });
      
      // If hotel selected, add to booking notes
      if (selectedHotel && needsHotel) {
        await base44.entities.Booking.update(booking.id, {
          special_requirements: `${specialRequirements ? specialRequirements + ' | ' : ''}Hotel: ${selectedHotel.name} (${selectedHotel.city})`
        });
      }
      
      // Send notification to priest
      if (allocatedPriest?.allocatedPriest?.id) {
        await base44.functions.invoke('sendBookingNotifications', {
          notificationType: 'new_booking',
          bookingId: booking.id
        });
      }
      
      return booking;
    },
    onSuccess: (data) => {
      setBookingDetails(data);
      setBookingSuccess(true);
      queryClient.invalidateQueries(['bookings']);
    },
    onError: (error) => {
      toast.error('Booking failed: ' + error.message);
    }
  });

  if (bookingSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 -m-6 mb-0 p-8 text-center text-white rounded-t-lg">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-white/80">Your temple visit has been booked</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Temple</span>
                <span className="font-semibold">{temple?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">{selectedDate && format(selectedDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold">{selectedTimeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Devotees</span>
                <span className="font-semibold">{numDevotees}</span>
              </div>
              {allocatedPriest?.allocatedPriest && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-500">Guide/Priest</span>
                  <span className="font-semibold">{allocatedPriest.allocatedPriest.display_name}</span>
                </div>
              )}
              {selectedHotel && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-500">Hotel</span>
                  <span className="font-semibold">{selectedHotel.name}</span>
                </div>
              )}
            </div>
            
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Book Your Visit</DialogTitle>
          <DialogDescription>
            Schedule your darshan at {temple?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div>
            <Label className="font-semibold mb-3 block">Select Visit Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (selectedEndDate && date > selectedEndDate) {
                  setSelectedEndDate(null);
                }
              }}
              disabled={(date) => date < new Date()}
              className="rounded-lg border"
            />
          </div>

          {/* Multi-day option */}
          <div className="flex items-center gap-2">
            <Checkbox 
              id="multiDay"
              checked={isMultiDay}
              onCheckedChange={(checked) => {
                setIsMultiDay(checked);
                if (!checked) setSelectedEndDate(null);
              }}
            />
            <Label htmlFor="multiDay" className="cursor-pointer">Multi-day visit</Label>
          </div>

          {isMultiDay && (
            <div className="animate-in slide-in-from-top-2">
              <Label className="font-semibold mb-3 block">End Date</Label>
              <Calendar
                mode="single"
                selected={selectedEndDate}
                onSelect={setSelectedEndDate}
                disabled={(date) => !selectedDate || date <= selectedDate}
                className="rounded-lg border"
              />
            </div>
          )}

          {/* Time Slot */}
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
                  <span className="text-blue-700">Assigning a guide/priest...</span>
                </div>
              ) : allocatedPriest?.success ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">
                      Guide: {allocatedPriest.allocatedPriest.display_name}
                    </p>
                    <p className="text-sm text-green-600">
                      {allocatedPriest.allocatedPriest.years_of_experience || 5}+ yrs • 
                      {allocatedPriest.allocatedPriest.rating_average || 4.5}★
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700">A guide will be assigned 24 hours before</span>
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

          {/* Hotel Cross-sell */}
          <div 
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              needsHotel ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
            }`}
            onClick={() => {
              setNeedsHotel(!needsHotel);
              if (needsHotel) setSelectedHotel(null);
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                needsHotel ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
              }`}>
                {needsHotel && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold">Need a place to stay?</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  View hotels near {temple?.city}
                </p>
              </div>
            </div>
          </div>

          {/* Hotel Selection */}
          {needsHotel && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <Label className="font-semibold">Select Hotel in {temple?.city}</Label>
              
              {hotelsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : nearbyHotels?.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {nearbyHotels.map((hotel) => {
                    const roomPrice = hotel.room_inventory?.[0]?.price_per_night || 1500;
                    return (
                      <div
                        key={hotel.id}
                        onClick={() => setSelectedHotel(hotel)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedHotel?.id === hotel.id 
                            ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' 
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={hotel.thumbnail_url || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                            alt={hotel.name}
                            className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-gray-800 truncate">{hotel.name}</h4>
                              {selectedHotel?.id === hotel.id && (
                                <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              {hotel.city}
                              <span>•</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {hotel.rating_average || 4.5}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex gap-1">
                                {hotel.amenities?.slice(0, 3).map((a, i) => (
                                  <span key={i} className="text-xs text-gray-400">
                                    {a.toLowerCase() === 'wifi' && <Wifi className="w-3 h-3" />}
                                    {a.toLowerCase() === 'parking' && <Car className="w-3 h-3" />}
                                    {a.toLowerCase() === 'restaurant' && <Utensils className="w-3 h-3" />}
                                  </span>
                                ))}
                              </div>
                              <span className="font-semibold text-orange-600">₹{roomPrice}/night</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No hotels available</p>
              )}
            </div>
          )}

          {/* Special Requirements */}
          <div>
            <Label className="font-semibold mb-3 block">Special Requirements (Optional)</Label>
            <Textarea
              placeholder="Wheelchair access, elderly assistance, etc."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              rows={2}
            />
          </div>

          {/* Price Summary */}
          {(selectedHotel || calculateTotal() > 0) && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <h4 className="font-semibold mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Temple Visit</span>
                  <span className="text-green-600">Free</span>
                </div>
                {selectedHotel && (
                  <div className="flex justify-between">
                    <span>{selectedHotel.name}</span>
                    <span>₹{selectedHotel.room_inventory?.[0]?.price_per_night || 1500}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-orange-200 font-semibold">
                  <span>Total</span>
                  <span className="text-orange-600">₹{calculateTotal()}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={() => bookingMutation.mutate()}
            disabled={!selectedDate || !selectedTimeSlot || bookingMutation.isPending || (needsHotel && !selectedHotel)}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {bookingMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}