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
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 font-light max-w-3xl mx-auto">
          Discover temples, book poojas and astrologers, and donate to trusted causes across India
        </p>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-3 bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full p-3 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search temples, poojas, astrologers, or causes..."
                className="flex-1 py-3 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full md:w-48 bg-white border-0 rounded-full h-12 px-6 font-medium">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase().replace(' ', '-')}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Temples')}>
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Explore Temples
            </Button>
          </Link>
          <Link to={createPageUrl('Astrology')}>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent text-white px-8 py-6 text-lg font-medium rounded-full border-2 border-white/40 hover:bg-white/10 hover:border-white/60 transition-all"
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