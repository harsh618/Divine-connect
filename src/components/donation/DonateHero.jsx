import React, { useState, useEffect } from 'react';
import { Heart, Users, Target, Sparkles, TrendingUp } from 'lucide-react';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920'
];

export default function DonateHero({ stats }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const liveStats = [
    { icon: Heart, label: 'Total Donations', value: `₹${(stats?.totalRaised || 1245678).toLocaleString()}`, color: 'text-pink-400' },
    { icon: Users, label: 'Donors Today', value: stats?.donorsToday || 248, color: 'text-blue-400' },
    { icon: Target, label: 'Active Campaigns', value: stats?.activeCampaigns || 47, color: 'text-green-400' },
    { icon: Sparkles, label: 'Lives Impacted', value: `${(stats?.livesImpacted || 89456).toLocaleString()}+`, color: 'text-amber-400' },
  ];

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-end overflow-hidden pb-8">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-black">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-50' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 max-w-7xl text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-6">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            Sacred Giving • Make an Impact
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 leading-tight drop-shadow-xl">
            Your Donation<br/>
            <span className="italic text-white/80">Creates Divine Impact</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Support temples, feed the needy, educate children, preserve traditions. Every contribution creates ripples of positive change.
          </p>
        </div>

        {/* Live Stats Counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {liveStats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/60 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}