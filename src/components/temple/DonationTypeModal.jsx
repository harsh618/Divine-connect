import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const donationTypes = [
  { id: 'anna_daan', label: 'Anna Daan', icon: '🍚', description: 'Provide meals to devotees', category: 'anna_daan' },
  { id: 'temple_renovation', label: 'Temple Maintenance', icon: '🏛️', description: 'Support temple upkeep', category: 'temple_renovation' },
  { id: 'gaushala', label: 'Gaushala', icon: '🐄', description: 'Support cow protection', category: 'gaushala' },
  { id: 'education', label: 'Education', icon: '📚', description: 'Support learning initiatives', category: 'education' },
  { id: 'medical', label: 'Medical Aid', icon: '⚕️', description: 'Healthcare for devotees', category: 'medical' },
  { id: 'general', label: 'General Donation', icon: '💝', description: 'Support overall activities', category: null }
];

export default function DonationTypeModal({ isOpen, onClose, templeId, templeName }) {
  const [selectedType, setSelectedType] = useState(null);
  const [showCampaigns, setShowCampaigns] = useState(false);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['donation-campaigns', selectedType],
    queryFn: async () => {
      const type = donationTypes.find(t => t.id === selectedType);
      if (!type?.category) {
        // For general donations, fetch all active campaigns
        return base44.entities.DonationCampaign.filter({ 
          status: 'active',
          is_deleted: false,
          is_hidden: false
        }, '-raised_amount');
      }
      return base44.entities.DonationCampaign.filter({ 
        status: 'active',
        is_deleted: false,
        is_hidden: false,
        category: type.category 
      }, '-raised_amount');
    },
    enabled: showCampaigns && !!selectedType
  });

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowCampaigns(true);
  };

  const handleBack = () => {
    setShowCampaigns(false);
    setSelectedType(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {showCampaigns ? `${donationTypes.find(t => t.id === selectedType)?.label} Campaigns` : `Donate to ${templeName}`}
          </DialogTitle>
        </DialogHeader>

        {!showCampaigns ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {donationTypes.map((type) => (
              <Card
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className="p-6 cursor-pointer hover:border-primary transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {type.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-4">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              ← Back to Categories
            </Button>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : campaigns?.length > 0 ? (
            <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} to={createPageUrl(`CampaignDetail?campaignId=${campaign.id}`)} onClick={onClose}>
                <Card className="p-6 hover:border-primary transition-all cursor-pointer">
                  <div className="flex gap-4">
                    {campaign.thumbnail_url && (
                      <img
                        src={campaign.thumbnail_url}
                        alt={campaign.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{campaign.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-sm text-muted-foreground mb-1">
                            ₹{campaign.raised_amount?.toLocaleString() || 0} raised of ₹{campaign.goal_amount?.toLocaleString()}
                          </p>
                          <div className="w-full bg-muted h-2 rounded-full">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(((campaign.raised_amount || 0) / campaign.goal_amount) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Donate Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No active campaigns in this category at the moment.
                </p>
                <Button onClick={handleBack} variant="outline">
                  Choose Different Category
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}