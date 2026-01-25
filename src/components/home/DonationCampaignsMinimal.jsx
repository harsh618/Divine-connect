import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, TrendingUp, ArrowRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function CampaignCard({ campaign }) {
  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
  const defaultImage = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800";
  
  const categoryColors = {
    temple_renovation: 'bg-orange-100 text-orange-700',
    gaushala: 'bg-green-100 text-green-700',
    anna_daan: 'bg-pink-100 text-pink-700',
    education: 'bg-blue-100 text-blue-700',
    medical: 'bg-purple-100 text-purple-700'
  };
  
  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-2xl border border-stone-200/60 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={campaign.images?.[0] || campaign.thumbnail_url || defaultImage}
          alt={`${campaign.title} - ${campaign.category}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
          <TrendingUp className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-bold text-stone-900">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-serif font-semibold text-stone-900 mb-3 line-clamp-2 leading-snug">{campaign.title}</h3>
        
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[campaign.category] || 'bg-stone-100 text-stone-700'}`}>
            {campaign.category?.replace(/_/g, ' ')}
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-sm">
            <span className="text-stone-900 font-bold">₹{(campaign.raised_amount || 0).toLocaleString()}</span>
            <span className="text-stone-500"> raised of </span>
            <span className="text-stone-900 font-bold">₹{campaign.goal_amount?.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={async (e) => {
            e.preventDefault();
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
              base44.auth.redirectToLogin(window.location.href);
            } else {
              window.location.href = createPageUrl('Donate');
            }
          }}
          className="w-full py-3 rounded-xl font-medium bg-stone-900 text-white hover:bg-black transition-colors flex justify-between px-4 items-center"
        >
          <span>Donate</span>
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DonationCampaignsMinimal() {
  const scrollRef = useRef(null);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['active-campaigns-minimal'],
    queryFn: () => base44.entities.DonationCampaign.filter({ 
      is_deleted: false, 
      status: 'active',
      is_hidden: false 
    }, '-created_date', 10),
  });

  return (
    <section className="py-24 px-6 bg-stone-50">
      <div className="container mx-auto max-w-7xl mb-12">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1C1917] mb-3 tracking-tight">
              Support Causes
            </h2>
            <p className="text-stone-600">Make a difference with your contribution</p>
          </div>
          <Link to={createPageUrl('Donate')}>
            <button className="hidden md:flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm hover:gap-3 transition-all">
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-80">
                  <Skeleton className="w-full h-80 rounded-2xl" />
                </div>
              ))
            ) : campaigns?.length > 0 ? (
              campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))
            ) : (
              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-pink-500" />
                </div>
                <p className="text-gray-500">No active campaigns yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}