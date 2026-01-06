import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Loader2, MapPin, Flame, Users, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const heroImages = [
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/8cd80df37_pexels-thash-11656202.jpg',
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/e5cfb95bd_pexels-imauritian-5729118.jpg',
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/97260da21_pexels-anirudh-kashyap-1066393-4511745.jpg',
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/9c83da7a3_pexels-som-108593-3098608.jpg'];


export default function MinimalHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  const placeholders = [
    'I want to visit Kashi Vishwanath...',
    'Book a Puja for peace...',
    'Find an astrologer...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const text = placeholders[currentImageIndex % placeholders.length];
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index));
        index++;
      }
    }, 50);
    return () => clearInterval(timer);
  }, [currentImageIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await base44.functions.invoke('unifiedSearch', { 
          query: searchQuery 
        });
        setSearchResults(response.data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleResultClick = (result) => {
    navigate(createPageUrl(result.page) + `?${result.params}`);
    setSearchQuery('');
    setShowResults(false);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'temple': return MapPin;
      case 'pooja': return Flame;
      case 'priest':
      case 'astrologer': return Users;
      case 'campaign': return Heart;
      default: return Sparkles;
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) =>
        <img
          key={image}
          src={image}
          alt={`Temple ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 scale-105 ${
          index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`
          } />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-neutral-950" />
      </div>

      {/* Aurora Gradient Blob */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-medium text-white mb-6 tracking-tight leading-[0.95] mix-blend-overlay">
          Find Your Inner<br />Sanctum
        </h1>
        
        <p className="text-lg md:text-xl text-white/70 mb-16 font-light tracking-wide max-w-2xl mx-auto">
          Step into a portal of ancient wisdom and modern spirituality
        </p>

        {/* Floating Omnibox */}
        <div className="relative max-w-2xl mx-auto" ref={searchRef}>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-[0_0_60px_-15px_rgba(217,119,6,0.3)] animate-[breathing_4s_ease-in-out_infinite]">
            <div className="flex items-center gap-4 px-6 py-4">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={typedText}
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/50 focus:outline-none text-base"
              />
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <Button 
                  onClick={() => searchResults.length > 0 && handleResultClick(searchResults[0])}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold px-6 py-2 text-sm"
                >
                  Search
                </Button>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-4 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
              {searchResults.map((result) => {
                const Icon = getResultIcon(result.type);
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-4 p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                  >
                    {result.image ? (
                      <img 
                        src={result.image} 
                        alt={result.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{result.title}</p>
                      <p className="text-sm text-gray-600">{result.subtitle}</p>
                    </div>
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute top-full mt-4 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-6 text-center">
              <p className="text-gray-600">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 mt-2">Try searching for temples, poojas, priests, or campaigns</p>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>);

}