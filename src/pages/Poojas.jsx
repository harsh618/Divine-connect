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
  { value: 'griha_pravesh', label: 'Griha Pravesh' },
  { value: 'navagraha', label: 'Navagraha Shanti' },
  { value: 'rudrabhishek', label: 'Rudrabhishek' },
];

function PoojaCard({ pooja }) {
  const defaultImage = "https://images.unsplash.com/photo-1604608672516-f1e3c1f9f6e6?w=800";

  return (
    <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)}>
      <Card className="group overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer bg-card">
        <div className="relative h-56 overflow-hidden">
          <img 
            src={pooja.image_url || defaultImage} 
            alt={pooja.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {pooja.is_popular && (
            <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground border-0 text-xs uppercase tracking-wider">
              Popular
            </Badge>
          )}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-normal text-base text-white">
              {pooja.name}
            </h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 font-light">
            {pooja.purpose || pooja.description}
          </p>

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-light">Starting from</p>
              <p className="text-xl font-normal text-primary">
                ₹{pooja.base_price_virtual || pooja.base_price_temple || pooja.base_price_in_person}
              </p>
            </div>
            {pooja.duration_minutes && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground flex items-center justify-end font-light">
                  <Clock className="w-3 h-3 mr-1" />
                  {pooja.duration_minutes} mins
                </p>
              </div>
            )}
          </div>

          <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs uppercase tracking-wider">
            Book Now
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>

          {pooja.required_items?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-start font-light">
                <Package className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{pooja.required_items.slice(0, 3).join(', ')}</span>
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

  const { data: poojas, isLoading } = useQuery({
    queryKey: ['poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }, '-is_popular'),
  });

  const filteredPoojas = poojas?.filter(pooja => {
    const matchesSearch = pooja.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pooja.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pooja.category === selectedCategory;
    const matchesVirtual = !showVirtualOnly || pooja.base_price_virtual > 0;
    return matchesSearch && matchesCategory && matchesVirtual;
  });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
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
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-2 border border-white/20 text-white text-xs mb-12 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Sacred Rituals
          </div>

          <h1 className="text-5xl md:text-7xl font-light text-white mb-8 leading-tight tracking-wide" style={{ 
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' 
          }}>
            Book Sacred Poojas
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-8 font-light max-w-2xl mx-auto">
            Connect with experienced priests for authentic Hindu rituals
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs uppercase tracking-widest font-light">Explore</span>
          <div className="w-px h-8 bg-white/30" />
        </div>
      </section>

      <div className="container mx-auto px-8 py-20 max-w-7xl">
        {/* Search & Filters */}
        <div className="bg-card border border-border p-8 mb-12">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search poojas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 border-border bg-background text-sm"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-56 h-14 border-border text-sm">
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
              className={`h-14 border-border text-sm uppercase tracking-wider ${showVirtualOnly ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <Video className="w-4 h-4 mr-2" />
              Virtual Only
            </Button>
          </div>
        </div>

        {/* Poojas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <PoojaCardSkeleton key={i} />)
          ) : filteredPoojas?.length > 0 ? (
            filteredPoojas.map((pooja) => (
              <PoojaCard key={pooja.id} pooja={pooja} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-4xl">🪔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No poojas found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}