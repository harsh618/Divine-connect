import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TempleGallerySection({ images, templeName }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSlideIndex, setAutoSlideIndex] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setAutoSlideIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  const openViewer = (index) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      {/* Auto-sliding Gallery Carousel */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-black">
        {/* Slides */}
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            initial={false}
            animate={{
              opacity: idx === autoSlideIndex ? 1 : 0,
              scale: idx === autoSlideIndex ? 1 : 1.1
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={img}
              alt={`${templeName} ${idx + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openViewer(idx)}
            />
          </motion.div>
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Navigation Arrows */}
        <button
          onClick={() => setAutoSlideIndex((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setAutoSlideIndex((prev) => (prev + 1) % images.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setAutoSlideIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === autoSlideIndex ? 'w-8 bg-amber-500' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* Caption */}
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-sm text-white/60 font-mono uppercase tracking-wider">Gallery</p>
          <p className="text-lg font-serif">{templeName}</p>
        </div>
      </div>

      {/* Lightbox Viewer */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 bg-black border-0">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={images[currentIndex]}
              alt={`${templeName} ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}