import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, MapPin, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MinimalHero() {
  const [city, setCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cities = ['All Cities', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Varanasi', 'Ayodhya'];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/86675d36b_pexels-som-108593-3098608.jpg"
          alt="Temple"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-orange-200 text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          Welcome to Divine
        </div>
        
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6 tracking-tight">
          Divine
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 font-light">
          Your spiritual journey, simplified
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Temples')}>
            <Button
              size="lg"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 rounded-full px-8 py-6 text-lg"
            >
              Explore Temples
            </Button>
          </Link>
          <Link to={createPageUrl('Astrology')}>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white px-8 py-6 text-lg rounded-full border border-white/30 hover:bg-white/10"
            >
              Consult Astrologer
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}