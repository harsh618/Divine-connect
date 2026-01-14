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
import { Checkbox } from "@/components/ui/checkbox";
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
  Plus,
  Minus,
  Upload,
  Star,
  Home,
  Building2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Tag,
  Mic,
  Camera,
  Share2,
  ChevronRight,
  ChevronLeft,
  Hotel,
  Car,
  Wifi,
  Utensils
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import TimeSlotPicker from './TimeSlotPicker';

const LANGUAGES = ['Sanskrit', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Marathi'];
const RELATIONS = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

export default function ComprehensivePoojaBooking({ 
  isOpen, 
  onClose, 
  pooja
}) {
  const queryClient = useQueryClient();
  
  // Step tracking (1-6)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Service Mode
  const [serviceMode, setServiceMode] = useState(null); // virtual_live, virtual_behalf, temple, home
  
  // Step 2: Date & Time
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [useAuspiciousTime, setUseAuspiciousTime] = useState(false);
  
  // Step 3: Participants
  const [participants, setParticipants] = useState([{
    name: '',
    relation: 'Self',
    dob: '',
    gotra: '',
    nakshatra: ''
  }]);
  
  // Step 4: Materials & Venue
  const [materialsBy, setMaterialsBy] = useState('priest'); // user, priest, temple
  const [specialMaterialRequests, setSpecialMaterialRequests] = useState('');
  const [venueAddress, setVenueAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    venueType: 'apartment',
    hasParkingForPriest: true
  });
  
  // Step 5: Add-ons & Preferences
  const [mantrasLanguage, setMantrasLanguage] = useState('Sanskrit');
  const [needsRecording, setNeedsRecording] = useState(false);
  const [shareLiveEmails, setShareLiveEmails] = useState(['']);
  const [priestSelection, setPriestSelection] = useState('auto'); // auto, manual
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [priestFilters, setPriestFilters] = useState({
    language: '',
    minExperience: 0,
    minRating: 0
  });
  const [specialRequirements, setSpecialRequirements] = useState('');
  
  // Step 6: Payment
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Temple & Hotel (if temple mode)
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [needsHotel, setNeedsHotel] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [numRooms, setNumRooms] = useState(1);
  
  // Allocation
  const [allocatedPriest, setAllocatedPriest] = useState(null);
  const [isAllocating, setIsAllocating] = useState(false);
  
  // Success state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Fetch temples
  const { data: temples } = useQuery({
    queryKey: ['temples-for-booking'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_hidden: false }, 'name', 50),
    enabled: serviceMode === 'temple'
  });

  // Fetch priests for manual selection
  const { data: availablePriests, isLoading: priestsLoading } = useQuery({
    queryKey: ['available-priests', priestFilters],
    queryFn: async () => {
      let priests = await base44.entities.ProviderProfile.filter({
        provider_type: 'priest',
        is_deleted: false,
        is_verified: true,
        is_hidden: false
      }, '-rating_average', 50);
      
      if (priestFilters.language) {
        priests = priests.filter(p => p.languages?.includes(priestFilters.language));
      }
      if (priestFilters.minExperience > 0) {
        priests = priests.filter(p => (p.years_of_experience || 0) >= priestFilters.minExperience);
      }
      if (priestFilters.minRating > 0) {
        priests = priests.filter(p => (p.rating_average || 0) >= priestFilters.minRating);
      }
      
      return priests;
    },
    enabled: priestSelection === 'manual' && currentStep === 5
  });

  // Fetch hotels near temple
  const { data: nearbyHotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels-near-temple', selectedTemple?.city],
    queryFn: async () => {
      const hotels = await base44.entities.Hotel.filter({ is_deleted: false }, '-rating_average', 20);
      const cityHotels = hotels.filter(h => h.city?.toLowerCase() === selectedTemple?.city?.toLowerCase());
      return cityHotels.length > 0 ? cityHotels : hotels.slice(0, 6);
    },
    enabled: !!selectedTemple?.city && needsHotel && serviceMode === 'temple'
  });

  // Calculate price
  const calculatePrice = () => {
    let basePrice = 0;
    
    if (serviceMode === 'virtual_live' || serviceMode === 'virtual_behalf') {
      basePrice = pooja?.base_price_virtual || 0;
    } else if (serviceMode === 'home') {
      basePrice = pooja?.base_price_in_person || 0;
    } else if (serviceMode === 'temple') {
      basePrice = pooja?.base_price_temple || 0;
    }
    
    // Materials cost
    if (materialsBy === 'priest' && pooja?.items_arrangement_cost) {
      basePrice += pooja.items_arrangement_cost;
    }
    
    // Recording cost
    if (needsRecording) {
      basePrice += 500;
    }
    
    // Hotel cost
    if (selectedHotel && selectedRoom) {
      basePrice += selectedRoom.price_per_night * numRooms;
    }
    
    // Apply coupon
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        basePrice = basePrice * (1 - appliedCoupon.value / 100);
      } else {
        basePrice = Math.max(0, basePrice - appliedCoupon.value);
      }
    }
    
    // GST (18%)
    const gst = Math.round(basePrice * 0.18);
    
    return {
      subtotal: basePrice,
      gst,
      total: basePrice + gst
    };
  };

  // Allocate priest
  const allocatePriest = async () => {
    if (!selectedDate || !selectedTimeSlot || priestSelection === 'manual') return;
    
    setIsAllocating(true);
    try {
      const response = await base44.functions.invoke('allocatePriest', {
        poojaId: pooja?.id,
        templeId: selectedTemple?.id,
        serviceMode: serviceMode,
        selectedDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot,
        userCity: venueAddress.city || selectedTemple?.city
      });
      
      if (response.data?.success && response.data?.allocatedPriest) {
        setAllocatedPriest(response.data);
      }
    } catch (error) {
      console.error('Allocation error:', error);
    }
    setIsAllocating(false);
  };

  useEffect(() => {
    if (selectedDate && selectedTimeSlot && currentStep >= 2) {
      allocatePriest();
    }
  }, [selectedDate, selectedTimeSlot]);

  // Apply coupon
  const applyCoupon = () => {
    // Demo coupon logic
    if (couponCode.toUpperCase() === 'DIVINE10') {
      setAppliedCoupon({ code: 'DIVINE10', type: 'percentage', value: 10 });
      toast.success('10% discount applied!');
    } else if (couponCode.toUpperCase() === 'FIRST500') {
      setAppliedCoupon({ code: 'FIRST500', type: 'flat', value: 500 });
      toast.success('₹500 discount applied!');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const prices = calculatePrice();
      
      const bookingData = {
        user_id: user.id,
        pooja_id: pooja?.id,
        booking_type: 'pooja',
        service_mode: serviceMode,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time_slot: selectedTimeSlot,
        num_devotees: participants.length,
        sankalp_details: {
          family_names: participants.map(p => p.name),
          gotra: participants[0]?.gotra,
          nakshatra: participants[0]?.nakshatra,
          participants: participants
        },
        location: serviceMode === 'home' ? 
          `${venueAddress.line1}, ${venueAddress.line2}, ${venueAddress.city}, ${venueAddress.state} - ${venueAddress.pincode}` : 
          null,
        items_arranged_by: materialsBy,
        special_requirements: [
          specialRequirements,
          specialMaterialRequests ? `Materials: ${specialMaterialRequests}` : '',
          `Mantras in: ${mantrasLanguage}`,
          needsRecording ? 'Recording requested' : '',
          shareLiveEmails.filter(e => e).length > 0 ? `Share with: ${shareLiveEmails.filter(e => e).join(', ')}` : ''
        ].filter(Boolean).join(' | '),
        provider_id: priestSelection === 'manual' ? selectedPriest?.id : allocatedPriest?.allocatedPriest?.id,
        temple_id: serviceMode === 'temple' ? selectedTemple?.id : null,
        total_amount: prices.total,
        status: 'confirmed',
        payment_status: 'completed'
      };

      return base44.entities.Booking.create(bookingData);
    },
    onSuccess: (data) => {
      setBookingDetails(data);
      setBookingSuccess(true);
      queryClient.invalidateQueries(['bookings']);
      toast.success('Booking confirmed!');
    },
    onError: (error) => {
      toast.error('Booking failed: ' + (error.message || 'Unknown error'));
    }
  });

  // Participant management
  const addParticipant = () => {
    setParticipants([...participants, { name: '', relation: 'Other', dob: '', gotra: '', nakshatra: '' }]);
  };

  const removeParticipant = (idx) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== idx));
    }
  };

  const updateParticipant = (idx, field, value) => {
    const updated = [...participants];
    updated[idx] = { ...updated[idx], [field]: value };
    setParticipants(updated);
  };

  // Validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!serviceMode && (serviceMode !== 'temple' || !!selectedTemple);
      case 2:
        return !!selectedDate && !!selectedTimeSlot;
      case 3:
        return participants.every(p => p.name.trim());
      case 4:
        if (serviceMode === 'home') {
          return venueAddress.line1 && venueAddress.city && venueAddress.pincode;
        }
        return true;
      case 5:
        return priestSelection === 'auto' || !!selectedPriest;
      case 6:
        return agreeTerms;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Please complete all required fields');
      return;
    }
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      bookingMutation.mutate();
    }
  };

  // Render Steps
  const renderStep1_ServiceMode = () => (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">How would you like to do the pooja?</Label>
      
      <RadioGroup value={serviceMode} onValueChange={setServiceMode}>
        {/* Virtual with participation */}
        {pooja?.base_price_virtual > 0 && (
          <div className={`p-4 rounded-xl border-2 transition-all ${
            serviceMode === 'virtual_live' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
          }`}>
            <div className="flex items-start gap-3">
              <RadioGroupItem value="virtual_live" id="virtual_live" className="mt-1" />
              <Label htmlFor="virtual_live" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">Virtual - I will participate live</span>
                </div>
                <p className="text-sm text-gray-600">Join online via video call. Link sent 24 hours prior.</p>
                <Badge className="mt-2 bg-purple-100 text-purple-700">₹{pooja.base_price_virtual}</Badge>
              </Label>
            </div>
          </div>
        )}

        {/* Virtual without participation */}
        {pooja?.base_price_virtual > 0 && (
          <div className={`p-4 rounded-xl border-2 transition-all ${
            serviceMode === 'virtual_behalf' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
          }`}>
            <div className="flex items-start gap-3">
              <RadioGroupItem value="virtual_behalf" id="virtual_behalf" className="mt-1" />
              <Label htmlFor="virtual_behalf" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <EyeOff className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">Virtual - Performed on my behalf</span>
                </div>
                <p className="text-sm text-gray-600">Priest performs the pooja. Recording sent later.</p>
                <Badge className="mt-2 bg-purple-100 text-purple-700">₹{pooja.base_price_virtual}</Badge>
              </Label>
            </div>
          </div>
        )}

        {/* At Temple */}
        {pooja?.base_price_temple > 0 && (
          <div className={`p-4 rounded-xl border-2 transition-all ${
            serviceMode === 'temple' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
          }`}>
            <div className="flex items-start gap-3">
              <RadioGroupItem value="temple" id="temple" className="mt-1" />
              <Label htmlFor="temple" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold">Physical - At Temple</span>
                  <Badge className="bg-green-100 text-green-700 text-xs">Recommended</Badge>
                </div>
                <p className="text-sm text-gray-600">Visit the temple. Materials provided there.</p>
                <Badge className="mt-2 bg-amber-100 text-amber-700">₹{pooja.base_price_temple}</Badge>
              </Label>
            </div>
          </div>
        )}

        {/* At Home */}
        {pooja?.base_price_in_person > 0 && (
          <div className={`p-4 rounded-xl border-2 transition-all ${
            serviceMode === 'home' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
          }`}>
            <div className="flex items-start gap-3">
              <RadioGroupItem value="home" id="home" className="mt-1" />
              <Label htmlFor="home" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold">Physical - At My Home</span>
                </div>
                <p className="text-sm text-gray-600">Priest comes to your place. Address required.</p>
                <Badge className="mt-2 bg-orange-100 text-orange-700">₹{pooja.base_price_in_person}</Badge>
              </Label>
            </div>
          </div>
        )}
      </RadioGroup>

      {/* Temple Selection */}
      {serviceMode === 'temple' && (
        <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
          <Label className="font-medium">Select Temple</Label>
          <Select value={selectedTemple?.id || ''} onValueChange={(val) => {
            const temple = temples?.find(t => t.id === val);
            setSelectedTemple(temple);
            setSelectedHotel(null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a temple" />
            </SelectTrigger>
            <SelectContent>
              {temples?.map((temple) => (
                <SelectItem key={temple.id} value={temple.id}>
                  {temple.name} - {temple.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Hotel Cross-sell */}
          {selectedTemple && (
            <div 
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                needsHotel ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => setNeedsHotel(!needsHotel)}
            >
              <div className="flex items-center gap-3">
                <Checkbox checked={needsHotel} />
                <div>
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Need accommodation?</span>
                  </div>
                  <p className="text-xs text-gray-500">View hotels near {selectedTemple.city}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Selection */}
          {needsHotel && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              {hotelsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : nearbyHotels?.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {nearbyHotels.map((hotel) => {
                    const startPrice = Math.min(...(hotel.room_inventory?.map(r => r.price_per_night) || [1500]));
                    return (
                      <div
                        key={hotel.id}
                        onClick={() => { setSelectedHotel(hotel); setSelectedRoom(null); }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedHotel?.id === hotel.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={hotel.thumbnail_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                            className="w-16 h-14 rounded-lg object-cover"
                            alt={hotel.name}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold truncate">{hotel.name}</h4>
                              {selectedHotel?.id === hotel.id && <CheckCircle className="w-4 h-4 text-orange-500" />}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {hotel.rating_average || 4.5}
                            </div>
                            <p className="text-sm text-orange-600 font-semibold">from ₹{startPrice}/night</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No hotels available</p>
              )}

              {/* Room Selection */}
              {selectedHotel?.room_inventory?.length > 0 && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
                  <Label className="font-medium">Select Room Type</Label>
                  {selectedHotel.room_inventory.map((room, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-3 rounded-lg border cursor-pointer ${
                        selectedRoom?.room_type === room.room_type ? 'border-orange-500 bg-orange-100' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{room.room_type}</p>
                          <p className="text-xs text-gray-500">Max {room.max_occupancy || 2} guests</p>
                        </div>
                        <p className="font-bold text-orange-600">₹{room.price_per_night}/night</p>
                      </div>
                    </div>
                  ))}
                  
                  {selectedRoom && (
                    <div className="flex items-center justify-between pt-2">
                      <Label>Number of Rooms</Label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNumRooms(Math.max(1, numRooms - 1))}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{numRooms}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNumRooms(numRooms + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2_DateTime = () => (
    <div className="space-y-4">
      <div>
        <Label className="font-semibold mb-3 block">Select Date</Label>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => date < addDays(new Date(), pooja?.min_notice_days || 1)}
          className="rounded-lg border"
        />
        {pooja?.min_notice_days > 1 && (
          <p className="text-xs text-gray-500 mt-2">Minimum {pooja.min_notice_days} days advance booking required</p>
        )}
      </div>

      <TimeSlotPicker
        value={selectedTimeSlot}
        onChange={setSelectedTimeSlot}
        label="Select Time"
      />

      {pooja?.best_time && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <Checkbox
            checked={useAuspiciousTime}
            onCheckedChange={setUseAuspiciousTime}
          />
          <div>
            <p className="font-medium text-amber-800">Use Auspicious Time</p>
            <p className="text-xs text-amber-600">{pooja.best_time}</p>
          </div>
        </div>
      )}

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
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">{allocatedPriest.allocatedPriest.display_name}</p>
                <p className="text-sm text-green-600">
                  {allocatedPriest.allocatedPriest.years_of_experience || 5}+ years • {allocatedPriest.allocatedPriest.rating_average || 4.5}★
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
    </div>
  );

  const renderStep3_Participants = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Participants ({participants.length})</Label>
        <Button variant="outline" size="sm" onClick={addParticipant}>
          <Plus className="w-4 h-4 mr-1" /> Add Person
        </Button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {participants.map((participant, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline">Person {idx + 1}</Badge>
              {idx > 0 && (
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeParticipant(idx)}>
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Full Name *</Label>
                <Input
                  placeholder="Enter name"
                  value={participant.name}
                  onChange={(e) => updateParticipant(idx, 'name', e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs">Relation</Label>
                <Select value={participant.relation} onValueChange={(v) => updateParticipant(idx, 'relation', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RELATIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Date of Birth</Label>
                <Input
                  type="date"
                  value={participant.dob}
                  onChange={(e) => updateParticipant(idx, 'dob', e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs">Gotra (optional)</Label>
                <Input
                  placeholder="e.g., Kashyap"
                  value={participant.gotra}
                  onChange={(e) => updateParticipant(idx, 'gotra', e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs">Nakshatra (optional)</Label>
                <Select value={participant.nakshatra} onValueChange={(v) => updateParticipant(idx, 'nakshatra', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {NAKSHATRAS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep4_Materials = () => (
    <div className="space-y-6">
      {/* Materials Arrangement */}
      <div>
        <Label className="font-semibold mb-3 block">Who will arrange Pooja Items (Samagri)?</Label>
        <RadioGroup value={materialsBy} onValueChange={setMaterialsBy}>
          <div className={`p-3 rounded-lg border ${materialsBy === 'user' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="user" id="user_mat" />
              <Label htmlFor="user_mat" className="cursor-pointer flex-1">
                <span className="font-medium">I will arrange everything</span>
              </Label>
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${materialsBy === 'priest' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="priest" id="priest_mat" />
              <Label htmlFor="priest_mat" className="cursor-pointer flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">Priest will bring items</span>
                  {pooja?.items_arrangement_cost > 0 && (
                    <span className="text-amber-600 font-semibold">+₹{pooja.items_arrangement_cost}</span>
                  )}
                </div>
              </Label>
            </div>
          </div>
          {serviceMode === 'temple' && (
            <div className={`p-3 rounded-lg border ${materialsBy === 'temple' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="temple" id="temple_mat" />
                <Label htmlFor="temple_mat" className="cursor-pointer">
                  <span className="font-medium">Temple will provide (included)</span>
                </Label>
              </div>
            </div>
          )}
        </RadioGroup>
      </div>

      {/* Special Material Requests */}
      <div>
        <Label className="font-medium mb-2 block">Special Material Requests (optional)</Label>
        <Textarea
          placeholder="e.g., Need specific type of flowers, organic ghee, etc."
          value={specialMaterialRequests}
          onChange={(e) => setSpecialMaterialRequests(e.target.value)}
          rows={2}
        />
      </div>

      {/* Venue Details for Home */}
      {serviceMode === 'home' && (
        <div className="space-y-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <h4 className="font-semibold flex items-center gap-2">
            <Home className="w-5 h-5 text-orange-600" />
            Venue Details
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Address Line 1 *</Label>
              <Input
                placeholder="House/Flat number, Building name"
                value={venueAddress.line1}
                onChange={(e) => setVenueAddress({ ...venueAddress, line1: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Address Line 2</Label>
              <Input
                placeholder="Street, Area"
                value={venueAddress.line2}
                onChange={(e) => setVenueAddress({ ...venueAddress, line2: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">City *</Label>
                <Input
                  placeholder="City"
                  value={venueAddress.city}
                  onChange={(e) => setVenueAddress({ ...venueAddress, city: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Pincode *</Label>
                <Input
                  placeholder="PIN Code"
                  value={venueAddress.pincode}
                  onChange={(e) => setVenueAddress({ ...venueAddress, pincode: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Venue Type</Label>
              <Select value={venueAddress.venueType} onValueChange={(v) => setVenueAddress({ ...venueAddress, venueType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="independent">Independent House</SelectItem>
                  <SelectItem value="farmhouse">Farmhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={venueAddress.hasParkingForPriest}
                onCheckedChange={(v) => setVenueAddress({ ...venueAddress, hasParkingForPriest: v })}
              />
              <Label className="text-sm">Parking available for priest</Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep5_Preferences = () => (
    <div className="space-y-6">
      {/* Mantras Language */}
      <div>
        <Label className="font-semibold mb-3 block">Language for Mantras</Label>
        <Select value={mantrasLanguage} onValueChange={setMantrasLanguage}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Recording Option */}
      <div className={`p-4 rounded-xl border-2 cursor-pointer ${needsRecording ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
        onClick={() => setNeedsRecording(!needsRecording)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox checked={needsRecording} />
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Need Recording?</span>
              </div>
              <p className="text-xs text-gray-500">Video of the pooja will be shared</p>
            </div>
          </div>
          <span className="text-purple-600 font-semibold">+₹500</span>
        </div>
      </div>

      {/* Share Live Link */}
      {(serviceMode === 'virtual_live' || serviceMode === 'virtual_behalf') && (
        <div className="space-y-3">
          <Label className="font-semibold">Share Live Link with Family (optional)</Label>
          {shareLiveEmails.map((email, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  const updated = [...shareLiveEmails];
                  updated[idx] = e.target.value;
                  setShareLiveEmails(updated);
                }}
              />
              {idx === shareLiveEmails.length - 1 && (
                <Button variant="outline" size="icon" onClick={() => setShareLiveEmails([...shareLiveEmails, ''])}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Priest Selection */}
      <div>
        <Label className="font-semibold mb-3 block">Priest Selection</Label>
        <RadioGroup value={priestSelection} onValueChange={setPriestSelection}>
          <div className={`p-3 rounded-lg border ${priestSelection === 'auto' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="auto" id="auto_priest" />
              <Label htmlFor="auto_priest" className="cursor-pointer">
                <span className="font-medium">Auto-assign (Recommended)</span>
                <p className="text-xs text-gray-500">Best available priest based on your preferences</p>
              </Label>
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${priestSelection === 'manual' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="manual" id="manual_priest" />
              <Label htmlFor="manual_priest" className="cursor-pointer">
                <span className="font-medium">Choose Manually</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Manual Priest Selection */}
      {priestSelection === 'manual' && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-3 gap-2">
            <Select value={priestFilters.language} onValueChange={(v) => setPriestFilters({ ...priestFilters, language: v })}>
              <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Any</SelectItem>
                {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(priestFilters.minExperience)} onValueChange={(v) => setPriestFilters({ ...priestFilters, minExperience: Number(v) })}>
              <SelectTrigger><SelectValue placeholder="Experience" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="5">5+ years</SelectItem>
                <SelectItem value="10">10+ years</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(priestFilters.minRating)} onValueChange={(v) => setPriestFilters({ ...priestFilters, minRating: Number(v) })}>
              <SelectTrigger><SelectValue placeholder="Rating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {priestsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {availablePriests?.map((priest) => (
                <div
                  key={priest.id}
                  onClick={() => setSelectedPriest(priest)}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    selectedPriest?.id === priest.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      {priest.avatar_url ? (
                        <img src={priest.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          {priest.display_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{priest.display_name}</p>
                        {selectedPriest?.id === priest.id && <CheckCircle className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{priest.years_of_experience || 5}+ yrs</span>
                        <span>•</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{priest.rating_average || 4.5}</span>
                      </div>
                      <p className="text-xs text-gray-400">{priest.languages?.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Special Requirements */}
      <div>
        <Label className="font-medium mb-2 block">Special Requirements (optional)</Label>
        <Textarea
          placeholder="Any other requests..."
          value={specialRequirements}
          onChange={(e) => setSpecialRequirements(e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );

  const renderStep6_Payment = () => {
    const prices = calculatePrice();
    
    return (
      <div className="space-y-6">
        {/* Price Breakdown */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-semibold mb-4">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Pooja Fee</span>
              <span>₹{serviceMode === 'virtual_live' || serviceMode === 'virtual_behalf' ? pooja?.base_price_virtual : serviceMode === 'home' ? pooja?.base_price_in_person : pooja?.base_price_temple}</span>
            </div>
            {materialsBy === 'priest' && pooja?.items_arrangement_cost > 0 && (
              <div className="flex justify-between">
                <span>Materials Fee</span>
                <span>₹{pooja.items_arrangement_cost}</span>
              </div>
            )}
            {needsRecording && (
              <div className="flex justify-between">
                <span>Recording</span>
                <span>₹500</span>
              </div>
            )}
            {selectedHotel && selectedRoom && (
              <div className="flex justify-between">
                <span>Hotel: {selectedRoom.room_type} × {numRooms}</span>
                <span>₹{selectedRoom.price_per_night * numRooms}</span>
              </div>
            )}
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{prices.gst}</span>
            </div>
            <div className="flex justify-between pt-2 border-t text-lg font-bold">
              <span>Total</span>
              <span className="text-amber-600">₹{prices.total}</span>
            </div>
          </div>
        </Card>

        {/* Coupon Code */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <Button variant="outline" onClick={applyCoupon} disabled={!couponCode || !!appliedCoupon}>
            <Tag className="w-4 h-4 mr-1" />
            Apply
          </Button>
        </div>

        {/* Payment Method */}
        <div>
          <Label className="font-semibold mb-3 block">Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className={`p-3 rounded-lg border ${paymentMethod === 'upi' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="cursor-pointer font-medium">UPI / Google Pay / PhonePe</Label>
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="cursor-pointer font-medium">Credit / Debit Card</Label>
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${paymentMethod === 'netbanking' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="netbanking" id="netbanking" />
                <Label htmlFor="netbanking" className="cursor-pointer font-medium">Net Banking</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
          <Checkbox checked={agreeTerms} onCheckedChange={setAgreeTerms} className="mt-1" />
          <Label className="text-sm cursor-pointer" onClick={() => setAgreeTerms(!agreeTerms)}>
            I agree to the <span className="text-amber-600 underline">Terms & Conditions</span> and understand that the payment will be held in escrow until the pooja is completed.
          </Label>
        </div>
      </div>
    );
  };

  // Success Screen
  if (bookingSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              {serviceMode === 'virtual_live' ? 'Meeting link will be sent 24 hours before.' :
               serviceMode === 'virtual_behalf' ? 'Recording will be shared after completion.' :
               serviceMode === 'home' ? 'Priest will contact you 24 hours before.' :
               'Visit details have been sent to your email.'}
            </p>
            
            <Card className="p-4 text-left bg-gray-50 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-mono">{bookingDetails?.id?.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span>{bookingDetails?.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span>{bookingDetails?.time_slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-semibold">₹{bookingDetails?.total_amount}</span>
                </div>
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

  const stepTitles = [
    'Choose Service Mode',
    'Select Date & Time',
    'Add Participants',
    'Materials & Venue',
    'Preferences',
    'Payment'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-serif">Book {pooja?.name}</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 6: {stepTitles[currentStep - 1]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div 
              key={step}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step <= currentStep ? 'bg-amber-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-1">
          {currentStep === 1 && renderStep1_ServiceMode()}
          {currentStep === 2 && renderStep2_DateTime()}
          {currentStep === 3 && renderStep3_Participants()}
          {currentStep === 4 && renderStep4_Materials()}
          {currentStep === 5 && renderStep5_Preferences()}
          {currentStep === 6 && renderStep6_Payment()}
        </div>

        <div className="flex gap-3 pt-4 border-t flex-shrink-0">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={!canProceed() || bookingMutation.isPending}
            className={`flex-1 ${currentStep === 6 ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {bookingMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : currentStep === 6 ? (
              <CreditCard className="w-4 h-4 mr-2" />
            ) : null}
            {currentStep === 6 ? 'Confirm & Pay' : 'Continue'}
            {currentStep < 6 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}