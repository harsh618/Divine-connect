import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, HandHeart, Users, Target, 
  TrendingUp, Gift, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#FF9933';

export default function TempleSevaTab({ temple }) {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.DonationCampaign.filter({ 
      status: 'active', 
      is_deleted: false 
    }),
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  // Seva options
  const sevaOptions = [
    {
      id: 'annadaan',
      title: 'Anna Daan Seva',
      description: 'Feed the devotees and the needy with sacred prasad',
      icon: Gift,
      amount: 1100,
      impact: 'Feeds 50 devotees'
    },
    {
      id: 'deepdaan',
      title: 'Deep Daan Seva',
      description: 'Light a diya in the temple for your family\'s well-being',
      icon: Heart,
      amount: 251,
      impact: 'Eternal flame blessing'
    },
    {
      id: 'gaushala',
      title: 'Gau Seva',
      description: 'Contribute towards the care of sacred cows at the temple gaushala',
      icon: HandHeart,
      amount: 501,
      impact: 'One day\'s care for a cow'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Seva & Donations</h2>
        <p className="text-gray-600 mt-1">Contribute to the temple's sacred services</p>
      </div>

      {/* Quick Seva Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {sevaOptions.map((seva, idx) => {
          const Icon = seva.icon;
          return (
            <motion.div
              key={seva.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-orange-100 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${GOLD}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: GOLD }} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{seva.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">{seva.description}</p>
                  <Badge variant="outline" className="mb-4 w-fit border-green-200 text-green-700">
                    {seva.impact}
                  </Badge>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold" style={{ color: GOLD }}>₹{seva.amount}</span>
                    <Button 
                      size="sm"
                      className="text-white"
                      style={{ backgroundColor: GOLD }}
                    >
                      Donate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Active Campaigns */}
      {campaigns?.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Active Campaigns</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.slice(0, 4).map((campaign, idx) => {
              const progress = campaign.goal_amount 
                ? Math.round((campaign.raised_amount / campaign.goal_amount) * 100)
                : 0;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow border-orange-100">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={campaign.thumbnail_url || campaign.images?.[0] || 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=400'}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{campaign.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {campaign.description}
                      </p>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Raised</span>
                          <span className="font-medium" style={{ color: GOLD }}>
                            ₹{campaign.raised_amount?.toLocaleString() || 0} / ₹{campaign.goal_amount?.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                          style={{ '--progress-color': GOLD }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{campaign.donor_count || 0} donors</span>
                        </div>
                        <Link to={createPageUrl(`CampaignDetail?id=${campaign.id}`)}>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-orange-300 hover:bg-orange-50"
                            style={{ color: GOLD }}
                          >
                            Contribute
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}