import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

function TempleCard({ temple }) {
  const defaultImage = "https://images.unsplash.com/photo-1548013146-72479768bada?w=800";
  
  return (
    <Link to={createPageUrl('TempleDetail', { templeId: temple.id })}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-4">
          <img
            src={temple.images?.[0] || temple.thumbnail_url || defaultImage}
            alt={temple.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              {temple.city}
            </div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{temple.name}</h3>
        <p className="text-sm text-gray-500">{temple.primary_deity}</p>
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
    <section className="py-24 px-6 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
              Sacred Spaces
            </h2>
            <p className="text-gray-500">Discover temples across India</p>
          </div>
          <Link to={createPageUrl('Temples')}>
            <button className="hidden md:flex items-center gap-2 text-gray-900 hover:gap-3 transition-all">
              View all
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <TempleCardSkeleton key={i} />)
          ) : temples?.length > 0 ? (
            temples.slice(0, 4).map((temple) => (
              <TempleCard key={temple.id} temple={temple} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No temples available
            </div>
          )}
        </div>
      </div>
    </section>
  );
}