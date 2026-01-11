import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, Star, MapPin, Navigation, ChevronLeft, ChevronRight, 
  X, Wifi, Car, Utensils, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#FF9933';

export default function HotelSuggestionPopup({ isOpen, onClose, temple, bookingDetails }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: hotels } = useQuery({
    queryKey: ['nearby-hotels', temple?.city],
    queryFn: () => base44.entities.Hotel.filter({ 
      is_deleted: false 
    }, '-rating_average', 10),
    enabled: isOpen
  });

  // Filter hotels by city or show all if no match
  const nearbyHotels = hotels?.filter(h => h.city === temple?.city) || [];
  const displayHotels = nearbyHotels.length > 0 ? nearbyHotels : hotels?.slice(0, 5) || [];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity?.toLowerCase()) {
      case 'wifi': return <Wifi className="w-3 h-3" />;
      case 'parking': return <Car className="w-3 h-3" />;
      case 'restaurant': return <Utensils className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Booking Confirmed!</h2>
              <p className="text-white/80 text-sm">
                Your visit to {temple?.name} has been scheduled
              </p>
            </div>
          </div>
        </div>

        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Hotel className="w-5 h-5" style={{ color: GOLD }} />
            Looking for Hotels Nearby?
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Complete your pilgrimage with comfortable stay options near {temple?.name}
          </p>
        </DialogHeader>

        {/* Hotels Carousel */}
        <div className="relative px-6 pb-6">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {canScrollRight && displayHotels.length > 2 && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayHotels.map((hotel, idx) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex-shrink-0 w-72 snap-start"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="relative h-36">
                    <img
                      src={hotel.thumbnail_url || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    {hotel.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{hotel.rating_average || hotel.rating || 4.5}</span>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-gray-800 truncate">{hotel.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {hotel.city}
                      {hotel.distance_from_temple_km && (
                        <span className="text-green-600 ml-1">
                          • {hotel.distance_from_temple_km} km away
                        </span>
                      )}
                    </p>
                    
                    {/* Amenities */}
                    <div className="flex gap-2 mt-2">
                      {hotel.amenities?.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="text-xs text-gray-500 flex items-center gap-1">
                          {getAmenityIcon(amenity)} {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t">
                      <div>
                        <span className="text-lg font-bold" style={{ color: GOLD }}>
                          ₹{hotel.price_per_night || hotel.room_types?.[0]?.price || 1500}
                        </span>
                        <span className="text-xs text-gray-500">/night</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Link to={createPageUrl('Yatra')} className="flex-1">
            <Button
              className="w-full text-white"
              style={{ backgroundColor: GOLD }}
              onClick={onClose}
            >
              <Hotel className="w-4 h-4 mr-2" />
              Browse All Hotels
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}