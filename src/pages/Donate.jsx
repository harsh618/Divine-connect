import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Heart, Search, SlidersHorizontal, TrendingUp, Sparkles, 
  Building2, Leaf, BookOpen, Stethoscope, Filter, ArrowUpRight
} from 'lucide-react';

import DonateHero from '../components/donation/DonateHero';
import FeaturedCampaignCarousel from '../components/donation/FeaturedCampaignCarousel';
import CategoryGrid from '../components/donation/CategoryGrid';
import CampaignCard from '../components/donation/CampaignCard';
import TrustIndicators from '../components/donation/TrustIndicators';
import ImpactStories from '../components/donation/ImpactStories';
import HowItWorks from '../components/donation/HowItWorks';
import EnhancedDonationFlow from '../components/donation/EnhancedDonationFlow';

const CATEGORIES = [
  { value: 'all', label: 'All Causes', icon: Heart },
  { value: 'temple_renovation', label: 'Temple', icon: Building2 },
  { value: 'gaushala', label: 'Gaushala', icon: Leaf },
  { value: 'anna_daan', label: 'Anna Daan', icon: Heart },
  { value: 'education', label: 'Education', icon: BookOpen },
  { value: 'medical', label: 'Medical', icon: Stethoscope },
];

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'most_funded', label: 'Most Funded' },
  { value: 'newest', label: 'Newest' },
  { value: 'amount_high', label: 'Goal (High to Low)' },
];

function CampaignCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function Donate() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [sortBy, setSortBy] = useState('trending');
  const [showDonationFlow, setShowDonationFlow] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['donation-campaigns'],
    queryFn: () => base44.entities.DonationCampaign.filter({ 
      is_deleted: false, 
      status: 'active', 
      is_hidden: false 
    }, '-created_date')
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised_amount || 0), 0);
    const totalDonors = campaigns.reduce((sum, c) => sum + (c.donor_count || 0), 0);
    const totalBeneficiaries = campaigns.reduce((sum, c) => sum + (c.beneficiary_count || 0), 0);
    return {
      totalRaised,
      donorsToday: Math.floor(totalDonors * 0.1) || 124,
      activeCampaigns: campaigns.length,
      livesImpacted: totalBeneficiaries || 50000
    };
  }, [campaigns]);

  // Get category counts
  const campaignCounts = useMemo(() => {
    const counts = {};
    campaigns.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [campaigns]);

  // Featured/Trending campaigns
  const featuredCampaigns = useMemo(() => {
    return campaigns.filter(c => c.is_trending).slice(0, 3);
  }, [campaigns]);

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let result = campaigns.filter(campaign => {
      const matchesSearch = !searchQuery || 
        campaign.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    switch (sortBy) {
      case 'ending_soon':
        result.sort((a, b) => new Date(a.deadline || '2099-12-31') - new Date(b.deadline || '2099-12-31'));
        break;
      case 'most_funded':
        result.sort((a, b) => ((b.raised_amount || 0) / b.goal_amount) - ((a.raised_amount || 0) / a.goal_amount));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case 'amount_high':
        result.sort((a, b) => b.goal_amount - a.goal_amount);
        break;
      case 'trending':
      default:
        result.sort((a, b) => (b.trending_rank || 0) - (a.trending_rank || 0));
        break;
    }

    return result;
  }, [campaigns, searchQuery, selectedCategory, sortBy]);

  // Non-featured for main grid
  const regularCampaigns = useMemo(() => {
    if (selectedCategory !== 'all' || searchQuery) {
      return filteredCampaigns;
    }
    return filteredCampaigns.filter(c => !c.is_trending);
  }, [filteredCampaigns, selectedCategory, searchQuery]);

  const handleDonate = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDonationFlow(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24">
      {/* Hero Section with Live Stats */}
      <DonateHero stats={stats} />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10 -mt-8">
        
        {/* Featured Campaigns Carousel */}
        {featuredCampaigns.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <FeaturedCampaignCarousel 
              campaigns={featuredCampaigns} 
              onDonate={handleDonate}
            />
          </div>
        )}

        {/* Category Grid */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
          </div>
          <CategoryGrid 
            onSelectCategory={setSelectedCategory} 
            campaignCounts={campaignCounts}
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search campaigns by name, location..." 
                className="w-full pl-10 pr-4 h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 flex items-center gap-1.5 ${
                      selectedCategory === cat.value
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-11 rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredCampaigns.length}</span> campaigns found
            {selectedCategory !== 'all' && ` in ${selectedCategory.replace(/_/g, ' ')}`}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <Button 
              variant="link" 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-orange-600"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <CampaignCardSkeleton key={i} />)
          ) : regularCampaigns.length > 0 ? (
            regularCampaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onDonate={handleDonate}
              />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
              <Button 
                variant="link" 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-orange-600 mt-2"
              >
                View All Campaigns
              </Button>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <HowItWorks />
        </div>

        {/* Impact Stories Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Your Impact</h2>
          </div>
          <ImpactStories />
        </div>

        {/* Trust Indicators */}
        <div className="mb-16">
          <TrustIndicators />
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
            Join thousands of donors who are transforming lives. Every contribution, no matter the size, creates lasting impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-orange-600 hover:bg-white/90 h-12 px-8 font-semibold"
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Button>
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 h-12 px-8"
            >
              Start a Campaign
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Donation Flow Modal */}
      <EnhancedDonationFlow
        open={showDonationFlow}
        onOpenChange={setShowDonationFlow}
        campaign={selectedCampaign}
      />
    </div>
  );
}