import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, MapPin, Languages, Award, Calendar, MessageCircle, Video, Phone, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PriestProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const providerId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider-profile', providerId],
    queryFn: async () => {
      const allProviders = await base44.entities.ProviderProfile.list();
      return allProviders.find(p => p.id === providerId) || null;
    },
    enabled: !!providerId
  });

  const { data: isFavorite } = useQuery({
    queryKey: ['is-favorite', providerId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const favorites = await base44.entities.FavoriteProvider.filter({
        user_id: user.id,
        provider_id: providerId
      });
      return favorites.length > 0;
    },
    enabled: !!user && !!providerId
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }
      
      if (isFavorite) {
        const favorites = await base44.entities.FavoriteProvider.filter({
          user_id: user.id,
          provider_id: providerId
        });
        if (favorites[0]) {
          await base44.entities.FavoriteProvider.delete(favorites[0].id);
        }
      } else {
        await base44.entities.FavoriteProvider.create({
          user_id: user.id,
          provider_id: providerId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['is-favorite']);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-500">The provider you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white pb-24 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
              <AvatarImage src={provider.avatar_url} />
              <AvatarFallback className="text-4xl bg-orange-600">
                {provider.display_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-4xl font-serif font-bold mb-2">{provider.display_name}</h1>
                  <Badge variant="secondary" className="capitalize mb-3">
                    {provider.provider_type}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleFavoriteMutation.mutate()}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-orange-100">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{provider.rating_average?.toFixed(1) || 'New'}</span>
                  <span className="text-sm">({provider.total_consultations} consultations)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{provider.years_of_experience} years experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">
                  {provider.bio || 'No bio available'}
                </p>
              </CardContent>
            </Card>

            {provider.specializations?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Specializations</h2>
                  <div className="flex flex-wrap gap-2">
                    {provider.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {provider.languages?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Languages className="w-5 h-5 text-orange-600" />
                    <h2 className="text-xl font-bold">Languages</h2>
                  </div>
                  <p className="text-gray-600">{provider.languages.join(', ')}</p>
                </CardContent>
              </Card>
            )}

            {provider.certifications?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-orange-600" />
                    <h2 className="text-xl font-bold">Certifications</h2>
                  </div>
                  <ul className="space-y-2">
                    {provider.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <span className="text-orange-500">•</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Consultation Rates</h3>
                
                {provider.provider_type === 'astrologer' && (
                  <div className="space-y-4">
                    {provider.consultation_rate_chat && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium">Chat</span>
                        </div>
                        <span className="font-bold text-orange-600">₹{provider.consultation_rate_chat}/min</span>
                      </div>
                    )}
                    
                    {provider.consultation_rate_voice && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium">Voice Call</span>
                        </div>
                        <span className="font-bold text-orange-600">₹{provider.consultation_rate_voice}/min</span>
                      </div>
                    )}
                    
                    {provider.consultation_rate_video && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium">Video Call</span>
                        </div>
                        <span className="font-bold text-orange-600">₹{provider.consultation_rate_video}/min</span>
                      </div>
                    )}

                    {!provider.consultation_rate_chat && !provider.consultation_rate_voice && !provider.consultation_rate_video && (
                      <p className="text-sm text-gray-500 italic text-center py-4">Contact for pricing</p>
                    )}
                  </div>
                )}

                {provider.provider_type === 'priest' && (
                  <p className="text-sm text-gray-500 italic text-center py-4">Contact for service pricing</p>
                )}

                <Button 
                  onClick={() => setShowBookingModal(true)}
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
                  disabled={!provider.is_available_now}
                >
                  {provider.is_available_now ? 'Book Consultation' : 'Currently Unavailable'}
                </Button>

                {provider.is_available_now && (
                  <p className="text-xs text-center text-green-600 mt-2">● Available now</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}