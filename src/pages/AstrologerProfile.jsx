import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MessageCircle,
  Phone,
  Video,
  Languages,
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  MapPin,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BackButton from '../components/ui/BackButton';

export default function AstrologerProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const astrologerId = urlParams.get('id');

  const { data: provider, isLoading } = useQuery({
    queryKey: ['astrologer', astrologerId],
    queryFn: async () => {
      const providers = await base44.entities.ProviderProfile.filter({ 
        id: astrologerId,
        provider_type: 'astrologer',
        is_deleted: false 
      });
      return providers[0];
    },
    enabled: !!astrologerId
  });

  const { data: reviews } = useQuery({
    queryKey: ['astrologer-reviews', astrologerId],
    queryFn: () => base44.entities.Review.filter({ provider_id: astrologerId }, '-created_date', 10),
    enabled: !!astrologerId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Astrologer not found</h2>
        <Link to={createPageUrl('Astrology')}>
          <Button>Back to Astrology</Button>
        </Link>
      </div>
    );
  }

  const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-6">
        <div className="container mx-auto">
          <BackButton label="Back to Astrologers" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-4">
            <div className="relative">
              <img
                src={provider.avatar_url || defaultAvatar}
                alt={provider.display_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {provider.is_available_now && (
                <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {provider.display_name}
                </h1>
                {provider.is_verified && (
                  <CheckCircle className="w-6 h-6 text-blue-300 fill-blue-300" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/90 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="font-semibold">{provider.rating_average || 4.5}</span>
                  <span className="text-white/70">({provider.total_consultations || 100}+ consultations)</span>
                </div>
                <span>•</span>
                <span>{provider.years_of_experience || 5}+ years experience</span>
              </div>
              {provider.city && (
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4" />
                  {provider.city}
                </div>
              )}
            </div>
            {provider.is_available_now && (
              <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
                Available Now
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="about">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6 mt-6">
                {/* Bio */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About Me</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {provider.bio || "Experienced astrologer dedicated to helping people understand their life path through Vedic astrology."}
                  </p>
                </Card>

                {/* Specializations */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Specializations
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(provider.specializations || ['Vedic Astrology', 'Kundli Analysis']).map((spec, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-700 border-0">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Astrology Types */}
                {provider.astrology_types?.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      Astrology Types
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {provider.astrology_types.map((type, idx) => (
                        <Badge key={idx} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Languages */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-blue-500" />
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(provider.languages || ['Hindi', 'English']).map((lang, idx) => (
                      <Badge key={idx} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Education */}
                {provider.education_lineage && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-500" />
                      Education & Lineage
                    </h2>
                    <div className="space-y-2 text-gray-600">
                      {provider.education_lineage.institution && (
                        <p><strong>Institution:</strong> {provider.education_lineage.institution}</p>
                      )}
                      {provider.education_lineage.guru_name && (
                        <p><strong>Guru:</strong> {provider.education_lineage.guru_name}</p>
                      )}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-6 mt-6">
                {provider.astrology_services?.length > 0 ? (
                  provider.astrology_services.map((service, idx) => (
                    <Card key={idx} className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{service.service_name}</h3>
                      <div className="flex items-center gap-4 mb-3">
                        <Badge className="bg-purple-100 text-purple-700">
                          {service.duration_minutes} minutes
                        </Badge>
                        <span className="text-2xl font-bold text-purple-600">₹{service.price}</span>
                      </div>
                      {service.deliverables && (
                        <p className="text-gray-600 text-sm">{service.deliverables}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        {service.mode?.map((m, i) => (
                          <Badge key={i} variant="outline">
                            {m === 'chat' && <MessageCircle className="w-3 h-3 mr-1" />}
                            {m === 'audio' && <Phone className="w-3 h-3 mr-1" />}
                            {m === 'video' && <Video className="w-3 h-3 mr-1" />}
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center text-gray-500">
                    No services listed yet
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 mt-6">
                {reviews?.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center text-gray-500">
                    No reviews yet
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Consultation Rates */}
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Consultation Rates</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Chat</span>
                  </div>
                  <span className="font-semibold">₹{provider.consultation_rate_chat || 15}/min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Voice</span>
                  </div>
                  <span className="font-semibold">₹{provider.consultation_rate_voice || 20}/min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Video</span>
                  </div>
                  <span className="font-semibold">₹{provider.consultation_rate_video || 30}/min</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                disabled={!provider.is_available_now}
              >
                {provider.is_available_now ? 'Start Chat Now' : 'Currently Offline'}
              </Button>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified Astrologer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Satisfaction Guaranteed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}