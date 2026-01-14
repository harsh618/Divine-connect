import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Building2, Heart, BookOpen, Stethoscope, Leaf, Utensils,
  Music, GraduationCap, Tent, Droplets, Bell, Sparkles, ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  { id: 'temple_renovation', name: 'Temple Renovation', icon: Building2, color: 'from-orange-500 to-red-500', count: 12 },
  { id: 'anna_daan', name: 'Food Distribution', icon: Utensils, color: 'from-pink-500 to-rose-500', count: 8 },
  { id: 'education', name: 'Education', icon: BookOpen, color: 'from-blue-500 to-indigo-500', count: 6 },
  { id: 'medical', name: 'Medical Aid', icon: Stethoscope, color: 'from-green-500 to-emerald-500', count: 4 },
  { id: 'gaushala', name: 'Gaushala', icon: Leaf, color: 'from-lime-500 to-green-500', count: 5 },
  { id: 'cultural', name: 'Cultural Events', icon: Music, color: 'from-purple-500 to-violet-500', count: 3 },
];

export default function CategoryGrid({ onSelectCategory, campaignCounts = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const count = campaignCounts[cat.id] || cat.count;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group relative p-5 rounded-2xl bg-white border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 text-center overflow-hidden"
          >
            {/* Hover Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-colors`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white text-sm mb-1 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-500 group-hover:text-white/80 transition-colors">
                {count} campaigns
              </p>
            </div>

            {/* Arrow on hover */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        );
      })}
    </div>
  );
}