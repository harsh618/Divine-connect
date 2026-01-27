import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { MapPin, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from '../TranslationProvider';

function TempleCard({ temple }) {
  const { t } = useTranslation();
  const defaultImage = "https://images.unsplash.com/photo-1548013146-72479768bada?w=800";
  
  return (
    <Link to={createPageUrl(`TempleDetail?id=${temple.id}`)}>
      <div className="group relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-3xl border border-[#C17B54]/20 bg-gradient-to-br from-[#C17B54]/5 via-[#D4A84B]/5 to-[#F5F0E8] backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-[#C17B54]/50 hover:shadow-[0_0_50px_-5px_rgba(193,123,84,0.4)] cursor-pointer">
        <img 
          src={temple.images?.[0] || temple.thumbnail_url || defaultImage}
          alt={temple.name}
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110"
        />
        
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#5D3A1A] via-[#5D3A1A]/80 to-transparent p-4 md:p-8 translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#D4A84B] mb-1 md:mb-2">
            <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>{temple.city}</span>
          </div>
          <h3 className="text-xl md:text-3xl font-serif text-[#F5F0E8] mb-1 leading-tight">{temple.name}</h3>
          <p className="text-xs md:text-sm text-[#F5F0E8]/70 mb-2 md:mb-4">{temple.primary_deity}</p>
          <div className="flex items-center gap-4 opacity-0 transition-opacity delay-100 duration-500 group-hover:opacity-100">
            <button 
              onClick={async (e) => {
                e.preventDefault();
                const isAuth = await base44.auth.isAuthenticated();
                if (!isAuth) {
                  base44.auth.redirectToLogin(window.location.href);
                } else {
                  window.location.href = createPageUrl(`TempleDetail?id=${temple.id}`);
                }
              }}
              className="rounded-full bg-gradient-to-r from-[#C17B54] to-[#A66B48] px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-[#F5F0E8] hover:from-[#A66B48] hover:to-[#8B5A3C] transition-all shadow-lg shadow-[#C17B54]/30"
            >
              {t('Darshan Now')}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TempleCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] rounded-2xl mb-4" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function FeaturedTemplesMinimal({ temples, isLoading }) {
  const { t } = useTranslation();
  
  return (
    <section className="py-16 md:py-24 px-6 bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] relative">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex items-start justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C17B54] font-medium mb-2">✧ Explore ✧</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-[#5D3A1A] mb-2 md:mb-3 tracking-tight">
              {t('Sacred Portals')}
            </h2>
            <p className="text-sm md:text-base text-[#5D3A1A]/60">{t('Discover divine temples across the cosmos')}</p>
          </div>
          <Link to={createPageUrl('Temples')}>
            <button className="hidden md:flex items-center gap-2 text-[#C17B54] hover:text-[#A66B48] font-medium text-sm hover:gap-3 transition-all">
              {t('View all')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Grid Container */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 md:w-auto">
                  <TempleCardSkeleton />
                </div>
              ))
            ) : temples?.length > 0 ? (
              temples.slice(0, 8).map((temple) => (
                <div key={temple.id} className="flex-shrink-0 w-72 md:w-auto">
                  <TempleCard temple={temple} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                {t('No temples available')}
              </div>
            )}
          </div>
        </div>

        {/* Mobile View All */}
        <div className="mt-8 md:hidden text-center">
          <Link to={createPageUrl('Temples')}>
            <button className="inline-flex items-center gap-2 text-[#C17B54] hover:text-[#A66B48] font-medium text-sm">
              {t('View all temples')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}