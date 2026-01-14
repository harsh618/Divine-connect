import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  Search, 
  Star, 
  MessageCircle, 
  Phone, 
  Video,
  Languages,
  CheckCircle,
  Sparkles,
  Bot,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import VedicAstrologerChat from '../components/kundli/VedicAstrologerChat';

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200";
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920'
];

const SPECIALIZATIONS = [
  { value: 'all', label: 'All Astrologers' },
  { value: 'vedic', label: 'Vedic Astrology' },
  { value: 'tarot', label: 'Tarot Reading' },
  { value: 'numerology', label: 'Numerology' },
  { value: 'palmistry', label: 'Palmistry' },
  { value: 'vastu', label: 'Vastu' },
];

const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Marathi'];
const EXPERIENCE_FILTERS = [
  { value: 'all', label: 'Any Experience' },
  { value: '5', label: '5+ Years' },
  { value: '10', label: '10+ Years' },
  { value: '15', label: '15+ Years' },
];

function AstrologerCard({ provider, onChatClick }) {
  const [imgSrc, setImgSrc] = useState(provider.avatar_url || FALLBACK_AVATAR);
  const isAI = provider.id === 'ai_astrologer';

  return (
    <div className="group block h-full">
      <div className={`relative h-full bg-white rounded-2xl overflow-hidden border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
        isAI ? 'border-purple-200' : 'border-gray-100'
      }`}>
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img 
            src={imgSrc} 
            alt={provider.display_name}
            onError={() => setImgSrc(FALLBACK_AVATAR)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${
            isAI ? 'from-purple-900/60' : 'from-black/60'
          }`} />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <div className="flex gap-1.5">
              {isAI && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-2.5 py-1 text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </Badge>
              )}
              {provider.is_verified && !isAI && (
                <Badge className="bg-blue-500 text-white border-0 px-2.5 py-1 text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </Badge>
              )}
              {provider.is_available_now && (
                <Badge className="bg-green-500 text-white border-0 px-2.5 py-1 text-xs">
                  Online
                </Badge>
              )}
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 text-xs text-white">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {provider.rating_average || 4.5}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white/80 text-sm">
              {isAI ? 'Instant AI Guidance' : `${provider.years_of_experience || 5}+ Years Experience`}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: isAI ? '#9333ea' : '#d97706' }}>
            {isAI ? 'AI Astrologer' : (provider.city || 'India')}
          </p>

          <h3 className={`font-semibold text-gray-900 text-lg mb-2 transition-colors line-clamp-1 ${
            isAI ? 'group-hover:text-purple-700' : 'group-hover:text-amber-700'
          }`}>
            {provider.display_name}
          </h3>

          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {provider.bio || (isAI ? 'Get instant astrological guidance powered by advanced AI. Free unlimited consultations.' : `Expert in ${(provider.specializations || ['Vedic Astrology']).slice(0, 2).join(', ')}.`)}
          </p>

          {/* Specializations */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(provider.specializations || ['Vedic Astrology']).slice(0, 3).map((spec, idx) => (
              <Badge key={idx} variant="secondary" className={`border-0 text-xs px-2 py-1 rounded-full ${
                isAI ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
              }`}>
                {spec}
              </Badge>
            ))}
          </div>

          {/* Rates for Human Astrologers */}
          {!isAI && (
            <div className="flex gap-3 mb-3 text-xs">
              <span className="text-gray-500">Chat ₹{provider.consultation_rate_chat || 15}/min</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Call ₹{provider.consultation_rate_voice || 20}/min</span>
            </div>
          )}

          {/* Free Badge for AI */}
          {isAI && (
            <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 text-center">
              <p className="text-base font-semibold text-purple-700">FREE</p>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={() => onChatClick(provider)}
            disabled={!provider.is_available_now && !isAI}
            className={`w-full h-10 ${
              isAI 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90' 
                : 'bg-amber-600 hover:bg-amber-700'
            } text-white`}
          >
            {isAI ? <Bot className="w-4 h-4 mr-2" /> : <MessageCircle className="w-4 h-4 mr-2" />}
            {isAI ? 'Chat with AI' : (provider.is_available_now ? 'Chat Now' : 'Offline')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AstrologerCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  );
}

export default function Astrology() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [user, setUser] = useState(null);

  // Rotate Hero Background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
  };

  const allProviders = providers ? [aiAstrologer, ...providers] : [aiAstrologer];

  const filteredProviders = allProviders?.filter(provider => {
    const matchesSearch = provider.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = selectedSpec === 'all' || 
      provider.specializations?.some(spec => spec.toLowerCase().includes(selectedSpec));
    const matchesLanguage = selectedLanguage === 'all' || 
      provider.languages?.some(lang => lang.toLowerCase() === selectedLanguage.toLowerCase());
    const matchesExperience = selectedExperience === 'all' || 
      (provider.years_of_experience || 0) >= parseInt(selectedExperience);
    const matchesRating = (provider.rating_average || 4.5) >= minRating;
    const matchesAvailable = !showAvailableOnly || provider.is_available_now;
    return matchesSearch && matchesSpec && matchesLanguage && matchesExperience && matchesRating && matchesAvailable;
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
      // Navigate to astrologer profile for booking
      window.location.href = createPageUrl('AstrologerProfile') + `?id=${provider.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24 font-sans">
      
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-end justify-center overflow-hidden pb-16">
        <div className="absolute inset-0 z-0 bg-black">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-60' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-4">
                <Star className="w-3 h-3 text-amber-400" />
                Cosmic Guidance
             </div>
             <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-none drop-shadow-xl">
                Vedic Astrology,<br/>
                <span className="italic text-white/70">Your Destiny Revealed.</span>
             </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-7xl relative z-20 -mt-8">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to={createPageUrl('KundliGenerator')}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-serif">Generate Your Kundli</h3>
                  <p className="text-white/80 font-light">Get your birth chart and predictions</p>
                </div>
              </div>
            </div>
          </Link>
          <Link to={createPageUrl('MatchMaking')}>
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Star className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-serif">Kundli Matching</h3>
                  <p className="text-white/80 font-light">Check marriage compatibility</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xl shadow-stone-200/50 mb-8 border border-gray-100 space-y-4">
          {/* Search and Specialization */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search astrologers by name..." 
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-0 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec.value}
                  onClick={() => setSelectedSpec(spec.value)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                    selectedSpec === spec.value
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t">
            <span className="text-sm text-gray-500 font-medium">Filter by:</span>
            
            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Languages</option>
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            
            {/* Experience Filter */}
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {EXPERIENCE_FILTERS.map(exp => (
                <option key={exp.value} value={exp.value}>{exp.label}</option>
              ))}
            </select>
            
            {/* Rating Filter */}
            <button
              onClick={() => setMinRating(minRating === 4 ? 0 : 4)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                minRating === 4
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${minRating === 4 ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              4+ Stars
            </button>
            
            {/* Available Now Filter */}
            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                showAvailableOnly
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showAvailableOnly ? 'bg-green-500' : 'bg-gray-400'}`} />
              Available Now
            </button>
            
            {/* Clear Filters */}
            {(selectedLanguage !== 'all' || selectedExperience !== 'all' || minRating > 0 || showAvailableOnly) && (
              <button
                onClick={() => {
                  setSelectedLanguage('all');
                  setSelectedExperience('all');
                  setMinRating(0);
                  setShowAvailableOnly(false);
                }}
                className="text-sm text-purple-600 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Astrologers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <AstrologerCardSkeleton key={i} />)
          ) : filteredProviders?.length > 0 ? (
            filteredProviders.map((provider) => (
              <AstrologerCard key={provider.id} provider={provider} onChatClick={handleChatClick} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No astrologers available</h3>
              <p className="text-gray-500 font-light">Check back soon for expert astrologers.</p>
              <Button 
                variant="link" 
                onClick={() => {setSearchQuery(''); setSelectedSpec('all'); setShowAvailableOnly(false);}}
                className="text-amber-600 mt-2"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-4xl h-[95vh] max-h-[95vh] p-0 overflow-hidden rounded-[2rem]">
          <div className="h-full flex flex-col">
            {user && <VedicAstrologerChat userName={user.full_name} userId={user.id} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}