import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flame, Stars, CheckCircle, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';
import AvailabilityScheduler from '../components/onboarding/AvailabilityScheduler';
import TempleSelector from '../components/onboarding/TempleSelector';
import ImageUploader from '../components/onboarding/ImageUploader';

const COMMON_POOJAS = [
  'Graha Shanti', 'Satyanarayan', 'Ganesh Puja', 'Lakshmi Puja', 'Navagraha',
  'Rudrabhishek', 'Marriage', 'Mundan', 'Shradh', 'Pitru Paksha', 'Havan',
  'Durga Puja', 'Navaratri', 'Diwali Puja', 'Vastu Shanti', 'Kaal Sarp Dosh',
  'Griha Pravesh', 'Namkaran', 'Annaprashan'
];

const ASTROLOGY_SERVICES = [
  'Kundali Making & Reading',
  'Matchmaking (Kundali Milan)',
  'Career Guidance',
  'Finance & Business',
  'Health Consultation',
  'Relationship Guidance',
  'Muhurat (Auspicious Timing)',
  'Gemstone Recommendation',
  'Remedies & Solutions',
  'Annual Predictions'
];

const LANGUAGES = ['Hindi', 'English', 'Sanskrit', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Marathi', 'Bengali', 'Gujarati'];

export default function ProviderOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Identity
    role: '', // 'priest', 'astrologer', 'both'
    full_name: '',
    display_name: '',
    age: '',
    gender: '',
    mobile: '',
    email: '',
    city: '',
    address: '',
    languages: [],
    avatar_url: '',

    // Step 2: Professional Details & Temple Association
    // Priest-specific
    gotra: '',
    sampradaya: '',
    vedic_training: '',
    priest_services: [], // Selected poojas with details

    // Astrologer-specific
    years_of_experience: '',
    astrology_types: [],
    education_lineage: { institution: '', guru_name: '' },
    astrology_services: [],

    // Common
    associated_temples: [],
    specializations: [],

    // Step 3: Availability & Scheduling
    weekly_schedule: [],
    default_slot_duration: 30,
    unavailable_dates: [],

    // Step 4: Content & Verification
    bio: '',
    gallery_images: [],
    kyc_document_url: ''
  });

  // Fetch poojas from database for priest services
  const { data: masterPoojas } = useQuery({
    queryKey: ['master-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }),
    enabled: formData.role === 'priest' || formData.role === 'both'
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      // If "both", create two profiles
      if (data.role === 'both') {
        const priestProfile = {
          ...data,
          user_id: user.id,
          provider_type: 'priest',
          profile_status: 'pending_review',
          is_verified: false
        };
        
        const astrologerProfile = {
          ...data,
          user_id: user.id,
          provider_type: 'astrologer',
          profile_status: 'pending_review',
          is_verified: false
        };
        
        await base44.entities.ProviderProfile.create(priestProfile);
        await base44.entities.ProviderProfile.create(astrologerProfile);
      } else {
        await base44.entities.ProviderProfile.create({
          ...data,
          user_id: user.id,
          provider_type: data.role,
          profile_status: 'pending_review',
          is_verified: false
        });
      }
    },
    onSuccess: () => {
      toast.success('Application submitted! We will review and contact you within 2-3 business days.');
      setTimeout(() => window.location.href = '/', 2000);
    },
    onError: () => {
      toast.error('Submission failed. Please try again.');
    }
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const togglePoojaService = (poojaName) => {
    setFormData(prev => {
      const exists = prev.priest_services.find(p => p.pooja_name === poojaName);
      if (exists) {
        return {
          ...prev,
          priest_services: prev.priest_services.filter(p => p.pooja_name !== poojaName)
        };
      }
      return {
        ...prev,
        priest_services: [
          ...prev.priest_services,
          {
            pooja_name: poojaName,
            at_home: true,
            in_temple: false,
            online_sankalp: false,
            duration_minutes: 90,
            dakshina_min: 1000,
            dakshina_max: 5000
          }
        ]
      };
    });
  };

  const toggleAstrologyService = (serviceName) => {
    setFormData(prev => {
      const exists = prev.astrology_services.find(s => s.service_name === serviceName);
      if (exists) {
        return {
          ...prev,
          astrology_services: prev.astrology_services.filter(s => s.service_name !== serviceName)
        };
      }
      return {
        ...prev,
        astrology_services: [
          ...prev.astrology_services,
          {
            service_name: serviceName,
            mode: ['chat'],
            duration_minutes: 30,
            price: 500,
            deliverables: ''
          }
        ]
      };
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.role) {
      toast.error('Please select your role');
      return;
    }
    if (!formData.full_name || !formData.mobile || !formData.email || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!formData.avatar_url) {
      toast.error('Please upload a profile picture');
      return;
    }
    if (formData.associated_temples.length === 0) {
      toast.error('Please select at least one associated temple');
      return;
    }
    if ((formData.role === 'priest' || formData.role === 'both') && formData.priest_services.length === 0) {
      toast.error('Please select at least one pooja service');
      return;
    }
    if ((formData.role === 'astrologer' || formData.role === 'both') && formData.astrology_services.length === 0) {
      toast.error('Please add at least one astrology service');
      return;
    }
    if (formData.weekly_schedule.filter(s => s.is_available).length === 0) {
      toast.error('Please set your availability schedule');
      return;
    }
    if (!formData.bio || formData.bio.length < 100) {
      toast.error('Please write a bio of at least 100 characters');
      return;
    }
    if (!formData.kyc_document_url) {
      toast.error('Please upload your KYC document');
      return;
    }

    submitMutation.mutate(formData);
  };

  const isPriest = formData.role === 'priest' || formData.role === 'both';
  const isAstrologer = formData.role === 'astrologer' || formData.role === 'both';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-indigo-500 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <BackButton label="Back to Home" />
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              {formData.role === 'priest' ? (
                <Flame className="w-8 h-8 text-white" />
              ) : formData.role === 'astrologer' ? (
                <Stars className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                Join as a Provider
              </h1>
              <p className="text-white/90">Share your spiritual wisdom with devotees nationwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-orange-500 to-purple-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Identity</span>
            <span>Services</span>
            <span>Availability</span>
            <span>Verification</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        <Card className="p-6 md:p-8">
          {/* Step 1: Basic Identity */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Basic Identity</h2>
                <p className="text-gray-600">Tell us about yourself and your role</p>
              </div>

              {/* Role Selection */}
              <Card className="p-4 bg-gradient-to-br from-orange-50 to-purple-50">
                <Label className="mb-3 block font-semibold">I want to join as: *</Label>
                <RadioGroup value={formData.role} onValueChange={(val) => updateField('role', val)}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === 'priest' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                    }`}>
                      <RadioGroupItem value="priest" />
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          <Flame className="w-4 h-4 text-orange-500" />
                          Priest
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Perform poojas & rituals</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === 'astrologer' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <RadioGroupItem value="astrologer" />
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          <Stars className="w-4 h-4 text-purple-500" />
                          Astrologer
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Offer consultations</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === 'both' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                    }`}>
                      <RadioGroupItem value="both" />
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          <User className="w-4 h-4 text-indigo-500" />
                          Both
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Priest & Astrologer</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </Card>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label>Display Name (Public) *</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => updateField('display_name', e.target.value)}
                    placeholder="How you want to be called"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mobile Number *</Label>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Input
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    placeholder="Male/Female/Other"
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div>
                <Label>Full Address/Location</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Complete address with pincode"
                  rows={2}
                />
              </div>

              <div>
                <Label>Languages You Speak *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {LANGUAGES.map(lang => (
                    <label key={lang} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.languages.includes(lang)}
                        onCheckedChange={() => toggleLanguage(lang)}
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Profile Picture */}
              <ImageUploader
                avatarUrl={formData.avatar_url}
                setAvatarUrl={(url) => updateField('avatar_url', url)}
                galleryImages={[]}
                setGalleryImages={() => {}}
                kycDocumentUrl=""
                setKycDocumentUrl={() => {}}
              />
            </div>
          )}

          {/* Step 2: Professional Details & Temple Association */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Professional Details & Temple Association</h2>
                <p className="text-gray-600">Tell us about your services and temple connections</p>
              </div>

              {/* Temple Association */}
              <TempleSelector
                associatedTemples={formData.associated_temples}
                setAssociatedTemples={(temples) => updateField('associated_temples', temples)}
              />

              {/* Priest Services */}
              {isPriest && (
                <Card className="p-6 bg-orange-50 border-orange-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    Poojas You Perform
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COMMON_POOJAS.map(pooja => (
                      <label
                        key={pooja}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.priest_services.find(p => p.pooja_name === pooja)
                            ? 'border-orange-500 bg-orange-100'
                            : 'border-gray-200 hover:border-orange-300 bg-white'
                        }`}
                      >
                        <Checkbox
                          checked={!!formData.priest_services.find(p => p.pooja_name === pooja)}
                          onCheckedChange={() => togglePoojaService(pooja)}
                        />
                        <span className="text-sm font-medium">{pooja}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label>Additional Details (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Gotra"
                        value={formData.gotra}
                        onChange={(e) => updateField('gotra', e.target.value)}
                      />
                      <Input
                        placeholder="Sampradaya/Tradition"
                        value={formData.sampradaya}
                        onChange={(e) => updateField('sampradaya', e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Vedic Training (Ved Pathshala, Gurukul, etc.)"
                      value={formData.vedic_training}
                      onChange={(e) => updateField('vedic_training', e.target.value)}
                      rows={2}
                    />
                  </div>
                </Card>
              )}

              {/* Astrology Services */}
              {isAstrologer && (
                <Card className="p-6 bg-purple-50 border-purple-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Stars className="w-5 h-5 text-purple-600" />
                    Astrology Services You Offer
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ASTROLOGY_SERVICES.map(service => (
                      <label
                        key={service}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.astrology_services.find(s => s.service_name === service)
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 hover:border-purple-300 bg-white'
                        }`}
                      >
                        <Checkbox
                          checked={!!formData.astrology_services.find(s => s.service_name === service)}
                          onCheckedChange={() => toggleAstrologyService(service)}
                        />
                        <span className="text-sm font-medium">{service}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    <Label>Years of Experience in Astrology</Label>
                    <Input
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => updateField('years_of_experience', e.target.value)}
                      placeholder="Years"
                    />
                  </div>
                </Card>
              )}

              <div>
                <Label>Specializations (Comma separated)</Label>
                <Input
                  placeholder="e.g., Marriage ceremonies expert, Career astrology specialist"
                  value={formData.specializations.join(', ')}
                  onChange={(e) => updateField('specializations', e.target.value.split(',').map(s => s.trim()))}
                />
              </div>
            </div>
          )}

          {/* Step 3: Availability & Scheduling */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Availability & Scheduling</h2>
                <p className="text-gray-600">Set your working hours and booking preferences</p>
              </div>

              <AvailabilityScheduler
                weeklySchedule={formData.weekly_schedule}
                setWeeklySchedule={(schedule) => updateField('weekly_schedule', schedule)}
                defaultSlotDuration={formData.default_slot_duration}
                setDefaultSlotDuration={(duration) => updateField('default_slot_duration', duration)}
                unavailableDates={formData.unavailable_dates}
                setUnavailableDates={(dates) => updateField('unavailable_dates', dates)}
              />
            </div>
          )}

          {/* Step 4: Content & Verification */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Content & Verification</h2>
                <p className="text-gray-600">Complete your profile and upload verification documents</p>
              </div>

              <div>
                <Label>Bio / About You * (min 100 characters)</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell devotees about yourself, your experience, training, style of work, and what makes you unique..."
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.bio.length} / 100 characters</p>
              </div>

              <ImageUploader
                avatarUrl={formData.avatar_url}
                setAvatarUrl={(url) => updateField('avatar_url', url)}
                galleryImages={formData.gallery_images}
                setGalleryImages={(images) => updateField('gallery_images', images)}
                kycDocumentUrl={formData.kyc_document_url}
                setKycDocumentUrl={(url) => updateField('kyc_document_url', url)}
              />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before You Submit</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Our team will review your application within 2-3 business days. We may contact you for:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Verification of temple association</li>
                  <li>• Additional details about your training/experience</li>
                  <li>• References from temple management (if needed)</li>
                  <li>• Sample consultations or pooja recordings</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!formData.role && step === 1}
                className="flex-1 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex-1 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600"
              >
                {submitMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Submit Application</>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}