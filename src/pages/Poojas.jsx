import React, { useState } from 'react';
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
import { Search, Clock, Video, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BackButton from '../components/ui/BackButton';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ['pooja-services'],
    queryFn: () => base44.entities.Service.filter({ category: 'pooja', is_deleted: false }, '-created_date'),
  });

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVirtual = !showVirtualOnly || service.is_virtual;
    return matchesSearch && matchesVirtual;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-16 px-6">
        <div className="container mx-auto">
          <BackButton label="Back" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Book a Pooja
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Experience sacred rituals performed by verified pandits, either virtually or at a temple near you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
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