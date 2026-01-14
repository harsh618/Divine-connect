import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, User, Flame, Calendar, Image, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import PriestHeroSection from '../components/priest-profile/PriestHeroSection';
import PriestAboutSection from '../components/priest-profile/PriestAboutSection';
import PriestServicesSection from '../components/priest-profile/PriestServicesSection';
import PriestGallerySection from '../components/priest-profile/PriestGallerySection';
import PriestAvailabilitySection from '../components/priest-profile/PriestAvailabilitySection';
import PriestReviewsSection from '../components/priest-profile/PriestReviewsSection';
import PriestBookingSidebar from '../components/priest-profile/PriestBookingSidebar';
import BackButton from '../components/ui/BackButton';

export default function PriestProfile() {
  const providerId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }, []);
  
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider-profile', providerId],
    queryFn: async () => {
      const providers = await base44.entities.ProviderProfile.filter({ 
        is_deleted: false, 
        is_hidden: false 
      });
      return providers.find(p => p.id === providerId) || null;
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

  const handleBook = (mode) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    
    // Navigate to booking page or open modal
    if (provider.provider_type === 'astrologer') {
      window.location.href = `${createPageUrl('AstrologerProfile')}?id=${providerId}`;
    } else {
      // For priests, could open a booking modal
      toast.info('Booking feature coming soon!');
    }
  };

  const handleSelectSlot = (slotData) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    toast.info(`Selected slot: ${slotData.slot.start_time} - ${slotData.slot.end_time}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-500 mb-6">The provider you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl('Priests')}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Priests
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white pb-24 md:pb-8">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <BackButton />
      </div>

      {/* Hero Section */}
      <PriestHeroSection 
        provider={provider}
        isFavorite={isFavorite}
        onToggleFavorite={() => toggleFavoriteMutation.mutate()}
        onBook={handleBook}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-white border shadow-sm rounded-xl p-1 mb-6 overflow-x-auto flex-nowrap">
                <TabsTrigger value="about" className="flex-shrink-0">
                  <User className="w-4 h-4 mr-2" />
                  About
                </TabsTrigger>
                <TabsTrigger value="services" className="flex-shrink-0">
                  <Flame className="w-4 h-4 mr-2" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="availability" className="flex-shrink-0">
                  <Calendar className="w-4 h-4 mr-2" />
                  Availability
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex-shrink-0">
                  <Image className="w-4 h-4 mr-2" />
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-shrink-0">
                  <Star className="w-4 h-4 mr-2" />
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-0">
                <PriestAboutSection provider={provider} />
              </TabsContent>

              <TabsContent value="services" className="mt-0">
                <PriestServicesSection 
                  provider={provider} 
                  onBookService={handleBook}
                />
              </TabsContent>

              <TabsContent value="availability" className="mt-0">
                <PriestAvailabilitySection 
                  provider={provider}
                  onSelectSlot={handleSelectSlot}
                />
              </TabsContent>

              <TabsContent value="gallery" className="mt-0">
                <PriestGallerySection provider={provider} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <PriestReviewsSection provider={provider} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking Sidebar (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <PriestBookingSidebar 
              provider={provider}
              onBook={handleBook}
            />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 lg:hidden z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            {provider.provider_type === 'astrologer' && provider.consultation_rate_chat ? (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-orange-600">₹{provider.consultation_rate_chat}</span>
                <span className="text-sm text-gray-500">/min</span>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Contact for pricing
              </div>
            )}
            <p className="text-xs text-gray-500">
              {provider.is_available_now ? '● Available Now' : 'View availability'}
            </p>
          </div>
          <Button 
            onClick={() => handleBook()}
            className="flex-1 max-w-[200px] h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}