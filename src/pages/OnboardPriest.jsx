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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flame, CheckCircle, Loader2, Plus, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';

const LANGUAGES = ['Hindi', 'English', 'Sanskrit', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Marathi', 'Bengali', 'Gujarati'];

export default function OnboardPriest() {
  // Fetch temples and poojas from database
  const { data: temples, isLoading: loadingTemples } = useQuery({
    queryKey: ['temples-list'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_hidden: false })
  });

  const { data: poojas, isLoading: loadingPoojas } = useQuery({
    queryKey: ['poojas-list'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false })
  });
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    display_name: '',
    age: '',
    mobile: '',
    email: '',
    city: '',
    languages: [],
    gotra: '',
    sampradaya: '',
    avatar_url: '',
    
    // Temple Details
    primary_temple: { name: '', city: '', role: '' },
    associated_temples: [],
    
    // Poojas
    selected_poojas: {},
    
    // Profile
    bio: '',
    vedic_training: '',
    specializations: [],
    travel_radius_km: 25,
    outstation_available: false,
    
    // Availability
    availability_slots: []
  });

  const [tempTemple, setTempTemple] = useState({ temple_id: '', temple_name: '', city: '', role: '', years_serving: '' });
  const [tempPooja, setTempPooja] = useState({ name: '', mode: 'in_person', duration: '', dakshina_min: '', dakshina_max: '', samagri: 'devotee' });
  const [customPooja, setCustomPooja] = useState('');

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.ProviderProfile.create({
        ...data,
        user_id: user.id,
        provider_type: 'priest',
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
    if (tempTemple.temple_id && tempTemple.temple_name) {
      setFormData(prev => ({
        ...prev,
        associated_temples: [...prev.associated_temples, { ...tempTemple }]
      }));
      setTempTemple({ temple_id: '', temple_name: '', city: '', role: '', years_serving: '' });
    }
  };

  const removeAssociatedTemple = (index) => {
    setFormData(prev => ({
      ...prev,
      associated_temples: prev.associated_temples.filter((_, i) => i !== index)
    }));
  };

  const togglePooja = (poojaName) => {
    setFormData(prev => ({
      ...prev,
      selected_poojas: {
        ...prev.selected_poojas,
        [poojaName]: prev.selected_poojas[poojaName] ? undefined : {
          at_home: true,
          in_temple: false,
          online_sankalp: false,
          duration: 90,
          dakshina_range: '₹1000-₹5000',
          samagri_by: 'devotee'
        }
      }
    }));
  };

  const updatePoojaDetails = (poojaName, field, value) => {
    setFormData(prev => ({
      ...prev,
      selected_poojas: {
        ...prev.selected_poojas,
        [poojaName]: {
          ...prev.selected_poojas[poojaName],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.full_name || !formData.mobile || !formData.email || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!formData.primary_temple.name || !formData.primary_temple.city) {
      toast.error('Please add your primary temple details');
      return;
    }

    if (Object.keys(formData.selected_poojas).length === 0) {
      toast.error('Please select at least one pooja');
      return;
    }

    if (!formData.bio || formData.bio.length < 100) {
      toast.error('Please write a bio of at least 100 characters');
      return;
    }

    // Calculate profile flags
    const flags = [];
    if (!formData.primary_temple.name) flags.push('Primary temple not added');
    if (Object.keys(formData.selected_poojas).length < 3) flags.push('Limited poojas selected');
    if (formData.bio.length < 150) flags.push('Bio too short');
    if (formData.languages.length === 0) flags.push('No languages specified');

    submitMutation.mutate({
      ...formData,
      age: parseInt(formData.age) || undefined,
      travel_radius_km: parseInt(formData.travel_radius_km) || 25,
      profile_flags: flags
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <BackButton label="Back to Home" />
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                Priest Registration
              </h1>
              <p className="text-white/90">Share your sacred knowledge with devotees nationwide</p>
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
                  s <= step ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Personal</span>
            <span>Temple</span>
            <span>Poojas</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label>Mobile *</Label>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    placeholder="Mobile number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Email address"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Gotra (Optional)</Label>
                  <Input
                    value={formData.gotra}
                    onChange={(e) => updateField('gotra', e.target.value)}
                    placeholder="Your gotra"
                  />
                </div>
                <div>
                  <Label>Sampradaya/Tradition</Label>
                  <Input
                    value={formData.sampradaya}
                    onChange={(e) => updateField('sampradaya', e.target.value)}
                    placeholder="e.g., Advaita, Vaishnava"
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

          {/* Step 2: Temple Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Temple & Association Details</h2>
                <p className="text-gray-600">Where do you perform your services?</p>
              </div>

              <Card className="p-4 bg-orange-50 border-orange-200">
                <h3 className="font-semibold mb-3">Primary Mandir *</h3>
                <p className="text-sm text-gray-600 mb-3">Select from our registered temples</p>
                {loadingTemples ? (
                  <p className="text-sm text-gray-500">Loading temples...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select
                      value={formData.primary_temple.temple_id}
                      onValueChange={(value) => {
                        const temple = temples.find(t => t.id === value);
                        updateField('primary_temple', {
                          temple_id: value,
                          name: temple?.name || '',
                          city: temple?.city || '',
                          role: formData.primary_temple.role
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select temple" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {temples?.map(temple => (
                          <SelectItem key={temple.id} value={temple.id}>
                            {temple.name} - {temple.city}, {temple.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Your role (e.g., Head Priest, Purohit)"
                      value={formData.primary_temple.role}
                      onChange={(e) => updateField('primary_temple', { ...formData.primary_temple, role: e.target.value })}
                    />
                  </div>
                )}
              </Card>

              <div>
                <h3 className="font-semibold mb-3">Other Associated Temples (Optional)</h3>
                <p className="text-sm text-gray-600 mb-3">Select additional temples where you serve</p>
                {loadingTemples ? (
                  <p className="text-sm text-gray-500">Loading temples...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <Select
                      value={tempTemple.temple_id}
                      onValueChange={(value) => {
                        const temple = temples.find(t => t.id === value);
                        setTempTemple({
                          ...tempTemple,
                          temple_id: value,
                          temple_name: temple?.name || '',
                          city: temple?.city || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select temple" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {temples?.map(temple => (
                          <SelectItem key={temple.id} value={temple.id}>
                            {temple.name} - {temple.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Your role"
                      value={tempTemple.role}
                      onChange={(e) => setTempTemple({ ...tempTemple, role: e.target.value })}
                    />
                    <Button onClick={addAssociatedTemple} variant="outline" disabled={!tempTemple.temple_id}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                )}

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

              <div>
                <Label>Vedic Training / Education</Label>
                <Textarea
                  value={formData.vedic_training}
                  onChange={(e) => updateField('vedic_training', e.target.value)}
                  placeholder="Ved Pathshala, Gurukul, traditional learning, etc."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Travel Radius (in km)</Label>
                  <Input
                    type="number"
                    value={formData.travel_radius_km}
                    onChange={(e) => updateField('travel_radius_km', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <Checkbox
                    checked={formData.outstation_available}
                    onCheckedChange={(checked) => updateField('outstation_available', checked)}
                  />
                  <Label>Available for outstation services</Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Poojas */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Poojas & Rituals You Perform</h2>
                <p className="text-gray-600">Select all the poojas you can perform</p>
              </div>

              {loadingPoojas ? (
                <p className="text-sm text-gray-500">Loading poojas...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {poojas?.map(pooja => (
                    <label
                      key={pooja.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.selected_poojas[pooja.name]
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <Checkbox
                        checked={!!formData.selected_poojas[pooja.name]}
                        onCheckedChange={() => togglePooja(pooja.name)}
                      />
                      <span className="text-sm font-medium">{pooja.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {Object.keys(formData.selected_poojas).length > 0 && (
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4">Configure Selected Poojas</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    For each pooja, specify where you can perform it and typical dakshina range
                  </p>
                  <div className="space-y-4">
                    {Object.entries(formData.selected_poojas).map(([poojaName, details]) => (
                      <div key={poojaName} className="border-b pb-4">
                        <h4 className="font-medium mb-2">{poojaName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={details.at_home}
                              onCheckedChange={(checked) =>
                                updatePoojaDetails(poojaName, 'at_home', checked)
                              }
                            />
                            At Home
                          </label>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={details.in_temple}
                              onCheckedChange={(checked) =>
                                updatePoojaDetails(poojaName, 'in_temple', checked)
                              }
                            />
                            In Temple
                          </label>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={details.online_sankalp}
                              onCheckedChange={(checked) =>
                                updatePoojaDetails(poojaName, 'online_sankalp', checked)
                              }
                            />
                            Online Sankalp
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <Input
                            placeholder="Duration (mins)"
                            type="number"
                            value={details.duration}
                            onChange={(e) =>
                              updatePoojaDetails(poojaName, 'duration', e.target.value)
                            }
                            size="sm"
                          />
                          <Input
                            placeholder="Dakshina range (e.g., ₹1000-₹5000)"
                            value={details.dakshina_range}
                            onChange={(e) =>
                              updatePoojaDetails(poojaName, 'dakshina_range', e.target.value)
                            }
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Profile */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                <p className="text-gray-600">Help devotees understand your expertise</p>
              </div>

              <div>
                <Label>Bio / About You * (min 100 characters)</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell devotees about yourself, your training, style of conducting rituals, what you specialize in..."
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.bio.length} / 100 characters</p>
              </div>

              <div>
                <Label>Specializations</Label>
                <Input
                  placeholder="e.g., Expert in Shradh karma, South Indian rituals specialist"
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
                  <li>• Verification of temple association</li>
                  <li>• Additional details about your training</li>
                  <li>• Profile photo in traditional attire</li>
                  <li>• References from temple management (if needed)</li>
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
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
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