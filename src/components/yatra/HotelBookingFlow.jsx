import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  BedDouble,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Utensils,
  Car,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  CreditCard
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { toast } from 'sonner';

const ADD_ON_SERVICES = [
  { id: 'lunch', name: 'Lunch Package', pricePerPerson: 300, icon: Utensils },
  { id: 'dinner', name: 'Dinner Package', pricePerPerson: 400, icon: Utensils },
  { id: 'pickup', name: 'Airport/Station Pickup', price: 800, icon: Car },
  { id: 'guide', name: 'Temple Guide Service', pricePerDay: 500, icon: User },
  { id: 'laundry', name: 'Laundry Service', pricePerDay: 200, icon: FileText },
  { id: 'yoga', name: 'Yoga Session', pricePerPerson: 300, icon: User }
];

export default function HotelBookingFlow({ hotel, room, checkIn, checkOut, guests, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [numRooms, setNumRooms] = useState(1);
  const [extraBed, setExtraBed] = useState(false);
  const [addOns, setAddOns] = useState([]);
  const [guestDetails, setGuestDetails] = useState({
    primary: {
      fullName: '',
      mobile: '',
      email: '',
      dob: '',
      idType: 'aadhaar',
      idNumber: ''
    },
    additional: []
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pay_now');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const nights = differenceInDays(checkOut, checkIn) || 1;
  const totalGuests = guests.adults + guests.children + guests.seniors + guests.infants;

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setGuestDetails(prev => ({
            ...prev,
            primary: {
              ...prev.primary,
              fullName: userData.full_name || '',
              email: userData.email || ''
            }
          }));
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  // Calculate prices
  const roomCharge = (room?.price_per_night || 0) * nights * numRooms;
  const extraBedCharge = extraBed ? 500 * nights : 0;
  const addOnsCharge = addOns.reduce((sum, addOn) => {
    const service = ADD_ON_SERVICES.find(s => s.id === addOn);
    if (!service) return sum;
    if (service.pricePerPerson) return sum + (service.pricePerPerson * totalGuests * nights);
    if (service.pricePerDay) return sum + (service.pricePerDay * nights);
    return sum + (service.price || 0);
  }, 0);
  const subtotal = roomCharge + extraBedCharge + addOnsCharge;
  const taxes = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + taxes;

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Booking.create({
        booking_type: 'hotel',
        temple_id: hotel.id, // Using temple_id for hotel reference
        date: format(checkIn, 'yyyy-MM-dd'),
        delivery_date: format(checkOut, 'yyyy-MM-dd'),
        num_devotees: totalGuests,
        total_amount: totalAmount,
        status: paymentMethod === 'pay_now' ? 'confirmed' : 'pending',
        payment_status: paymentMethod === 'pay_now' ? 'completed' : 'pending',
        delivery_address: {
          full_name: guestDetails.primary.fullName,
          phone: guestDetails.primary.mobile,
          address_line1: hotel.name,
          city: hotel.city,
          state: hotel.state
        },
        special_requirements: `Room: ${room?.room_type} | Rooms: ${numRooms} | Extra Bed: ${extraBed ? 'Yes' : 'No'} | Add-ons: ${addOns.join(', ') || 'None'} | Notes: ${specialRequests}`,
        user_id: user.id
      });
    },
    onSuccess: (booking) => {
      setBookingDetails(booking);
      setBookingComplete(true);
      queryClient.invalidateQueries(['user-bookings']);
      toast.success('Booking confirmed!');
    }
  });

  const handleBook = () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    createBookingMutation.mutate();
  };

  const addAdditionalGuest = () => {
    setGuestDetails(prev => ({
      ...prev,
      additional: [...prev.additional, { fullName: '', age: '', relation: '' }]
    }));
  };

  const resetAndClose = () => {
    setStep(1);
    setAddOns([]);
    setSpecialRequests('');
    setAgreedToTerms(false);
    setBookingComplete(false);
    setBookingDetails(null);
    onOpenChange(false);
  };

  // Success Screen
  if (bookingComplete) {
    return (
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-2">Booking ID: {bookingDetails?.id?.slice(0, 12)}</p>

            <Card className="p-4 text-left mb-6 bg-orange-50 mt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotel</span>
                  <span className="font-medium">{hotel?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room</span>
                  <span className="font-medium">{room?.room_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{format(checkIn, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{format(checkOut, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{totalGuests}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Amount</span>
                  <span className="text-orange-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Voucher (PDF)
              </Button>
              <p className="text-xs text-gray-500">
                Confirmation email sent to {guestDetails.primary.email}
              </p>
              <Button onClick={resetAndClose} className="w-full bg-orange-500 hover:bg-orange-600">
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
          <DialogTitle>Book {hotel?.name}</DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s < step ? 'bg-orange-500 text-white' :
                s === step ? 'bg-orange-100 text-orange-600 border-2 border-orange-500' :
                'bg-gray-100 text-gray-400'
              }`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 5 && <div className={`w-6 h-0.5 ${s < step ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Room Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Room Selection</h3>
            
            <Card className="p-4 bg-orange-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{room?.room_type}</h4>
                  <p className="text-sm text-gray-600">Max {room?.max_occupancy || 2} guests</p>
                </div>
                <p className="text-xl font-bold text-orange-600">₹{room?.price_per_night?.toLocaleString()}/night</p>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-xs text-gray-500">Check-in</Label>
                <p className="font-semibold">{format(checkIn, 'PPP')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-xs text-gray-500">Check-out</Label>
                <p className="font-semibold">{format(checkOut, 'PPP')}</p>
              </div>
            </div>

            <div>
              <Label>Number of Rooms</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button variant="outline" size="icon" onClick={() => setNumRooms(Math.max(1, numRooms - 1))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold w-8 text-center">{numRooms}</span>
                <Button variant="outline" size="icon" onClick={() => setNumRooms(numRooms + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Extra Bed</p>
                <p className="text-sm text-gray-500">₹500 per night</p>
              </div>
              <Checkbox checked={extraBed} onCheckedChange={setExtraBed} />
            </div>

            <Card className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>₹{room?.price_per_night?.toLocaleString()} × {nights} nights × {numRooms} rooms</span>
                  <span>₹{roomCharge.toLocaleString()}</span>
                </div>
                {extraBed && (
                  <div className="flex justify-between">
                    <span>Extra bed × {nights} nights</span>
                    <span>₹{extraBedCharge.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Add-on Services */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Add-on Services (Optional)</h3>
            
            <div className="space-y-3">
              {ADD_ON_SERVICES.map((service) => {
                const Icon = service.icon;
                const isSelected = addOns.includes(service.id);
                let price = service.price || 0;
                if (service.pricePerPerson) price = service.pricePerPerson * totalGuests * nights;
                if (service.pricePerDay) price = service.pricePerDay * nights;
                
                return (
                  <div 
                    key={service.id}
                    onClick={() => {
                      setAddOns(prev => 
                        prev.includes(service.id) 
                          ? prev.filter(a => a !== service.id)
                          : [...prev, service.id]
                      );
                    }}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <Icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-gray-500">
                          {service.pricePerPerson ? `₹${service.pricePerPerson}/person/day` :
                           service.pricePerDay ? `₹${service.pricePerDay}/day` :
                           'One-time'}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-orange-600">₹{price.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Guest Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Guest Details</h3>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Primary Guest</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={guestDetails.primary.fullName}
                    onChange={(e) => setGuestDetails({
                      ...guestDetails,
                      primary: { ...guestDetails.primary, fullName: e.target.value }
                    })}
                    placeholder="As per ID"
                  />
                </div>
                <div>
                  <Label>Mobile Number *</Label>
                  <Input
                    value={guestDetails.primary.mobile}
                    onChange={(e) => setGuestDetails({
                      ...guestDetails,
                      primary: { ...guestDetails.primary, mobile: e.target.value }
                    })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={guestDetails.primary.email}
                    onChange={(e) => setGuestDetails({
                      ...guestDetails,
                      primary: { ...guestDetails.primary, email: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>ID Type</Label>
                  <Select 
                    value={guestDetails.primary.idType}
                    onValueChange={(v) => setGuestDetails({
                      ...guestDetails,
                      primary: { ...guestDetails.primary, idType: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driving">Driving License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>ID Number</Label>
                  <Input
                    value={guestDetails.primary.idNumber}
                    onChange={(e) => setGuestDetails({
                      ...guestDetails,
                      primary: { ...guestDetails.primary, idNumber: e.target.value }
                    })}
                    placeholder="Will be verified at check-in"
                  />
                </div>
              </div>

              {/* Additional Guests */}
              {guestDetails.additional.map((guest, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <h5 className="font-medium">Guest {idx + 2}</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="Full Name" value={guest.fullName} onChange={(e) => {
                      const updated = [...guestDetails.additional];
                      updated[idx].fullName = e.target.value;
                      setGuestDetails({ ...guestDetails, additional: updated });
                    }} />
                    <Input placeholder="Age" type="number" value={guest.age} onChange={(e) => {
                      const updated = [...guestDetails.additional];
                      updated[idx].age = e.target.value;
                      setGuestDetails({ ...guestDetails, additional: updated });
                    }} />
                    <Input placeholder="Relation" value={guest.relation} onChange={(e) => {
                      const updated = [...guestDetails.additional];
                      updated[idx].relation = e.target.value;
                      setGuestDetails({ ...guestDetails, additional: updated });
                    }} />
                  </div>
                </div>
              ))}
              
              {totalGuests > 1 && guestDetails.additional.length < totalGuests - 1 && (
                <Button variant="outline" onClick={addAdditionalGuest} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guest Details
                </Button>
              )}

              <div>
                <Label>Special Requests</Label>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Room preferences, dietary restrictions, medical needs, arrival time..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review Booking</h3>
            
            <Card className="p-4">
              <h4 className="font-medium mb-3">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property</span>
                  <span className="font-medium">{hotel?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Type</span>
                  <span className="font-medium">{room?.room_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{format(checkIn, 'PPP')}, 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{format(checkOut, 'PPP')}, 10:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{totalGuests}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Price Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Room charges</span>
                  <span>₹{roomCharge.toLocaleString()}</span>
                </div>
                {extraBed && (
                  <div className="flex justify-between">
                    <span>Extra bed</span>
                    <span>₹{extraBedCharge.toLocaleString()}</span>
                  </div>
                )}
                {addOnsCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Add-ons</span>
                    <span>₹{addOnsCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (18% GST)</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                  <span>Total Payable</span>
                  <span className="text-orange-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <div className="p-4 bg-green-50 rounded-lg text-sm">
              <p className="font-medium text-green-800">Cancellation Policy</p>
              <p className="text-green-700">Free cancellation until 24 hours before check-in</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={agreedToTerms} onCheckedChange={setAgreedToTerms} />
                <span className="text-sm">I agree to property rules and cancellation policy</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Payment</h3>
            
            <div className="space-y-3">
              <div 
                onClick={() => setPaymentMethod('pay_now')}
                className={`p-4 rounded-lg border-2 cursor-pointer ${
                  paymentMethod === 'pay_now' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold">Pay Now</p>
                    <p className="text-sm text-gray-500">Pay full amount now via UPI/Card/Net Banking</p>
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => setPaymentMethod('pay_later')}
                className={`p-4 rounded-lg border-2 cursor-pointer ${
                  paymentMethod === 'pay_later' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BedDouble className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold">Pay at Property</p>
                    <p className="text-sm text-gray-500">Card required for guarantee. Pay cash/card at check-in</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-4 bg-orange-50">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-orange-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {step < 5 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleBook}
              disabled={createBookingMutation.isPending || !agreedToTerms}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createBookingMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {paymentMethod === 'pay_now' ? `Pay ₹${totalAmount.toLocaleString()}` : 'Confirm Booking'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}