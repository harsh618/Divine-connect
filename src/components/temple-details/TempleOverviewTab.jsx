import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Book, Info } from 'lucide-react';

const GOLD = '#FF9933';

export default function TempleOverviewTab({ temple }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        {/* About */}
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: GOLD }}>
              <Info className="w-5 h-5" />
              About the Temple
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              {temple.description || `${temple.name} is one of the most revered temples dedicated to ${temple.primary_deity}. Devotees from across the country visit this sacred place to seek blessings and experience divine peace.`}
            </p>
          </CardContent>
        </Card>

        {/* History */}
        {temple.history && (
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: GOLD }}>
                <Book className="w-5 h-5" />
                History & Significance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{temple.history}</p>
            </CardContent>
          </Card>
        )}

        {/* Gallery */}
        {temple.images?.length > 0 && (
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle style={{ color: GOLD }}>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {temple.images.slice(0, 6).map((img, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-square rounded-lg overflow-hidden"
                  >
                    <img 
                      src={img} 
                      alt={`${temple.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Info */}
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle style={{ color: GOLD }}>Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-0.5" style={{ color: GOLD }} />
              <div>
                <p className="font-medium text-gray-800">Address</p>
                <p className="text-sm text-gray-600">
                  {temple.location || `${temple.city}, ${temple.state}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-0.5" style={{ color: GOLD }} />
              <div>
                <p className="font-medium text-gray-800">Best Time to Visit</p>
                <p className="text-sm text-gray-600">October to March</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Festivals */}
        {temple.festivals?.length > 0 && (
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle style={{ color: GOLD }}>Major Festivals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {temple.festivals.map((festival, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline"
                    className="border-orange-200 text-orange-700"
                  >
                    {festival}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}