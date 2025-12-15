import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettings({ user }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
  });
  const [uploading, setUploading] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Profile updated successfully');
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      queryClient.invalidateQueries(['user']);
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-orange-500 text-white text-2xl">
                {user.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-2 cursor-pointer hover:bg-orange-600">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user.full_name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                value={user.email}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <Button
            onClick={() => updateProfileMutation.mutate(formData)}
            disabled={updateProfileMutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}