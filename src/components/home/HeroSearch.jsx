import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function HeroSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(createPageUrl('Temples') + `?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl transition-all duration-300 hover:bg-white/15">
        <Search className="w-5 h-5 text-white/70 ml-4" />
        <Input
          type="text"
          placeholder="Search temples, poojas, astrologers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-12 border-0 bg-transparent focus-visible:ring-0 text-sm text-white placeholder:text-white/70"
          aria-label="Search for temples, poojas, and astrologers"
        />
        <div className="hidden md:block w-px h-6 bg-white/20"></div>
        <MapPin className="hidden md:block w-4 h-4 text-white/70" />
        <Input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="hidden md:block w-32 h-12 border-0 bg-transparent focus-visible:ring-0 text-sm text-white placeholder:text-white/70"
          aria-label="Enter location"
        />
        <Button 
          type="submit"
          className="h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg"
          aria-label="Search button"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}