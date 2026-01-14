import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { 
  User, 
  Upload, 
  Video, 
  Languages, 
  Award, 
  Building2,
  Save,
  Loader2,
  Camera,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

const SPECIALIZATIONS = [
  'Rudrabhishek', 'Satyanarayan Pooja', 'Ganesh Pooja', 'Lakshmi Pooja',
  'Navgraha Shanti', 'Vastu Pooja', 'Griha Pravesh', 'Vivah Sanskar',
  'Mundan', 'Namkaran', 'Katha', 'Havan', 'Durga Pooja', 'Shiv Pooja'
];

const LANGUAGES = [
  'Hindi', 'Sanskrit', 'English', 'Tamil', 'Telugu', 'Kannada', 
  'Malayalam', 'Bengali', 'Gujarati', 'Marathi', 'Punjabi'
];

export default function PriestProfileEditor({ profile, onSave }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    city: profile?.city || '',
    address: profile?.address || '',
    years_of_experience: profile?.years_of_experience || 0,
    languages: profile?.languages || [],
    specializations: profile?.specializations || [],
    gotra: profile?.gotra || '',
    sampradaya: profile?.sampradaya || '',
    vedic_training: profile?.vedic_training || '',
    travel_radius_km: profile?.travel_radius_km || 25,
    outstation_available: profile?.outstation_available || false,
    is_available_online: profile?.is_available_online || true,
    is_available_offline: profile?.is_available_offline || true,
    avatar_url: profile?.avatar_url || '',
    gallery_images: profile?.gallery_images || [],
    consultation_rate_chat: profile?.consultation_rate_chat || 0,
    consultation_rate_voice: profile?.consultation_rate_voice || 0,
    consultation_rate_video: profile?.consultation_rate_video || 0,
  });

  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ProviderProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-profile']);
      toast.success('Profile updated successfully!');
      onSave?.();
    },
    onError: (error) => {
      toast.error('Failed to update profile');
    }
  });

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'avatar') {
        setFormData(prev => ({ ...prev, avatar_url: file_url }));
      } else if (type === 'gallery') {
        setFormData(prev => ({ 
          ...prev, 
          gallery_images: [...prev.gallery_images, file_url] 
        }));
      }
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  };

  const removeGalleryImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== idx)
    }));
  };

  const toggleSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo & Basic Info */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-orange-600" />
          Personal Information
        </h3>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-orange-500 rounded-full text-white cursor-pointer hover:bg-orange-600">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Profile Photo</p>
          </div>

          {/* Basic Fields */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Display Name *</Label>
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Pandit Sharma Ji"
              />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Full legal name"
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Your city"
              />
            </div>
            <div>
              <Label>Years of Experience</Label>
              <Input
                type="number"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Bio / Introduction</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell devotees about yourself, your background, and your expertise..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Introduction Video */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-orange-600" />
          Introduction Video
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add a 2-minute introduction video to help devotees know you better
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Video className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-2">Upload introduction video (max 2 minutes)</p>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </Card>

      {/* Specializations */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-600" />
          Specializations
        </h3>
        <p className="text-sm text-gray-600 mb-4">Select the poojas and rituals you specialize in</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              onClick={() => toggleSpecialization(spec)}
              className={`px-3 py-2 rounded-lg border transition-all ${
                formData.specializations.includes(spec)
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </Card>

      {/* Languages */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-orange-600" />
          Languages Known
        </h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-2 rounded-lg border transition-all ${
                formData.languages.includes(lang)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </Card>

      {/* Traditional Background */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-600" />
          Traditional Background
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Gotra</Label>
            <Input
              value={formData.gotra}
              onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
              placeholder="e.g., Kashyap"
            />
          </div>
          <div>
            <Label>Sampradaya</Label>
            <Input
              value={formData.sampradaya}
              onChange={(e) => setFormData({ ...formData, sampradaya: e.target.value })}
              placeholder="e.g., Shaiva, Vaishnava"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Vedic Training</Label>
            <Textarea
              value={formData.vedic_training}
              onChange={(e) => setFormData({ ...formData, vedic_training: e.target.value })}
              placeholder="Details about your Ved Pathshala, Gurukul, traditional learning..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Service Availability */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Service Availability</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Available for Online/Virtual Services</p>
              <p className="text-sm text-gray-500">Video calls, virtual poojas</p>
            </div>
            <Checkbox
              checked={formData.is_available_online}
              onCheckedChange={(v) => setFormData({ ...formData, is_available_online: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Available for In-Person Services</p>
              <p className="text-sm text-gray-500">Home visits, temple poojas</p>
            </div>
            <Checkbox
              checked={formData.is_available_offline}
              onCheckedChange={(v) => setFormData({ ...formData, is_available_offline: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Available for Outstation Travel</p>
              <p className="text-sm text-gray-500">Willing to travel to other cities</p>
            </div>
            <Checkbox
              checked={formData.outstation_available}
              onCheckedChange={(v) => setFormData({ ...formData, outstation_available: v })}
            />
          </div>
          <div>
            <Label>Travel Radius (km)</Label>
            <Input
              type="number"
              value={formData.travel_radius_km}
              onChange={(e) => setFormData({ ...formData, travel_radius_km: Number(e.target.value) })}
              placeholder="25"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum distance you're willing to travel for home visits</p>
          </div>
        </div>
      </Card>

      {/* Gallery */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Photo Gallery</h3>
        <p className="text-sm text-gray-600 mb-4">Upload photos of previous poojas and ceremonies</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.gallery_images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeGalleryImage(idx)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-colors">
            <Plus className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500 mt-1">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'gallery')}
            />
          </label>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button 
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600 px-8"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Profile
        </Button>
      </div>
    </div>
  );
}