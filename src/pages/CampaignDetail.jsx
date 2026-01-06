import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import BackButton from '../components/ui/BackButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Heart, 
  Target, 
  TrendingUp, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Calendar,
  Info,
  Loader2,
  PieChart,
  FileText,
  Award,
  DollarSign
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import moment from 'moment';

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

  // Get campaignId from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('campaignId');

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const campaigns = await base44.entities.DonationCampaign.filter({ id: campaignId });
      return campaigns[0] || null;
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
        donor_name: user.full_name,
        donor_email: user.email
      });

      await base44.entities.DonationCampaign.update(campaignId, {
        raised_amount: (campaign.raised_amount || 0) + parseFloat(amount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign', campaignId]);
      toast.success('Thank you for your generous donation! 🙏');
      setShowDonateModal(false);
      setDonationAmount('');
    },
    onError: () => {
      toast.error('Failed to process donation. Please try again.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Campaign not found</p>
        </div>
      </div>
    );
  }

  const config = categoryConfig[campaign.category] || categoryConfig.temple_renovation;
  const progress = ((campaign.raised_amount || 0) / campaign.goal_amount) * 100;
  const daysLeft = campaign.deadline ? moment(campaign.deadline).diff(moment(), 'days') : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <BackButton to={createPageUrl('Donate') + '#campaigns'} label="Back to Campaigns" />

        <div className="grid md:grid-cols-3 gap-8 mt-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Campaign Overview Card */}
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl">
                  {config.icon}
                </div>
                <div className="flex-1">
                  <Badge className={`${categoryColors[campaign.category] || 'bg-orange-100 text-orange-700'} mb-2`}>
                    {config.label}
                  </Badge>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {campaign.title}
                  </h1>
                  {campaign.location && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{campaign.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/60 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{(campaign.raised_amount || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-600">Raised</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {progress.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-600">Funded</p>
                </div>
                {daysLeft !== null && daysLeft > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {daysLeft}
                    </p>
                    <p className="text-xs text-gray-600">Days Left</p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Goal: ₹{campaign.goal_amount.toLocaleString('en-IN')}</span>
                  <span className="text-orange-600 font-semibold">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </Card>
            {/* Hero Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={campaign.images?.[0] || campaign.thumbnail_url || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800'}
                  alt={campaign.title}
                  className="w-full h-96 object-cover"
                />
                {campaign.status === 'completed' && (
                  <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                    Campaign Completed ✓
                  </Badge>
                )}
              </div>
            </Card>

            {/* Description - Short Overview */}
            {campaign.description && (
              <Card className="p-6 bg-white border-l-4 border-l-blue-500">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  Campaign Overview
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {campaign.description}
                </p>
              </Card>
            )}

            {/* Impact Breakdown - What Your Donation Achieves */}
            {campaign.impact_breakdown && campaign.impact_breakdown.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Your Impact
                </h2>
                <div className="space-y-3">
                  {campaign.impact_breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900">₹{item.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-700">{item.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Purpose */}
            {campaign.purpose && (
              <Card className="p-6 bg-white border-l-4 border-l-purple-500">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold">Why This Campaign?</h2>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                    {campaign.purpose}
                  </p>
                </div>
              </Card>
            )}

            {/* Detailed Description */}
            {campaign.detailed_description && (
              <Card className="p-6 bg-white">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-gray-700" />
                  About This Campaign
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                    {campaign.detailed_description}
                  </p>
                </div>
              </Card>
            )}

            {/* Seva Details */}
            {campaign.seva_details && (
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-orange-900">Seva Details</h2>
                </div>
                <p className="text-orange-900/80 leading-relaxed whitespace-pre-line">
                  {campaign.seva_details}
                </p>
              </Card>
            )}

            {/* Fund Utilization */}
            {campaign.fund_utilization && campaign.fund_utilization.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <PieChart className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold">Where Your Money Goes</h2>
                </div>
                <div className="space-y-4">
                  {campaign.fund_utilization.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">{item.item}</span>
                        <span className="text-gray-900 font-bold">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Impact Metrics */}
            {campaign.impact_metrics && campaign.impact_metrics.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold">Expected Impact</h2>
                </div>
                <div className="space-y-3">
                  {campaign.impact_metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{metric}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Beneficiary Info */}
            {campaign.beneficiary_organization && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-blue-900">Beneficiary Organization</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Organization Name</p>
                    <p className="text-blue-900 font-semibold text-lg">
                      {campaign.beneficiary_organization}
                      {campaign.is_fcra_registered && (
                        <Badge className="ml-2 bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          FCRA Registered
                        </Badge>
                      )}
                    </p>
                  </div>
                  {campaign.beneficiary_contact && (
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Contact Information</p>
                      <p className="text-blue-800 font-medium">
                        {campaign.beneficiary_contact}
                      </p>
                    </div>
                  )}
                  {campaign.beneficiary_count > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold text-blue-900">{campaign.beneficiary_count.toLocaleString()}+</p>
                          <p className="text-sm text-blue-600">People/Families Helped</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Card */}
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Support This Cause</h3>
                <p className="text-gray-600 text-center text-sm">
                  Every contribution makes a difference
                </p>
              </div>

              <Button
                onClick={() => setShowDonateModal(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white py-6 text-lg"
                size="lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                Donate Now
              </Button>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDonationAmount('500');
                    setShowDonateModal(true);
                  }}
                  className="text-sm"
                >
                  ₹500
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDonationAmount('1000');
                    setShowDonateModal(true);
                  }}
                  className="text-sm"
                >
                  ₹1000
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDonationAmount('5000');
                    setShowDonateModal(true);
                  }}
                  className="text-sm"
                >
                  ₹5000
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>100% secure payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Tax benefits available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Transparent fund usage</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <Dialog open={showDonateModal} onOpenChange={setShowDonateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Donation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Donation Amount (₹)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2500, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setDonationAmount(amount.toString())}
                  className="text-sm"
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
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white"
              size="lg"
            >
              {donateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Confirm Donation
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}