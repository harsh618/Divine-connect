import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Clock, Video, Package, ArrowRight, Sparkles, Flame, ArrowUpRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const poojaImages = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/5be609959_pexels-vijay-krishnawat-2932162-14855916.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/442e5a8b3_pexels-nilkanthdham-30544428.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/af220e4ef_pexels-saikumar-chowdary-pothumarthi-72150037-30623344.jpg'
];

const categories = [
  { value: 'all', label: 'All Poojas' },
  { value: 'graha_shanti', label: 'Graha Shanti' },
  { value: 'satyanarayan', label: 'Satyanarayan' },
  { value: 'ganesh', label: 'Ganesh Pooja' },
  { value: 'lakshmi', label: 'Lakshmi Pooja' },
  { value: 'durga', label: 'Durga Pooja' },
  { value: 'shiva', label: 'Shiva Pooja' },
  { value: 'havan', label: 'Havan' },
  { value: 'griha_pravesh', label: 'Griha Pravesh' },
  { value: 'navagraha', label: 'Navagraha Shanti' },
  { value: 'rudrabhishek', label: 'Rudrabhishek' },
];

function PoojaCard({ pooja }) {
  const defaultImage = "https://images.unsplash.com/photo-1604608672516-f1e3c1f9f6e6?w=800";

  return (
    <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)} className="block h-full">
      <div className="group relative h-full bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 isolate">
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={pooja.image_url || defaultImage} 
            alt={pooja.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/90 backdrop-blur text-black border-0 px-3 py-1 text-xs font-medium shadow-sm hover:bg-white">
              ₹{pooja.base_price_virtual || pooja.base_price_temple || pooja.base_price_in_person || 1100}
            </Badge>
            {pooja.is_popular && (
              <Badge className="bg-amber-400 text-black border-0 px-3 py-1 text-xs font-medium shadow-sm flex items-center gap-1">
                <Flame className="w-3 h-3 fill-black" /> Popular
              </Badge>
            )}
          </div>

          {/* Duration Badge */}
          {pooja.duration_minutes && (
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 text-xs text-white border border-white/10">
              <Clock className="w-3 h-3" />
              {pooja.duration_minutes}m
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 relative">
          {/* Decorative Category Label */}
          <p className="text-[10px] font-bold tracking-widest text-amber-600 uppercase mb-2">
            {pooja.category?.replace('_', ' ') || 'Vedic Ritual'}
          </p>

          <h3 className="font-serif text-2xl text-gray-900 leading-tight mb-3 group-hover:text-amber-700 transition-colors">
            {pooja.name}
          </h3>

          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6 font-light">
            {pooja.purpose || pooja.description}
          </p>

          {/* Bottom Action Area */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <div className="flex -space-x-2">
              {/* Social Proof Avatars */}
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
              ))}
              <span className="text-[10px] text-gray-400 pl-3 self-center">{pooja.total_bookings || 42}+ booked</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
              <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PoojaCardSkeleton() {
  return (
    <div className="rounded-[2rem] overflow-hidden bg-white border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-4 flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Poojas() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % poojaImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: poojas, isLoading } = useQuery({
    queryKey: ['poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }, '-is_popular'),
  });

  const filteredPoojas = poojas?.filter(pooja => {
    const matchesSearch = pooja.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pooja.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pooja.category === selectedCategory;
    const matchesVirtual = !showVirtualOnly || pooja.base_price_virtual > 0;
    return matchesSearch && matchesCategory && matchesVirtual;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24">
      
      {/* Cinematic Hero Section */}
      <section className="relative h-[80vh] flex items-end justify-center overflow-hidden pb-20">
        <div className="absolute inset-0 z-0">
          {poojaImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Divine Services
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
            Ancient Rituals for <br/> <span className="italic text-amber-200">Modern Lives</span>
          </h1>
          
          <p className="text-lg text-white/70 font-light max-w-xl mx-auto mb-8">
            Perform authentic vedic poojas with certified priests, from the comfort of your home or at sacred temples.
          </p>

          {/* Integrated Search in Hero */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              placeholder="Search for 'Ganesh Pooja' or 'Havan'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-10 relative z-20">
        
        {/* Spotify-Style Pill Filters */}
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
            <Button
              onClick={() => setShowVirtualOnly(!showVirtualOnly)}
              variant="outline"
              className={`rounded-full h-10 px-4 whitespace-nowrap border-dashed flex-shrink-0 ${showVirtualOnly ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-gray-300 text-gray-500 bg-white'}`}
            >
              <Video className="w-4 h-4 mr-2" />
              Virtual Only
            </Button>
            <div className="w-px h-8 bg-gray-200 mx-2 flex-shrink-0" />
            
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`h-10 px-6 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat.value
                    ? 'bg-black text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <PoojaCardSkeleton key={i} />)
          ) : filteredPoojas?.length > 0 ? (
            filteredPoojas.map((pooja) => (
              <PoojaCard key={pooja.id} pooja={pooja} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No rituals found</h3>
              <p className="text-gray-500 font-light">Try adjusting your filters to find what you seek.</p>
              <Button 
                variant="link" 
                onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}
                className="text-amber-600 mt-2"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}