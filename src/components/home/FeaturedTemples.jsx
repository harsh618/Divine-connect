import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TempleCard from '../temple/TempleCard';
import TempleCardSkeleton from '../temple/TempleCardSkeleton';

export default function FeaturedTemples({ temples, isLoading }) {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              Featured Temples
            </h2>
            <p className="text-gray-600">Explore sacred destinations across India</p>
          </div>
          <Link to={createPageUrl('Temples')}>
            <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <TempleCardSkeleton key={i} />)
          ) : temples?.length > 0 ? (
            temples.slice(0, 6).map((temple) => (
              <TempleCard key={temple.id} temple={temple} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No temples found. Check back soon!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}