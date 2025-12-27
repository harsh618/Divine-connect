import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

export default function FeaturedPoojasCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1
  });

  const { data: poojas, isLoading } = useQuery({
    queryKey: ['featured-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ 
      is_featured: true, 
      is_deleted: false
    }, '-total_bookings', 8),
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
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
              className="border border-border hover:bg-muted"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="border border-border hover:bg-muted"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {poojas.map((pooja) => (
              <div key={pooja.id} className="flex-[0_0_280px] md:flex-[0_0_320px]">
                <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)}>
                  <div className="group cursor-pointer h-full">
                    <div className="relative h-64 overflow-hidden rounded-t-lg">
                      <img
                        src={pooja.image_url || 'https://images.unsplash.com/photo-1604608672516-f1e3e4c3d72c?w=600'}
                        alt={pooja.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {pooja.is_popular && (
                        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground border-0">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg">
                      <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">
                        {pooja.category?.replace('_', ' ')}
                      </Badge>
                      <h3 className="text-lg font-normal mb-2 group-hover:text-primary transition-colors">
                        {pooja.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light">
                        {pooja.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{pooja.duration_minutes} min</span>
                        </div>
                        {(pooja.base_price_virtual || pooja.base_price_in_person) && (
                          <div className="text-lg font-normal text-primary">
                            ₹{pooja.base_price_virtual || pooja.base_price_in_person}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}