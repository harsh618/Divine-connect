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
      <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search temples, poojas, astrologers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 border-0 focus-visible:ring-0 text-base"
            aria-label="Search for temples, poojas, and astrologers"
          />
        </div>
        <div className="relative md:w-48">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-12 h-14 border-0 focus-visible:ring-0 text-base"
            aria-label="Enter location"
          />
        </div>
        <Button 
          type="submit"
          className="h-14 px-8 bg-orange-500 hover:bg-orange-600 hover:scale-105 text-white font-semibold rounded-xl transition-all focus:ring-4 focus:ring-orange-500/50"
          aria-label="Search button"
        >
          Search
        </Button>
      </div>
    </form>
  );
}