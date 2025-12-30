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
import KarmaScore from '../yatra/KarmaScore';

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
    <div className="py-20 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 relative">
      <div className="container mx-auto px-8 max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif font-semibold text-orange-900 tracking-tight mb-2">Live Lounge</h2>
            <p className="text-orange-700/70">Connect with spiritual guides in real-time</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="bg-white border border-orange-200 hover:bg-orange-50 text-orange-600 rounded-full w-10 h-10 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="bg-white border border-orange-200 hover:bg-orange-50 text-orange-600 rounded-full w-10 h-10 shadow-md"
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
                  className="flex-[0_0_280px] md:flex-[0_0_320px] px-3"
                >
                  <Link to={createPageUrl(profileUrl)}>
                    <div className="relative bg-white border border-orange-200 rounded-3xl p-6 hover:border-orange-400 hover:shadow-xl transition-all h-full">
                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20 mb-4">
                          {provider.avatar_url ? (
                            <img
                              src={provider.avatar_url}
                              alt={provider.display_name}
                              className="w-full h-full rounded-full object-cover border-3 border-amber-500/20 shadow-xl"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border-3 border-amber-500/20">
                              <span className="text-2xl text-amber-400">
                                {provider.display_name?.[0]?.toUpperCase() || 'P'}
                              </span>
                            </div>
                          )}
                          {provider.is_available_now && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-zinc-900 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-orange-900 mb-1 text-center">{provider.display_name}</h3>
                        <p className="text-sm text-orange-700/70 mb-2 text-center">
                          {specialization}
                        </p>
                        <div className="inline-flex px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold tracking-wider border border-amber-500/30 mb-3">
                          {provider.years_of_experience || 0}+ YRS
                        </div>
                        <div className="mb-4">
                          <KarmaScore score={provider.karma_score} size="sm" />
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold rounded-xl text-sm py-2"
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