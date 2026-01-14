import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Clock, Users, MapPin, Flame, Share2, 
  Building2, Leaf, BookOpen, Stethoscope, Sparkles, ArrowUpRight
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800";

const categoryIcons = {
  temple_renovation: Building2,
  gaushala: Leaf,
  anna_daan: Heart,
  education: BookOpen,
  medical: Stethoscope
};

export default function CampaignCard({ campaign, onDonate, featured = false }) {
  const [imgSrc, setImgSrc] = useState(campaign.images?.[0] || campaign.thumbnail_url || FALLBACK_IMAGE);
  const [isSaved, setIsSaved] = useState(false);
  
  const Icon = categoryIcons[campaign.category] || Heart;
  const progress = ((campaign.raised_amount || 0) / campaign.goal_amount) * 100;
  const daysLeft = campaign.deadline ? differenceInDays(new Date(campaign.deadline), new Date()) : null;
  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;
  const isAlmostFunded = progress >= 80;

  return (
    <div className="group h-full">
      <div className={`relative h-full bg-white rounded-2xl overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
        featured ? 'border-amber-200' : 'border-gray-100'
      }`}>
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img 
            src={imgSrc} 
            alt={campaign.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex flex-wrap gap-1.5">
              <Badge className="bg-white/95 text-gray-800 border-0 px-2.5 py-1 text-xs flex items-center gap-1 shadow-sm">
                <Icon className="w-3 h-3" />
                {campaign.category?.replace(/_/g, ' ')}
              </Badge>
              {isUrgent && (
                <Badge className="bg-red-500 text-white border-0 px-2.5 py-1 text-xs flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  {daysLeft}d left
                </Badge>
              )}
              {isAlmostFunded && (
                <Badge className="bg-green-500 text-white border-0 px-2.5 py-1 text-xs flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {Math.round(progress)}% funded
                </Badge>
              )}
            </div>
            
            {/* Save & Share */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); }}
                className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
              <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Bottom Image Overlay - Progress */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Progress value={Math.min(progress, 100)} className="h-1.5 bg-white/30" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Location */}
          {campaign.location && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
              <MapPin className="w-3 h-3" />
              {campaign.location}
            </div>
          )}

          <Link to={`${createPageUrl('CampaignDetail')}?campaignId=${campaign.id}`}>
            <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-amber-700 transition-colors line-clamp-2 cursor-pointer">
              {campaign.title}
            </h3>
          </Link>

          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {campaign.description || `Support this noble cause and make a difference in many lives.`}
          </p>

          {/* Funding Stats */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-bold text-gray-900">
                ₹{(campaign.raised_amount || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                of ₹{campaign.goal_amount?.toLocaleString()} goal
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-600">
                {Math.round(progress)}%
              </div>
              <div className="text-xs text-gray-500">funded</div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              {campaign.donor_count || 0} supporters
            </span>
            {campaign.total_reviews > 0 && (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {campaign.campaign_rating?.toFixed(1)} rating
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={(e) => {
                e.preventDefault();
                onDonate(campaign);
              }}
              disabled={campaign.status !== 'active'}
              className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </Button>
            <Link to={`${createPageUrl('CampaignDetail')}?campaignId=${campaign.id}`}>
              <Button variant="outline" className="h-11 px-3">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-l from-amber-400 to-orange-400 text-white text-xs font-medium px-3 py-1 rounded-bl-xl">
              Featured
            </div>
          </div>
        )}
      </div>
    </div>
  );
}