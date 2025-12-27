import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles } from 'lucide-react';
import HeroSearch from './HeroSearch';

const heroImages = [
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/8cd80df37_pexels-thash-11656202.jpg',
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/e5cfb95bd_pexels-imauritian-5729118.jpg',
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/97260da21_pexels-anirudh-kashyap-1066393-4511745.jpg',
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/9c83da7a3_pexels-som-108593-3098608.jpg'];


export default function MinimalHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const placeholders = [
    'I want to visit Kashi Vishwanath...',
    'Book a Puja for peace...',
    'Find an astrologer...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const text = placeholders[currentImageIndex % placeholders.length];
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index));
        index++;
      }
    }, 50);
    return () => clearInterval(timer);
  }, [currentImageIndex]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) =>
        <img
          key={image}
          src={image}
          alt={`Temple ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 scale-105 ${
          index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`
          } />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-neutral-950" />
      </div>

      {/* Aurora Gradient Blob */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-medium text-white mb-6 tracking-tight leading-[0.95] mix-blend-overlay">
          Find Your Inner<br />Sanctum
        </h1>
        
        <p className="text-lg md:text-xl text-white/70 mb-16 font-light tracking-wide max-w-2xl mx-auto">
          Step into a portal of ancient wisdom and modern spirituality
        </p>

        {/* Floating Omnibox */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-[0_0_60px_-15px_rgba(217,119,6,0.3)] animate-[breathing_4s_ease-in-out_infinite]">
            <div className="flex items-center gap-4 px-6 py-4">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={typedText}
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/50 focus:outline-none text-base"
              />
              <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold px-6 py-2 text-sm">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>);

}