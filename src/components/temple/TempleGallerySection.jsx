import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TempleGallerySection({ images, templeName }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openViewer = (index) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="py-16 md:py-24 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-mono text-sm tracking-[0.3em] uppercase">Visual Journey</span>
            <h2 className="text-4xl font-serif text-gray-900 mt-4">Temple Gallery</h2>
          </div>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.slice(0, 8).map((img, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => openViewer(idx)}
                className={`relative group overflow-hidden rounded-xl ${
                  idx === 0 ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <img
                  src={img}
                  alt={`${templeName} ${idx + 1}`}
                  className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    idx === 0 ? 'h-[400px]' : 'h-[190px]'
                  }`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

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