import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Image, Video, FileText, X, ChevronLeft, ChevronRight, 
  Play, Download, ZoomIn
} from 'lucide-react';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
  'https://images.unsplash.com/photo-1609619385002-f40f1bce0151?w=800',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
];

export default function PriestGallerySection({ provider }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = provider.gallery_images?.length > 0 
    ? provider.gallery_images 
    : PLACEHOLDER_IMAGES;

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const navigateLightbox = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Image className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
          </div>
          <span className="text-sm text-gray-500">{images.length} photos</span>
        </div>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="photos" className="text-sm">
              <Image className="w-4 h-4 mr-2" /> Photos
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-sm">
              <Video className="w-4 h-4 mr-2" /> Videos
            </TabsTrigger>
            <TabsTrigger value="certificates" className="text-sm">
              <FileText className="w-4 h-4 mr-2" /> Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => openLightbox(idx)}
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No videos uploaded yet</p>
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Certificates will be displayed here</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Gallery preview"
              className="w-full max-h-[80vh] object-contain"
            />
            
            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => navigateLightbox('prev')}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => navigateLightbox('next')}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}