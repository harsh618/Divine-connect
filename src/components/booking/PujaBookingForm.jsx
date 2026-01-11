import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Flame, Video, MapPin, User, CheckCircle, Loader2,
  Star, Award, Shield, Crown, ChevronRight, IndianRupee,
  Sparkles, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#FF9933';

const STEPS = [
  { id: 1, title: 'Ritual Selection', icon: Flame },
  { id: 2, title: 'Mode Selection', icon: Video },
  { id: 3, title: 'Select Priest', icon: User },
  { id: 4, title: 'Details', icon: Users },
  { id: 5, title: 'Payment', icon: IndianRupee },
];

const TIER_CONFIG = {
  ELITE: { label: 'Elite', color: 'bg-purple-500', icon: Crown, priority: 1 },
  GOLD: { label: 'Gold', color: 'bg-yellow-500', icon: Award, priority: 2 },
  STANDARD: { label: 'Standard', color: 'bg-gray-500', icon: Shield, priority: 3 },
};

export default function PujaBookingForm({ templeId, onComplete }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPooja, setSelectedPooja] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null); // 'online' or 'offline'
  const [selectedPriestId, setSelectedPriestId] = useState(null);
  const [autoAssign, setAutoAssign] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gotra: '',
    nakshatra: '',
  });

  // Fetch available poojas
  const { data: poojas, isLoading: loadingPoojas } = useQuery({
    queryKey: ['poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }),
  });

  // Fetch priests with new PriestProfile schema
  const { data: priests, isLoading: loadingPriests } = useQuery({
    queryKey: ['priests-for-booking', selectedPooja?.name, templeId],
    queryFn: () => base44.entities.PriestProfile.filter({ 
      is_verified: true,
      is_deleted: false,
      is_available: true
    }),
    enabled: !!selectedPooja && currentStep >= 3,
  });

  // Filter and sort priests based on skills and temple attachment
  const filteredPriests = useMemo(() => {
    if (!priests || !selectedPooja) return [];
    
    // Filter priests who have the skill for this pooja AND are attached to this temple
    const filtered = priests.filter(priest => {
      const hasSkill = priest.skills?.some(skill => 
        skill.toLowerCase().includes(selectedPooja.name.toLowerCase()) ||
        selectedPooja.name.toLowerCase().includes(skill.toLowerCase()) ||
        priest.skills?.includes(selectedPooja.category)
      );
      
      const attachedToTemple = templeId 
        ? priest.attached_temples?.includes(templeId)
        : true; // If no templeId, show all verified priests
      
      return hasSkill || attachedToTemple || priest.skills?.length > 0;
    });

    // Sort by verification tier (ELITE first, then GOLD, then STANDARD)
    return filtered.sort((a, b) => {
      const tierA = TIER_CONFIG[a.verification_tier]?.priority || 99;
      const tierB = TIER_CONFIG[b.verification_tier]?.priority || 99;
      if (tierA !== tierB) return tierA - tierB;
      // Secondary sort by rating
      return (b.rating_average || 0) - (a.rating_average || 0);
    });
  }, [priests, selectedPooja, templeId]);

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        booking_type: 'pooja',
        status: 'pending',
        payment_status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('Booking created! Awaiting confirmation.');
      queryClient.invalidateQueries(['bookings']);
      if (onComplete) {
        onComplete();
      } else {
        navigate(createPageUrl('MyBookings'));
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Booking failed');
    }
  });

  const getPrice = () => {
    if (!selectedPooja) return 0;
    if (selectedMode === 'online') return selectedPooja.base_price_virtual || 1100;
    return selectedPooja.base_price_in_person || selectedPooja.base_price_temple || 2100;
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedPooja) {
      toast.error('Please select a ritual');
      return;
    }
    if (currentStep === 2 && !selectedMode) {
      toast.error('Please select a mode');
      return;
    }
    if (currentStep === 3 && !selectedPriestId && !autoAssign) {
      toast.error('Please select a priest or choose auto-assign');
      return;
    }
    if (currentStep === 4 && !formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePayment = () => {
    // Mock payment - in production this would integrate with a payment gateway
    bookingMutation.mutate({
      pooja_id: selectedPooja.id,
      temple_id: templeId,
      provider_id: autoAssign ? null : selectedPriestId,
      service_mode: selectedMode === 'online' ? 'virtual' : 'in_person',
      date: new Date().toISOString().split('T')[0],
      sankalp_details: {
        family_names: [formData.name],
        gotra: formData.gotra,
        nakshatra: formData.nakshatra
      },
      total_amount: getPrice(),
      status: 'pending'
    });
  };

  const fadeAnimation = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                    style={isActive ? { backgroundColor: GOLD } : {}}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 hidden md:block ${isActive ? 'font-semibold' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} {...fadeAnimation}>
          {/* Step 1: Ritual Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: GOLD }}>Select Your Ritual</h2>
              {loadingPoojas ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {poojas?.map((pooja) => (
                    <Card 
                      key={pooja.id}
                      onClick={() => setSelectedPooja(pooja)}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedPooja?.id === pooja.id 
                          ? 'ring-2 ring-offset-2' 
                          : 'hover:border-orange-200'
                      }`}
                      style={selectedPooja?.id === pooja.id ? { ringColor: GOLD } : {}}
                    >
                      <div className="relative h-32 overflow-hidden rounded-t-lg">
                        <img 
                          src={pooja.image_url || 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=400'}
                          alt={pooja.name}
                          className="w-full h-full object-cover"
                        />
                        {pooja.is_popular && (
                          <Badge className="absolute top-2 left-2 text-white" style={{ backgroundColor: GOLD }}>
                            Popular
                          </Badge>
                        )}
                        {selectedPooja?.id === pooja.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-800">{pooja.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{pooja.purpose}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold" style={{ color: GOLD }}>
                            ₹{pooja.base_price_virtual || pooja.base_price_temple || 1100}
                          </span>
                          <span className="text-xs text-gray-500">{pooja.duration_minutes} mins</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Mode Selection */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: GOLD }}>Select Mode</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  onClick={() => setSelectedMode('online')}
                  className={`cursor-pointer p-6 transition-all hover:shadow-lg ${
                    selectedMode === 'online' ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={selectedMode === 'online' ? { ringColor: GOLD } : {}}
                >
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${GOLD}20` }}
                    >
                      <Video className="w-8 h-8" style={{ color: GOLD }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Online (Video)</h3>
                    <p className="text-gray-600 mb-4">
                      Join the puja via live video call from anywhere
                    </p>
                    <Badge variant="outline" className="mb-3">Convenient</Badge>
                    <p className="text-2xl font-bold" style={{ color: GOLD }}>
                      ₹{selectedPooja?.base_price_virtual || 1100}
                    </p>
                    {selectedMode === 'online' && (
                      <div className="mt-4 flex items-center justify-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Selected
                      </div>
                    )}
                  </div>
                </Card>

                <Card 
                  onClick={() => setSelectedMode('offline')}
                  className={`cursor-pointer p-6 transition-all hover:shadow-lg ${
                    selectedMode === 'offline' ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={selectedMode === 'offline' ? { ringColor: GOLD } : {}}
                >
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${GOLD}20` }}
                    >
                      <MapPin className="w-8 h-8" style={{ color: GOLD }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Offline (Visit)</h3>
                    <p className="text-gray-600 mb-4">
                      Priest visits your home or temple location
                    </p>
                    <Badge variant="outline" className="mb-3">Traditional</Badge>
                    <p className="text-2xl font-bold" style={{ color: GOLD }}>
                      ₹{selectedPooja?.base_price_in_person || selectedPooja?.base_price_temple || 2100}
                    </p>
                    {selectedMode === 'offline' && (
                      <div className="mt-4 flex items-center justify-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Selected
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Priest Selection */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: GOLD }}>Select Your Priest</h2>
              
              {/* Auto-Assign Option */}
              <Card 
                onClick={() => {
                  setAutoAssign(true);
                  setSelectedPriestId(null);
                }}
                className={`mb-6 cursor-pointer p-4 transition-all ${
                  autoAssign ? 'ring-2 ring-offset-2 bg-orange-50' : 'hover:border-orange-200'
                }`}
                style={autoAssign ? { ringColor: GOLD } : {}}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: GOLD }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Auto-Assign Best Available Priest</h3>
                    <p className="text-sm text-gray-600">We'll assign the most suitable priest based on availability</p>
                  </div>
                  {autoAssign && (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
              </Card>

              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-gray-300 flex-1" />
                <span className="text-sm text-gray-500">Or choose a priest</span>
                <div className="h-px bg-gray-300 flex-1" />
              </div>

              {loadingPriests ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
                </div>
              ) : filteredPriests.length > 0 ? (
                <div className="space-y-4">
                  {filteredPriests.map((priest) => {
                    const tierConfig = TIER_CONFIG[priest.verification_tier] || TIER_CONFIG.STANDARD;
                    const TierIcon = tierConfig.icon;
                    const isSelected = selectedPriestId === priest.id && !autoAssign;

                    return (
                      <Card 
                        key={priest.id}
                        onClick={() => {
                          setSelectedPriestId(priest.id);
                          setAutoAssign(false);
                        }}
                        className={`cursor-pointer p-4 transition-all ${
                          isSelected ? 'ring-2 ring-offset-2' : 'hover:border-orange-200'
                        }`}
                        style={isSelected ? { ringColor: GOLD } : {}}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={priest.avatar_url} />
                            <AvatarFallback>{priest.display_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{priest.display_name}</h3>
                              <Badge className={`${tierConfig.color} text-white text-xs`}>
                                <TierIcon className="w-3 h-3 mr-1" />
                                {tierConfig.label}
                              </Badge>
                              {priest.is_verified && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Award className="w-4 h-4 mr-1" />
                                {priest.years_of_experience || 0}+ years
                              </span>
                              {priest.rating_average > 0 && (
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                                  {priest.rating_average.toFixed(1)}
                                </span>
                              )}
                              <span>{priest.total_bookings || 0} bookings</span>
                            </div>
                            {priest.skills?.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {priest.skills.slice(0, 3).map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold" style={{ color: GOLD }}>
                              ₹{priest.consultation_rate || getPrice()}
                            </p>
                            {isSelected && (
                              <Badge className="mt-2 bg-green-500">Selected</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No priests available. Please use Auto-Assign.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: GOLD }}>Enter Your Details</h2>
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Full Name *</Label>
                    <Input 
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium">Gotra (Optional)</Label>
                      <Input 
                        placeholder="Your gotra"
                        value={formData.gotra}
                        onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">Ancestral lineage for sankalp</p>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Nakshatra (Optional)</Label>
                      <Input 
                        placeholder="Your nakshatra"
                        value={formData.nakshatra}
                        onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">Birth star for auspicious timing</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: GOLD }}>Confirm & Pay</h2>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Ritual</span>
                    <span className="font-medium">{selectedPooja?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Mode</span>
                    <Badge>{selectedMode === 'online' ? 'Online (Video)' : 'Offline (Visit)'}</Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Priest</span>
                    <span className="font-medium">
                      {autoAssign 
                        ? 'Auto-Assigned' 
                        : filteredPriests.find(p => p.id === selectedPriestId)?.display_name || 'Selected'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Devotee Name</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  {formData.gotra && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Gotra</span>
                      <span className="font-medium">{formData.gotra}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 text-lg">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold" style={{ color: GOLD }}>₹{getPrice()}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={bookingMutation.isPending}
                  className="w-full mt-6 py-6 text-lg text-white"
                  style={{ backgroundColor: GOLD }}
                >
                  {bookingMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5 mr-2" /> Pay ₹{getPrice()} & Confirm</>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Your booking will be marked as "Pending Confirmation" until payment is verified
                </p>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8">
        {currentStep > 1 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Back
          </Button>
        )}
        {currentStep < 5 && (
          <Button 
            onClick={handleNext} 
            className="flex-1 text-white"
            style={{ backgroundColor: GOLD }}
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}