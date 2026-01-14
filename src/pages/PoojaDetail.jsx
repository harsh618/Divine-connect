import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
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
  Clock,
  Package,
  Video,
  CheckCircle2,
  Loader2,
  Sparkles,
  Users,
  Star,
  ChevronLeft,
  ShieldCheck,
  Calendar,
  Flame,
  Check,
  MapPin,
  Hotel,
  Wifi,
  Car,
  Utensils,
  CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FAQSection from '../components/faq/FAQSection';
import { toast } from 'sonner';
import { format } from 'date-fns';

const timeSlots = [
  '6:00 AM - 8:00 AM',
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM'
];

export default function PoojaDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Capture the ID once on initial mount to prevent it from being lost on re-renders
  const poojaId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }, []);
  const [activeTab, setActiveTab] = useState('about');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showMultiDay, setShowMultiDay] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedMode, setSelectedMode] = useState('temple');
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [availablePriests, setAvailablePriests] = useState([]);
  const [numDevotees, setNumDevotees] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [itemsArrangedBy, setItemsArrangedBy] = useState('priest');
  const [location, setLocation] = useState('');
  const [needsHotel, setNeedsHotel] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [numRooms, setNumRooms] = useState(1);
  const [selectedTemple, setSelectedTemple] = useState(null);

  const { data: pooja, isLoading } = useQuery({
    queryKey: ['pooja', poojaId],
    queryFn: async () => {
      const poojas = await base44.entities.Pooja.filter({ is_deleted: false });
      return poojas.find(p => p.id === poojaId) || null;
    },
    enabled: !!poojaId
  });

  // Fetch temples for temple mode
  const { data: temples } = useQuery({
    queryKey: ['temples-for-pooja'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_hidden: false }, 'name', 50),
    enabled: selectedMode === 'temple'
  });

  // Fetch hotels near selected temple
  const { data: nearbyHotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels-near-temple', selectedTemple?.city],
    queryFn: async () => {
      const hotels = await base44.entities.Hotel.filter({
        is_deleted: false
      }, '-rating_average', 20);
      
      const cityHotels = hotels.filter(h => 
        h.city?.toLowerCase() === selectedTemple?.city?.toLowerCase()
      );
      
      return cityHotels.length > 0 ? cityHotels : hotels.slice(0, 6);
    },
    enabled: !!selectedTemple?.city && needsHotel && selectedMode === 'temple'
  });

  const checkPriestAvailability = async (date, timeSlot) => {
    if (!date || !timeSlot) return;

    try {
      const priests = await base44.entities.ProviderProfile.filter({
        provider_type: 'priest',
        is_deleted: false,
        is_verified: true,
        is_hidden: false
      });

      const dateStr = format(date, 'yyyy-MM-dd');
      const bookingsOnDate = await base44.entities.Booking.filter({
        date: dateStr,
        time_slot: timeSlot,
        status: ['confirmed', 'in_progress']
      });

      const bookedPriestIds = bookingsOnDate.map(b => b.provider_id);
      const available = priests.filter(p => !bookedPriestIds.includes(p.id));

      setAvailablePriests(available);
      
      if (available.length > 0) {
        setSelectedPriest(available[0].id);
      } else {
        setSelectedPriest(null);
        toast.info('No priests available for this slot. We will assign one upon confirmation.');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailablePriests([]);
    }
  };

  useEffect(() => {
    if (startDate && selectedTimeSlot) {
      checkPriestAvailability(startDate, selectedTimeSlot);
    }
  }, [startDate, selectedTimeSlot]);

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        pooja_id: poojaId,
        booking_type: 'pooja',
        status: 'confirmed',
        payment_status: 'completed'
      });
    },
    onSuccess: () => {
      toast.success('Pooja booked successfully!');
      setShowBookingModal(false);
      queryClient.invalidateQueries(['bookings']);
    }
  });

  const handleBookPooja = async () => {
    if (!startDate || !endDate || !selectedTimeSlot) {
      toast.error('Please select start date, end date, and time slot');
      return;
    }

    if (selectedMode === 'in_person' && !location) {
      toast.error('Please enter your location for in-person pooja');
      return;
    }

    const priceMap = {
      virtual: pooja.base_price_virtual,
      in_person: pooja.base_price_in_person,
      temple: pooja.base_price_temple
    };

    let totalAmount = priceMap[selectedMode] || 0;
    if (itemsArrangedBy === 'priest') {
      totalAmount += pooja.items_arrangement_cost || 0;
    }
    
    // Add hotel cost if selected
    if (selectedHotel && needsHotel && selectedRoom) {
      const roomPrice = selectedRoom.price_per_night || 1500;
      totalAmount += roomPrice * numRooms;
    }

    bookingMutation.mutate({
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      date: format(startDate, 'yyyy-MM-dd'),
      time_slot: selectedTimeSlot,
      service_mode: selectedMode,
      provider_id: selectedPriest,
      num_devotees: numDevotees,
      special_requirements: specialRequirements,
      items_arranged_by: itemsArrangedBy,
      location: selectedMode === 'in_person' ? location : null,
      total_amount: totalAmount,
      special_requirements: selectedHotel && selectedRoom ? 
        `${specialRequirements ? specialRequirements + ' | ' : ''}Hotel: ${selectedHotel.name} - ${selectedRoom.room_type} x ${numRooms} room(s)` : 
        specialRequirements,
      temple_id: selectedMode === 'temple' ? selectedTemple?.id : null
    });
  };

  const openBookingModal = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin();
      return;
    }
    setShowBookingModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-amber-900 font-serif animate-pulse">Preparing your sanctuary...</p>
        </div>
      </div>
    );
  }

  if (!pooja) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Ritual Not Found</h2>
        <Link to={createPageUrl('Poojas')}>
          <Button variant="outline" className="border-amber-600 text-amber-900 hover:bg-amber-50">
            Return to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const defaultImage = "https://images.unsplash.com/photo-1604608672516-f1e3c1f9f6e6?w=800";
  const poojaImage = pooja.image_url || defaultImage;

  return (
    <div className="min-h-screen bg-[#FAFAF9] selection:bg-amber-100">
      
      {/* 1. Cinematic Hero Section (Dark Mode) */}
      <div className="relative h-[65vh] w-full overflow-hidden bg-black group">
        
        {/* Navigation Overlay */}
        <div className="absolute top-6 left-6 z-50">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all group-hover:pl-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Hero Image with Slow Zoom */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-in-out scale-100 group-hover:scale-110"
          style={{ backgroundImage: `url(${poojaImage})` }}
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF9] via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

        {/* Title Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 pb-20 md:p-16 md:pb-24">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 animate-fade-in-up">
                {pooja.is_popular && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-black border-0 px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1 fill-black" /> Popular Ritual
                  </Badge>
                )}
                {pooja.category && (
                  <Badge variant="outline" className="border-white/30 text-white backdrop-blur-md capitalize px-3 py-1">
                    {pooja.category.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight drop-shadow-2xl max-w-4xl">
                {pooja.name}
              </h1>
              
              <div className="flex items-center gap-6 text-white/80 mt-2 font-light">
                {pooja.duration_minutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>~{pooja.duration_minutes} Minutes</span>
                  </div>
                )}
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{pooja.total_bookings || 108}+ Devotees</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="container mx-auto px-6 max-w-7xl -mt-12 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Storytelling (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 sticky top-0 bg-[#FAFAF9]/95 backdrop-blur-sm z-40 pt-4">
              {['About', 'Benefits', 'Items', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-4 text-sm font-medium tracking-wide transition-all ${
                    activeTab === tab.toLowerCase()
                      ? 'text-amber-600 border-b-2 border-amber-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* About Section */}
            <section id="about" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="prose prose-lg prose-stone max-w-none">
                <p className="text-xl leading-relaxed text-gray-600 font-light first-letter:text-6xl first-letter:font-serif first-letter:text-amber-600 first-letter:mr-3 first-letter:float-left">
                  {pooja.description || "Experience the divine energy through this sacred ritual, performed with strict adherence to Vedic traditions."}
                </p>
              </div>

              {pooja.purpose && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-serif text-2xl text-gray-900 mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    Spiritual Significance
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-light">{pooja.purpose}</p>
                </div>
              )}
            </section>

            {/* Benefits Grid */}
            {pooja.benefits?.length > 0 && (
              <section id="benefits">
                <h3 className="font-serif text-2xl text-gray-900 mb-6">Divine Blessings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pooja.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-5 rounded-xl bg-white border border-gray-100 hover:border-amber-200 transition-colors shadow-sm group">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                      </div>
                      <p className="text-gray-700 font-light leading-relaxed pt-1">{benefit}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Items Checklist */}
            {(pooja.required_items?.length > 0) && (
              <section id="items" className="bg-stone-100 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-serif text-2xl text-gray-900">Samagri (Items)</h3>
                   <Badge variant="outline" className="bg-white border-stone-200 text-stone-600">
                     Included in Temple Pooja
                   </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                  {pooja.required_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600/80" />
                      <span className="font-light">{item}</span>
                    </div>
                  ))}
                </div>
                
                {pooja.items_arrangement_cost > 0 && (
                  <div className="mt-8 pt-6 border-t border-stone-200 flex items-center gap-3 text-stone-600 text-sm italic">
                    <Package className="w-4 h-4" />
                    Panditji can arrange all Samagri for an additional ₹{pooja.items_arrangement_cost}
                  </div>
                )}
              </section>
            )}

            {/* Reviews Preview */}
            <section id="reviews" className="pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl text-gray-900">Devotee Experiences</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-lg">4.9</span>
                  <span className="text-gray-400 text-sm">(Verified)</span>
                </div>
              </div>
              {/* Simple Review Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-600 italic mb-4">"The atmosphere created by the priests was absolutely divine. I felt a deep sense of peace after the Sankalp."</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                   <div>
                     <p className="text-sm font-medium text-gray-900">Anjali Sharma</p>
                     <p className="text-xs text-gray-400">Booked for Graha Shanti</p>
                   </div>
                </div>
              </div>
            </section>
            
            <FAQSection entityType="pooja" entityId={poojaId} entityData={pooja} />

          </div>

          {/* Right Column: Sticky Booking Ticket (4 Cols) */}
          <div className="lg:col-span-4 relative">
             <div className="sticky top-24 space-y-6">
                
                {/* The Booking Card */}
                <Card className="border-0 shadow-2xl shadow-stone-200/50 rounded-[2rem] overflow-hidden bg-white ring-1 ring-black/5">
                  <div className="bg-[#1C1917] p-6 text-center relative overflow-hidden">
                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                     <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Sankalp Dakshina</p>
                     
                     {pooja.base_price_virtual || pooja.base_price_temple ? (
                        <div className="text-white relative z-10">
                           <span className="text-2xl font-serif">₹</span>
                           <span className="text-5xl font-serif font-medium">{pooja.base_price_virtual || pooja.base_price_temple}</span>
                        </div>
                     ) : (
                        <span className="text-3xl font-serif text-white">Contact Us</span>
                     )}
                  </div>

                  <div className="p-6 space-y-6">
                     {/* Mode Selection */}
                     <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Mode</label>
                        
                        {pooja.base_price_virtual > 0 && (
                           <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-amber-500 cursor-pointer bg-gray-50 hover:bg-amber-50/50 transition-all group">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 group-hover:border-amber-200">
                                    <Video className="w-4 h-4 text-gray-600 group-hover:text-amber-600" />
                                 </div>
                                 <span className="text-sm font-medium text-gray-700">Virtual Pooja</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">₹{pooja.base_price_virtual}</span>
                           </div>
                        )}

                        {pooja.base_price_temple > 0 && (
                           <div className="flex items-center justify-between p-3 rounded-xl border-2 border-amber-500 bg-amber-50/30 cursor-pointer relative">
                              <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">RECOMMENDED</div>
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-amber-200">
                                    <Flame className="w-4 h-4 text-amber-600" />
                                 </div>
                                 <span className="text-sm font-medium text-gray-900">At Temple</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">₹{pooja.base_price_temple}</span>
                           </div>
                        )}

                        {pooja.base_price_in_person > 0 && (
                           <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-amber-500 cursor-pointer bg-gray-50 hover:bg-amber-50/50 transition-all group">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 group-hover:border-amber-200">
                                    <Users className="w-4 h-4 text-gray-600 group-hover:text-amber-600" />
                                 </div>
                                 <span className="text-sm font-medium text-gray-700">In-Person</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">₹{pooja.base_price_in_person}</span>
                           </div>
                        )}
                     </div>

                     {/* Action Button */}
                     <Button 
                        onClick={openBookingModal}
                        className="w-full h-14 bg-black hover:bg-stone-800 text-white rounded-xl text-lg font-medium shadow-lg shadow-stone-300 transition-transform active:scale-95"
                     >
                        Book Now
                     </Button>

                     {/* Trust Badges */}
                     <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                           <ShieldCheck className="w-4 h-4 text-green-600" />
                           <span>100% Money Back Guarantee</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                           <Calendar className="w-4 h-4 text-amber-600" />
                           <span>Reschedule anytime before 24hrs</span>
                        </div>
                     </div>
                  </div>
                </Card>

                {/* Priest Info (Optional) */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200" className="w-full h-full object-cover" alt="Priest" />
                   </div>
                   <div>
                      <p className="text-sm font-medium text-gray-900">Performed by</p>
                      <p className="text-xs text-gray-500">Certified Vedic Priests</p>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>
      
      {/* Mobile Sticky Bottom Bar (Visible only on mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:hidden z-50 flex items-center justify-between">
         <div>
            <p className="text-xs text-gray-500 uppercase">Total Dakshina</p>
            <p className="text-2xl font-serif font-bold text-gray-900">₹{pooja.base_price_temple || pooja.base_price_virtual}</p>
         </div>
         <Button 
            onClick={openBookingModal}
            className="bg-black text-white rounded-xl px-8 h-12"
         >
            Book Now
         </Button>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Book {pooja.name}</DialogTitle>
            <DialogDescription>
              Select your preferred date, time, and service mode
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Service Mode Selection */}
            <div>
              <Label className="mb-3 block text-sm font-medium">Service Mode</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pooja.base_price_virtual > 0 && (
                  <button
                    onClick={() => setSelectedMode('virtual')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMode === 'virtual'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <Video className="w-5 h-5 mx-auto mb-2 text-amber-600" />
                    <p className="text-sm font-medium">Virtual</p>
                    <p className="text-xs text-gray-500">₹{pooja.base_price_virtual}</p>
                  </button>
                )}
                {pooja.base_price_in_person > 0 && (
                  <button
                    onClick={() => setSelectedMode('in_person')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMode === 'in_person'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <Users className="w-5 h-5 mx-auto mb-2 text-amber-600" />
                    <p className="text-sm font-medium">In-Person</p>
                    <p className="text-xs text-gray-500">₹{pooja.base_price_in_person}</p>
                  </button>
                )}
                {pooja.base_price_temple > 0 && (
                  <button
                    onClick={() => {
                      setSelectedMode('temple');
                      setNeedsHotel(false);
                      setSelectedHotel(null);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMode === 'temple'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <Flame className="w-5 h-5 mx-auto mb-2 text-amber-600" />
                    <p className="text-sm font-medium">At Temple</p>
                    <p className="text-xs text-gray-500">₹{pooja.base_price_temple}</p>
                  </button>
                )}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <Label className="mb-2 block text-sm font-medium">Start Date</Label>
              <CalendarComp
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  if (endDate && date && date > endDate) {
                    setEndDate(null);
                  }
                }}
                disabled={(date) => date < new Date()}
                className="rounded-lg border w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="multiDay"
                checked={showMultiDay}
                onChange={(e) => {
                  setShowMultiDay(e.target.checked);
                  if (!e.target.checked) {
                    setEndDate(null);
                  }
                }}
                className="rounded"
              />
              <Label htmlFor="multiDay" className="cursor-pointer text-sm font-normal">
                Multi-day pooja
              </Label>
            </div>
            
            {showMultiDay && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <Label className="mb-2 block text-sm font-medium">End Date</Label>
                <CalendarComp
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < new Date() || (startDate && date < startDate)}
                  className="rounded-lg border w-full"
                />
              </div>
            )}
            
            {startDate && endDate && showMultiDay && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 animate-in fade-in duration-200">
                <p className="text-sm text-blue-900">
                  <strong>Pooja Duration:</strong> {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} day(s)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Time Slot Selection */}
            <div>
              <Label className="mb-2 block text-sm font-medium">Select Time Slot</Label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Available Priest */}
            {availablePriests.length > 0 && startDate && selectedTimeSlot && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Label className="mb-2 block text-sm font-medium">Available Priest</Label>
                <Select value={selectedPriest} onValueChange={setSelectedPriest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priest" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePriests.map((priest) => (
                      <SelectItem key={priest.id} value={priest.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{priest.display_name}</span>
                          {priest.years_of_experience && (
                            <span className="text-xs text-muted-foreground">
                              ({priest.years_of_experience} yrs exp)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-green-700 mt-2">
                  {availablePriests.length} priest{availablePriests.length > 1 ? 's' : ''} available
                </p>
              </div>
            )}

            {/* Location (for in-person) */}
            {selectedMode === 'in_person' && (
              <div>
                <Label className="mb-2 block text-sm font-medium">Your Location</Label>
                <Input
                  placeholder="Enter your address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}

            {/* Temple Selection (for temple mode) */}
            {selectedMode === 'temple' && (
              <div>
                <Label className="mb-2 block text-sm font-medium">Select Temple</Label>
                <Select 
                  value={selectedTemple?.id || ''} 
                  onValueChange={(val) => {
                    const temple = temples?.find(t => t.id === val);
                    setSelectedTemple(temple);
                    setSelectedHotel(null);
                  }}
                >
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
              </div>
            )}

            {/* Hotel Cross-sell (for temple mode) */}
            {selectedMode === 'temple' && selectedTemple && (
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
                      View hotels near {selectedTemple.city}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel Selection */}
            {selectedMode === 'temple' && needsHotel && selectedTemple && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <Label className="font-medium">Select Hotel in {selectedTemple.city}</Label>
                
                {hotelsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : nearbyHotels?.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {nearbyHotels.map((hotel) => {
                      const startingPrice = Math.min(...(hotel.room_inventory?.map(r => r.price_per_night) || [1500]));
                      return (
                        <div
                          key={hotel.id}
                          onClick={() => {
                            setSelectedHotel(hotel);
                            setSelectedRoom(null);
                            setNumRooms(1);
                          }}
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
                                <span className="font-semibold text-orange-600">from ₹{startingPrice}/night</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No hotels available in this area</p>
                )}

                {/* Room Type Selection */}
                {selectedHotel && selectedHotel.room_inventory?.length > 0 && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl border">
                    <Label className="font-medium text-gray-800">Select Room Type for {numDevotees} devotee(s)</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      💡 We recommend {Math.ceil(numDevotees / 2)} room(s) for {numDevotees} devotee(s)
                    </p>
                    
                    <div className="space-y-2">
                      {selectedHotel.room_inventory.map((room, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedRoom(room);
                            // Auto-calculate rooms needed based on devotees
                            const roomsNeeded = Math.ceil(numDevotees / (room.max_occupancy || 2));
                            setNumRooms(Math.min(roomsNeeded, room.available_rooms || 10));
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedRoom?.room_type === room.room_type 
                              ? 'border-orange-500 bg-orange-100' 
                              : 'border-gray-200 bg-white hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-gray-800">{room.room_type}</h5>
                                {selectedRoom?.room_type === room.room_type && (
                                  <CheckCircle className="w-4 h-4 text-orange-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Max {room.max_occupancy || 2} guests • {room.available_rooms || 0} available
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-orange-600">₹{room.price_per_night}</p>
                              <p className="text-xs text-gray-500">/night</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Number of Rooms */}
                    {selectedRoom && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Number of Rooms</Label>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setNumRooms(Math.max(1, numRooms - 1))}
                              disabled={numRooms <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-semibold">{numRooms}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setNumRooms(Math.min(selectedRoom.available_rooms || 10, numRooms + 1))}
                              disabled={numRooms >= (selectedRoom.available_rooms || 10)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-orange-100 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>{selectedRoom.room_type} × {numRooms}</span>
                            <span className="font-bold text-orange-700">₹{selectedRoom.price_per_night * numRooms}/night</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Total capacity: {(selectedRoom.max_occupancy || 2) * numRooms} guests
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Number of Devotees */}
            <div>
              <Label className="mb-2 block text-sm font-medium">Number of Devotees</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={numDevotees}
                onChange={(e) => setNumDevotees(Number(e.target.value))}
              />
            </div>

            {/* Items Arrangement */}
            {pooja.items_arrangement_cost > 0 && (
              <div>
                <Label className="mb-2 block text-sm font-medium">Pooja Items</Label>
                <Select value={itemsArrangedBy} onValueChange={setItemsArrangedBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">I will arrange items</SelectItem>
                    <SelectItem value="priest">
                      Priest will arrange (+ ₹{pooja.items_arrangement_cost})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Special Requirements */}
            <div>
              <Label className="mb-2 block text-sm font-medium">Special Requirements (Optional)</Label>
              <Textarea
                placeholder="Any special requests or requirements..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Price Summary */}
          {(selectedHotel || selectedMode) && (
            <Card className="p-4 bg-amber-50 border-amber-200 mb-4">
              <h4 className="font-semibold mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Pooja ({selectedMode === 'virtual' ? 'Virtual' : selectedMode === 'in_person' ? 'In-Person' : 'At Temple'})</span>
                  <span>₹{pooja[`base_price_${selectedMode === 'in_person' ? 'in_person' : selectedMode}`] || 0}</span>
                </div>
                {itemsArrangedBy === 'priest' && pooja.items_arrangement_cost > 0 && (
                  <div className="flex justify-between">
                    <span>Items Arrangement</span>
                    <span>₹{pooja.items_arrangement_cost}</span>
                  </div>
                )}
                {selectedHotel && selectedRoom && (
                  <div className="flex justify-between">
                    <span>{selectedHotel.name} - {selectedRoom.room_type} × {numRooms}</span>
                    <span>₹{selectedRoom.price_per_night * numRooms}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-amber-200 font-semibold">
                  <span>Total</span>
                  <span className="text-amber-700">
                    ₹{(pooja[`base_price_${selectedMode === 'in_person' ? 'in_person' : selectedMode}`] || 0) + 
                      (itemsArrangedBy === 'priest' ? (pooja.items_arrangement_cost || 0) : 0) +
                      (selectedRoom ? (selectedRoom.price_per_night * numRooms) : 0)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBookPooja} 
              disabled={bookingMutation.isPending || (needsHotel && (!selectedHotel || !selectedRoom))}
              className="flex-1 bg-black hover:bg-stone-800"
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

    </div>
  );
}