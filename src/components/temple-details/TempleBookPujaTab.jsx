import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, IndianRupee, Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOLD = '#FF9933';

export default function TempleBookPujaTab({ temple }) {
  const { data: poojas, isLoading } = useQuery({
    queryKey: ['poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }),
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Book a Puja at {temple.name}</h2>
        <p className="text-gray-600 mt-1">Select from our curated list of sacred rituals</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {poojas?.slice(0, 6).map((pooja, idx) => (
          <motion.div
            key={pooja.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-orange-100 group">
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={pooja.image_url || 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=400'}
                  alt={pooja.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {pooja.is_popular && (
                  <Badge 
                    className="absolute top-3 left-3 text-white"
                    style={{ backgroundColor: GOLD }}
                  >
                    Popular
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{pooja.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {pooja.purpose || pooja.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {pooja.duration_minutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {pooja.base_price_temple || pooja.base_price_virtual || '₹500'}
                  </span>
                </div>

                <Link to={createPageUrl(`PoojaDetail?id=${pooja.id}`)}>
                  <Button 
                    className="w-full text-white group"
                    style={{ backgroundColor: GOLD }}
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    Book Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}