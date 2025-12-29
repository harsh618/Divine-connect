import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Sparkles } from 'lucide-react';

export default function KarmaScore({ score, size = 'default', showLabel = true }) {
  const karmaScore = score || Math.floor(Math.random() * 30) + 70; // Mock: 70-100
  
  const getKarmaColor = (score) => {
    if (score >= 90) return 'from-amber-400 to-yellow-400';
    if (score >= 80) return 'from-orange-400 to-amber-400';
    return 'from-orange-500 to-red-500';
  };

  const getKarmaLabel = (score) => {
    if (score >= 95) return 'Divine';
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    return 'Good';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <Badge 
      className={`bg-gradient-to-r ${getKarmaColor(karmaScore)} text-black border-0 font-bold ${sizeClasses[size]} inline-flex items-center gap-1.5`}
    >
      <Sparkles className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      <span>{karmaScore}</span>
      {showLabel && <span className="font-normal">• {getKarmaLabel(karmaScore)}</span>}
    </Badge>
  );
}