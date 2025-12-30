import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import VirtualTempleWalkModal from '../components/yatra/VirtualTempleWalkModal';
import { DivineCartProvider, useDivineCart } from '../components/yatra/DivineCartContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Building2,
  Hotel,
  Package,
  Train,
  Plane,
  MapPin,
  Calendar,
  Users,
  Star,
  ChevronRight,
  Sparkles,
  Clock,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, addDays } from 'date-fns';

const PILGRIMAGE_CATEGORIES = [
  { name: 'Char Dham', icon: '🏔️', color: 'from-blue-500 to-cyan-500' },
  { name: 'Jyotirlingas', icon: '🕉️', color: 'from-orange-500 to-amber-500' },
  { name: 'Shakti Peeths', icon: '🌺', color: 'from-pink-500 to-rose-500' },
  { name: 'Weekend Getaways', icon: '✨', color: 'from-purple-500 to-indigo-500' }
];

const UPCOMING_FESTIVALS = [
  { date: '2025-01-13', name: 'Makar Sankranti', deity: 'Surya' },
  { date: '2025-02-26', name: 'Maha Shivratri', deity: 'Shiva' },
  { date: '2025-03-14', name: 'Holi', deity: 'Krishna' },
  { date: '2025-04-10', name: 'Ram Navami', deity: 'Ram' }
];

function YatraContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('temples');
  const [selectedTempleFor360, setSelectedTempleFor360] = useState(null);
  const { cartItems, addToCart } = useDivineCart();

  const { data: temples } = useQuery({
    queryKey: ['yatra-temples'],
    queryFn: () => base44.entities.Temple.filter({ 
      is_deleted: false, 
      is_hidden: false,
      is_featured: true 
    }, '-created_date', 8)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      
      {/* Divine Cart Indicator */}
      {cartItems.length > 0 && (
        <div className="fixed top-24 right-8 z-40">
          <Link to={createPageUrl('DivineCart')}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-2xl relative">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Divine Cart ({cartItems.length})
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                {cartItems.length}
              </div>
            </Button>
          </Link>
        </div>
      )}
      
      {/* Cinematic Hero with Omni-Search */}
      <section className="relative h-[80vh] overflow-hidden">
        {/* Video Background Placeholder */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1609920658906-8223bd289001?q=80&w=2070"
            alt="Spiritual Journey"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/40 to-neutral-950" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-8 max-w-7xl h-full flex flex-col items-center justify-center">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Sacred Journeys
            </div>
            <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 leading-tight">
              Your <span className="text-amber-400 italic">Divine</span> Yatra
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto font-light">
              Book temples, hotels, trains, and flights—all in one spiritual journey
            </p>
          </div>

          {/* Omni-Search Widget */}
          <Card className="w-full max-w-5xl bg-white/10 backdrop-blur-xl border-white/20 p-6">
            <Tabs defaultValue="temples" value={searchType} onValueChange={setSearchType}>
              <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10 mb-6">
                <TabsTrigger value="temples" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                  <Building2 className="w-4 h-4 mr-2" />
                  Temples
                </TabsTrigger>
                <TabsTrigger value="hotels" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                  <Hotel className="w-4 h-4 mr-2" />
                  Hotels
                </TabsTrigger>
                <TabsTrigger value="packages" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                  <Package className="w-4 h-4 mr-2" />
                  Packages
                </TabsTrigger>
                <TabsTrigger value="trains" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                  <Train className="w-4 h-4 mr-2" />
                  Trains
                </TabsTrigger>
                <TabsTrigger value="flights" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                  <Plane className="w-4 h-4 mr-2" />
                  Flights
                </TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <Input
                      placeholder={`Search ${searchType}... (e.g., Tirupati, Kashi)`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-12">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PILGRIMAGE_CATEGORIES.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold h-12">
                  Search
                </Button>
              </div>
            </Tabs>
          </Card>
        </div>
      </section>

      {/* Pilgrimage Categories */}
      <section className="py-20 bg-neutral-950">
        <div className="container mx-auto px-8 max-w-7xl">
          <h2 className="text-3xl font-serif text-white mb-12 text-center">Sacred Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PILGRIMAGE_CATEGORIES.map((category) => (
              <Card key={category.name} className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="p-6 text-center relative z-10">
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-serif text-white mb-2">{category.name}</h3>
                  <p className="text-sm text-white/60">Explore Sacred Sites</p>
                  <ChevronRight className="w-5 h-5 mx-auto mt-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-neutral-900">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-serif text-white mb-2">Featured Temples</h2>
              <p className="text-white/60">Most visited sacred destinations</p>
            </div>
            <Link to={createPageUrl('Temples')}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                View All <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {temples?.map((temple) => (
              <Card key={temple.id} className="group overflow-hidden border-white/10 bg-neutral-800 hover:border-amber-500/50 transition-all h-full">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={temple.images?.[0] || temple.thumbnail_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'}
                    alt={temple.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {temple.live_darshan_url && (
                      <Badge className="bg-red-500/80 backdrop-blur-sm text-white border-0">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                        Live
                      </Badge>
                    )}
                  </div>
                  
                  {/* 360° View Button */}
                  <button
                    onClick={() => setSelectedTempleFor360(temple)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <div className="bg-amber-500 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform">
                      <Eye className="w-6 h-6 text-black" />
                    </div>
                    <span className="absolute bottom-4 text-white text-sm font-bold">360° Virtual Walk</span>
                  </button>
                </div>
                <Link to={createPageUrl(`TempleDetail?id=${temple.id}`)}>
                  <div className="p-4">
                    <h3 className="text-lg font-serif text-white mb-2 line-clamp-1">{temple.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                      <MapPin className="w-3 h-3" />
                      {temple.city}, {temple.state}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                        {temple.primary_deity}
                      </Badge>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Faith Calendar Timeline */}
      <section className="py-20 bg-neutral-950">
        <div className="container mx-auto px-8 max-w-7xl">
          <h2 className="text-3xl font-serif text-white mb-12 text-center">Auspicious Dates</h2>
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {UPCOMING_FESTIVALS.map((festival, idx) => (
                <Card key={idx} className="flex-shrink-0 w-72 bg-gradient-to-br from-neutral-900 to-neutral-800 border-white/10 hover:border-amber-500/50 transition-all cursor-pointer p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber-500/10 flex flex-col items-center justify-center border border-amber-500/30">
                      <span className="text-2xl font-bold text-amber-400">
                        {format(new Date(festival.date), 'd')}
                      </span>
                      <span className="text-xs text-amber-400/70 uppercase">
                        {format(new Date(festival.date), 'MMM')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-serif text-white mb-1">{festival.name}</h3>
                      <p className="text-sm text-white/60 mb-3">Dedicated to {festival.deity}</p>
                      <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 p-0 h-auto">
                        View Packages <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Darshan Booking Widget */}
      <section className="py-20 bg-neutral-900">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 mb-4">
              <Clock className="w-3 h-3 mr-2" />
              Real-Time Availability
            </Badge>
            <h2 className="text-3xl font-serif text-white mb-4">Book Your Darshan Slot</h2>
            <p className="text-white/60">Reserve your worship time in advance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {temples?.slice(0, 3).map((temple, idx) => {
              const availability = ['available', 'limited', 'full'][idx % 3];
              const availabilityConfig = {
                available: { color: 'green', text: 'Available', slots: ['6:00 AM', '10:00 AM', '4:00 PM'] },
                limited: { color: 'yellow', text: 'Limited', slots: ['6:00 AM', '4:00 PM'] },
                full: { color: 'red', text: 'Full', slots: [] }
              };
              const config = availabilityConfig[availability];
              
              return (
                <Card key={temple.id} className="bg-neutral-800 border-white/10 p-6 hover:border-amber-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-serif text-white mb-1">{temple.name}</h3>
                      <p className="text-sm text-white/60">{temple.city}</p>
                    </div>
                    <Badge className={`bg-${config.color}-500/20 text-${config.color}-400 border-${config.color}-500/30`}>
                      <div className={`w-2 h-2 bg-${config.color}-400 rounded-full mr-2 ${availability !== 'full' && 'animate-pulse'}`} />
                      {config.text}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {config.slots.length > 0 ? (
                      config.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => addToCart({ 
                            id: `${temple.id}-${slot}`, 
                            temple: temple.name, 
                            slot, 
                            date: format(new Date(), 'MMM d, yyyy') 
                          })}
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span>{slot}</span>
                            <ChevronRight className="w-4 h-4 text-amber-400" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                        <p className="text-sm text-red-400">All slots booked for today</p>
                      </div>
                    )}
                  </div>

                  <Link to={createPageUrl(`TempleDetail?id=${temple.id}`)}>
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold"
                      disabled={availability === 'full'}
                    >
                      {availability === 'full' ? 'Check Other Dates' : 'Book Now'}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Virtual Temple Walk Modal */}
      <VirtualTempleWalkModal
        isOpen={!!selectedTempleFor360}
        onClose={() => setSelectedTempleFor360(null)}
        temple={selectedTempleFor360}
      />
    </div>
  );
}

export default function Yatra() {
  return (
    <DivineCartProvider>
      <YatraContent />
    </DivineCartProvider>
  );
}