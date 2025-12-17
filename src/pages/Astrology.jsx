import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Star, 
  MessageCircle, 
  Phone, 
  Video,
  Clock,
  Languages,
  CheckCircle,
  Sparkles,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PageHero from '../components/shared/PageHero';
import KundliChat from '../components/kundli/KundliChat';

function AstrologerCard({ provider, onChatClick }) {
  const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200";
  const isAI = provider.id === 'ai_astrologer';
  
  return (
    <Card className={`overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 ${isAI ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300' : ''}`}>
      <div className="p-6">
        {isAI && (
          <Badge className="mb-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        )}
        
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
                  {(provider.is_verified || isAI) && (
                    <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {isAI ? 'Instant AI Guidance' : `${provider.years_of_experience || 5}+ years experience`}
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
        {!isAI && (
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
        )}

        {isAI && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-center p-3 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100">
              <p className="text-lg font-bold text-purple-700">FREE</p>
              <p className="text-xs text-purple-600">Unlimited AI Consultations</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            className={`flex-1 ${isAI ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90' : 'bg-purple-600 hover:bg-purple-700'}`}
            disabled={!provider.is_available_now && !isAI}
            onClick={() => onChatClick(provider)}
          >
            {isAI ? <Bot className="w-4 h-4 mr-2" /> : <MessageCircle className="w-4 h-4 mr-2" />}
            {isAI ? 'Chat with AI' : (provider.is_available_now ? 'Chat Now' : 'Offline')}
          </Button>
          {!isAI && (
            <Link to={createPageUrl(`AstrologerProfile?id=${provider.id}`)} className="flex-1">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
          )}
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
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['astrologers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      provider_type: 'astrologer', 
      is_deleted: false,
      is_verified: true,
      is_hidden: false
    }, '-rating_average'),
  });

  // AI Astrologer Profile
  const aiAstrologer = {
    id: 'ai_astrologer',
    display_name: 'Divine AI Astrologer',
    avatar_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200',
    is_verified: true,
    is_available_now: true,
    years_of_experience: null,
    rating_average: 4.9,
    total_consultations: 10000,
    specializations: ['Vedic Astrology', 'Kundli Analysis', 'Predictions', 'Remedies'],
    languages: ['Hindi', 'English'],
    bio: 'AI-powered Vedic astrologer providing instant guidance based on ancient wisdom'
  };

  const allProviders = providers ? [aiAstrologer, ...providers] : [aiAstrologer];

  const filteredProviders = allProviders?.filter(provider => {
    const matchesSearch = provider.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                  provider.specializations?.some(spec => spec.toLowerCase().includes(selectedSpecialization));
    const matchesAvailable = !showAvailableOnly || provider.is_available_now;
    return matchesSearch && matchesSpecialization && matchesAvailable;
  });

  const handleChatClick = (provider) => {
    if (provider.id === 'ai_astrologer') {
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }
      setSelectedProvider(provider);
      setChatOpen(true);
    } else {
      // For human astrologers, implement actual chat/consultation booking
      console.log('Chat with human astrologer:', provider);
    }
  };

  const specializations = [
    'All', 'Vedic Astrology', 'Tarot Reading', 'Numerology', 'Palmistry', 
    'Vastu', 'Kundli Analysis', 'Horoscope'
  ];

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      <PageHero page="astrology" />

      <div className="container mx-auto px-6 py-16">
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
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.slice(1).map(spec => (
                  <SelectItem key={spec} value={spec.toLowerCase()}>{spec}</SelectItem>
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
              <AstrologerCard key={provider.id} provider={provider} onChatClick={handleChatClick} />
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

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Chat with {selectedProvider?.display_name}</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            {user && <KundliChat userName={user.full_name} userId={user.id} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}