import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

export default function FeaturedProvidersCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1
  });

  const { data: providers, isLoading } = useQuery({
    queryKey: ['featured-providers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      is_featured: true, 
      is_deleted: false,
      is_hidden: false,
      is_verified: true
    }, '-screen_time_score', 10),
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
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

  const priests = providers.filter(p => p.provider_type === 'priest');
  const astrologers = providers.filter(p => p.provider_type === 'astrologer');

  return (
    <>
      {/* Top Priests */}
      {priests.length > 0 && (
        <div className="py-20 bg-foreground">
          <div className="container mx-auto px-8 max-w-7xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-normal text-background tracking-wide">Top Priests</h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={scrollPrev}
                  className="bg-background/10 hover:bg-background/20 text-background"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={scrollNext}
                  className="bg-background/10 hover:bg-background/20 text-background"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {priests.map((priest) => (
                  <div key={priest.id} className="flex-[0_0_280px] md:flex-[0_0_320px]">
                    <Link to={createPageUrl(`PriestProfile?id=${priest.id}`)}>
                      <div className="relative group cursor-pointer h-[400px] overflow-hidden">
                        <img
                          src={priest.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                          alt={priest.display_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground border-0">
                          Top Advisor
                        </Badge>

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                          <h3 className="text-xl font-normal mb-1">{priest.display_name}</h3>
                          <p className="text-sm text-background/80 mb-2">
                            {priest.specializations?.[0] || 'Vedic Priest'} | {priest.years_of_experience || 0}+ years exp
                          </p>
                          {priest.rating_average > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              <span>{priest.rating_average.toFixed(1)}</span>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Astrologers */}
      {astrologers.length > 0 && (
        <div className="py-20 bg-background">
          <div className="container mx-auto px-8 max-w-7xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-normal text-foreground tracking-wide">Top Astrologers</h2>
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
                {astrologers.map((astrologer) => (
                  <div key={astrologer.id} className="flex-[0_0_280px] md:flex-[0_0_320px]">
                    <Link to={createPageUrl(`AstrologerProfile?id=${astrologer.id}`)}>
                      <div className="relative group cursor-pointer h-[400px] overflow-hidden">
                        <img
                          src={astrologer.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                          alt={astrologer.display_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground border-0">
                          Top Advisor
                        </Badge>

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                          <h3 className="text-xl font-normal mb-1">{astrologer.display_name}</h3>
                          <p className="text-sm text-background/80 mb-2">
                            {astrologer.astrology_types?.[0] || 'Vedic Astrology'} | {astrologer.years_of_experience || 0}+ years exp
                          </p>
                          {astrologer.rating_average > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              <span>{astrologer.rating_average.toFixed(1)}</span>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}