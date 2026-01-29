import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Sparkles, 
  MapPin, 
  Heart,
  ArrowRight,
  Plane,
  Hotel,
  Camera
} from 'lucide-react';

export default function TempleDivineExperienceCTA({ 
  temple, 
  onBookDarshan, 
  onPlanTrip, 
  onDonate 
}) {
  if (!temple) return null;

  const experiences = [
    {
      icon: CalendarDays,
      title: "Book Darshan",
      description: "Reserve your sacred time with the divine",
      action: onBookDarshan,
      color: "from-amber-500 to-orange-500",
      primary: true
    },
    {
      icon: MapPin,
      title: "Plan Your Yatra",
      description: "AI-powered itinerary for your pilgrimage",
      action: onPlanTrip,
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Heart,
      title: "Make a Donation",
      description: "Support the temple's divine mission",
      action: onDonate,
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
      className="py-20 md:py-32 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1609766857326-18c0a0e2fa0e?w=1920')] bg-cover bg-center opacity-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Begin Your Sacred Journey</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
            Ready to Experience<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Divine Blessings?
            </span>
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Book your personalized spiritual experience at {temple.name}. 
            From darshan to complete pilgrimage planning, we're here to guide your journey.
          </p>
        </motion.div>

        {/* Experience Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <button
                onClick={exp.action}
                className={`w-full p-8 rounded-2xl border transition-all duration-300 text-left group ${
                  exp.primary 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-400/50 hover:shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  exp.primary ? 'bg-white/20' : `bg-gradient-to-br ${exp.color}`
                }`}>
                  <exp.icon className={`w-7 h-7 ${exp.primary ? 'text-white' : 'text-white'}`} />
                </div>
                
                <h3 className={`text-2xl font-serif mb-2 ${exp.primary ? 'text-white' : 'text-white'}`}>
                  {exp.title}
                </h3>
                
                <p className={`text-sm mb-6 ${exp.primary ? 'text-white/80' : 'text-white/50'}`}>
                  {exp.description}
                </p>
                
                <div className={`inline-flex items-center gap-2 text-sm font-medium ${
                  exp.primary ? 'text-white' : 'text-amber-400'
                } group-hover:gap-3 transition-all`}>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/40"
        >
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            <span className="text-sm">Travel Assistance</span>
          </div>
          <div className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            <span className="text-sm">Stay Options</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <span className="text-sm">Virtual Darshan</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}