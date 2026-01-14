import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, ChevronRight, Flame, Clock, Heart, Users, 
  Target, Sparkles, ArrowRight
} from 'lucide-react';
import { differenceInDays } from 'date-fns';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800";

export default function FeaturedCampaignCarousel({ campaigns, onDonate }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || campaigns.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % campaigns.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [campaigns.length, isHovered]);

  if (!campaigns || campaigns.length === 0) return null;

  const campaign = campaigns[current];
  const progress = ((campaign.raised_amount || 0) / campaign.goal_amount) * 100;
  const daysLeft = campaign.deadline ? differenceInDays(new Date(campaign.deadline), new Date()) : null;

  return (
    <div 
      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid md:grid-cols-2">
        {/* Image Side */}
        <div className="relative h-72 md:h-96">
          <img 
            src={campaign.images?.[0] || campaign.thumbnail_url || FALLBACK_IMAGE}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-orange-500 md:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/80 to-transparent md:hidden" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {progress >= 80 && (
              <Badge className="bg-red-500 text-white border-0 animate-pulse">
                <Flame className="w-3 h-3 mr-1" /> Almost Funded!
              </Badge>
            )}
            {campaign.is_trending && (
              <Badge className="bg-purple-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" /> Trending
              </Badge>
            )}
          </div>
        </div>

        {/* Content Side */}
        <div className="p-6 md:p-8 flex flex-col justify-center text-white">
          <Badge className="w-fit mb-3 bg-white/20 border-white/30 text-white capitalize">
            {campaign.category?.replace(/_/g, ' ')}
          </Badge>
          
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3 line-clamp-2">
            {campaign.title}
          </h2>
          
          <p className="text-white/80 mb-4 line-clamp-2">
            {campaign.description}
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>₹{(campaign.raised_amount || 0).toLocaleString()} raised</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2.5 bg-white/30" />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Goal: ₹{campaign.goal_amount?.toLocaleString()}</span>
              {daysLeft !== null && daysLeft > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {daysLeft} days left
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-6 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-white/70" />
              <span>{campaign.donor_count || 0} donors</span>
            </div>
            {campaign.beneficiary_count > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-white/70" />
                <span>{campaign.beneficiary_count}+ helped</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={() => onDonate(campaign)}
              className="flex-1 bg-white text-orange-600 hover:bg-white/90 h-12 font-semibold"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate Now
            </Button>
            <Link to={`${createPageUrl('CampaignDetail')}?campaignId=${campaign.id}`}>
              <Button variant="outline" className="h-12 border-white/30 text-white hover:bg-white/10">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {campaigns.length > 1 && (
        <>
          <button 
            onClick={() => setCurrent((prev) => (prev - 1 + campaigns.length) % campaigns.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrent((prev) => (prev + 1) % campaigns.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {campaigns.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}