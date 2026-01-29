import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  ChevronLeft, 
  Share2, 
  Heart, 
  Video,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function TempleHeroRedesign({ 
  temple, 
  images, 
  isFavorite, 
  onBack, 
  onShare, 
  onToggleFavorite,
  onScrollDown 
}) {
  if (!temple) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Ken Burns Effect */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0"
      >
        <img
          src={images[0]}
          alt={temple.name}
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Live Darshan Badge */}
      {temple.live_darshan_url && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => window.open(temple.live_darshan_url, '_blank')}
          className="absolute top-24 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-red-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-red-600 transition-colors"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <Video className="w-4 h-4" />
          Live Darshan
        </motion.button>
      )}

      {/* Main Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          {/* Deity Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">{temple.primary_deity}</span>
          </motion.div>

          {/* Temple Name */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 leading-none">
            {temple.name}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-3 text-white/70 mb-8">
            <MapPin className="w-5 h-5 text-amber-400" />
            <span className="text-lg">{temple.city}, {temple.state}</span>
          </div>

          {/* Tagline */}
          {temple.tagline && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
            >
              {temple.tagline}
            </motion.p>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onScrollDown}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Discover More</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}