import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stars, CheckCircle, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';

const ASTROLOGY_TYPES = [
  'Vedic', 'KP (Krishnamurti Paddhati)', 'Nadi', 'Numerology', 'Tarot',
  'Western', 'Prashna', 'Lal Kitab', 'Vastu', 'Palmistry'
];

const SERVICE_CATEGORIES = [
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

export default function OnboardAstrologer() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    display_name: '',
    age: '',
    gender: '',
    mobile: '',
    email: '',
    city: '',
    languages: [],
    avatar_url: '',
    
    // Astrology Background
    years_of_experience: '',
    astrology_types: [],
    education_lineage: {
      institution: '',
      guru_name: '',
      certificates: []
    },
    
    // Temple Association
    associated_temples: [],
    
    // Services
    astrology_services: [],
    
    // Profile
    bio: '',
    specializations: [],
    availability_slots: []
  });

  const [tempTemple, setTempTemple] = useState({ temple_name: '', city: '', role: '' });
  const [tempService, setTempService] = useState({
    service_name: '',
    mode: [],
    duration_minutes: '',
    price: '',
    deliverables: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.ProviderProfile.create({
        ...data,
        user_id: user.id,
        provider_type: 'astrologer',
        profile_status: 'pending_review',
        is_verified: false
      });
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

  const addAssociatedTemple = () => {
    if (tempTemple.temple_name && tempTemple.city) {
      setFormData(prev => ({
        ...prev,
        associated_temples: [...prev.associated_temples, { ...tempTemple }]
      }));
      setTempTemple({ temple_name: '', city: '', role: '' });
    }
  };

  const removeAssociatedTemple = (index) => {
    setFormData(prev => ({
      ...prev,
      associated_temples: prev.associated_temples.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    if (tempService.service_name && tempService.mode.length > 0 && tempService.price) {
      setFormData(prev => ({
        ...prev,
        astrology_services: [...prev.astrology_services, { ...tempService }]
      }));
      setTempService({
        service_name: '',
        mode: [],
        duration_minutes: '',
        price: '',
        deliverables: ''
      });
    } else {
      toast.error('Please fill service name, mode, and price');
    }
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      astrology_services: prev.astrology_services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.full_name || !formData.mobile || !formData.email || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.astrology_types.length === 0) {
      toast.error('Please select at least one astrology type');
      return;
    }

    if (formData.astrology_services.length === 0) {
      toast.error('Please add at least one service');
      return;
    }

    if (!formData.bio || formData.bio.length < 100) {
      toast.error('Please write a bio of at least 100 characters');
      return;
    }

    // Calculate profile flags
    const flags = [];
    if (formData.associated_temples.length === 0) flags.push('Temple not added');
    if (formData.astrology_services.length < 3) flags.push('Services missing');
    if (formData.bio.length < 150) flags.push('Bio too short');
    if (formData.languages.length === 0) flags.push('No languages specified');

    submitMutation.mutate({
      ...formData,
      age: parseInt(formData.age) || undefined,
      years_of_experience: parseInt(formData.years_of_experience) || 0,
      profile_flags: flags
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <BackButton label="Back to Home" />
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Stars className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                Astrologer Registration
              </h1>
              <p className="text-white/90">Guide seekers with your astrological wisdom</p>
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
                  s <= step ? 'bg-purple-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Personal</span>
            <span>Background</span>
            <span>Services</span>
            <span>Profile</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        <Card className="p-6 md:p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
                <p className="text-gray-600">Tell us about yourself</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Display Name (for public profile) *</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => updateField('display_name', e.target.value)}
                    placeholder="How you want to be called"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Age *</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(val) => updateField('gender', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mobile *</Label>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    placeholder="Mobile number"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <Label>Languages You Speak *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {LANGUAGES.map(lang => (
                    <label key={lang} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.languages.includes(lang)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateField('languages', [...formData.languages, lang]);
                          } else {
                            updateField('languages', formData.languages.filter(l => l !== lang));
                          }
                        }}
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Background */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Astrology Background</h2>
                <p className="text-gray-600">Tell us about your expertise</p>
              </div>

              <div>
                <Label>Years of Experience in Astrology *</Label>
                <Input
                  type="number"
                  value={formData.years_of_experience}
                  onChange={(e) => updateField('years_of_experience', e.target.value)}
                  placeholder="Years"
                />
              </div>

              <div>
                <Label>Types of Astrology You Practice *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {ASTROLOGY_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.astrology_types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateField('astrology_types', [...formData.astrology_types, type]);
                          } else {
                            updateField('astrology_types', formData.astrology_types.filter(t => t !== type));
                          }
                        }}
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Card className="p-4 bg-purple-50">
                <h3 className="font-semibold mb-3">Education & Lineage</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Institution/Gurukul name (if any)"
                    value={formData.education_lineage.institution}
                    onChange={(e) =>
                      updateField('education_lineage', {
                        ...formData.education_lineage,
                        institution: e.target.value
                      })
                    }
                  />
                  <Input
                    placeholder="Guru name (if any)"
                    value={formData.education_lineage.guru_name}
                    onChange={(e) =>
                      updateField('education_lineage', {
                        ...formData.education_lineage,
                        guru_name: e.target.value
                      })
                    }
                  />
                </div>
              </Card>

              <div>
                <h3 className="font-semibold mb-3">Associated Temples/Organizations (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <Input
                    placeholder="Temple/organization name"
                    value={tempTemple.temple_name}
                    onChange={(e) => setTempTemple({ ...tempTemple, temple_name: e.target.value })}
                  />
                  <Input
                    placeholder="City"
                    value={tempTemple.city}
                    onChange={(e) => setTempTemple({ ...tempTemple, city: e.target.value })}
                  />
                  <Button onClick={addAssociatedTemple} variant="outline">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>

                {formData.associated_temples.length > 0 && (
                  <div className="space-y-2">
                    {formData.associated_temples.map((temple, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="text-sm">
                          <strong>{temple.temple_name}</strong>, {temple.city}
                          {temple.role && ` - ${temple.role}`}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeAssociatedTemple(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Services You Provide</h2>
                <p className="text-gray-600">Add the services you offer</p>
              </div>

              <Card className="p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Add Service</h3>
                <div className="space-y-3">
                  <Select
                    value={tempService.service_name}
                    onValueChange={(val) => setTempService({ ...tempService, service_name: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <Label className="mb-2 block">Service Mode *</Label>
                    <div className="flex gap-4">
                      {['chat', 'audio', 'video'].map(mode => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={tempService.mode.includes(mode)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTempService({
                                  ...tempService,
                                  mode: [...tempService.mode, mode]
                                });
                              } else {
                                setTempService({
                                  ...tempService,
                                  mode: tempService.mode.filter(m => m !== mode)
                                });
                              }
                            }}
                          />
                          <span className="text-sm capitalize">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={tempService.duration_minutes}
                      onChange={(e) =>
                        setTempService({ ...tempService, duration_minutes: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Price (₹)"
                      value={tempService.price}
                      onChange={(e) => setTempService({ ...tempService, price: e.target.value })}
                    />
                  </div>

                  <Input
                    placeholder="Deliverables (e.g., PDF report, live call, remedies list)"
                    value={tempService.deliverables}
                    onChange={(e) => setTempService({ ...tempService, deliverables: e.target.value })}
                  />

                  <Button onClick={addService} className="w-full bg-purple-500 hover:bg-purple-600">
                    <Plus className="w-4 h-4 mr-2" /> Add Service
                  </Button>
                </div>
              </Card>

              {formData.astrology_services.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Added Services</h3>
                  {formData.astrology_services.map((service, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.service_name}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {service.mode.map(m => (
                              <span key={m} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {m}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {service.duration_minutes} mins • ₹{service.price}
                          </div>
                          {service.deliverables && (
                            <p className="text-sm text-gray-500 mt-1">{service.deliverables}</p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeService(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Profile */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                <p className="text-gray-600">Help clients understand your expertise</p>
              </div>

              <div>
                <Label>Bio / About You * (min 100 characters)</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell clients about yourself, your style of reading, what you specialize in, your approach to astrology..."
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.bio.length} / 100 characters</p>
              </div>

              <div>
                <Label>Specializations</Label>
                <Input
                  placeholder="e.g., Career astrology expert, Relationship counseling, Nadi specialist"
                  value={formData.specializations.join(', ')}
                  onChange={(e) =>
                    updateField('specializations', e.target.value.split(',').map(s => s.trim()))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple specializations with commas</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before You Submit</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Our team will review your application within 2-3 business days. We may contact you for:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Verification of credentials</li>
                  <li>• Sample consultation review</li>
                  <li>• Profile photo (professional/traditional attire)</li>
                  <li>• Additional service details</li>
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
                className="flex-1 bg-purple-500 hover:bg-purple-600"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
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