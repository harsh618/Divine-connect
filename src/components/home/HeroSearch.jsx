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
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div className="bg-white/98 backdrop-blur-md rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-2 flex flex-col md:flex-row gap-2 border border-white/30 transition-all duration-300">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D97706]" />
          <Input
            type="text"
            placeholder="Search temples, poojas, astrologers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 text-sm text-gray-900 placeholder:text-gray-400"
            aria-label="Search for temples, poojas, and astrologers"
          />
        </div>
        <div className="hidden md:block w-px h-6 bg-gray-300 self-center"></div>
        <div className="relative md:w-48">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#D97706]" />
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-11 h-12 border-0 bg-transparent focus-visible:ring-0 text-sm text-gray-900 placeholder:text-gray-400"
            aria-label="Enter location"
          />
        </div>
        <Button 
          type="submit"
          className="h-12 px-7 bg-gradient-to-br from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] hover:shadow-[0_4px_12px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-white font-semibold text-sm rounded-lg transition-all duration-200"
          aria-label="Search button"
        >
          Search
        </Button>
      </div>
    </form>
  );
}