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
    <div className="py-24 px-6 bg-gradient-to-b from-orange-50/30 to-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-700 border-0 px-4 py-1.5">
            Sacred Rituals
          </Badge>
          <h2 className="text-4xl md:text-5xl font-normal text-foreground mb-4 tracking-tight">
            Featured Poojas
          </h2>
          <p className="text-muted-foreground font-light text-lg max-w-2xl mx-auto">
            Experience divine blessings through authentic Vedic ceremonies
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-full w-12 h-12 shadow-2xl border border-gray-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-full w-12 h-12 shadow-2xl border border-gray-200"
            >
              <ChevronRight className="w-6 h-6" />
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
                      "flex-[0_0_85%] md:flex-[0_0_400px] px-4 transition-all duration-700 ease-out",
                      {
                        'scale-105 md:scale-110 opacity-100 z-10': isActive,
                        'scale-90 md:scale-85 opacity-30': !isActive,
                      }
                    )}
                  >
                    <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)}>
                      <div className="group cursor-pointer h-full bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 border border-orange-100">
                        <div className="relative h-80 overflow-hidden">
                          <img
                            src={pooja.image_url || 'https://images.unsplash.com/photo-1604608672516-f1e3e4c3d72c?w=600'}
                            alt={pooja.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                          
                          {/* Top Badges */}
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                            <Badge variant="secondary" className="text-xs uppercase tracking-wider bg-white/90 text-gray-800 border-0 backdrop-blur-sm font-medium">
                              {pooja.category?.replace('_', ' ')}
                            </Badge>
                            {pooja.is_popular && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg font-medium">
                                ⭐ Popular
                              </Badge>
                            )}
                          </div>

                          {/* Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="text-2xl md:text-3xl font-normal mb-3 tracking-tight">
                              {pooja.name}
                            </h3>
                            <p className="text-sm text-white/90 mb-5 line-clamp-2 font-light leading-relaxed">
                              {pooja.description}
                            </p>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 text-sm text-white bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{pooja.duration_minutes} min</span>
                              </div>
                              {(pooja.base_price_virtual || pooja.base_price_in_person) && (
                                <div className="text-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 rounded-full shadow-lg">
                                  ₹{pooja.base_price_virtual || pooja.base_price_in_person}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-all duration-500" />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-3 mt-8 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-full w-12 h-12 shadow-xl border border-gray-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="bg-white hover:bg-gray-50 text-gray-800 rounded-full w-12 h-12 shadow-xl border border-gray-200"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}