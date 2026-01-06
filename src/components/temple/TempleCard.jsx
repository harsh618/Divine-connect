import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KarmaScore from '../yatra/KarmaScore';

export default function TempleCard({ temple }) {
  const defaultImage = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800";
  
  return (
    <Card 
      className="group overflow-hidden border-0 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white cursor-pointer rounded-2xl"
      onClick={() => window.location.href = createPageUrl(`TempleDetail?id=${temple.id}`)}
    >
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={temple.thumbnail_url || temple.images?.[0] || defaultImage}
            alt={temple.name}
            className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          
          {temple.is_featured && (
            <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          
          {temple.live_darshan_url && (
            <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0 animate-pulse">
              <Video className="w-3 h-3 mr-1" />
              Live
            </Badge>
          )}
          
          <div className="absolute bottom-3 left-3 right-3 transform group-hover:translate-y-0 transition-transform">
            <h3 className="text-white font-bold text-lg truncate group-hover:text-shadow-lg">{temple.name}</h3>
            <div className="flex items-center text-white text-sm mt-1 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full inline-flex group-hover:bg-black/60 transition-colors">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {temple.city}, {temple.state}
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">
              {temple.primary_deity}
            </span>
            {temple.visit_booking_enabled && (
              <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Bookings Open
              </span>
            )}
          </div>
          <div className="flex justify-end">
            <KarmaScore score={temple.karma_score} size="sm" showLabel={false} />
          </div>
        </div>
      </Card>
  );
}