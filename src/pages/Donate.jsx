import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
  Stethoscope
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/components/translations';

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

  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="relative h-48 overflow-hidden">
        <img
          src={campaign.images?.[0] || defaultImage}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge className={`absolute top-3 left-3 ${categoryColors[campaign.category]} border-0`}>
          <Icon className="w-3 h-3 mr-1" />
          {campaign.category?.replace(/_/g, ' ')}
        </Badge>
        {campaign.status === 'completed' && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
            Completed
          </Badge>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {campaign.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Raised: ₹{(campaign.raised_amount || 0).toLocaleString()}</span>
            <span className="text-gray-900 font-medium">Goal: ₹{campaign.goal_amount?.toLocaleString()}</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {daysLeft !== null && daysLeft > 0 && (
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {daysLeft} days left
              </span>
            )}
          </div>
          <Button 
            onClick={() => onDonate(campaign)}
            disabled={campaign.status !== 'active'}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Heart className="w-4 h-4 mr-2" />
            Donate
          </Button>
        </div>
      </div>
    </Card>
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
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['donation-campaigns'],
    queryFn: () => base44.entities.DonationCampaign.filter({ is_deleted: false, status: 'active' }, '-created_date'),
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-16 px-6">
        <div className="container mx-auto">
          <BackButton label={t('common.back', language)} />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {t('donate.title', language)}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            {t('donate.subtitle', language)}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{totalRaised.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{t('donate.totalRaised', language)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{campaigns?.length || 0}</p>
                <p className="text-sm text-gray-500">{t('donate.activeCampaigns', language)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5,000+</p>
                <p className="text-sm text-gray-500">{t('donate.generousDonors', language)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {t('donate.allCauses', language)}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('donate.noCampaigns', language)}</h3>
              <p className="text-gray-500">{t('donate.checkBack', language)}</p>
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