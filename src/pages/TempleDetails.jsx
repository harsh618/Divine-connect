import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, Shirt, MapPin, Phone, Globe, 
  Heart, Share2, ChevronDown, Star, Calendar,
  Home, Flame, HandHeart, Play, Pause
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TempleOverviewTab from '@/components/temple-details/TempleOverviewTab';
import TempleBookPujaTab from '@/components/temple-details/TempleBookPujaTab';
import TempleStayNearbyTab from '@/components/temple-details/TempleStayNearbyTab';
import TempleSevaTab from '@/components/temple-details/TempleSevaTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Globe },
  { id: 'book-puja', label: 'Book Puja', icon: Flame },
  { id: 'stay-nearby', label: 'Stay Nearby', icon: Home },
  { id: 'seva', label: 'Seva', icon: HandHeart },
];

// Gold/White color palette
const COLORS = {
  gold: '#FF9933',
  goldLight: '#FFB366',
  goldDark: '#E68A00',
  white: '#FFFFFF',
  cream: '#FFF8F0',
};

export default function TempleDetails() {
  const [searchParams] = useSearchParams();
  const templeId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSticky, setIsSticky] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const tabBarRef = useRef(null);
  const videoRef = useRef(null);

  const { data: temple, isLoading } = useQuery({
    queryKey: ['temple', templeId],
    queryFn: () => base44.entities.Temple.filter({ id: templeId }),
    enabled: !!templeId,
    select: (data) => data?.[0]
  });

  // Handle sticky tab bar
  useEffect(() => {
    const handleScroll = () => {
      if (tabBarRef.current) {
        const tabBarTop = tabBarRef.current.getBoundingClientRect().top;
        setIsSticky(tabBarTop <= 64);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Mock crowd status
  const getCrowdStatus = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) return { status: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (hour >= 9 && hour < 12) return { status: 'High', color: 'text-red-600', bg: 'bg-red-100' };
    if (hour >= 12 && hour < 16) return { status: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (hour >= 16 && hour < 20) return { status: 'High', color: 'text-red-600', bg: 'bg-red-100' };
    return { status: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const crowdStatus = getCrowdStatus();

  if (isLoading) {
    return <TempleDetailsSkeleton />;
  }

  if (!temple) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Temple not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/30">
      {/* Hero Section with Video */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={temple.thumbnail_url || temple.images?.[0] || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1920'}
        >
          <source 
            src={temple.live_darshan_url || "https://cdn.pixabay.com/video/2020/07/30/45913-446417868_large.mp4"} 
            type="video/mp4" 
          />
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Video Control */}
        <button
          onClick={toggleVideo}
          className="absolute top-24 right-4 z-10 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          {isVideoPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge 
              className="mb-3 text-white border-white/30"
              style={{ backgroundColor: COLORS.gold }}
            >
              {temple.primary_deity}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {temple.name}
            </h1>
            <p className="text-white/80 flex items-center gap-2 text-sm md:text-base">
              <MapPin className="w-4 h-4" />
              {temple.city}, {temple.state}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button 
                className="text-white border-white/30 hover:bg-white/20"
                variant="outline"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                className="text-white border-white/30 hover:bg-white/20"
                variant="outline"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </section>

      {/* Info Bar */}
      <section className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-12">
            {/* Crowd Status */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${crowdStatus.bg}`}>
                <Users className={`w-5 h-5 ${crowdStatus.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Crowd Status</p>
                <p className={`font-semibold ${crowdStatus.color}`}>{crowdStatus.status}</p>
              </div>
            </div>

            {/* Open/Close Time */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Clock className="w-5 h-5" style={{ color: COLORS.gold }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Darshan Timings</p>
                <p className="font-semibold text-gray-800">
                  {temple.opening_hours || '5:00 AM - 9:00 PM'}
                </p>
              </div>
            </div>

            {/* Dress Code */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Shirt className="w-5 h-5" style={{ color: COLORS.gold }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dress Code</p>
                <p className="font-semibold text-gray-800">
                  {temple.dress_code || 'Traditional Attire'}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Star className="w-5 h-5" style={{ color: COLORS.gold }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <p className="font-semibold text-gray-800">4.8 (2.3k reviews)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Tab Bar */}
      <div 
        ref={tabBarRef}
        className={`bg-white border-b z-40 transition-all duration-300 ${
          isSticky ? 'fixed top-16 left-0 right-0 shadow-md' : ''
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive 
                      ? 'text-white font-medium' 
                      : 'text-gray-600 hover:bg-orange-50'
                  }`}
                  style={isActive ? { backgroundColor: COLORS.gold } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spacer for sticky tab bar */}
      {isSticky && <div className="h-16" />}

      {/* Tab Content with Animation */}
      <section className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <TempleOverviewTab temple={temple} />}
            {activeTab === 'book-puja' && <TempleBookPujaTab temple={temple} />}
            {activeTab === 'stay-nearby' && <TempleStayNearbyTab temple={temple} />}
            {activeTab === 'seva' && <TempleSevaTab temple={temple} />}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

function TempleDetailsSkeleton() {
  return (
    <div className="min-h-screen">
      <Skeleton className="h-[60vh] w-full" />
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <Skeleton className="h-16 w-40" />
          <Skeleton className="h-16 w-40" />
          <Skeleton className="h-16 w-40" />
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}