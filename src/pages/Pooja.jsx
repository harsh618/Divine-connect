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
import SEO from '../components/SEO';

// --- Assets & Constants ---
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1604608672516-f1e3c1f9f6e6?w=800";
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
      <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img 
            src={imgSrc} 
            alt={pooja.name}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <Badge className="bg-white/90 backdrop-blur text-black border-0 px-2.5 py-1 text-xs font-medium">
              ₹{pooja.base_price_virtual || pooja.base_price_temple || pooja.base_price_in_person || 1100}
            </Badge>
            {pooja.duration_minutes && (
              <div className="bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 text-xs text-white">
                <Clock className="w-3 h-3" />
                {pooja.duration_minutes}m
              </div>
            )}
          </div>

          {pooja.is_popular && (
            <Badge className="absolute bottom-3 left-3 bg-amber-400 text-black border-0 px-2.5 py-1 text-xs flex items-center gap-1">
              <Flame className="w-3 h-3 fill-black" /> Popular
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
            {pooja.category?.replace('_', ' ') || 'Vedic Ritual'}
          </p>

          <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-amber-700 transition-colors line-clamp-1">
            {pooja.name}
          </h3>

          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {pooja.purpose || pooja.description || "Perform this sacred ritual to invoke blessings and peace."}
          </p>

          {/* Bottom Stats */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{pooja.total_bookings || 42}+ booked</span>
            <ArrowUpRight className="w-5 h-5 text-amber-600 group-hover:rotate-45 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function PoojaCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function Pooja() {
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
    <>
      <SEO 
        title="Book Vedic Poojas & Rituals | MandirSutra"
        description="Book authentic Vedic poojas and rituals with verified priests. Virtual, in-person, and temple-based services. Graha Shanti, Satyanarayan, Ganesh, and more."
      />
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
                       ? 'bg-orange-600 text-white shadow-lg'
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
    </>
  );
}