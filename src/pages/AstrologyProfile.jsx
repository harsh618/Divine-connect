import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Upload, User, MapPin, Clock, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';

export default function AstrologyProfile() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    birth_name: '',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    profile_image: '',
    additional_notes: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Load existing profile data
        if (userData.astrology_profile) {
          setFormData(userData.astrology_profile);
        }
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe({
        astrology_profile: data
      });
    },
    onSuccess: () => {
      toast.success('Astrology profile updated successfully');
      queryClient.invalidateQueries(['user']);
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_image: file_url });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-pink-50 py-12 px-6">
      <div className="container mx-auto max-w-3xl">
        <BackButton to="Profile" />
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full text-purple-700 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            Astrology Profile
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">
            Your Cosmic Journey
          </h1>
          <p className="text-gray-600">
            Complete your profile for personalized astrology readings
          </p>
        </div>

        <Card className="p-8 shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
                  {formData.profile_image ? (
                    <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 cursor-pointer shadow-lg">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
            </div>

            {/* Birth Name */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-purple-600" />
                Birth Name
              </Label>
              <Input
                value={formData.birth_name}
                onChange={(e) => setFormData({ ...formData, birth_name: e.target.value })}
                placeholder="Enter your birth name"
                required
              />
            </div>

            {/* Birth Date */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Birth Date
              </Label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                required
              />
            </div>

            {/* Birth Time */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Birth Time
              </Label>
              <Input
                type="time"
                value={formData.birth_time}
                onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                required
              />
            </div>

            {/* Birth Place */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Birth Place
              </Label>
              <Input
                value={formData.birth_place}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                placeholder="City, State, Country"
                required
              />
            </div>

            {/* Additional Notes */}
            <div>
              <Label className="mb-2 block">Additional Notes (Optional)</Label>
              <Textarea
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                placeholder="Any specific questions or areas of focus..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white py-6 text-lg"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </Card>

        {formData.birth_date && formData.birth_time && formData.birth_place && (
          <Card className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-orange-50 border-0">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Profile Complete
            </h3>
            <p className="text-sm text-gray-600">
              Your astrology profile is complete! Astrologers can now provide more accurate and personalized readings based on your birth details.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}