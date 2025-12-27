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
    <div className="py-20 bg-stone-100">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif font-semibold text-[#1C1917] tracking-tight mb-2">Featured Providers</h2>
            <p className="text-stone-600">Trusted spiritual guides and experts</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="bg-white border border-stone-200/60 hover:bg-stone-50 text-stone-800 rounded-full w-10 h-10 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="bg-white border border-stone-200/60 hover:bg-stone-50 text-stone-800 rounded-full w-10 h-10 shadow-sm"
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
                    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all border border-stone-200/60 relative">
                      <img
                        src={provider.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                        alt={provider.display_name}
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md mx-auto -mt-12"
                      />
                      <div className="text-center mt-4">
                        <h3 className="text-lg font-serif font-semibold text-stone-900 mb-1">{provider.display_name}</h3>
                        <p className="text-sm text-stone-600 mb-3">
                          {specialization}
                        </p>
                        <div className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold tracking-wide uppercase border border-amber-100 mb-3">
                          {provider.years_of_experience || 0}+ Years
                        </div>
                        {provider.rating_average > 0 && (
                          <div className="flex items-center justify-center gap-1 text-sm text-stone-600 mb-4">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            <span className="font-medium">{provider.rating_average.toFixed(1)}</span>
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full bg-stone-900 hover:bg-black text-white border-0"
                        >
                          View Profile
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