import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageUpload({ images = [], onImagesChange, thumbnailUrl, onThumbnailChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      
      onImagesChange([...images, ...newUrls]);
      
      // Set first uploaded image as thumbnail if no thumbnail exists
      if (!thumbnailUrl && newUrls.length > 0) {
        onThumbnailChange(newUrls[0]);
      }
      
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    const newImages = images.filter(img => img !== url);
    onImagesChange(newImages);
    
    // If removed image was thumbnail, set new thumbnail
    if (url === thumbnailUrl && newImages.length > 0) {
      onThumbnailChange(newImages[0]);
    } else if (newImages.length === 0) {
      onThumbnailChange('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Images {images.length > 0 && `(${images.length})`}
        </label>
        
        <div className="grid grid-cols-3 gap-3 mb-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`Upload ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              
              {/* Thumbnail Badge */}
              {url === thumbnailUrl && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Thumbnail
                </div>
              )}
              
              {/* Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {url !== thumbnailUrl && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onThumbnailChange(url)}
                    className="text-xs"
                  >
                    Set as Thumbnail
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(url)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Images
              </span>
            </Button>
          </label>
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Upload multiple images. Click "Set as Thumbnail" to choose which image appears in listings.
        </p>
      </div>
    </div>
  );
}