import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, RotateCw, Eye, X } from 'lucide-react';

export default function VirtualTempleWalkModal({ isOpen, onClose, temple }) {
  const [rotation, setRotation] = useState(0);

  if (!temple) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {/* 360° Viewer */}
          <div className="relative w-full h-full">
            <img
              src={temple.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200'}
              alt={`${temple.name} Virtual Walk`}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            
            {/* VR Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
            
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <Badge className="bg-amber-500/90 text-black border-0 backdrop-blur-sm">
                <Eye className="w-3 h-3 mr-2" />
                360° Virtual Darshan
              </Badge>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Temple Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h2 className="text-2xl font-serif text-white mb-2">{temple.name}</h2>
              <p className="text-white/80 mb-4">{temple.city}, {temple.state}</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setRotation(prev => prev - 90)}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate Left
                </Button>
                <Button
                  onClick={() => setRotation(prev => prev + 90)}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
                >
                  <RotateCw className="w-4 h-4 mr-2 scale-x-[-1]" />
                  Rotate Right
                </Button>
              </div>
            </div>
          </div>

          {/* Mock VR Navigation Points */}
          <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full bg-amber-500/30 border-2 border-amber-500 animate-pulse cursor-pointer hover:scale-110 transition-transform" title="Main Sanctum" />
          <div className="absolute top-1/3 right-1/3 w-8 h-8 rounded-full bg-amber-500/30 border-2 border-amber-500 animate-pulse cursor-pointer hover:scale-110 transition-transform" title="Prayer Hall" />
        </div>
      </DialogContent>
    </Dialog>
  );
}