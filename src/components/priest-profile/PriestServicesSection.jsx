import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, Home, Building, Video, Clock, IndianRupee, 
  ChevronRight, MessageCircle, Phone, Users
} from 'lucide-react';

const MODE_ICONS = {
  at_home: { icon: Home, label: 'At Home', color: 'bg-blue-100 text-blue-600' },
  in_temple: { icon: Building, label: 'In Temple', color: 'bg-orange-100 text-orange-600' },
  online_sankalp: { icon: Video, label: 'Online', color: 'bg-green-100 text-green-600' },
};

export default function PriestServicesSection({ provider, onBookService }) {
  const [selectedService, setSelectedService] = useState(null);

  // For Priests - Pooja Services
  const priestServices = provider.priest_services || [];
  
  // For Astrologers - Consultation Services
  const astroServices = provider.astrology_services || [];

  const consultationRates = [
    { mode: 'chat', icon: MessageCircle, rate: provider.consultation_rate_chat, label: 'Chat', color: 'bg-blue-500' },
    { mode: 'voice', icon: Phone, rate: provider.consultation_rate_voice, label: 'Voice Call', color: 'bg-green-500' },
    { mode: 'video', icon: Video, rate: provider.consultation_rate_video, label: 'Video Call', color: 'bg-purple-500' },
  ].filter(r => r.rate);

  return (
    <div className="space-y-6">
      {/* Consultation Rates for Astrologers */}
      {provider.provider_type === 'astrologer' && consultationRates.length > 0 && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Consultation Rates</h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {consultationRates.map((rate, idx) => (
                <div 
                  key={idx}
                  className="relative p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-purple-200 transition-all cursor-pointer group"
                  onClick={() => onBookService?.(rate.mode)}
                >
                  <div className={`w-12 h-12 rounded-xl ${rate.color} flex items-center justify-center mb-3`}>
                    <rate.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{rate.label}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">₹{rate.rate}</span>
                    <span className="text-sm text-gray-500">/min</span>
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Astrology Services */}
      {provider.provider_type === 'astrologer' && astroServices.length > 0 && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Services Offered</h2>
            </div>

            <div className="space-y-3">
              {astroServices.map((service, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onBookService?.(service)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service.service_name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {service.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration_minutes} mins
                        </span>
                      )}
                      {service.mode?.length > 0 && (
                        <div className="flex gap-1">
                          {service.mode.map((m, i) => (
                            <Badge key={i} variant="outline" className="text-xs capitalize">{m}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {service.deliverables && (
                      <p className="text-xs text-gray-500 mt-1">{service.deliverables}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-600">₹{service.price}</div>
                    <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-600">
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priest Services (Poojas) */}
      {provider.provider_type === 'priest' && priestServices.length > 0 && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Pooja Services</h2>
            </div>

            <div className="space-y-3">
              {priestServices.map((service, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{service.pooja_name}</h3>
                      
                      {/* Service Modes */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {service.at_home && (
                          <Badge className="bg-blue-100 text-blue-700 border-0">
                            <Home className="w-3 h-3 mr-1" /> At Home
                          </Badge>
                        )}
                        {service.in_temple && (
                          <Badge className="bg-orange-100 text-orange-700 border-0">
                            <Building className="w-3 h-3 mr-1" /> In Temple
                          </Badge>
                        )}
                        {service.online_sankalp && (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <Video className="w-3 h-3 mr-1" /> Online
                          </Badge>
                        )}
                      </div>

                      {/* Duration */}
                      {service.duration_minutes && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {service.duration_minutes} minutes
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {(service.dakshina_min || service.dakshina_max) && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Dakshina</p>
                          <p className="text-xl font-bold text-orange-600">
                            ₹{service.dakshina_min?.toLocaleString()}
                            {service.dakshina_max && service.dakshina_max !== service.dakshina_min && (
                              <span> - ₹{service.dakshina_max?.toLocaleString()}</span>
                            )}
                          </p>
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        className="mt-2 bg-orange-500 hover:bg-orange-600"
                        onClick={() => onBookService?.(service)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Services */}
      {priestServices.length === 0 && astroServices.length === 0 && consultationRates.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Services Coming Soon</h3>
            <p className="text-gray-500">Contact directly for service details and pricing.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}