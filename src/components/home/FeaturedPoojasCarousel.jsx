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
    <div className="py-20 bg-background">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-normal text-foreground tracking-wide mb-2">Featured Poojas</h2>
            <p className="text-muted-foreground font-light">Sacred rituals for every occasion</p>
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
            {poojas.map((pooja, index) => {
              const isActive = index === selectedIndex;
              return (
                <div 
                  key={pooja.id} 
                  className={cn(
                    "flex-[0_0_300px] md:flex-[0_0_360px] px-3 transition-all duration-500 ease-out",
                    {
                      'scale-110 opacity-100 z-10': isActive,
                      'scale-90 opacity-40': !isActive,
                    }
                  )}
                >
                  <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)}>
                    <div className="group cursor-pointer h-full shadow-xl rounded-lg overflow-hidden">
                      <div className="relative h-72 overflow-hidden">
                        <img
                          src={pooja.image_url || 'https://images.unsplash.com/photo-1604608672516-f1e3e4c3d72c?w=600'}
                          alt={pooja.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        {pooja.is_popular && (
                          <Badge className="absolute top-4 right-4 bg-yellow-500 text-white border-0 shadow-md">
                            Popular
                          </Badge>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider bg-white/20 text-white border-0 backdrop-blur-sm">
                            {pooja.category?.replace('_', ' ')}
                          </Badge>
                          <h3 className="text-2xl font-normal mb-2">
                            {pooja.name}
                          </h3>
                          <p className="text-sm text-white/80 mb-4 line-clamp-2 font-light">
                            {pooja.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              <Clock className="w-4 h-4" />
                              <span>{pooja.duration_minutes} min</span>
                            </div>
                            {(pooja.base_price_virtual || pooja.base_price_in_person) && (
                              <div className="text-xl font-normal text-white bg-primary px-4 py-1.5 rounded-full">
                                ₹{pooja.base_price_virtual || pooja.base_price_in_person}
                              </div>
                            )}
                          </div>
                        </div>
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