import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Heart, 
  Target, 
  Users, 
  Calendar, 
  Loader2,
  Building2,
  Leaf,
  BookOpen,
  Stethoscope,
  Clock,
  Flame,
  TrendingUp,
  CheckCircle,
  Share2,
  Play,
  Star
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import PageHero from '../components/shared/PageHero';

const categoryIcons = {
  temple_renovation: Building2,
  gaushala: Leaf,
  anna_daan: Heart,
  education: BookOpen,
  medical: Stethoscope
};

const categoryColors = {
  temple_renovation: 'bg-orange-100 text-orange-700',
  gaushala: 'bg-green-100 text-green-700',
  anna_daan: 'bg-pink-100 text-pink-700',
  education: 'bg-blue-100 text-blue-700',
  medical: 'bg-purple-100 text-purple-700'
};

function CampaignCard({ campaign, onDonate }) {
  const Icon = categoryIcons[campaign.category] || Heart;
  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
  const daysLeft = campaign.deadline ? differenceInDays(new Date(campaign.deadline), new Date()) : null;
  const defaultImage = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800";
  
  const quickAmounts = campaign.impact_breakdown?.slice(0, 3) || [];

  return (
    <Link to={createPageUrl(`CampaignDetail?campaignId=${campaign.id}`)}>
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={campaign.images?.[0] || defaultImage}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Top Left - Category & Location */}
          <Badge className={`absolute top-3 left-3 ${categoryColors[campaign.category]} border-0`}>
            <Icon className="w-3 h-3 mr-1" />
            {campaign.category?.replace(/_/g, ' ')}
            {campaign.location && ` | ${campaign.location}`}
          </Badge>
          
          {/* Top Right - Urgency Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {campaign.status === 'completed' && (
              <Badge className="bg-green-500 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            {progress >= 80 && progress < 100 && (
              <Badge className="bg-orange-500 text-white border-0 animate-pulse">
                <Flame className="w-3 h-3 mr-1" />
                {Math.round(progress)}% Funded
              </Badge>
            )}
            {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
              <Badge className="bg-red-500 text-white border-0">
                <Clock className="w-3 h-3 mr-1" />
                {daysLeft} days left
              </Badge>
            )}
            {campaign.video_url && (
              <Badge className="bg-blue-500/90 text-white border-0">
                <Play className="w-3 h-3 mr-1" />
                Video
              </Badge>
            )}
            {campaign.is_trending && (
              <Badge className="bg-purple-500 text-white border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>

          {/* Bottom - Organization Badge */}
          {campaign.beneficiary_organization && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                {campaign.beneficiary_organization}
                {campaign.is_fcra_registered && (
                  <CheckCircle className="w-3 h-3 ml-1 text-green-400" />
                )}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {campaign.title}
          </h3>
          
          {/* Impact Summary */}
          {campaign.impact_breakdown?.[0] && (
            <div className="mb-3 text-sm text-orange-600 font-medium">
              💝 ₹{campaign.impact_breakdown[0].amount.toLocaleString()} = {campaign.impact_breakdown[0].impact}
            </div>
          )}

          {campaign.description && (
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
              {campaign.description}
            </p>
          )}

          {/* Progress Bar with Percentage */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">
                Raised: ₹{(campaign.raised_amount || 0).toLocaleString()}
              </span>
              <span className="text-orange-600 font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Goal: ₹{campaign.goal_amount?.toLocaleString()}</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2.5" />
          </div>

          {/* Beneficiary & Social Proof */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            {campaign.beneficiary_count > 0 && (
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-blue-500" />
                {campaign.beneficiary_count.toLocaleString()}+ helped
              </span>
            )}
            {campaign.donor_count > 0 && (
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1 text-pink-500" />
                {campaign.donor_count.toLocaleString()} donors
              </span>
            )}
          </div>

          {/* Rating */}
          {campaign.campaign_rating && campaign.total_reviews > 0 && (
            <div className="flex items-center gap-1 mb-4 text-sm">
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.round(campaign.campaign_rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {campaign.campaign_rating.toFixed(1)} ({campaign.total_reviews})
              </span>
            </div>
          )}

          {/* Latest Update */}
          {campaign.latest_update && (
            <div className="mb-4 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span className="font-medium">Latest: {campaign.latest_update.title}</span>
              </div>
            </div>
          )}

          {/* Quick Donation Amounts */}
          {quickAmounts.length > 0 && (
            <div className="mb-4 flex gap-2">
              {quickAmounts.map((item, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    onDonate(campaign);
                  }}
                  className="flex-1 text-xs h-8"
                >
                  ₹{item.amount}
                </Button>
              ))}
            </div>
          )}

          {/* CTA & Share */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={(e) => {
                e.preventDefault();
                onDonate(campaign);
              }}
              disabled={campaign.status !== 'active'}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate Now
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                const url = `${window.location.origin}${createPageUrl(`CampaignDetail?campaignId=${campaign.id}`)}`;
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Days Left Footer */}
          {daysLeft !== null && daysLeft > 7 && (
            <div className="mt-3 pt-3 border-t text-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 inline mr-1" />
              {daysLeft} days remaining
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

function CampaignCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </Card>
  );
}

export default function Donate() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  React.useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['donation-campaigns'],
    queryFn: () => base44.entities.DonationCampaign.filter({ is_deleted: false, status: 'active', is_hidden: false }, '-created_date'),
  });

  const donationMutation = useMutation({
    mutationFn: async (donationData) => {
      const user = await base44.auth.me();
      
      // Create donation record
      await base44.entities.Donation.create({
        ...donationData,
        user_id: user.id,
        donor_name: isAnonymous ? 'Anonymous' : user.full_name,
        donor_email: user.email
      });

      // Update campaign raised amount
      const campaign = campaigns.find(c => c.id === donationData.campaign_id);
      if (campaign) {
        await base44.entities.DonationCampaign.update(campaign.id, {
          raised_amount: (campaign.raised_amount || 0) + donationData.amount
        });
      }
    },
    onSuccess: () => {
      toast.success('Thank you for your generous donation!');
      setSelectedCampaign(null);
      setDonationAmount('');
      setIsAnonymous(false);
      setIsRecurring(false);
      queryClient.invalidateQueries(['donation-campaigns']);
    }
  });

  const handleDonate = () => {
    if (!donationAmount || Number(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }
    donationMutation.mutate({
      campaign_id: selectedCampaign.id,
      amount: Number(donationAmount),
      is_anonymous: isAnonymous,
      is_recurring: isRecurring,
      recurring_frequency: isRecurring ? recurringFrequency : undefined
    });
  };

  const filteredCampaigns = campaigns?.filter(campaign => 
    selectedCategory === 'all' || campaign.category === selectedCategory
  );

  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      <PageHero page="donate" />

      <div className="container mx-auto px-6 py-16" id="campaigns">
        {/* Campaigns Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Active Campaigns</h2>
          <p className="text-gray-600">Support causes that matter to you</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            All Causes
            </Button>
          {Object.entries(categoryIcons).map(([key, Icon]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(key)}
              className={selectedCategory === key ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              <Icon className="w-4 h-4 mr-2" />
              {key.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <CampaignCardSkeleton key={i} />)
          ) : filteredCampaigns?.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onDonate={setSelectedCampaign}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500">Check back soon for donation campaigns</p>
            </div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Donation</DialogTitle>
            <DialogDescription>
              {selectedCampaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant={donationAmount === String(amount) ? "default" : "outline"}
                  onClick={() => setDonationAmount(String(amount))}
                  className={donationAmount === String(amount) ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>

            <div>
              <Label className="mb-2 block">Custom Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="anonymous" className="cursor-pointer">Make this donation anonymous</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="recurring" className="cursor-pointer">Make this a recurring donation</Label>
              </div>

              {isRecurring && (
                <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedCampaign(null)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleDonate}
              disabled={donationMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {donationMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              Donate ₹{donationAmount || '0'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}