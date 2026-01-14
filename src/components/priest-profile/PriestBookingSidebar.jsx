import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, MessageCircle, Phone, Video, Shield, 
  Star, CheckCircle, Zap, Gift, ArrowRight
} from 'lucide-react';

export default function PriestBookingSidebar({ provider, onBook }) {
  const consultationRates = [
    { 
      mode: 'chat', 
      icon: MessageCircle, 
      rate: provider.consultation_rate_chat, 
      label: 'Chat',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      mode: 'voice', 
      icon: Phone, 
      rate: provider.consultation_rate_voice, 
      label: 'Voice Call',
      color: 'from-green-500 to-green-600'
    },
    { 
      mode: 'video', 
      icon: Video, 
      rate: provider.consultation_rate_video, 
      label: 'Video Call',
      color: 'from-purple-500 to-purple-600'
    },
  ].filter(r => r.rate);

  return (
    <div className="space-y-4 sticky top-6">
      {/* Quick Book Card */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />
        <CardContent className="p-5">
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            {provider.is_available_now ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                </div>
                <span className="text-sm font-semibold text-green-600">Available Now</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Next: Tomorrow 10 AM</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
              {provider.rating_average?.toFixed(1) || 'New'}
            </Badge>
          </div>

          {/* Consultation Rates */}
          {provider.provider_type === 'astrologer' && consultationRates.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Consultation Rates</p>
              {consultationRates.map((rate, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onBook?.(rate.mode)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${rate.color} flex items-center justify-center`}>
                      <rate.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">{rate.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">₹{rate.rate}</span>
                    <span className="text-xs text-gray-500">/min</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* For Priests - Service Range */}
          {provider.provider_type === 'priest' && (
            <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-xs text-orange-600 uppercase tracking-wide font-medium mb-2">Service Range</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-orange-600">₹1,100</span>
                <span className="text-gray-500">onwards</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Varies by pooja type and location</p>
            </div>
          )}

          {/* Main CTA */}
          <Button 
            onClick={() => onBook?.()}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30"
            disabled={!provider.is_available_now && !provider.is_available_online}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Consultation
          </Button>

          {/* Instant Connect */}
          {provider.is_available_now && (
            <Button 
              variant="outline"
              className="w-full mt-2 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => onBook?.('instant')}
            >
              <Zap className="w-4 h-4 mr-2" />
              Connect Instantly
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Guarantees</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Secure Payments</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Verified Profile</p>
                <p className="text-xs text-gray-500">ID & credentials checked</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Gift className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Satisfaction Guaranteed</p>
                <p className="text-xs text-gray-500">Quality assurance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{provider.total_consultations || 0}+</div>
              <div className="text-xs text-orange-100">Consultations</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{provider.years_of_experience || 0}+</div>
              <div className="text-xs text-orange-100">Years Exp.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}