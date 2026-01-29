import React from 'react';
import { MapPin, Landmark } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

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
      <div className="flex flex-wrap gap-3 mb-8">
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0 px-3 py-1.5 text-sm">
          <Landmark className="w-4 h-4 mr-1.5" />
          {temple.primary_deity}
        </Badge>
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0 px-3 py-1.5 text-sm">
          <MapPin className="w-4 h-4 mr-1.5" />
          {temple.city}, {temple.state}
        </Badge>
      </div>

      {/* About This Temple - Summary Section */}
      {temple.description && (
        <Card className="p-6 md:p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm">
          <h2 className="text-xl md:text-2xl font-serif text-amber-700 mb-4">About This Temple</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
              }}
            >
              {temple.description.length > 500 
                ? temple.description.substring(0, 500).trim() + '...' 
                : temple.description}
            </ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
}