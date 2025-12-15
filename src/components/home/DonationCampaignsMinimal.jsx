import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, TrendingUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function CampaignCard({ campaign }) {
  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
  const defaultImage = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800";
  
  return (
    <Link to={createPageUrl('Donate')}>
      <div className="flex-shrink-0 w-80 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <img
            src={campaign.images?.[0] || campaign.thumbnail_url || defaultImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-pink-600 text-sm mb-3">
            <Heart className="w-4 h-4" />
            {campaign.category?.replace(/_/g, ' ')}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{campaign.title}</h3>
          
          <div className="space-y-2">
            <Progress value={Math.min(progress, 100)} className="h-1.5" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">₹{(campaign.raised_amount || 0).toLocaleString()}</span>
              <span className="text-gray-900 font-medium">₹{campaign.goal_amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
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
    <section className="py-24 px-6 bg-gradient-to-b from-orange-50/30 to-white">
      <div className="container mx-auto max-w-7xl mb-12">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
          Support Causes
        </h2>
        <p className="text-gray-500">Help maintain sacred traditions</p>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-4"
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
              <div className="w-80 text-gray-500 text-center py-12">
                No active campaigns
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}