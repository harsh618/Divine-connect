import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, BookOpen, Heart, Sparkles, Quote } from 'lucide-react';

const IMPACT_METRICS = [
  { icon: Building2, value: '24', label: 'Temples Renovated', color: 'text-orange-600' },
  { icon: Heart, value: '50,000', label: 'Meals Served', color: 'text-pink-600' },
  { icon: BookOpen, value: '1,200', label: 'Children Educated', color: 'text-blue-600' },
  { icon: Users, value: '45', label: 'Events Supported', color: 'text-purple-600' },
];

const TESTIMONIALS = [
  {
    quote: "The temple renovation brought our community together. We're forever grateful to all donors.",
    author: "Pandit Ramesh Ji",
    role: "Temple Priest, Varanasi",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"
  },
  {
    quote: "Because of the Anna Daan program, my children never go hungry. Thank you from the bottom of my heart.",
    author: "Lakshmi Devi",
    role: "Beneficiary, Chennai",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
  },
  {
    quote: "My daughter is now studying in school thanks to the education fund. Dreams do come true.",
    author: "Suresh Kumar",
    role: "Parent, Jaipur",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
  }
];

export default function ImpactStories() {
  return (
    <div className="space-y-8">
      {/* Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {IMPACT_METRICS.map((metric, idx) => (
          <Card key={idx} className="p-5 text-center bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
            <metric.icon className={`w-8 h-8 ${metric.color} mx-auto mb-2`} />
            <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
            <div className="text-sm text-gray-500">{metric.label}</div>
          </Card>
        ))}
      </div>

      {/* Testimonials */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Quote className="w-5 h-5 text-amber-600" />
          <h3 className="text-xl font-bold text-gray-900">Stories of Impact</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((testimonial, idx) => (
            <Card key={idx} className="p-5 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Quote className="w-8 h-8 text-amber-200 mb-3" />
              <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{testimonial.author}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}