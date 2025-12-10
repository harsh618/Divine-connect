import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Video, X } from 'lucide-react';
import TempleCard from '../components/temple/TempleCard';
import TempleCardSkeleton from '../components/temple/TempleCardSkeleton';
import PageHero from '../components/shared/PageHero';

const deities = ['All', 'Shiva', 'Vishnu', 'Ganesha', 'Hanuman', 'Durga', 'Krishna', 'Ram', 'Lakshmi'];
const states = ['All', 'Tamil Nadu', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Rajasthan', 'Gujarat', 'Kerala'];

export default function Temples() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [showLiveOnly, setShowLiveOnly] = useState(false);

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

  const hasFilters = searchQuery || selectedDeity !== 'All' || selectedState !== 'All' || showLiveOnly;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      <PageHero page="temples" />

      <div className="container mx-auto px-6 py-16">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by temple name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-gray-200"
              />
            </div>
            
            <Select value={selectedDeity} onValueChange={setSelectedDeity}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Deity" />
              </SelectTrigger>
              <SelectContent>
                {deities.map(deity => (
                  <SelectItem key={deity} value={deity}>{deity}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showLiveOnly ? "default" : "outline"}
              onClick={() => setShowLiveOnly(!showLiveOnly)}
              className={`h-12 ${showLiveOnly ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              <Video className="w-4 h-4 mr-2" />
              Live Darshan
            </Button>
          </div>

          {hasFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedDeity !== 'All' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedDeity}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDeity('All')} />
                </Badge>
              )}
              {selectedState !== 'All' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedState}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedState('All')} />
                </Badge>
              )}
              {showLiveOnly && (
                <Badge variant="secondary" className="gap-1 bg-red-100 text-red-700">
                  Live Only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setShowLiveOnly(false)} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!isLoading && (
          <p className="text-gray-500 mb-6">
            {filteredTemples?.length || 0} temples found
          </p>
        )}

        {/* Temple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <TempleCardSkeleton key={i} />)
          ) : filteredTemples?.length > 0 ? (
            filteredTemples.map((temple) => (
              <TempleCard key={temple.id} temple={temple} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No temples found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}