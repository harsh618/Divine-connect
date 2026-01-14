import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import BackButton from '../components/ui/BackButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Heart, Target, TrendingUp, MapPin, Users, CheckCircle2, Calendar,
  Info, Loader2, PieChart, FileText, Award, Clock, Share2,
  Play, ImageIcon, MessageSquare, ChevronRight, Shield, Gift,
  Sparkles, ArrowRight, Download, Quote
} from 'lucide-react';
import { toast } from 'sonner';
import { differenceInDays, format } from 'date-fns';

const categoryConfig = {
  temple_renovation: { icon: '🛕', color: 'orange', label: 'Temple Renovation' },
  gaushala: { icon: '🐄', color: 'green', label: 'Gaushala' },
  anna_daan: { icon: '🍚', color: 'amber', label: 'Anna Daan' },
  education: { icon: '📚', color: 'blue', label: 'Education' },
  medical: { icon: '⚕️', color: 'red', label: 'Medical' }
};

const categoryColors = {
  temple_renovation: 'bg-orange-100 text-orange-700',
  gaushala: 'bg-green-100 text-green-700',
  anna_daan: 'bg-pink-100 text-pink-700',
  education: 'bg-blue-100 text-blue-700',
  medical: 'bg-purple-100 text-purple-700'
};

export default function CampaignDetail() {
  const queryClient = useQueryClient();
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const campaignId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('campaignId');
  }, []);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const campaigns = await base44.entities.DonationCampaign.filter({ is_deleted: false, is_hidden: false });
      return campaigns.find(c => c.id === campaignId) || null;
    },
    enabled: !!campaignId
  });

  const { data: recentDonations = [] } = useQuery({
    queryKey: ['campaign-donations', campaignId],
    queryFn: async () => {
      const donations = await base44.entities.Donation.filter({ campaign_id: campaignId }, '-created_date', 10);
      return donations;
    },
    enabled: !!campaignId
  });

  const donateMutation = useMutation({
    mutationFn: async (amount) => {
      const user = await base44.auth.me();
      
      await base44.entities.Donation.create({
        user_id: user.id,
        campaign_id: campaignId,
        amount: parseFloat(amount),
        is_anonymous: isAnonymous,
        donor_name: isAnonymous ? 'Anonymous' : user.full_name,
        donor_email: user.email
      });

      await base44.entities.DonationCampaign.update(campaignId, {
        raised_amount: (campaign.raised_amount || 0) + parseFloat(amount),
        donor_count: (campaign.donor_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign', campaignId]);
      queryClient.invalidateQueries(['campaign-donations', campaignId]);
      toast.success('Thank you for your generous donation! 🙏');
      setShowDonateModal(false);
      setDonationAmount('');
    }
  });

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin();
      return;
    }

    donateMutation.mutate(donationAmount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign not found</h2>
          <p className="text-gray-500 mb-6">This campaign may have ended or been removed.</p>
          <Link to={createPageUrl('Donate')}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Browse Campaigns
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const config = categoryConfig[campaign.category] || categoryConfig.temple_renovation;
  const progress = ((campaign.raised_amount || 0) / campaign.goal_amount) * 100;
  const daysLeft = campaign.deadline ? differenceInDays(new Date(campaign.deadline), new Date()) : null;
  const images = campaign.images?.length > 0 ? campaign.images : ['https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 h-80 md:h-96">
          <img 
            src={images[currentImageIndex]}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-black/40 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-8 max-w-6xl">
          <BackButton to={createPageUrl('Donate')} label="All Campaigns" className="text-white" />

          {/* Campaign Header */}
          <div className="mt-32 md:mt-48">
            <Badge className={`${categoryColors[campaign.category] || 'bg-orange-100 text-orange-700'} mb-3`}>
              {config.icon} {config.label}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 drop-shadow-lg">
              {campaign.title}
            </h1>
            {campaign.location && (
              <div className="flex items-center gap-1 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>{campaign.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-6xl -mt-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card className="p-6 bg-white shadow-xl border-0">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{(campaign.raised_amount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Raised</p>
                </div>
                <div className="text-center border-x">
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(progress)}%
                  </p>
                  <p className="text-sm text-gray-600">Funded</p>
                </div>
                <div className="text-center">
                  {daysLeft !== null && daysLeft > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-blue-600">{daysLeft}</p>
                      <p className="text-sm text-gray-600">Days Left</p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-green-600">{campaign.donor_count || 0}</p>
                      <p className="text-sm text-gray-600">Donors</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Goal: ₹{campaign.goal_amount?.toLocaleString()}</span>
                  <span className="text-orange-600 font-semibold">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-3" />
              </div>

              {/* Milestones */}
              {campaign.milestones?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Milestones</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {campaign.milestones.map((milestone, idx) => (
                      <Badge 
                        key={idx} 
                        variant={milestone.achieved ? 'default' : 'outline'}
                        className={milestone.achieved ? 'bg-green-500' : ''}
                      >
                        {milestone.achieved ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                        ₹{milestone.amount?.toLocaleString()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 h-12">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="donors">Donors</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Description */}
                {campaign.description && (
                  <Card className="p-6 border-l-4 border-l-blue-500">
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      About This Campaign
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {campaign.description}
                    </p>
                  </Card>
                )}

                {/* Impact Breakdown */}
                {campaign.impact_breakdown?.length > 0 && (
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      Your Impact
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {campaign.impact_breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Gift className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-green-900">₹{item.amount?.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{item.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Purpose */}
                {campaign.purpose && (
                  <Card className="p-6 border-l-4 border-l-purple-500">
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-purple-500" />
                      Why This Campaign?
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {campaign.purpose}
                    </p>
                  </Card>
                )}

                {/* Fund Utilization */}
                {campaign.fund_utilization?.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-amber-500" />
                      Where Your Money Goes
                    </h2>
                    <div className="space-y-3">
                      {campaign.fund_utilization.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">{item.item}</span>
                            <span className="font-bold">{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Beneficiary */}
                {campaign.beneficiary_organization && (
                  <Card className="p-6 bg-blue-50 border-blue-200">
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Beneficiary Organization
                    </h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-900 text-lg">{campaign.beneficiary_organization}</p>
                        {campaign.beneficiary_contact && (
                          <p className="text-blue-700 text-sm">{campaign.beneficiary_contact}</p>
                        )}
                      </div>
                      {campaign.is_fcra_registered && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> FCRA Registered
                        </Badge>
                      )}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                {campaign.latest_update ? (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{campaign.latest_update.date}</Badge>
                      <span className="font-semibold">{campaign.latest_update.title}</span>
                    </div>
                    <p className="text-gray-700">{campaign.latest_update.description}</p>
                    {campaign.latest_update.image_url && (
                      <img 
                        src={campaign.latest_update.image_url}
                        alt="Update"
                        className="mt-4 rounded-xl w-full max-h-64 object-cover"
                      />
                    )}
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No updates yet. Check back soon!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="donors" className="mt-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Recent Supporters</h3>
                  {recentDonations.length > 0 ? (
                    <div className="space-y-3">
                      {recentDonations.map((donation, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-semibold">
                              {donation.is_anonymous ? '?' : donation.donor_name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <p className="font-medium">{donation.is_anonymous ? 'Anonymous' : donation.donor_name}</p>
                              <p className="text-xs text-gray-500">
                                {donation.created_date && format(new Date(donation.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">₹{donation.amount?.toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Be the first to donate!</p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div 
                      key={idx}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {campaign.video_url && (
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center cursor-pointer">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Donation Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24 shadow-xl border-0">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">Support This Cause</h3>
                <p className="text-gray-500 text-sm">Every contribution makes a difference</p>
              </div>

              <Button
                onClick={() => setShowDonateModal(true)}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-semibold rounded-xl"
                size="lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                Donate Now
              </Button>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[500, 1000, 5000].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    onClick={() => {
                      setDonationAmount(amt.toString());
                      setShowDonateModal(true);
                    }}
                    className="text-sm"
                  >
                    ₹{amt}
                  </Button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>100% secure payment</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Tax benefits available</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Transparent fund usage</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <Dialog open={showDonateModal} onOpenChange={setShowDonateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Make a Donation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Donation Amount (₹)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="text-lg h-12"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2500, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant={donationAmount === amount.toString() ? 'default' : 'outline'}
                  onClick={() => setDonationAmount(amount.toString())}
                  className={donationAmount === amount.toString() ? 'bg-orange-500' : ''}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-600">
                Donate anonymously
              </label>
            </div>

            <Button
              onClick={handleDonate}
              disabled={donateMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              {donateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Donate ₹{donationAmount || '0'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}