import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Star, 
  MessageCircle, 
  Phone, 
  Video,
  Clock,
  Languages,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function AstrologerCard({ provider }) {
  const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200";
  
  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="p-6">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={provider.avatar_url || defaultAvatar}
              alt={provider.display_name}
              className="w-20 h-20 rounded-full object-cover"
            />
            {provider.is_available_now && (
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  {provider.display_name}
                  {provider.is_verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {provider.years_of_experience || 5}+ years experience
                </p>
              </div>
              {provider.is_available_now && (
                <Badge className="bg-green-100 text-green-700 border-0">Online</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium ml-1">{provider.rating_average || 4.5}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {provider.total_consultations || 100}+ consultations
              </span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1 mt-4">
          {(provider.specializations || ['Vedic Astrology', 'Kundli']).slice(0, 3).map((spec, idx) => (
            <Badge key={idx} variant="secondary" className="bg-purple-50 text-purple-700 border-0 text-xs">
              {spec}
            </Badge>
          ))}
        </div>

        {/* Languages */}
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
          <Languages className="w-4 h-4" />
          {(provider.languages || ['Hindi', 'English']).join(', ')}
        </div>

        {/* Rates */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <MessageCircle className="w-4 h-4 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Chat</p>
            <p className="font-semibold text-sm">₹{provider.consultation_rate_chat || 15}/min</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <Phone className="w-4 h-4 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Voice</p>
            <p className="font-semibold text-sm">₹{provider.consultation_rate_voice || 20}/min</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <Video className="w-4 h-4 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Video</p>
            <p className="font-semibold text-sm">₹{provider.consultation_rate_video || 30}/min</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={!provider.is_available_now}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {provider.is_available_now ? 'Chat Now' : 'Offline'}
          </Button>
          <Link to={createPageUrl(`AstrologerProfile?id=${provider.id}`)} className="flex-1">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function AstrologerCardSkeleton() {
  return (
    <Card className="overflow-hidden p-6">
      <div className="flex gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </Card>
  );
}

export default function Astrology() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['astrologers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      provider_type: 'astrologer', 
      is_deleted: false,
      is_verified: true 
    }, '-rating_average'),
  });

  const filteredProviders = providers?.filter(provider => {
    const matchesSearch = provider.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailable = !showAvailableOnly || provider.is_available_now;
    return matchesSearch && matchesAvailable;
  });

  const specializations = [
    'All', 'Vedic Astrology', 'Tarot Reading', 'Numerology', 'Palmistry', 
    'Vastu', 'Kundli Analysis', 'Horoscope'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-6">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Astrology Services
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Connect with verified astrologers for personalized readings, kundli analysis, and life guidance.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to={createPageUrl('KundliGenerator')}>
            <Card className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white cursor-pointer hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Generate Your Kundli</h3>
                  <p className="text-white/80">Get your birth chart and predictions</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to={createPageUrl('MatchMaking')}>
            <Card className="p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white cursor-pointer hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Star className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Kundli Matching</h3>
                  <p className="text-white/80">Check marriage compatibility</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search astrologers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec.toLowerCase().replace(' ', '_')}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showAvailableOnly ? "default" : "outline"}
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`h-12 ${showAvailableOnly ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${showAvailableOnly ? 'bg-white' : 'bg-green-500'}`} />
              Available Now
            </Button>
          </div>
        </div>

        {/* Astrologers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <AstrologerCardSkeleton key={i} />)
          ) : filteredProviders?.length > 0 ? (
            filteredProviders.map((provider) => (
              <AstrologerCard key={provider.id} provider={provider} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Star className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No astrologers available</h3>
              <p className="text-gray-500">Check back soon for expert astrologers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}