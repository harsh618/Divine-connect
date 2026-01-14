import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  Flame, 
  Stars, 
  Hotel,
  Plus,
  Upload,
  Check,
  Loader2,
  ChevronLeft,
  Mail,
  Phone,
  Building2,
  CreditCard,
  FileText,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const PROVIDER_TYPES = [
  { value: 'priest', label: 'Priest/Pandit', icon: Flame, color: 'bg-orange-100 text-orange-700' },
  { value: 'astrologer', label: 'Astrologer', icon: Stars, color: 'bg-purple-100 text-purple-700' },
  { value: 'hotel', label: 'Hotel Partner', icon: Hotel, color: 'bg-blue-100 text-blue-700' }
];

const PRIEST_SPECIALIZATIONS = [
  'Marriage Ceremonies', 'Griha Pravesh', 'Mundan', 'Last Rites', 
  'Daily Pooja', 'Homam/Havan', 'Satyanarayan Pooja', 'Rudrabhishek',
  'Vastu Shanti', 'Navagraha Pooja'
];

const ASTROLOGER_SPECIALIZATIONS = [
  'Vedic Astrology', 'Numerology', 'Palmistry', 'Vastu', 
  'Tarot Reading', 'Gemology', 'KP Astrology', 'Prashna Kundli'
];

const LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Sanskrit'
];

const HOTEL_TYPES = [
  'Budget', '2 Star', '3 Star', '4 Star', '5 Star', 'Dharamshala', 'Guest House'
];

export default function AdminProviderOnboarding() {
  const queryClient = useQueryClient();
  const [providerType, setProviderType] = useState('');
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Common fields
  const [formData, setFormData] = useState({
    // Basic Info
    email: '',
    mobile: '',
    full_name: '',
    
    // Priest/Astrologer fields
    temple_affiliation: '',
    id_number: '',
    years_of_experience: '',
    specializations: [],
    languages: [],
    hourly_rate: '',
    bio: '',
    
    // Hotel fields
    hotel_name: '',
    hotel_type: '',
    gst_number: '',
    pan_number: '',
    address: '',
    city: '',
    state: '',
    
    // Bank Details
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    
    // Files
    profile_photo_url: '',
    certificate_url: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  // Create provider mutation
  const createProviderMutation = useMutation({
    mutationFn: async () => {
      if (providerType === 'hotel') {
        // Create Hotel entity
        const hotel = await base44.entities.Hotel.create({
          name: formData.hotel_name,
          description: formData.bio,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          contact_phone: formData.mobile,
          contact_email: formData.email,
          is_active: true,
          room_inventory: []
        });
        return hotel;
      } else {
        // Create ProviderProfile
        const profile = await base44.entities.ProviderProfile.create({
          provider_type: providerType,
          display_name: formData.full_name,
          full_name: formData.full_name,
          email: formData.email,
          mobile: formData.mobile,
          bio: formData.bio,
          years_of_experience: Number(formData.years_of_experience) || 0,
          languages: formData.languages,
          specializations: formData.specializations,
          avatar_url: formData.profile_photo_url,
          kyc_document_url: formData.certificate_url,
          profile_status: 'approved',
          is_verified: true,
          ...(providerType === 'astrologer' && {
            consultation_rate_chat: Number(formData.hourly_rate) || 500,
            consultation_rate_voice: Number(formData.hourly_rate) || 700,
            consultation_rate_video: Number(formData.hourly_rate) || 1000,
            astrology_types: formData.specializations
          }),
          ...(providerType === 'priest' && {
            primary_temple: formData.temple_affiliation ? {
              name: formData.temple_affiliation,
              city: formData.city
            } : null,
            priest_services: formData.specializations.map(s => ({
              pooja_name: s,
              at_home: true,
              in_temple: true,
              online_sankalp: true
            }))
          })
        });
        return profile;
      }
    },
    onSuccess: () => {
      setShowSuccessModal(true);
      queryClient.invalidateQueries(['providers']);
    },
    onError: (error) => {
      toast.error('Failed to create provider: ' + error.message);
    }
  });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateField(field, file_url);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.email || !formData.mobile || !formData.full_name) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (providerType === 'hotel' && !formData.hotel_name) {
      toast.error('Hotel name is required');
      return;
    }
    
    createProviderMutation.mutate();
  };

  const resetForm = () => {
    setProviderType('');
    setStep(1);
    setFormData({
      email: '', mobile: '', full_name: '', temple_affiliation: '',
      id_number: '', years_of_experience: '', specializations: [],
      languages: [], hourly_rate: '', bio: '', hotel_name: '',
      hotel_type: '', gst_number: '', pan_number: '', address: '',
      city: '', state: '', account_holder_name: '', account_number: '',
      ifsc_code: '', bank_name: '', profile_photo_url: '', certificate_url: ''
    });
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link to={createPageUrl('AdminDashboard')} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-bold text-white">Add New Provider</h1>
          <p className="text-white/80 mt-1">Onboard priests, astrologers, or hotel partners</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 -mt-6">
        <Card className="p-8 shadow-xl">
          {/* Step 1: Select Provider Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Select Provider Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROVIDER_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => {
                        setProviderType(type.value);
                        setStep(2);
                      }}
                      className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                        providerType === type.value 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl ${type.color} flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{type.label}</h3>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Badge className={PROVIDER_TYPES.find(t => t.value === providerType)?.color}>
                  {PROVIDER_TYPES.find(t => t.value === providerType)?.label}
                </Badge>
                <span className="text-gray-400">Step 2 of 3</span>
              </div>

              <h2 className="text-xl font-semibold">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Fields */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    placeholder="provider@email.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Mobile Number *
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    {providerType === 'hotel' ? 'Contact Person Name *' : 'Full Name *'}
                  </Label>
                  <Input
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Hotel-specific fields */}
                {providerType === 'hotel' && (
                  <>
                    <div className="md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        Hotel Name *
                      </Label>
                      <Input
                        placeholder="Enter hotel name"
                        value={formData.hotel_name}
                        onChange={(e) => updateField('hotel_name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Hotel Type</Label>
                      <Select value={formData.hotel_type} onValueChange={(v) => updateField('hotel_type', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOTEL_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>GST Number</Label>
                      <Input
                        placeholder="22AAAAA0000A1Z5"
                        value={formData.gst_number}
                        onChange={(e) => updateField('gst_number', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>City *</Label>
                      <Input
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <Input
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Full Address</Label>
                      <Textarea
                        placeholder="Enter complete address"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </>
                )}

                {/* Priest-specific fields */}
                {providerType === 'priest' && (
                  <>
                    <div>
                      <Label>Temple Affiliation</Label>
                      <Input
                        placeholder="Temple name (if any)"
                        value={formData.temple_affiliation}
                        onChange={(e) => updateField('temple_affiliation', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Priest ID Number</Label>
                      <Input
                        placeholder="For verification"
                        value={formData.id_number}
                        onChange={(e) => updateField('id_number', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={formData.years_of_experience}
                        onChange={(e) => updateField('years_of_experience', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {/* Astrologer-specific fields */}
                {providerType === 'astrologer' && (
                  <>
                    <div>
                      <Label>Registration Number</Label>
                      <Input
                        placeholder="Astrologer ID"
                        value={formData.id_number}
                        onChange={(e) => updateField('id_number', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={formData.years_of_experience}
                        onChange={(e) => updateField('years_of_experience', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Hourly Rate (₹)</Label>
                      <Input
                        type="number"
                        placeholder="500"
                        value={formData.hourly_rate}
                        onChange={(e) => updateField('hourly_rate', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} className="bg-orange-500 hover:bg-orange-600">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Specializations & Bank Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Badge className={PROVIDER_TYPES.find(t => t.value === providerType)?.color}>
                  {PROVIDER_TYPES.find(t => t.value === providerType)?.label}
                </Badge>
                <span className="text-gray-400">Step 3 of 3</span>
              </div>

              {/* Specializations for Priest/Astrologer */}
              {(providerType === 'priest' || providerType === 'astrologer') && (
                <>
                  <div>
                    <Label className="font-semibold mb-3 block">Specializations</Label>
                    <div className="flex flex-wrap gap-2">
                      {(providerType === 'priest' ? PRIEST_SPECIALIZATIONS : ASTROLOGER_SPECIALIZATIONS).map(spec => (
                        <button
                          key={spec}
                          onClick={() => toggleArrayField('specializations', spec)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            formData.specializations.includes(spec)
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-semibold mb-3 block">Languages Known</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang}
                          onClick={() => toggleArrayField('languages', lang)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            formData.languages.includes(lang)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Bio / Description</Label>
                    <Textarea
                      placeholder="Brief description about experience and services..."
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4 text-gray-400" />
                        Profile Photo
                      </Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                        {formData.profile_photo_url ? (
                          <div className="relative">
                            <img src={formData.profile_photo_url} alt="Profile" className="w-20 h-20 rounded-full mx-auto object-cover" />
                            <Check className="w-5 h-5 text-green-500 absolute top-0 right-1/3" />
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'profile_photo_url')}
                              className="hidden"
                              id="profile-upload"
                            />
                            <label htmlFor="profile-upload" className="text-sm text-orange-600 cursor-pointer hover:underline">
                              Upload Photo
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        Certificate (PDF)
                      </Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                        {formData.certificate_url ? (
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="w-8 h-8 text-green-500" />
                            <Check className="w-5 h-5 text-green-500" />
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileUpload(e, 'certificate_url')}
                              className="hidden"
                              id="cert-upload"
                            />
                            <label htmlFor="cert-upload" className="text-sm text-orange-600 cursor-pointer hover:underline">
                              Upload Certificate
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Bank Details */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  Bank Details (for payouts)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Account Holder Name</Label>
                    <Input
                      placeholder="Name as per bank"
                      value={formData.account_holder_name}
                      onChange={(e) => updateField('account_holder_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      placeholder="Bank name"
                      value={formData.bank_name}
                      onChange={(e) => updateField('bank_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Account number"
                      value={formData.account_number}
                      onChange={(e) => updateField('account_number', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>IFSC Code</Label>
                    <Input
                      placeholder="IFSC code"
                      value={formData.ifsc_code}
                      onChange={(e) => updateField('ifsc_code', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createProviderMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  {createProviderMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Create Provider
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Provider Added!</h2>
            <p className="text-gray-600 mb-6">
              {providerType === 'hotel' ? 'Hotel partner' : providerType.charAt(0).toUpperCase() + providerType.slice(1)} has been successfully onboarded.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Add Another
              </Button>
              <Link to={createPageUrl('AdminDashboard')} className="flex-1">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}