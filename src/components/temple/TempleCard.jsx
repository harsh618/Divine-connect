import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TempleCard({ temple }) {
  const defaultImage = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800";
  
  return (
    <Link to={createPageUrl(`TempleDetail?id=${temple.id}`)}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <img
            src={temple.images?.[0] || defaultImage}
            alt={temple.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
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
          
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-semibold text-lg truncate">{temple.name}</h3>
            <div className="flex items-center text-white/80 text-sm mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {temple.city}, {temple.state}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 bg-orange-50 px-3 py-1 rounded-full">
              {temple.primary_deity}
            </span>
            {temple.visit_booking_enabled && (
              <span className="text-xs text-green-600 font-medium">Bookings Open</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}