import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, MapPin, Calendar, Heart, Share2, Shield, BadgeCheck, 
  Clock, CheckCircle, Phone, MessageCircle, Video, Award
} from 'lucide-react';

export default function PriestHeroSection({ provider, isFavorite, onToggleFavorite, onBook }) {
  const verificationBadges = [
    { icon: BadgeCheck, label: 'Platform Verified', color: 'text-blue-500', show: provider.is_verified },
    { icon: Shield, label: 'ID Verified', color: 'text-green-500', show: provider.kyc_document_url },
    { icon: Award, label: 'Top Rated', color: 'text-amber-500', show: (provider.rating_average || 0) >= 4.5 },
  ];

  const stats = [
    { label: 'Services', value: provider.total_consultations || 0 },
    { label: 'Rating', value: provider.rating_average?.toFixed(1) || 'New' },
    { label: 'Experience', value: `${provider.years_of_experience || 0}y` },
    { label: 'Response', value: '98%' },
  ];

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="absolute inset-0 h-80 bg-gradient-to-br from-orange-600 via-amber-500 to-orange-400">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545389336-cf090694435e?w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6 pt-8 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Profile Photo & Badges */}
          <div className="relative">
            <Avatar className="w-36 h-36 md:w-44 md:h-44 border-4 border-white shadow-2xl ring-4 ring-orange-300/30">
              <AvatarImage src={provider.avatar_url} className="object-cover" />
              <AvatarFallback className="text-5xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                {provider.display_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {/* Verification Badges */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {verificationBadges.filter(b => b.show).map((badge, idx) => (
                <div 
                  key={idx} 
                  className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
                  title={badge.label}
                >
                  <badge.icon className={`w-4 h-4 ${badge.color}`} />
                </div>
              ))}
            </div>

            {/* Online Status */}
            {provider.is_available_now && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 text-white">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm capitalize">
                    {provider.provider_type === 'priest' ? '🙏 Vedic Priest' : '⭐ Astrologer'}
                  </Badge>
                  {provider.is_featured && (
                    <Badge className="bg-amber-400 text-black border-0">Featured</Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 drop-shadow-lg">
                  {provider.display_name}
                </h1>
                
                {provider.bio && (
                  <p className="text-orange-100 text-sm md:text-base max-w-xl mb-3 line-clamp-2">
                    "{provider.bio?.slice(0, 100)}..."
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-orange-100 text-sm">
                  {provider.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.city}</span>
                    </div>
                  )}
                  {provider.languages?.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>🗣️</span>
                      <span>{provider.languages.slice(0, 3).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleFavorite}
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-4 mt-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center min-w-[70px]">
                  <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-orange-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            {provider.is_available_now ? (
              <div className="flex items-center gap-2 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Available Now</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-200">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Next available: Tomorrow 10 AM</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              onClick={onBook}
              className="bg-white text-orange-600 hover:bg-orange-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Consultation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}