import React from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Heart, 
  MapPin, 
  Package,
  Clock,
  Users,
  Navigation
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TempleQuickActions({ 
  temple, 
  onBookDarshan, 
  onDonate, 
  onPlanTrip, 
  onOrderPrasad,
  onGetDirections,
  hasPrasad 
}) {
  if (!temple) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="py-8 md:py-12 bg-white border-b"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Quick Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-gray-900">Plan Your Visit</h2>
            
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-3 py-1.5">
                <Clock className="w-4 h-4 mr-1.5" />
                {temple.opening_hours || '5:00 AM - 9:00 PM'}
              </Badge>
              
              {temple.dress_code?.general && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1.5">
                  <Users className="w-4 h-4 mr-1.5" />
                  {temple.dress_code.general}
                </Badge>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGetDirections}
              className="gap-2"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              onClick={onBookDarshan}
              disabled={!temple.visit_booking_enabled}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Book Darshan
            </Button>
            
            <Button
              variant="outline"
              onClick={onDonate}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </Button>
            
            <Button
              variant="outline"
              onClick={onPlanTrip}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Plan Trip
            </Button>
            
            {hasPrasad && (
              <Button
                variant="outline"
                onClick={onOrderPrasad}
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                <Package className="w-4 h-4 mr-2" />
                Order Prasad
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}