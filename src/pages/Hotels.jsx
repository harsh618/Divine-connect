import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Star, Hotel, Wifi, Utensils, Car, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const AMENITY_ICONS = {
  'WiFi': Wifi,
  'Restaurant': Utensils,
  'Parking': Car,
};

export default function Hotels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => base44.entities.Hotel.filter({ is_deleted: false, is_hidden: false }, '-rating_average'),
    initialData: []
  });

  const cities = ['All', ...new Set(hotels?.map(h => h.city) || [])];

  const filteredHotels = hotels?.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'All' || hotel.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24">
      
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"
            alt="Hotels"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#FAFAF9]" />
        </div>

        <div className="relative z-10 container mx-auto px-8 max-w-7xl h-full flex flex-col items-center justify-center">
          <h1 className="text-6xl md:text-7xl font-serif text-white mb-6 text-center">
            Sacred <span className="text-amber-400">Stays</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 text-center">Comfortable accommodations near holy sites</p>

          <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full flex items-center">
            <Search className="w-5 h-5 text-white/70 ml-4" />
            <Input
              placeholder="Search hotels or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-white placeholder:text-white/60 focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[#FAFAF9]/95 backdrop-blur-md border-b border-gray-200/50 py-4">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-600">Filter by:</span>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="container mx-auto px-8 max-w-7xl py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif text-gray-900">Available Hotels</h2>
          <span className="text-sm text-gray-500">{filteredHotels?.length || 0} properties</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filteredHotels?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHotels.map(hotel => (
              <Link key={hotel.id} to={createPageUrl(`HotelDetail?id=${hotel.id}`)}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all cursor-pointer">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={hotel.images?.[0] || hotel.thumbnail_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {hotel.is_featured && (
                      <Badge className="absolute top-3 right-3 bg-amber-500 text-white">Featured</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-serif text-gray-900 mb-2">{hotel.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      {hotel.city}, {hotel.state}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {Array(hotel.star_rating || 3).fill(0).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {hotel.rating_average > 0 && (
                        <span className="text-sm text-gray-600">({hotel.rating_average.toFixed(1)})</span>
                      )}
                    </div>
                    {hotel.room_types?.[0] && (
                      <div className="text-amber-600 font-semibold">
                        ₹{hotel.room_types[0].price_per_night}/night
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Hotel className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-serif text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}