import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Star, Wifi, Car, Coffee, 
  IndianRupee, Navigation, Phone 
} from 'lucide-react';

const GOLD = '#FF9933';

const AMENITY_ICONS = {
  'WiFi': Wifi,
  'Parking': Car,
  'Restaurant': Coffee,
};

export default function TempleStayNearbyTab({ temple }) {
  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels', temple.city],
    queryFn: () => base44.entities.Hotel.filter({ 
      city: temple.city, 
      is_active: true, 
      is_deleted: false 
    }),
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  // If no hotels found, show placeholder
  const displayHotels = hotels?.length > 0 ? hotels : [
    {
      id: '1',
      name: 'Temple View Inn',
      thumbnail_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      amenities: ['WiFi', 'Parking', 'Restaurant'],
      rating_average: 4.5,
      room_inventory: [{ room_type: 'STANDARD', price_per_night: 1500 }],
      distance_to_temple: { distance_km: 0.5 }
    },
    {
      id: '2',
      name: 'Pilgrim Guest House',
      thumbnail_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      amenities: ['WiFi', 'Parking'],
      rating_average: 4.2,
      room_inventory: [{ room_type: 'DELUXE', price_per_night: 2500 }],
      distance_to_temple: { distance_km: 1.2 }
    },
    {
      id: '3',
      name: 'Divine Stay Resort',
      thumbnail_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
      amenities: ['WiFi', 'Parking', 'Restaurant'],
      rating_average: 4.7,
      room_inventory: [{ room_type: 'SUITE', price_per_night: 4500 }],
      distance_to_temple: { distance_km: 2.0 }
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Stay Near {temple.name}</h2>
        <p className="text-gray-600 mt-1">Comfortable accommodations for your pilgrimage</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {displayHotels.map((hotel, idx) => (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-orange-100">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto">
                  <img 
                    src={hotel.thumbnail_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{hotel.rating_average || 4.5}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <Navigation className="w-4 h-4" style={{ color: GOLD }} />
                    <span>{hotel.distance_to_temple?.distance_km || 1} km from temple</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities?.slice(0, 4).map((amenity, i) => {
                      const Icon = AMENITY_ICONS[amenity] || Wifi;
                      return (
                        <Badge key={i} variant="outline" className="text-xs border-orange-200">
                          <Icon className="w-3 h-3 mr-1" />
                          {amenity}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Price & Book */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold" style={{ color: GOLD }}>
                        ₹{hotel.room_inventory?.[0]?.price_per_night || 1500}
                      </span>
                      <span className="text-sm text-gray-500">/night</span>
                    </div>
                    <Button 
                      className="text-white"
                      style={{ backgroundColor: GOLD }}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}