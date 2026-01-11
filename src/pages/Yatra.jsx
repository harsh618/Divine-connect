import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, MapPin, Star, Hotel, Sparkles, Wifi, Car, Utensils, ArrowUpRight, Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920'
];

const CITIES = [
  { value: 'all', label: 'All Cities' },
  { value: 'Ayodhya', label: 'Ayodhya' },
  { value: 'Varanasi', label: 'Varanasi' },
  { value: 'Mathura', label: 'Mathura' },
  { value: 'Haridwar', label: 'Haridwar' },
  { value: 'Rishikesh', label: 'Rishikesh' },
];

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  restaurant: Utensils,
};

function HotelCard({ hotel }) {
  const [imgSrc, setImgSrc] = useState(hotel.thumbnail_url || hotel.images?.[0] || FALLBACK_IMAGE);
  const roomPrice = hotel.room_inventory?.[0]?.price_per_night || 1500;

  return (
    <Link to={`${createPageUrl('HotelDetail')}?id=${hotel.id}`} className="group block h-full">
      <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
        
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img 
            src={imgSrc} 
            alt={hotel.name}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <Badge className="bg-white/90 backdrop-blur text-black border-0 px-2 py-0.5 text-xs font-medium">
              ₹{roomPrice.toLocaleString()}/night
            </Badge>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-0.5 text-xs text-white">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {hotel.rating_average || 4.5}
            </div>
          </div>

          {hotel.is_featured && (
            <Badge className="absolute bottom-2 left-2 bg-amber-400 text-black border-0 px-2 py-0.5 text-xs font-medium flex items-center gap-1">
              <Flame className="w-3 h-3 fill-black" /> Featured
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3">
          <div className="flex items-center gap-1 text-[10px] text-amber-600 uppercase tracking-wide mb-1">
            <MapPin className="w-3 h-3" />
            {hotel.city}, {hotel.state}
          </div>

          <h3 className="font-semibold text-gray-900 text-base mb-2 group-hover:text-amber-700 transition-colors line-clamp-1">
            {hotel.name}
          </h3>

          {/* Amenities */}
          <div className="flex gap-1.5 flex-wrap">
            {hotel.amenities?.slice(0, 3).map((amenity, i) => {
              const IconComponent = amenityIcons[amenity.toLowerCase()] || Hotel;
              return (
                <span key={i} className="text-[10px] text-gray-500 flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                  <IconComponent className="w-3 h-3" />
                  {amenity}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}

function HotelCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export default function Yatra() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  // Rotate Hero Background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch ALL hotels
  const { data: allHotels, isLoading } = useQuery({
    queryKey: ['all-hotels'],
    queryFn: () => base44.entities.Hotel.filter({ 
      is_deleted: false 
    }, '-rating_average', 50)
  });

  // Get unique cities from data
  const dynamicCities = useMemo(() => {
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

  // Featured hotels
  const featuredHotels = useMemo(() => {
    return allHotels?.filter(h => h.is_featured) || [];
  }, [allHotels]);

  // Non-featured for main grid
  const regularHotels = useMemo(() => {
    return filteredHotels.filter(h => !h.is_featured);
  }, [filteredHotels]);

  // Combine cities from static list and dynamic data
  const allCities = useMemo(() => {
    const citySet = new Set(['all', ...dynamicCities]);
    return [{ value: 'all', label: 'All Cities' }, ...dynamicCities.map(c => ({ value: c, label: c }))];
  }, [dynamicCities]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24 font-sans">
      
      {/* 1. Cinematic Hero */}
      <section className="relative h-[60vh] flex items-end justify-center overflow-hidden pb-16">
        <div className="absolute inset-0 z-0 bg-black">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-60' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Sacred Journeys
             </div>
             <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-none drop-shadow-xl">
                Yatra Hotels,<br/>
                <span className="italic text-white/70">Divine Comfort.</span>
             </h1>
          </div>
        </div>
      </section>

      {/* 2. Sticky Filter Bar & Grid */}
      <div className="container mx-auto px-6 max-w-7xl relative z-20 -mt-8">
        
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xl shadow-stone-200/50 mb-12 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                 type="text" 
                 placeholder="Search hotels by name or city..." 
                 className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-0 transition-all text-sm"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           {/* Horizontal City Filter */}
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {allCities.map((city) => (
                 <button
                    key={city.value}
                    onClick={() => setSelectedCity(city.value)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                       selectedCity === city.value
                       ? 'bg-orange-600 text-white shadow-lg'
                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                 >
                    {city.label}
                 </button>
              ))}
           </div>
        </div>

        {/* Featured Hotels Section */}
        {featuredHotels.length > 0 && !searchQuery && selectedCity === 'all' && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-amber-600" />
              <h2 className="text-3xl font-serif text-gray-900">Featured Hotels</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
            <div className="mt-12 mb-8 border-t border-gray-200" />
          </div>
        )}

        {/* 3. All Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <HotelCardSkeleton key={i} />)
          ) : (searchQuery || selectedCity !== 'all' ? filteredHotels : regularHotels)?.length > 0 ? (
            (searchQuery || selectedCity !== 'all' ? filteredHotels : regularHotels).map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Hotel className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No hotels match your search</h3>
              <p className="text-gray-500 font-light">Try adjusting your filters to find more options.</p>
              <Button 
                variant="link" 
                onClick={() => {setSearchQuery(''); setSelectedCity('all');}}
                className="text-amber-600 mt-2"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}