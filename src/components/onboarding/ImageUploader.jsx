import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2, User, Image as ImageIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageUploader({ 
  avatarUrl, 
  setAvatarUrl, 
  galleryImages, 
  setGalleryImages, 
  kycDocumentUrl, 
  setKycDocumentUrl 
}) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingKyc, setUploadingKyc] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
      toast.success('Profile picture uploaded!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    }
    setUploadingAvatar(false);
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploads = await Promise.all(
        files.map(file => base44.integrations.Core.UploadFile({ file }))
      );
      const urls = uploads.map(r => r.file_url);
      setGalleryImages(prev => [...prev, ...urls]);
      toast.success(`${files.length} image(s) uploaded!`);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    }
    setUploadingGallery(false);
  };

  const handleKycUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingKyc(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setKycDocumentUrl(file_url);
      toast.success('KYC document uploaded!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    }
    setUploadingKyc(false);
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className="p-6">
        <Label className="mb-3 block">Profile Picture (1:1 Ratio) *</Label>
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingAvatar}
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('avatar-upload').click();
                }}
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Photo
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Upload a clear photo in traditional or professional attire. Square format recommended (1:1 ratio).
            </p>
            {avatarUrl && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setAvatarUrl('')}
                className="text-red-600 mt-2"
              >
                Remove Photo
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Gallery */}
      <Card className="p-6">
        <Label className="mb-3 block flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Gallery (Optional)
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Upload images of your past work, ceremonies, or consultations (max 6 images)
        </p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryUpload}
          className="hidden"
          id="gallery-upload"
        />
        
        <label htmlFor="gallery-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploadingGallery || galleryImages.length >= 6}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('gallery-upload').click();
            }}
          >
            {uploadingGallery ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload Images
          </Button>
        </label>

        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {galleryImages.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* KYC Document */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <Label className="mb-3 block flex items-center gap-2">
          <FileText className="w-4 h-4" />
          KYC Document (Government ID) *
        </Label>
        <p className="text-sm text-gray-700 mb-4">
          Upload a government-issued ID for verification (Aadhaar, PAN Card, Passport, etc.). 
          This will only be visible to admins for verification purposes.
        </p>

        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleKycUpload}
          className="hidden"
          id="kyc-upload"
        />
        
        <div className="flex items-center gap-3">
          <label htmlFor="kyc-upload">
            <Button
              type="button"
              variant="outline"
              disabled={uploadingKyc}
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('kyc-upload').click();
              }}
            >
              {uploadingKyc ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Document
            </Button>
          </label>

          {kycDocumentUrl && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-700 font-medium">✓ Document uploaded</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setKycDocumentUrl('')}
                className="text-red-600"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}