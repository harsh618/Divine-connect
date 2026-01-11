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
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {temple.city}, {temple.state}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
            {temple.primary_deity}
          </p>

          <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-amber-700 transition-colors line-clamp-1">
            {temple.name}
          </h3>

          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {temple.significance || temple.description || `Visit the sacred ${temple.name} dedicated to ${temple.primary_deity}.`}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-400">
            {temple.visit_booking_enabled ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Bookings Open
              </span>
            ) : (
              <span>{temple.city}, {temple.state}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}