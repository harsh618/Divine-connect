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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 2000); // 2 seconds = 2000ms

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Transition */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) =>
        <img
          key={image}
          src={image}
          alt={`Temple ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`
          } />

        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="pr-64 pb-48 pl-64 text-center opacity-100 relative z-10 max-w-4xl">
        <div className="bg-white/10 text-orange-200 mb-8 px-4 py-2 text-sm opacity-0 rounded-full inline-flex items-center gap-2 backdrop-blur-md">
          <Sparkles className="w-4 h-4" />
          Welcome to Divine
        </div>
        
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6 tracking-tight">
          Divine
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
          Your spiritual journey, simplified
        </p>

        <div className="mb-12">
          <HeroSearch />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Temples')}>
            <Button
              size="lg"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 rounded-full px-8 py-6 text-lg">

              Explore Temples
            </Button>
          </Link>
          <Link to={createPageUrl('Astrology')}>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white px-8 py-6 text-lg rounded-full border border-white/30 hover:bg-white/10">

              Explore Pooja
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
    </section>);

}