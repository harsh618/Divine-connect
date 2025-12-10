import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1920"
          alt="Temple"
          className="w-full h-full object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-orange-300 text-sm mb-6 mt-8">
            <Sparkles className="w-4 h-4" />
           
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
            Divine
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Connections
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Experience authentic spiritual services from the comfort of your home. 
            Connect with temples, book poojas, consult astrologers, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={createPageUrl('Temples')}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-orange-500/30 transition-all hover:scale-105">
                
                Explore Temples
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to={createPageUrl('Poojas')}>
              <Button
                size="lg"
                variant="outline" className="bg-transparent text-white px-8 py-6 text-lg font-medium rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-10 border-white/30 hover:bg-white/10 backdrop-blur-sm">

                
                Book a Pooja
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-8 mt-12 text-white/70">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">10,000+</p>
              <p className="text-sm">Devotees</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-sm">Verified Priests</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100+</p>
              <p className="text-sm">Temples</p>
            </div>
          </div>
        </div>
      </div>
    </section>);

}