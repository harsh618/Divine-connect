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
        <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-4 shadow-md hover:shadow-xl transition-all">
          <img
            src={temple.images?.[0] || temple.thumbnail_url || defaultImage}
            alt={temple.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{temple.city}</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">{temple.name}</h3>
        <p className="text-sm text-gray-600">{temple.city} · {temple.primary_deity}</p>
        <Link to={createPageUrl('TempleDetail', { templeId: temple.id })}>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 mt-2">
            View Temple
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
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