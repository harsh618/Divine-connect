import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Crop, X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const ASPECT_RATIOS = {
  'free': { value: undefined, label: 'Free' },
  '1:1': { value: 1, label: '1:1 (Square)' },
  '16:9': { value: 16/9, label: '16:9 (Landscape)' },
  '4:3': { value: 4/3, label: '4:3' },
  '3:2': { value: 3/2, label: '3:2' },
  '9:16': { value: 9/16, label: '9:16 (Portrait)' },
};

export default function ImageCropUpload({ value, onChange, label = "Image" }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('free');
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const imgRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const aspect = ASPECT_RATIOS[aspectRatio].value;
    
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect || width / height,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
    setCompletedCrop(crop);
  };

  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const aspect = ASPECT_RATIOS[ratio].value;
      
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect || width / height,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  };

  const getCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !completedCrop) {
      toast.error('Please select and crop an image');
      return;
    }

    setIsUploading(true);

    try {
      const croppedBlob = await getCroppedImage();
      const croppedFile = new File([croppedBlob], selectedFile.name, { type: 'image/jpeg' });

      const { file_url } = await base44.integrations.Core.UploadFile({ file: croppedFile });

      onChange(file_url);
      toast.success('Image uploaded successfully');
      setShowCropper(false);
      setImageSrc(null);
      setSelectedFile(null);
      setCrop(null);
      setCompletedCrop(null);
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setSelectedFile(null);
    setCrop(null);
    setCompletedCrop(null);
  };

  const handleRemove = () => {
    onChange('');
    toast.success('Image removed');
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {!showCropper && !value && (
        <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors cursor-pointer">
          <label className="flex flex-col items-center gap-3 cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Click to upload image</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </Card>
      )}

      {!showCropper && value && (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img src={value} alt="Uploaded" className="max-h-40 rounded-lg border" />
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <Button size="sm" variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="w-3 h-3 mr-2" />
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>
      )}

      {showCropper && imageSrc && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crop className="w-4 h-4 text-orange-500" />
              <span className="font-medium">Crop Image</span>
            </div>
            <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-96 overflow-auto bg-gray-100 rounded-lg flex items-center justify-center p-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT_RATIOS[aspectRatio].value}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImageLoad}
                alt="Crop"
                className="max-w-full"
              />
            </ReactCrop>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={isUploading}
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Upload Cropped Image
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}