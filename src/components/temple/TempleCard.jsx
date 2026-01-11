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
    <Link to={createPageUrl(`TempleDetail?id=${temple.id}`)}>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-white cursor-pointer rounded-2xl">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={temple.thumbnail_url || temple.images?.[0] || defaultImage}
            alt={temple.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            {temple.is_featured ? (
              <Badge className="bg-orange-500 text-white border-0 text-xs px-2.5 py-1">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            ) : <div />}
            
            {temple.live_darshan_url && (
              <Badge className="bg-red-500 text-white border-0 animate-pulse text-xs px-2.5 py-1">
                <Video className="w-3 h-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
          
          {/* Bottom info */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-semibold text-lg truncate mb-1">{temple.name}</h3>
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {temple.city}, {temple.state}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">
              {temple.primary_deity}
            </span>
            {temple.visit_booking_enabled && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Bookings Open
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}