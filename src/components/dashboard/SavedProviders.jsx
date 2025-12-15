import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, Star, MessageCircle, Video, Phone, HeartOff } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

export default function SavedProviders({ userId }) {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorite-providers', userId],
    queryFn: () => base44.entities.FavoriteProvider.filter({ user_id: userId })
  });

  const { data: providers } = useQuery({
    queryKey: ['saved-provider-details', favorites],
    queryFn: async () => {
      if (!favorites?.length) return [];
      const providerIds = favorites.map(f => f.provider_id);
      return base44.entities.ProviderProfile.filter({
        id: { $in: providerIds },
        is_deleted: false,
        is_hidden: false
      });
    },
    enabled: !!favorites?.length
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (providerId) => {
      const favorite = favorites.find(f => f.provider_id === providerId);
      if (favorite) {
        await base44.entities.FavoriteProvider.delete(favorite.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorite-providers']);
      toast.success('Removed from favorites');
    }
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!providers?.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Providers</h3>
          <p className="text-gray-500 mb-4">Save your favorite priests and astrologers for quick access</p>
          <Link to={createPageUrl('Priests')}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Browse Providers
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {providers.map((provider) => (
        <Card key={provider.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={provider.avatar_url || `https://ui-avatars.com/api/?name=${provider.display_name}&background=f97316&color=fff`}
                alt={provider.display_name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{provider.display_name}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {provider.provider_type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFavoriteMutation.mutate(provider.id)}
                    className="text-pink-500 hover:text-pink-600"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{provider.rating_average?.toFixed(1) || 'New'}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{provider.years_of_experience} years</span>
                </div>

                {provider.provider_type === 'astrologer' && (
                  <div className="flex gap-2">
                    {provider.consultation_rate_chat && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MessageCircle className="w-3 h-3" />
                        <span>₹{provider.consultation_rate_chat}/min</span>
                      </div>
                    )}
                    {provider.consultation_rate_video && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Video className="w-3 h-3" />
                        <span>₹{provider.consultation_rate_video}/min</span>
                      </div>
                    )}
                  </div>
                )}

                <Link to={createPageUrl('Priests')}>
                  <Button size="sm" className="mt-3 w-full" variant="outline">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}