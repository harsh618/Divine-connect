import React from 'react';
import { MapPin, Star, Landmark } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function TempleIntroSection({ temple }) {
  if (!temple) return null;

  return (
    <div className="mb-8">
      {/* SEO Optimized Title */}
      <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">
        {temple.name}, {temple.city}: History, Timings & Significance
      </h1>
      
      {/* Alternate Name */}
      {temple.alternate_name && (
        <p className="text-lg text-amber-700 font-medium mb-4 italic">
          Also known as: {temple.alternate_name}
        </p>
      )}

      {/* Tagline/Summary */}
      <p className="text-lg text-gray-700 leading-relaxed mb-6">
        {temple.tagline || (
          `A sacred temple dedicated to ${temple.primary_deity}, located in the holy city of ${temple.city}, ${temple.state}. ${
            temple.significance ? temple.significance.split('.')[0] + '.' : ''
          }`
        )}
      </p>

      {/* Quick Info Badges */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0 px-3 py-1.5 text-sm">
          <Landmark className="w-4 h-4 mr-1.5" />
          {temple.primary_deity}
        </Badge>
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0 px-3 py-1.5 text-sm">
          <MapPin className="w-4 h-4 mr-1.5" />
          {temple.city}, {temple.state}
        </Badge>
        {temple.architecture?.style && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0 px-3 py-1.5 text-sm">
            {temple.architecture.style} Architecture
          </Badge>
        )}
      </div>
    </div>
  );
}