import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, ArrowRight } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

function PriestCard({ priest }) {
  const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all hover:scale-[1.01]">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            <img
              src={priest.avatar_url || defaultAvatar}
              alt={priest.display_name}
              className="w-full h-full object-cover" />

          </div>
          {priest.is_verified &&
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-2">{priest.display_name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-900">{priest.rating_average?.toFixed(1) || '5.0'}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{priest.years_of_experience}+ years</span>
          </div>
          {priest.specializations && priest.specializations.length > 0 &&
          <div className="flex flex-wrap gap-1.5">
              {priest.specializations.slice(0, 2).map((spec, idx) =>
            <span key={idx} className="inline-block px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-medium">
                  {spec}
                </span>
            )}
            </div>
          }
        </div>
      </div>
      {priest.bio &&
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{priest.bio}</p>
      }
      <div className="pt-4 border-t border-gray-100 space-y-3">
        {priest.consultation_rate_chat && priest.consultation_rate_chat > 0 ?
        <p className="text-sm text-gray-600">
            Starting at <span className="font-semibold text-gray-900">₹{priest.consultation_rate_chat}</span>/session
          </p> :

        <p className="text-sm text-gray-500 italic">Pricing coming soon</p>
        }
        <Link to={createPageUrl('Priests')}>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium transition-all hover:shadow-lg">
            View Profile
          </button>
        </Link>
      </div>
    </div>);

}

function PriestCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-4 w-full" />
    </div>);

}

export default function PriestsMinimal() {
  const { data: priests, isLoading } = useQuery({
    queryKey: ['featured-priests'],
    queryFn: () => base44.entities.ProviderProfile.filter({
      is_deleted: false,
      is_hidden: false,
      provider_type: 'priest',
      is_verified: true
    }, '-rating_average', 6)
  });

  return (
    <section className="bg-white pt-8 pr-6 pb-12 pl-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
              Connect with Priests
            </h2>
            <p className="text-gray-600">Expert guidance for your spiritual journey</p>
          </div>
          <Link to={createPageUrl('Priests')}>
            <button className="hidden md:flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm hover:gap-3 transition-all">
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
            {isLoading ?
            Array(6).fill(0).map((_, i) =>
            <div key={i} className="flex-shrink-0 w-80 md:w-auto">
                  <PriestCardSkeleton />
                </div>
            ) :
            priests?.length > 0 ?
            priests.map((priest) =>
            <div key={priest.id} className="flex-shrink-0 w-80 md:w-auto">
                  <PriestCard priest={priest} />
                </div>
            ) :

            <div className="col-span-full text-center py-12 text-gray-500">
                No priests available
              </div>
            }
          </div>
        </div>

        {/* Mobile View All */}
        <div className="mt-8 md:hidden text-center">
          <Link to={createPageUrl('Priests')}>
            <button className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm">
              View all priests
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>);

}