import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

function TempleCard({ temple }) {
  const defaultImage = "https://images.unsplash.com/photo-1548013146-72479768bada?w=800";
  
  return (
    <div className="group cursor-pointer">
      <Link to={createPageUrl('TempleDetail', { templeId: temple.id })}>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12),0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
          <div className="relative overflow-hidden aspect-video h-[200px] bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={temple.images?.[0] || temple.thumbnail_url || defaultImage}
              alt={temple.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded text-xs backdrop-blur-md">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{temple.city}</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
              {temple.name}
            </h3>
            <p className="text-xs text-gray-600 mb-3 flex gap-2">
              <span>{temple.city}</span>
              <span>•</span>
              <span>{temple.primary_deity}</span>
            </p>
            <button className="w-full bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-3 rounded-md text-xs font-semibold uppercase tracking-wide hover:-translate-y-0.5 active:scale-98 transition-all">
              View Temple
            </button>
          </div>
        </div>
      </Link>
    </div>
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
    <section className="py-24 px-6 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
              Popular Temples
            </h2>
            <p className="text-gray-600">Explore famous and nearby temples with timings and rituals</p>
          </div>
          <Link to={createPageUrl('Temples')}>
            <button className="hidden md:flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm hover:gap-3 transition-all">
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Horizontal Scroll Container */}
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