import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from "@/lib/utils";

export default function FeaturedProvidersCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps'
    },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['featured-providers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      is_featured: true, 
      is_deleted: false,
      is_hidden: false,
      is_verified: true
    }, '-screen_time_score', 10),
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (isLoading) {
    return (
      <div className="py-20 bg-foreground">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-background" />
          </div>
        </div>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return null;
  }

  return (
    <div className="py-20 bg-neutral-950 relative">
      <div className="container mx-auto px-8 max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif font-semibold text-white tracking-tight mb-2">Live Lounge</h2>
            <p className="text-white/60">Connect with spiritual guides in real-time</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full w-10 h-10 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full w-10 h-10 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {providers.map((provider, index) => {
              const profileUrl = provider.provider_type === 'priest' 
                ? `PriestProfile?id=${provider.id}` 
                : `AstrologerProfile?id=${provider.id}`;
              const specialization = provider.provider_type === 'priest'
                ? provider.specializations?.[0] || 'Vedic Priest'
                : provider.astrology_types?.[0] || 'Vedic Astrology';
              const badgeText = provider.provider_type === 'priest' ? 'Top Priest' : 'Top Astrologer';
              const isActive = index === selectedIndex;
              
              return (
                <div 
                  key={provider.id} 
                  className={cn(
                    "flex-[0_0_280px] md:flex-[0_0_320px] px-3 transition-all duration-500 ease-out",
                    {
                      'scale-110 opacity-100 z-10': isActive,
                      'scale-90 opacity-40': !isActive,
                    }
                  )}
                >
                  <Link to={createPageUrl(profileUrl)}>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-amber-500/50 transition-all">
                      <div className="relative mx-auto w-24 h-24 -mt-12 mb-4">
                        {provider.is_available_now && (
                          <div className="absolute -inset-1 rounded-full bg-green-500 animate-ping opacity-75" />
                        )}
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-50 blur" />
                        <img
                          src={provider.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                          alt={provider.display_name}
                          className="relative h-full w-full rounded-full object-cover border-2 border-white/20"
                        />
                        {provider.is_available_now && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-neutral-950 animate-pulse" />
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-serif font-semibold text-white mb-1">{provider.display_name}</h3>
                        <p className="text-sm text-white/60 mb-3">
                          {specialization}
                        </p>
                        <div className="inline-flex px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-semibold tracking-wider uppercase border border-amber-500/30 mb-3">
                          {provider.years_of_experience || 0}+ YRS
                        </div>
                        {provider.rating_average > 0 && (
                          <div className="flex items-center justify-center gap-1 text-sm text-white/70 mb-4">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{provider.rating_average.toFixed(1)}</span>
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold border-0"
                        >
                          Connect Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}