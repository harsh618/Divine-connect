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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((campaign) => (
                <Link key={campaign.id} to={createPageUrl(`CampaignDetail?campaignId=${campaign.id}`)} onClick={onClose}>
                  <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full">
                    {campaign.thumbnail_url && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={campaign.thumbnail_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-normal text-base text-white line-clamp-2 mb-2">
                            {campaign.title}
                          </h4>
                          <div className="flex items-center justify-between text-white/90 text-xs">
                            <span>₹{campaign.raised_amount?.toLocaleString() || 0} raised</span>
                            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                              {Math.round(((campaign.raised_amount || 0) / campaign.goal_amount) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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