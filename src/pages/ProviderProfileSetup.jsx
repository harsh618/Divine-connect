import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Star, Languages, Award, IndianRupee, Upload, Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const languages = ['Hindi', 'English', 'Sanskrit', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati'];

const priestSpecializations = [
  'Vedic Rituals',
  'Poojas',
  'Havans',
  'Weddings',
  'Griha Pravesh',
  'Satyanarayan Katha',
  'Namkaran',
  'Thread Ceremony',
  'Last Rites',
  'Temple Worship'
];

const astrologerSpecializations = [
  'Vedic Astrology',
  'Numerology',
  'Palmistry',
  'Vastu Shastra',
  'Tarot Reading',
  'Kundli Matching',
  'Career Counseling',
  'Relationship Advice',
  'Gemstone Recommendation',
  'Muhurat Selection'
];

export default function ProviderProfileSetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    provider_type: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    years_of_experience: '',
    languages: [],
    specializations: [],
    certifications: [],
    consultation_rate_chat: '',
    consultation_rate_voice: '',
    consultation_rate_video: '',
  });

  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingProfile } = useQuery({
    queryKey: ['provider-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await base44.entities.ProviderProfile.filter({ user_id: user.id });
      return profiles[0] || null;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        provider_type: existingProfile.provider_type || '',
        display_name: existingProfile.display_name || '',
        bio: existingProfile.bio || '',
        avatar_url: existingProfile.avatar_url || '',
        years_of_experience: existingProfile.years_of_experience || '',
        languages: existingProfile.languages || [],
        specializations: existingProfile.specializations || [],
        certifications: existingProfile.certifications || [],
        consultation_rate_chat: existingProfile.consultation_rate_chat || '',
        consultation_rate_voice: existingProfile.consultation_rate_voice || '',
        consultation_rate_video: existingProfile.consultation_rate_video || '',
      });
    }
  }, [existingProfile]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, avatar_url: file_url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addItem = (field, value, setter) => {
    if (value && !formData[field].includes(value)) {
      setFormData({ ...formData, [field]: [...formData[field], value] });
      setter('');
    }
  };

  const removeItem = (field, item) => {
    setFormData({ ...formData, [field]: formData[field].filter(i => i !== item) });
  };

  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProfile) {
        return await base44.entities.ProviderProfile.update(existingProfile.id, data);
      }
      return await base44.entities.ProviderProfile.create({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      toast.success(existingProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
      setTimeout(() => navigate(createPageUrl('Profile')), 1500);
    },
    onError: () => {
      toast.error('Failed to save profile');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.provider_type || !formData.display_name || !formData.bio) {
      toast.error('Please fill all required fields');
      return;
    }

    const dataToSave = {
      ...formData,
      years_of_experience: parseInt(formData.years_of_experience) || 0,
      consultation_rate_chat: parseFloat(formData.consultation_rate_chat) || 0,
      consultation_rate_voice: parseFloat(formData.consultation_rate_voice) || 0,
      consultation_rate_video: parseFloat(formData.consultation_rate_video) || 0,
    };

    createProfileMutation.mutate(dataToSave);
  };

  const availableSpecializations = formData.provider_type === 'priest' 
    ? priestSpecializations 
    : astrologerSpecializations;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">
            {existingProfile ? 'Edit Your Profile' : 'Create Your Provider Profile'}
          </h1>
          <p className="text-gray-600">
            Set up your professional profile to start connecting with devotees
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-8">
            {/* Provider Type */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-orange-500" />
                Provider Type *
              </Label>
              <Select 
                value={formData.provider_type} 
                onValueChange={(value) => setFormData({ ...formData, provider_type: value, specializations: [] })}
                disabled={!!existingProfile}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priest">Priest / Pandit</SelectItem>
                  <SelectItem value="astrologer">Astrologer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Avatar Upload */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Upload className="w-5 h-5 text-orange-500" />
                Profile Photo
              </Label>
              <div className="flex items-center gap-4">
                {formData.avatar_url && (
                  <img 
                    src={formData.avatar_url} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                  />
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Display Name *
              </Label>
              <Input
                placeholder="e.g., Pandit Rajesh Sharma"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Bio */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Bio / About You *
              </Label>
              <Textarea
                placeholder="Tell devotees about yourself, your experience, and what makes you unique..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
                className="resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">{formData.bio.length} / 500 characters</p>
            </div>

            {/* Experience */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-orange-500" />
                Years of Experience *
              </Label>
              <Input
                type="number"
                placeholder="e.g., 15"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                className="h-12"
                min="0"
              />
            </div>

            {/* Languages */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Languages className="w-5 h-5 text-orange-500" />
                Languages Spoken
              </Label>
              <div className="flex gap-2 mb-3">
                <Select value={newLanguage} onValueChange={setNewLanguage}>
                  <SelectTrigger className="h-12 flex-1">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={() => addItem('languages', newLanguage, setNewLanguage)}
                  className="h-12"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map(lang => (
                  <Badge key={lang} variant="secondary" className="px-3 py-1">
                    {lang}
                    <X 
                      className="w-3 h-3 ml-2 cursor-pointer" 
                      onClick={() => removeItem('languages', lang)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Specializations */}
            {formData.provider_type && (
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-orange-500" />
                  Specializations
                </Label>
                <div className="flex gap-2 mb-3">
                  <Select value={newSpecialization} onValueChange={setNewSpecialization}>
                    <SelectTrigger className="h-12 flex-1">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecializations.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    onClick={() => addItem('specializations', newSpecialization, setNewSpecialization)}
                    className="h-12"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map(spec => (
                    <Badge key={spec} variant="secondary" className="px-3 py-1">
                      {spec}
                      <X 
                        className="w-3 h-3 ml-2 cursor-pointer" 
                        onClick={() => removeItem('specializations', spec)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-orange-500" />
                Certifications & Qualifications
              </Label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="e.g., Vedic Studies from Banaras Hindu University"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  className="h-12"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('certifications', newCertification, setNewCertification);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={() => addItem('certifications', newCertification, setNewCertification)}
                  className="h-12"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map(cert => (
                  <Badge key={cert} variant="secondary" className="px-3 py-1">
                    {cert}
                    <X 
                      className="w-3 h-3 ml-2 cursor-pointer" 
                      onClick={() => removeItem('certifications', cert)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Consultation Rates */}
            {formData.provider_type === 'astrologer' && (
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-4">
                  <IndianRupee className="w-5 h-5 text-orange-500" />
                  Consultation Rates (per minute)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Chat Rate</Label>
                    <Input
                      type="number"
                      placeholder="₹10"
                      value={formData.consultation_rate_chat}
                      onChange={(e) => setFormData({ ...formData, consultation_rate_chat: e.target.value })}
                      className="h-11"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Voice Call Rate</Label>
                    <Input
                      type="number"
                      placeholder="₹15"
                      value={formData.consultation_rate_voice}
                      onChange={(e) => setFormData({ ...formData, consultation_rate_voice: e.target.value })}
                      className="h-11"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Video Call Rate</Label>
                    <Input
                      type="number"
                      placeholder="₹20"
                      value={formData.consultation_rate_video}
                      onChange={(e) => setFormData({ ...formData, consultation_rate_video: e.target.value })}
                      className="h-11"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600"
                disabled={createProfileMutation.isPending}
              >
                {createProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {existingProfile ? 'Update Profile' : 'Create Profile'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12"
                onClick={() => navigate(createPageUrl('Profile'))}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}