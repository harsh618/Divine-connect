import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from "@/lib/utils";

export default function FeaturedPoojasCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'center',
      slidesToScroll: 1,
      dragFree: false,
      containScroll: 'trimSnaps'
    },
    [Autoplay({ delay: 3500, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: poojas, isLoading } = useQuery({
    queryKey: ['featured-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ 
      is_featured: true, 
      is_deleted: false
    }, '-total_bookings', 8),
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
      <div className="py-20 bg-background">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!poojas || poojas.length === 0) {
    return null;
  }

  return (
    <div className="py-20 px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-normal text-foreground tracking-wide mb-2">Featured Poojas</h2>
          <p className="text-muted-foreground font-light">Sacred rituals for every occasion</p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 shadow-lg border border-gray-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 shadow-lg border border-gray-200 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="overflow-hidden py-8" ref={emblaRef}>
            <div className="flex">
              {poojas.map((pooja, index) => {
                const isActive = index === selectedIndex;
                return (
                  <div 
                    key={pooja.id} 
                    className={cn(
                      "flex-[0_0_90%] md:flex-[0_0_380px] px-3 transition-all duration-500",
                      {
                        'opacity-100': isActive,
                        'opacity-60': !isActive,
                      }
                    )}
                  >
                    <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)}>
                      <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={pooja.image_url || 'https://images.unsplash.com/photo-1604608672516-f1e3e4c3d72c?w=600'}
                            alt={pooja.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 shadow-sm text-xs">
                            {pooja.category?.replace('_', ' ')}
                          </Badge>
                          {pooja.is_popular && (
                            <Badge className="absolute top-3 right-3 bg-yellow-500 text-white border-0 shadow-sm text-xs">
                              ⭐ Popular
                            </Badge>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="mb-3">
                            <div className="text-xl font-semibold text-gray-900 mb-1">
                              ₹{(pooja.base_price_virtual || pooja.base_price_in_person || 0).toLocaleString()}
                            </div>
                            <h3 className="text-base font-normal text-gray-800 line-clamp-1">
                              {pooja.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{pooja.duration_minutes} min</span>
                            </div>
                            {pooja.total_bookings > 0 && (
                              <div className="text-xs text-gray-500">
                                {pooja.total_bookings}+ bookings
                              </div>
                            )}
                          </div>

                          {pooja.purpose && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {pooja.purpose}
                            </p>
                          )}
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
    </div>
  );
}