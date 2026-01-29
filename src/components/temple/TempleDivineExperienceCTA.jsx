import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Sparkles, 
  MapPin, 
  Heart,
  ArrowRight,
  X
} from 'lucide-react';

export default function TempleDivineExperienceCTA({ 
  temple, 
  onBookDarshan, 
  onPlanTrip, 
  onDonate,
  triggerRef 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  useEffect(() => {
    if (hasBeenClosed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show popup when user scrolls past the trigger (hero section)
        if (!entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (triggerRef?.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [triggerRef, hasBeenClosed]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenClosed(true);
  };

  if (!temple) return null;

  const experiences = [
    {
      icon: CalendarDays,
      title: "Book Darshan",
      description: "Reserve your sacred time",
      action: onBookDarshan,
      primary: true
    },
    {
      icon: MapPin,
      title: "Plan Yatra",
      description: "AI-powered itinerary",
      action: onPlanTrip
    },
    {
      icon: Heart,
      title: "Donate",
      description: "Support the temple",
      action: onDonate
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-x-4 bottom-24 md:inset-x-auto md:right-6 md:bottom-28 md:w-[400px] z-50"
        >
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="p-6 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full mb-3">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 text-xs font-medium">Begin Your Journey</span>
              </div>
              
              <h3 className="text-xl font-serif text-white mb-1">
                Ready for <span className="text-amber-400">Divine Blessings?</span>
              </h3>
              <p className="text-xs text-white/50">
                Book your personalized spiritual experience
              </p>
            </div>

            {/* Action Cards */}
            <div className="px-4 pb-4 space-y-2">
              {experiences.map((exp) => (
                <button
                  key={exp.title}
                  onClick={() => { exp.action(); handleClose(); }}
                  className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all text-left group ${
                    exp.primary 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    exp.primary ? 'bg-white/20' : 'bg-amber-500/20'
                  }`}>
                    <exp.icon className={`w-5 h-5 ${exp.primary ? 'text-white' : 'text-amber-400'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${exp.primary ? 'text-white' : 'text-white'}`}>
                      {exp.title}
                    </h4>
                    <p className={`text-xs ${exp.primary ? 'text-white/70' : 'text-white/50'}`}>
                      {exp.description}
                    </p>
                  </div>
                  
                  <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${
                    exp.primary ? 'text-white' : 'text-amber-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}