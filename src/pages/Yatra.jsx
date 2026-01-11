import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, Star, Hotel, Sparkles, Filter, Wifi, Car, Utensils, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#FF9933';

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  restaurant: Utensils,
};

export default function Yatra() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  // Fetch ALL hotels
  const { data: allHotels, isLoading } = useQuery({
    queryKey: ['all-hotels'],
    queryFn: () => base44.entities.Hotel.filter({ 
      is_deleted: false 
    }, '-rating_average', 50)
  });

  // Get unique cities
  const cities = useMemo(() => {
    if (!allHotels) return [];
    return [...new Set(allHotels.map(h => h.city).filter(Boolean))].sort();
  }, [allHotels]);

  // Filter hotels
  const filteredHotels = useMemo(() => {
    if (!allHotels) return [];
    return allHotels.filter(hotel => {
      const matchesSearch = !searchQuery || 
        hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.city?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'all' || hotel.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [allHotels, searchQuery, selectedCity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-neutral-900 to-neutral-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920"
            alt="Hotels"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-6 max-w-7xl text-center">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-4">
            <Sparkles className="w-3 h-3 mr-2" />
            Plan Your Sacred Journey
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Yatra <span className="text-amber-400">Hotels</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Find comfortable stays near sacred temples for your pilgrimage
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6 bg-white border-b sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search hotels by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[180px] h-12">
                <Filter className="w-4 h-4 mr-2 text-orange-500" />
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="h-12 px-4 flex items-center">
              {filteredHotels.length} hotels
            </Badge>
          </div>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="py-8">
        <div className="container mx-auto px-6 max-w-7xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : filteredHotels.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel, idx) => {
                const roomPrice = hotel.room_inventory?.[0]?.price_per_night || 1500;
                return (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link to={`${createPageUrl('HotelDetail')}?id=${hotel.id}`}>
                      <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group h-full">
                        <div className="relative h-48">
                          <img
                            src={hotel.thumbnail_url || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {hotel.is_featured && (
                            <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                              Featured
                            </Badge>
                          )}
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{hotel.rating_average || 4.5}</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-600 transition-colors">
                            {hotel.name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                            <MapPin className="w-3 h-3" />
                            {hotel.city}, {hotel.state}
                          </p>
                          
                          {/* Amenities */}
                          <div className="flex gap-2 mb-4 flex-wrap">
                            {hotel.amenities?.slice(0, 3).map((amenity, i) => {
                              const IconComponent = amenityIcons[amenity.toLowerCase()] || Hotel;
                              return (
                                <span key={i} className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                  <IconComponent className="w-3 h-3" />
                                  {amenity}
                                </span>
                              );
                            })}
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div>
                              <span className="text-2xl font-bold" style={{ color: GOLD }}>
                                ₹{roomPrice.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500">/night</span>
                            </div>
                            <Button 
                              size="sm" 
                              className="text-white"
                              style={{ backgroundColor: GOLD }}
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Hotel className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hotels Found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}