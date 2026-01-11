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
  Search, MapPin, Star, Hotel, Filter
} from 'lucide-react';

import HotelBookingCard from '@/components/yatra/HotelBookingCard';

const GOLD = '#FF9933';

export default function Yatra() {
  const [hotelSearchCity, setHotelSearchCity] = useState('');

  // Fetch ALL hotels
  const { data: allHotels, isLoading: allHotelsLoading } = useQuery({
    queryKey: ['all-hotels'],
    queryFn: () => base44.entities.Hotel.filter({ 
      is_deleted: false 
    }, '-rating_average', 50)
  });

  // Filter hotels for display
  const filteredHotels = useMemo(() => {
    if (!allHotels) return [];
    if (!hotelSearchCity) return allHotels;
    return allHotels.filter(h => 
      h.city?.toLowerCase().includes(hotelSearchCity.toLowerCase()) ||
      h.name?.toLowerCase().includes(hotelSearchCity.toLowerCase())
    );
  }, [allHotels, hotelSearchCity]);

  // Get unique hotel cities
  const hotelCities = useMemo(() => {
    if (!allHotels) return [];
    return [...new Set(allHotels.map(h => h.city).filter(Boolean))].sort();
  }, [allHotels]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-neutral-900 to-neutral-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1920"
            alt="Temple"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-6 max-w-7xl text-center">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-4">
            <Sparkles className="w-3 h-3 mr-2" />
            Plan Your Sacred Journey
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Yatra <span className="text-amber-400">Planner</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Book temples and hotels together for a seamless pilgrimage experience
          </p>
        </div>
      </section>

      {/* Header */}
      <section className="bg-white border-b sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-6 max-w-7xl py-3">
          <div className="flex items-center gap-2">
            <Hotel className="w-5 h-5" style={{ color: GOLD }} />
            <h2 className="font-semibold text-gray-800">Book Hotels for Your Pilgrimage</h2>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Search */}
            <div className="flex flex-wrap gap-4 items-center mb-8 p-4 bg-white rounded-xl shadow-sm">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search hotels by name or city..."
                      value={hotelSearchCity}
                      onChange={(e) => setHotelSearchCity(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={hotelSearchCity} onValueChange={setHotelSearchCity}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>All Cities</SelectItem>
                      {hotelCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hotels Grid */}
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {hotelSearchCity ? `Hotels in ${hotelSearchCity}` : 'All Hotels'}
                  </h2>
                  <Badge variant="secondary">
                    {filteredHotels.length} hotels found
                  </Badge>
                </div>

                {allHotelsLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
                  </div>
                ) : filteredHotels.length > 0 ? (
                  <div className="space-y-6">
                    {filteredHotels.map((hotel) => (
                      <HotelBookingCard
                        key={hotel.id}
                        hotel={hotel}
                        showBookNow={true}
                      />
                    ))}
                  </div>
            ) : (
              <Card className="p-12 text-center">
                <Hotel className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hotels Found</h3>
                <p className="text-gray-500">Try adjusting your search filters</p>
              </Card>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}