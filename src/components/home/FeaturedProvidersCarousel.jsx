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
      align: 'center',
      slidesToScroll: 1,
      dragFree: false,
      containScroll: 'trimSnaps'
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
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
    <div className="py-20 bg-foreground">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-normal text-background tracking-wide mb-2">Featured Providers</h2>
            <p className="text-background/70 font-light">Top priests and astrologers on our platform</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 shadow-lg"
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
              const badgeText = provider.provider_type === 'priest' ? 'Priest' : 'Astrologer';
              const isActive = index === selectedIndex;
              const rate = provider.consultation_rate_video || provider.consultation_rate_voice || provider.consultation_rate_chat;

              return (
                <div 
                  key={provider.id} 
                  className={cn(
                    "flex-[0_0_90%] md:flex-[0_0_380px] px-3 transition-all duration-500",
                    {
                      'opacity-100': isActive,
                      'opacity-60': !isActive,
                    }
                  )}
                >
                  <Link to={createPageUrl(profileUrl)}>
                    <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={provider.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                          alt={provider.display_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 shadow-sm text-xs">
                          {badgeText}
                        </Badge>
                        {provider.is_verified && (
                          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 shadow-sm text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="mb-3">
                          {rate && (
                            <div className="text-xl font-semibold text-gray-900 mb-1">
                              ₹{rate}/session
                            </div>
                          )}
                          <h3 className="text-base font-normal text-gray-800 line-clamp-1">
                            {provider.display_name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="text-xs">
                            {provider.years_of_experience || 0}+ years exp
                          </div>
                          {provider.rating_average > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs">{provider.rating_average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {specialization}
                          {provider.languages?.length > 0 && ` • ${provider.languages.slice(0, 2).join(', ')}`}
                        </p>
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