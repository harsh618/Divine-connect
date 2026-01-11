import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, Calendar as CalendarIcon, Star, Navigation, 
  Building2, Hotel, User, Check, X, ChevronRight, Sparkles,
  Filter, SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays } from 'date-fns';
import HotelBookingCard from '@/components/yatra/HotelBookingCard';

const GOLD = '#FF9933';

export default function Yatra() {
  const [activeTab, setActiveTab] = useState('planner');
  const [tripState, setTripState] = useState({
    city: '',
    dates: { start: null, end: null },
    hotel_booking: null,
    guide_booking: null,
  });
  
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [addGuide, setAddGuide] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [hotelSearchCity, setHotelSearchCity] = useState('');

  // Fetch temples
  const { data: temples, isLoading: templesLoading } = useQuery({
    queryKey: ['yatra-temples'],
    queryFn: () => base44.entities.Temple.filter({ 
      is_deleted: false, 
      is_hidden: false 
    }, '-created_date', 20)
  });

  // Fetch ALL hotels (for the hotels tab)
  const { data: allHotels, isLoading: allHotelsLoading } = useQuery({
    queryKey: ['all-hotels'],
    queryFn: () => base44.entities.Hotel.filter({ 
      is_active: true, 
      is_deleted: false 
    }, '-rating_average', 50)
  });

  // Fetch hotels based on selected city (for planner)
  const { data: cityHotels, isLoading: cityHotelsLoading } = useQuery({
    queryKey: ['city-hotels', tripState.city],
    queryFn: () => base44.entities.Hotel.filter({ 
      city: tripState.city,
      is_active: true, 
      is_deleted: false 
    }),
    enabled: !!tripState.city
  });

  // Fetch guides (priests with GUIDE skill)
  const { data: guides } = useQuery({
    queryKey: ['guides', tripState.city],
    queryFn: () => base44.entities.PriestProfile.filter({ 
      city: tripState.city,
      is_deleted: false,
      is_verified: true
    }),
    enabled: addGuide && !!tripState.city,
    select: (data) => data?.filter(p => p.skills?.includes('GUIDE') || p.skills?.includes('Guide'))
  });

  // Get unique cities
  const cities = useMemo(() => {
    if (!temples) return [];
    const uniqueCities = [...new Set(temples.map(t => t.city).filter(Boolean))];
    return uniqueCities.sort();
  }, [temples]);

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

  const tripDays = tripState.dates.start && tripState.dates.end 
    ? differenceInDays(tripState.dates.end, tripState.dates.start) + 1 
    : 0;

  const calculateTotal = () => {
    let total = 0;
    if (tripState.hotel_booking) {
      const nights = Math.max(tripDays - 1, 1);
      total += (tripState.hotel_booking.price_per_night || 0) * nights;
    }
    if (addGuide && selectedGuide) {
      total += 2000 * tripDays;
    }
    return total;
  };

  const handleSelectCity = (city) => {
    setTripState(prev => ({ ...prev, city, hotel_booking: null }));
    setSelectedTemple(temples?.find(t => t.city === city) || null);
  };

  const handleSelectHotel = (hotel, roomType) => {
    setTripState(prev => ({
      ...prev,
      hotel_booking: {
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        room_type: roomType.room_type,
        price_per_night: roomType.price_per_night,
      }
    }));
  };

  const handleSelectGuide = (guide) => {
    setSelectedGuide(guide);
    setTripState(prev => ({
      ...prev,
      guide_booking: {
        guide_id: guide.id,
        guide_name: guide.display_name,
        rate_per_day: 2000
      }
    }));
  };

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

      {/* Tabs */}
      <section className="bg-white border-b sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-6 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 my-2">
              <TabsTrigger value="planner" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Trip Planner
              </TabsTrigger>
              <TabsTrigger value="hotels" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Hotel className="w-4 h-4 mr-2" />
                Book Hotels
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <AnimatePresence mode="wait">
            {/* PLANNER TAB */}
            {activeTab === 'planner' && (
              <motion.div
                key="planner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Search & Filters */}
                <div className="flex flex-wrap gap-4 items-center mb-8 p-4 bg-white rounded-xl shadow-sm">
                  <Select value={tripState.city} onValueChange={handleSelectCity}>
                    <SelectTrigger className="w-[200px]">
                      <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[240px] justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                        {tripState.dates.start ? (
                          tripState.dates.end ? (
                            `${format(tripState.dates.start, 'MMM d')} - ${format(tripState.dates.end, 'MMM d')}`
                          ) : format(tripState.dates.start, 'MMM d, yyyy')
                        ) : 'Select Dates'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{ from: tripState.dates.start, to: tripState.dates.end }}
                        onSelect={(range) => setTripState(prev => ({
                          ...prev,
                          dates: { start: range?.from, end: range?.to }
                        }))}
                        numberOfMonths={2}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>

                  {tripDays > 0 && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {tripDays} {tripDays === 1 ? 'Day' : 'Days'}
                    </Badge>
                  )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Temples Section */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-6 h-6" style={{ color: GOLD }} />
                        Temples {tripState.city && `in ${tripState.city}`}
                      </h2>
                      
                      {templesLoading ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {(tripState.city 
                            ? temples?.filter(t => t.city === tripState.city)
                            : temples?.slice(0, 8)
                          )?.map((temple) => (
                            <motion.div
                              key={temple.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ y: -4 }}
                            >
                              <Card className={`overflow-hidden cursor-pointer transition-all ${
                                selectedTemple?.id === temple.id 
                                  ? 'ring-2 ring-orange-500 shadow-lg' 
                                  : 'hover:shadow-md'
                              }`}
                              onClick={() => {
                                setSelectedTemple(temple);
                                if (!tripState.city) handleSelectCity(temple.city);
                              }}>
                                <div className="relative h-32">
                                  <img
                                    src={temple.thumbnail_url || temple.images?.[0] || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400'}
                                    alt={temple.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {selectedTemple?.id === temple.id && (
                                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                                      <Check className="w-5 h-5 text-white" />
                                    </div>
                                  )}
                                </div>
                                <CardContent className="p-4">
                                  <h3 className="font-semibold text-gray-800 mb-1">{temple.name}</h3>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {temple.city}, {temple.state}
                                  </p>
                                  <Badge className="mt-2 text-xs" style={{ backgroundColor: `${GOLD}20`, color: GOLD }}>
                                    {temple.primary_deity}
                                  </Badge>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hotels Section (City-based) */}
                    {tripState.city && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Hotel className="w-6 h-6" style={{ color: GOLD }} />
                          Hotels in {tripState.city}
                        </h2>

                        {cityHotelsLoading ? (
                          <div className="space-y-4">
                            {[1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
                          </div>
                        ) : cityHotels?.length > 0 ? (
                          <div className="space-y-4">
                            {cityHotels.map((hotel) => (
                              <HotelBookingCard
                                key={hotel.id}
                                hotel={hotel}
                                onSelect={handleSelectHotel}
                                isSelected={tripState.hotel_booking?.hotel_id === hotel.id}
                              />
                            ))}
                          </div>
                        ) : (
                          <Card className="p-8 text-center">
                            <Hotel className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No hotels found in {tripState.city}</p>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Guides Section */}
                    <AnimatePresence>
                      {addGuide && tripState.city && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-6 h-6" style={{ color: GOLD }} />
                            Spiritual Guides
                          </h2>
                          
                          {guides?.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                              {guides.map((guide) => (
                                <Card 
                                  key={guide.id}
                                  className={`p-4 cursor-pointer transition-all ${
                                    selectedGuide?.id === guide.id 
                                      ? 'ring-2 ring-orange-500' 
                                      : 'hover:shadow-md'
                                  }`}
                                  onClick={() => handleSelectGuide(guide)}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                                      <User className="w-8 h-8" style={{ color: GOLD }} />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800">{guide.display_name}</h4>
                                      <p className="text-sm text-gray-500">{guide.years_of_experience || 5}+ years exp</p>
                                      <div className="flex items-center gap-1 text-sm">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        {guide.rating_average || 4.5}
                                      </div>
                                    </div>
                                    {selectedGuide?.id === guide.id && (
                                      <Check className="w-6 h-6 text-green-500" />
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <Card className="p-6 text-center">
                              <p className="text-gray-500">No guides available in {tripState.city}</p>
                            </Card>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right Column - Trip Summary */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-40">
                      <Card className="overflow-hidden border-2 border-orange-200">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
                          <h3 className="text-xl font-bold text-white">Trip Summary</h3>
                        </div>
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-gray-600">Destination</span>
                            <span className="font-semibold text-gray-800">
                              {tripState.city || 'Not selected'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-gray-600">Dates</span>
                            <span className="font-semibold text-gray-800">
                              {tripState.dates.start 
                                ? `${format(tripState.dates.start, 'MMM d')}${tripState.dates.end ? ` - ${format(tripState.dates.end, 'MMM d')}` : ''}`
                                : 'Not selected'}
                            </span>
                          </div>

                          {selectedTemple && (
                            <div className="py-2 border-b">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-600">Temple</span>
                                <button onClick={() => setSelectedTemple(null)}>
                                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                              <p className="font-semibold text-gray-800">{selectedTemple.name}</p>
                            </div>
                          )}

                          {tripState.hotel_booking && (
                            <div className="py-2 border-b">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-600">Hotel</span>
                                <button onClick={() => setTripState(prev => ({ ...prev, hotel_booking: null }))}>
                                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                              <p className="font-semibold text-gray-800">{tripState.hotel_booking.hotel_name}</p>
                              <p className="text-sm text-gray-500">
                                {tripState.hotel_booking.room_type} • ₹{tripState.hotel_booking.price_per_night}/night
                              </p>
                              {tripDays > 1 && (
                                <p className="text-sm text-orange-600 mt-1">
                                  {tripDays - 1} nights × ₹{tripState.hotel_booking.price_per_night} = ₹{(tripDays - 1) * tripState.hotel_booking.price_per_night}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="py-2 border-b">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Add Spiritual Guide</span>
                              <Switch
                                checked={addGuide}
                                onCheckedChange={(checked) => {
                                  setAddGuide(checked);
                                  if (!checked) {
                                    setSelectedGuide(null);
                                    setTripState(prev => ({ ...prev, guide_booking: null }));
                                  }
                                }}
                              />
                            </div>
                            {addGuide && selectedGuide && (
                              <div className="mt-2 p-3 bg-orange-50 rounded-lg">
                                <p className="font-semibold text-gray-800">{selectedGuide.display_name}</p>
                                <p className="text-sm text-orange-600">
                                  {tripDays} days × ₹2,000 = ₹{tripDays * 2000}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t-2 border-orange-200">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-800">Total</span>
                              <span className="text-2xl font-bold" style={{ color: GOLD }}>
                                ₹{calculateTotal().toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <Button 
                            className="w-full h-12 text-white font-bold text-lg"
                            style={{ backgroundColor: GOLD }}
                            disabled={!tripState.city || !tripState.dates.start}
                          >
                            Confirm Booking
                            <ChevronRight className="w-5 h-5 ml-2" />
                          </Button>

                          {(!tripState.city || !tripState.dates.start) && (
                            <p className="text-xs text-center text-gray-500">
                              Please select a city and dates to proceed
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* HOTELS TAB */}
            {activeTab === 'hotels' && (
              <motion.div
                key="hotels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
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
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}