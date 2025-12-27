import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

function TempleCard({ temple }) {
  const defaultImage = "https://images.unsplash.com/photo-1548013146-72479768bada?w=800";
  
  return (
    <Link to={createPageUrl('TempleDetail', { templeId: temple.id })}>
      <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden group isolate cursor-pointer">
        <img
          src={temple.images?.[0] || temple.thumbnail_url || defaultImage}
          alt={temple.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-6 pt-24">
          <div className="flex items-center gap-1 text-sm font-light text-white/80 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{temple.city}</span>
          </div>
          <h3 className="text-xl font-serif text-white mb-1 leading-tight">
            {temple.name}
          </h3>
          <p className="text-sm text-white/70">{temple.primary_deity}</p>
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors">
              View Details
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
  return (
    <section className="py-24 px-6 bg-[#FAFAF9]">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1C1917] mb-3 tracking-tight">
              Popular Temples
            </h2>
            <p className="text-stone-600">Explore sacred temples with divine experiences</p>
          </div>
          <Link to={createPageUrl('Temples')}>
            <button className="hidden md:flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm hover:gap-3 transition-all">
              View all
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
                No temples available
              </div>
            )}
          </div>
        </div>

        {/* Mobile View All */}
        <div className="mt-8 md:hidden text-center">
          <Link to={createPageUrl('Temples')}>
            <button className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm">
              View all temples
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}