import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Video, Sparkles, ArrowUpRight, Flame, Filter, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// --- Assets & Constants ---
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1604608672516-f1e3c1f9f6e6?w=800"; // Beautiful Diya Lamp default
const HERO_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/5be609959_pexels-vijay-krishnawat-2932162-14855916.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/442e5a8b3_pexels-nilkanthdham-30544428.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/af220e4ef_pexels-saikumar-chowdary-pothumarthi-72150037-30623344.jpg'
];

const CATEGORIES = [
  { value: 'all', label: 'All Rituals' },
  { value: 'graha_shanti', label: 'Graha Shanti' },
  { value: 'satyanarayan', label: 'Satyanarayan' },
  { value: 'shiva', label: 'Shiva Pooja' },
  { value: 'havan', label: 'Sacred Havan' },
  { value: 'lakshmi', label: 'Wealth' },
  { value: 'navagraha', label: 'Navagraha' },
];

// --- Components ---

function PoojaCard({ pooja }) {
  const [imgSrc, setImgSrc] = useState(pooja.image_url || FALLBACK_IMAGE);

  return (
    <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)} className="group block h-full">
      <div className="relative h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-100/50 hover:-translate-y-1">
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img 
            src={imgSrc} 
            alt={pooja.name}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
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
          <p className="text-[10px] font-bold tracking-widest text-amber-600 uppercase mb-2">
            {pooja.category?.replace('_', ' ') || 'Vedic Ritual'}
          </p>

          <h3 className="font-serif text-2xl text-gray-900 leading-tight mb-3 group-hover:text-amber-700 transition-colors">
            {pooja.name}
          </h3>

          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6 font-light">
            {pooja.purpose || pooja.description || "Perform this sacred ritual to invoke blessings and peace."}
          </p>

          {/* Bottom Action Area */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
              ))}
              <span className="text-[10px] text-gray-400 pl-3 self-center">{pooja.total_bookings || 42}+ booked</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center group-hover:bg-amber-700 transition-colors duration-300">
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
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function Poojas() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);

  // Rotate Hero Background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: poojas, isLoading } = useQuery({
    queryKey: ['poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }, '-is_popular'),
  });

  const { data: featuredPoojas, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false, is_featured: true }, '-created_date'),
  });

  const filteredPoojas = poojas?.filter(pooja => {
    const matchesSearch = pooja.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pooja.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pooja.category === selectedCategory;
    const matchesVirtual = !showVirtualOnly || pooja.base_price_virtual > 0;
    const notFeatured = !featuredPoojas?.some(fp => fp.id === pooja.id);
    return matchesSearch && matchesCategory && matchesVirtual && notFeatured;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-24 font-sans">
      
      {/* 1. Cinematic Hero (Matches Temple Page) */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF9] via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Vedic Rituals
             </div>
             <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-none drop-shadow-xl">
                Ancient Prayers,<br/>
                <span className="italic text-white/70">Modern Blessings.</span>
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
                 placeholder="Search for 'Ganesh' or 'Peace'..." 
                 className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-0 transition-all text-sm"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           {/* Horizontal Category Scroll */}
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                 <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                       selectedCategory === cat.value
                       ? 'bg-black text-white shadow-lg'
                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                 >
                    {cat.label}
                 </button>
              ))}
           </div>
        </div>

        {/* Featured Poojas Section */}
        {featuredPoojas && featuredPoojas.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-amber-600" />
              <h2 className="text-3xl font-serif text-gray-900">Featured Rituals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPoojas.map((pooja) => (
                <PoojaCard key={pooja.id} pooja={pooja} />
              ))}
            </div>
            <div className="mt-12 mb-8 border-t border-gray-200" />
          </div>
        )}

        {/* 3. All Poojas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <PoojaCardSkeleton key={i} />)
          ) : filteredPoojas?.length > 0 ? (
            filteredPoojas.map((pooja) => (
              <PoojaCard key={pooja.id} pooja={pooja} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Flame className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No rituals match your search</h3>
              <p className="text-gray-500 font-light">We are constantly adding more certified poojas.</p>
              <Button 
                variant="link" 
                onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}
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