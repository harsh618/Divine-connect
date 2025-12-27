import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from "@/lib/utils";

export default function FeaturedProvidersCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'center',
    slidesToScroll: 1
  });

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
                    <div className="relative group cursor-pointer h-[400px] overflow-hidden rounded-lg shadow-xl">
                      <img
                        src={provider.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                        alt={provider.display_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 shadow-md">
                        {badgeText}
                      </Badge>

                      <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                        <h3 className="text-xl font-normal mb-1">{provider.display_name}</h3>
                        <p className="text-sm text-background/80 mb-2">
                          {specialization} | {provider.years_of_experience || 0}+ years exp
                        </p>
                        {provider.rating_average > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span>{provider.rating_average.toFixed(1)}</span>
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4 bg-background text-foreground hover:bg-background/90 border-0"
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