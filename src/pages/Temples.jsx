import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SEO from '../components/SEO';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Video, Sparkles, Compass, X } from 'lucide-react';
import TempleCard from '../components/temple/TempleCard';
import TempleCardSkeleton from '../components/temple/TempleCardSkeleton';

const TEMPLE_HERO_IMAGES = [
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/b2c47aca5_pexels-koushalya-karthikeyan-605468635-18362045.jpg',
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/44b522447_WhatsAppImage2025-12-08at131011_839c7371.jpg',
  'https://images.unsplash.com/photo-1598890777032-bde835ba27c0?q=80&w=2070&auto=format&fit=crop'
];

const DEITIES = ['All', 'Shiva', 'Vishnu', 'Ganesha', 'Hanuman', 'Durga', 'Krishna', 'Ram', 'Lakshmi'];
const STATES = ['All', 'Tamil Nadu', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Rajasthan', 'Gujarat', 'Kerala'];

export default function Temples() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [showLiveOnly, setShowLiveOnly] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % TEMPLE_HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const { data: temples, isLoading } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_hidden: false }, '-created_date'),
  });

  const filteredTemples = temples?.filter(temple => {
    const matchesSearch = temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         temple.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDeity = selectedDeity === 'All' || temple.primary_deity === selectedDeity;
    const matchesState = selectedState === 'All' || temple.state === selectedState;
    const matchesLive = !showLiveOnly || temple.live_darshan_url;
    return matchesSearch && matchesDeity && matchesState && matchesLive;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDeity('All');
    setSelectedState('All');
    setShowLiveOnly(false);
  };

  const activeFilterCount = (selectedDeity !== 'All' ? 1 : 0) + (selectedState !== 'All' ? 1 : 0) + (showLiveOnly ? 1 : 0);

  return (
    <>
      <SEO 
        title="Sacred Temples | MandirSutra"
        description="Explore 100+ revered Hindu temples across India. Find temples by deity, state, and location. Book darshan, watch live streams, and plan your spiritual visit."
        image={TEMPLE_HERO_IMAGES[0]}
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24 font-sans">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 bg-black">
          {TEMPLE_HERO_IMAGES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-60' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#FAFAF9]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl w-full mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Sacred Destinations
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 md:mb-8 leading-tight drop-shadow-2xl px-4">
            Find Your <span className="text-amber-200 italic">Sanctuary</span>
          </h1>
          
          {/* Integrated Search Bar (Glassmorphism) */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-1.5 md:p-2 rounded-full flex items-center shadow-2xl px-4">
            <div className="pl-2 md:pl-4">
               <Search className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
            </div>
            <input
              type="text"
              placeholder="Search 'Kashi Vishwanath'..."
              className="w-full bg-transparent border-none text-white placeholder-white/60 focus:ring-0 px-3 md:px-4 h-10 md:h-12 text-base md:text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="p-2 text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
               </button>
            )}
          </div>
          
          <div className="mt-4 flex justify-center gap-6 text-white/60 text-sm font-light">
             <span className="flex items-center gap-1"><Compass className="w-3 h-3" /> 100+ Temples</span>
             <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Live Darshan</span>
          </div>
        </div>
      </section>

      {/* 2. Sticky Filter Bar (Airbnb Style) */}
      <div className="sticky top-16 z-30 bg-[#FAFAF9]/95 backdrop-blur-md border-b border-gray-200/50 py-3 md:py-4 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
           <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
              
              {/* Deity Horizontal Scroll (Primary Filter) */}
              <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1.5 md:gap-2">
                   <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 md:mr-2">Deity:</span>
                   {DEITIES.map(deity => (
                      <button
                         key={deity}
                         onClick={() => setSelectedDeity(deity)}
                         className={`whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                            selectedDeity === deity
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                         }`}
                      >
                         {deity}
                      </button>
                   ))}
                </div>
              </div>

              {/* Utility Filters (State & Live) */}
              <div className="flex items-center gap-3 w-full md:w-auto border-l border-gray-200 pl-0 md:pl-6">
                 <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="w-[180px] rounded-full border-gray-200 bg-white h-10">
                       <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <SelectValue placeholder="State" />
                       </div>
                    </SelectTrigger>
                    <SelectContent>
                       {STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>

                 <Button
                    variant={showLiveOnly ? "default" : "outline"}
                    onClick={() => setShowLiveOnly(!showLiveOnly)}
                    className={`rounded-full h-10 border-gray-200 px-4 ${showLiveOnly ? 'bg-red-500 hover:bg-red-600 border-red-500 text-white' : 'bg-white text-gray-600'}`}
                 >
                    <Video className={`w-3 h-3 mr-2 ${showLiveOnly && 'animate-pulse'}`} />
                    Live Only
                 </Button>
              </div>
           </div>
        </div>
      </div>

      {/* 3. Results Section */}
      <div className="container mx-auto px-6 max-w-7xl py-12">
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-serif text-gray-900">
              {activeFilterCount > 0 ? 'Filtered Results' : 'Sacred Sites'}
           </h2>
           {!isLoading && (
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100">
                 {filteredTemples?.length || 0} temples found
              </span>
           )}
        </div>

        {/* Temple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <TempleCardSkeleton key={i} />)
          ) : filteredTemples?.length > 0 ? (
            filteredTemples.map((temple) => (
              <div key={temple.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                 <TempleCard temple={temple} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                <Compass className="w-10 h-10 text-stone-300" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No sacred sites found</h3>
              <p className="text-gray-500 mb-6 font-light">
                 We couldn't find any temples matching your specific criteria.
              </p>
              <Button onClick={clearFilters} variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}