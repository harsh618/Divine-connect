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
import { Search, Clock, Video, Package, ArrowRight, Sparkles } from 'lucide-react';
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
];

function PoojaCard({ service }) {
  return (
    <Link to={createPageUrl(`PoojaDetail?id=${service.id}`)}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer">
        <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <span className="text-3xl">🪔</span>
          </div>
          {service.is_virtual && (
            <Badge className="absolute top-3 right-3 bg-blue-500 text-white border-0">
              <Video className="w-3 h-3 mr-1" />
              Virtual
            </Badge>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
            {service.title}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {service.description || 'A sacred ritual to invoke divine blessings'}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">₹{service.price}</p>
              {service.duration_minutes && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {service.duration_minutes} mins
                </p>
              )}
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              Book Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {service.materials_included?.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 flex items-center">
                <Package className="w-3 h-3 mr-1" />
                Includes: {service.materials_included.slice(0, 3).join(', ')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
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
    </Card>
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

  const { data: services, isLoading } = useQuery({
    queryKey: ['pooja-services'],
    queryFn: () => base44.entities.Service.filter({ category: 'pooja', is_deleted: false, is_hidden: false }, '-created_date'),
  });

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVirtual = !showVirtualOnly || service.is_virtual;
    return matchesSearch && matchesVirtual;
  });

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      {/* Hero Section with Rotating Images */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images with Transition */}
        <div className="absolute inset-0 z-0">
          {poojaImages.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Pooja ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-orange-200 text-sm mb-8">
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
                className="pl-10 h-12"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showVirtualOnly ? "default" : "outline"}
              onClick={() => setShowVirtualOnly(!showVirtualOnly)}
              className={`h-12 ${showVirtualOnly ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            >
              <Video className="w-4 h-4 mr-2" />
              Virtual Only
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <PoojaCardSkeleton key={i} />)
          ) : filteredServices?.length > 0 ? (
            filteredServices.map((service) => (
              <PoojaCard key={service.id} service={service} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-4xl">🪔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No poojas available</h3>
              <p className="text-gray-500 mb-4">Check back soon for available pooja services</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}