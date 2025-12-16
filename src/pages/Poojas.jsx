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
  SelectValue } from
"@/components/ui/select";
import { Search, Clock, Video, Package, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const poojaImages = [
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/5be609959_pexels-vijay-krishnawat-2932162-14855916.jpg',
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/442e5a8b3_pexels-nilkanthdham-30544428.jpg',
'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6939ab07ccfe16dc9f48421b/af220e4ef_pexels-saikumar-chowdary-pothumarthi-72150037-30623344.jpg'];


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
{ value: 'rudrabhishek', label: 'Rudrabhishek' }];


function PoojaCard({ pooja }) {
  const defaultImage = "https://images.unsplash.com/photo-1604608672516-f1e3c1f9f6e6?w=800";

  return (
    <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <img
            src={pooja.image_url || defaultImage}
            alt={pooja.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {pooja.is_popular &&
          <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0">
              Popular
            </Badge>
          }
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-semibold text-lg text-white mb-1">
              {pooja.name}
            </h3>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {pooja.purpose || pooja.description}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Starting from</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{pooja.base_price_virtual || pooja.base_price_temple || pooja.base_price_in_person}
              </p>
            </div>
            {pooja.duration_minutes &&
            <div className="text-right">
                <p className="text-xs text-gray-500 flex items-center justify-end">
                  <Clock className="w-3 h-3 mr-1" />
                  {pooja.duration_minutes} mins
                </p>
              </div>
            }
          </div>

          <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
            Book Now
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          {pooja.required_items?.length > 0 &&
          <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 flex items-start">
                <Package className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{pooja.required_items.slice(0, 3).join(', ')}</span>
              </p>
            </div>
          }
        </div>
      </Card>
    </Link>);

}

function PoojaCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </Card>);

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
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }, '-is_popular')
  });

  const filteredPoojas = poojas?.filter((pooja) => {
    const matchesSearch = pooja.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pooja.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pooja.category === selectedCategory;
    const matchesVirtual = !showVirtualOnly || pooja.base_price_virtual > 0;
    return matchesSearch && matchesCategory && matchesVirtual;
  });

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      {/* Hero Section with Rotating Images */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images with Transition */}
        <div className="absolute inset-0 z-0">
          {poojaImages.map((image, index) =>
          <img
            key={image}
            src={image}
            alt={`Pooja ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`
            } />

          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="pr-6 pb-64 pl-6 text-center relative z-10 max-w-4xl">
          <div className="bg-white/10 text-orange-200 mb-8 px-4 py-2 text-sm opacity-0 rounded-full inline-flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            Sacred Rituals
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight" style={{
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 107, 53, 0.3)'
          }}>
            Book Sacred Poojas
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
            Connect with experienced priests for authentic Hindu rituals
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 animate-bounce">
          <span className="text-xs">Explore</span>
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search poojas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12" />

            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) =>
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Button
              variant={showVirtualOnly ? "default" : "outline"}
              onClick={() => setShowVirtualOnly(!showVirtualOnly)}
              className={`h-12 ${showVirtualOnly ? 'bg-blue-500 hover:bg-blue-600' : ''}`}>

              <Video className="w-4 h-4 mr-2" />
              Virtual Only
            </Button>
          </div>
        </div>

        {/* Poojas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ?
          Array(6).fill(0).map((_, i) => <PoojaCardSkeleton key={i} />) :
          filteredPoojas?.length > 0 ?
          filteredPoojas.map((pooja) =>
          <PoojaCard key={pooja.id} pooja={pooja} />
          ) :

          <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-4xl">🪔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No poojas found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            </div>
          }
        </div>
      </div>
    </div>);

}