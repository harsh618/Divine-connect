import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
  Star,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800";
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920'
];

const categoryIcons = {
  temple_renovation: Building2,
  gaushala: Leaf,
  anna_daan: Heart,
  education: BookOpen,
  medical: Stethoscope
};

const CATEGORIES = [
  { value: 'all', label: 'All Causes', icon: Heart },
  { value: 'temple_renovation', label: 'Temple', icon: Building2 },
  { value: 'gaushala', label: 'Gaushala', icon: Leaf },
  { value: 'anna_daan', label: 'Anna Daan', icon: Heart },
  { value: 'education', label: 'Education', icon: BookOpen },
  { value: 'medical', label: 'Medical', icon: Stethoscope },
];

function CampaignCard({ campaign, onDonate }) {
  const [imgSrc, setImgSrc] = useState(campaign.images?.[0] || FALLBACK_IMAGE);
  const Icon = categoryIcons[campaign.category] || Heart;
  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
  const daysLeft = campaign.deadline ? differenceInDays(new Date(campaign.deadline), new Date()) : null;

  return (
    <div className="group block h-full">
      <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
        
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img 
            src={imgSrc} 
            alt={campaign.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <Badge className="bg-white/90 backdrop-blur text-black border-0 px-2 py-0.5 text-xs flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {campaign.category?.replace(/_/g, ' ')}
            </Badge>
            {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
              <Badge className="bg-red-500 text-white border-0 px-2 py-0.5 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysLeft}d left
              </Badge>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white font-semibold text-base line-clamp-1">{campaign.title}</h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3">
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">₹{(campaign.raised_amount || 0).toLocaleString()}</span>
              <span className="text-amber-600 font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-1.5" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gray-500">
            {campaign.donor_count > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-500" />
                {campaign.donor_count} donors
              </span>
            )}
            <span>Goal: ₹{campaign.goal_amount?.toLocaleString()}</span>
          </div>

          {/* Action Button */}
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onDonate(campaign);
            }}
            disabled={campaign.status !== 'active'}
            size="sm"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Heart className="w-3 h-3 mr-1" />
            Donate Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-8 w-full rounded" />
      </div>
    </div>
  );
}

export default function Donate() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  // Rotate Hero Background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
      
      await base44.entities.Donation.create({
        ...donationData,
        user_id: user.id,
        donor_name: isAnonymous ? 'Anonymous' : user.full_name,
        donor_email: user.email
      });

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

  const featuredCampaigns = filteredCampaigns?.filter(c => c.is_trending) || [];
  const regularCampaigns = filteredCampaigns?.filter(c => !c.is_trending) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24 font-sans">
      
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-end justify-center overflow-hidden pb-16">
        <div className="absolute inset-0 z-0 bg-black">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-60' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-4">
                <Heart className="w-3 h-3 text-pink-400" />
                Sacred Giving
             </div>
             <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-none drop-shadow-xl">
                Give with Love,<br/>
                <span className="italic text-white/70">Change Lives.</span>
             </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-7xl relative z-20 -mt-8">
        
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xl shadow-stone-200/50 mb-12 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
           <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 flex items-center gap-2 ${
                       selectedCategory === cat.value
                       ? 'bg-orange-600 text-white shadow-lg'
                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
           </div>
        </div>

        {/* Trending Campaigns Section */}
        {featuredCampaigns.length > 0 && selectedCategory === 'all' && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-3xl font-serif text-gray-900">Trending Campaigns</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} onDonate={setSelectedCampaign} />
              ))}
            </div>
            <div className="mt-12 mb-8 border-t border-gray-200" />
          </div>
        )}

        {/* All Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <CampaignCardSkeleton key={i} />)
          ) : (selectedCategory !== 'all' ? filteredCampaigns : regularCampaigns)?.length > 0 ? (
            (selectedCategory !== 'all' ? filteredCampaigns : regularCampaigns).map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} onDonate={setSelectedCampaign} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No campaigns available</h3>
              <p className="text-gray-500 font-light">Check back soon for donation campaigns.</p>
              <Button 
                variant="link" 
                onClick={() => setSelectedCategory('all')}
                className="text-amber-600 mt-2"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Make a Donation</DialogTitle>
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
                  className={`rounded-xl ${donationAmount === String(amount) ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
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
                className="rounded-xl"
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
                  <SelectTrigger className="rounded-xl">
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
            <Button variant="outline" onClick={() => setSelectedCampaign(null)} className="flex-1 rounded-xl h-12">
              Cancel
            </Button>
            <Button 
              onClick={handleDonate}
              disabled={donationMutation.isPending}
              className="flex-1 bg-amber-600 hover:bg-amber-700 rounded-xl h-12"
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