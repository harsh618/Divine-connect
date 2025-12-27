import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Video, MessageCircle, Phone, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

const categoryIcons = {
  astrology_chat: MessageCircle,
  astrology_video: Video,
  astrology_voice: Phone,
  kundli: Video
};

export default function FeaturedServicesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['featured-astrology-services'],
    queryFn: async () => {
      const allServices = await base44.entities.Service.filter({ 
        is_featured: true, 
        is_deleted: false,
        is_hidden: false
      });
      // Filter for astrology services only
      return allServices.filter(s => 
        ['astrology_chat', 'astrology_video', 'astrology_voice', 'kundli'].includes(s.category)
      ).slice(0, 8);
    },
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (isLoading) {
    return (
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className="py-20 bg-muted/30">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-normal text-foreground tracking-wide mb-2">Featured Astrology Services</h2>
            <p className="text-muted-foreground font-light">Connect with expert astrologers</p>
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
            {services.map((service) => {
              const Icon = categoryIcons[service.category] || Video;
              return (
                <div key={service.id} className="flex-[0_0_280px] md:flex-[0_0_320px]">
                  <div className="group cursor-pointer h-full bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={service.thumbnail_url || 'https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=600'}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">
                        {service.category?.replace('_', ' ')}
                      </Badge>
                      <h3 className="text-lg font-normal mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light">
                        {service.description || 'Expert astrology consultation service'}
                      </p>
                      <div className="flex items-center justify-between">
                        {service.duration_minutes && (
                          <span className="text-sm text-muted-foreground">
                            {service.duration_minutes} min
                          </span>
                        )}
                        <div className="text-lg font-normal text-primary">
                          ₹{service.price}
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}