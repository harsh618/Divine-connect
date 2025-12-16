import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const heroConfigs = {
  home: {
    title: "Divine",
    subtitle: "Connections",
    description: "Experience authentic spiritual services from the comfort of your home. Connect with temples, book poojas, consult astrologers, and more.",
    backgroundImage: "https://images.pexels.com/photos/3098608/pexels-photo-3098608.jpeg?auto=compress&cs=tinysrgb&w=1920",
    gradientFrom: "from-black/80",
    gradientVia: "via-black/50",
    primaryAction: { text: "Explore Temples", link: "Temples", gradient: "from-orange-500 to-amber-500" },
    secondaryAction: { text: "Book a Pooja", link: "Poojas" },
    stats: [
    { value: "10,000+", label: "Devotees" },
    { value: "500+", label: "Verified Priests" },
    { value: "100+", label: "Temples" }],

    badge: "Welcome to Divine"
  },
  temples: {
    title: "Sacred",
    subtitle: "Temples",
    description: "Discover ancient temples across India. Book darshan, watch live ceremonies, order prasad, and immerse yourself in spiritual heritage.",
    backgroundImage: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1920",
    gradientFrom: "from-orange-900/80",
    gradientVia: "via-orange-800/50",
    primaryAction: { text: "Explore All Temples", link: "Temples", gradient: "from-orange-500 to-amber-500" },
    secondaryAction: { text: "Watch Live Darshan", link: "Temples" },
    stats: [
    { value: "100+", label: "Temples" },
    { value: "50+", label: "Cities" },
    { value: "Live", label: "Darshan" }],

    badge: "Explore Sacred Places"
  },
  poojas: {
    title: "Divine",
    subtitle: "Rituals",
    description: "Book authentic Vedic poojas performed by experienced priests. Choose from virtual ceremonies or in-person rituals at sacred temples.",
    backgroundImage: "https://images.unsplash.com/photo-1604608672516-f1b9b1a0e25f?w=1920",
    gradientFrom: "from-amber-900/80",
    gradientVia: "via-amber-800/50",
    primaryAction: { text: "Browse Poojas", link: "Poojas", gradient: "from-orange-500 to-amber-500" },
    secondaryAction: { text: "Virtual Poojas", link: "Poojas" },
    stats: [
    { value: "50+", label: "Ritual Types" },
    { value: "500+", label: "Verified Priests" },
    { value: "Live", label: "Streaming" }],

    badge: "Sacred Ceremonies"
  },
  astrology: {
    title: "Celestial",
    subtitle: "Guidance",
    description: "Connect with expert Vedic astrologers for personalized readings, kundli analysis, and life guidance through chat, voice, or video.",
    backgroundImage: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1920",
    gradientFrom: "from-purple-900/80",
    gradientVia: "via-purple-800/50",
    primaryAction: { text: "Consult Astrologer", link: "Astrology", gradient: "from-purple-600 to-indigo-600" },
    secondaryAction: { text: "Generate Kundli", link: "KundliGenerator" },
    stats: [
    { value: "200+", label: "Astrologers" },
    { value: "24/7", label: "Available" },
    { value: "10k+", label: "Consultations" }],

    badge: "Your Cosmic Journey"
  },
  priests: {
    title: "Connect with",
    subtitle: "Sacred Guides",
    description: "Find experienced priests for spiritual ceremonies, poojas, and religious consultations. Access authentic Vedic knowledge and guidance.",
    backgroundImage: "https://images.pexels.com/photos/3098608/pexels-photo-3098608.jpeg?auto=compress&cs=tinysrgb&w=1920",
    gradientFrom: "from-indigo-900/80",
    gradientVia: "via-indigo-800/50",
    primaryAction: { text: "Find a Priest", link: "Priests", gradient: "from-indigo-600 to-blue-600" },
    secondaryAction: { text: "Book Ceremony", link: "Poojas" },
    stats: [
    { value: "500+", label: "Verified Priests" },
    { value: "15+", label: "Languages" },
    { value: "5k+", label: "Services Done" }],

    badge: "Spiritual Guidance"
  },
  donate: {
    title: "Support",
    subtitle: "Sacred Causes",
    description: "Your generous contributions help maintain temples, support charitable activities, and spread the light of spirituality across communities.",
    backgroundImage: "https://images.pexels.com/photos/3098608/pexels-photo-3098608.jpeg?auto=compress&cs=tinysrgb&w=1920",
    gradientFrom: "from-rose-900/80",
    gradientVia: "via-rose-800/50",
    primaryAction: { text: "View Campaigns", link: "Donate", gradient: "from-rose-500 to-pink-500" },
    secondaryAction: { text: "Donate to Temples", link: "Temples" },
    stats: [
    { value: "₹10L+", label: "Raised" },
    { value: "20+", label: "Active Causes" },
    { value: "1000+", label: "Donors" }],

    badge: "Make a Difference"
  }
};

export default function PageHero({ page = 'home' }) {
  const config = heroConfigs[page] || heroConfigs.home;

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={config.backgroundImage}
          alt={config.title}
          className="w-full h-full object-cover" />

        <div className="bg-gradient-to-r opacity-40 absolute inset-0 from-purple-900/80 via-purple-800/50 to-transparent" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mr-6 ml-40 pb-64 max-w-2xl">
          <div className="bg-white/10 text-orange-300 mt-8 mb-6 px-4 py-2 text-sm opacity-0 rounded-full inline-flex items-center gap-2 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            {config.badge}
          </div>

        

          

          <div className="pt-1 flex flex-col sm:flex-row gap-4">
            <Link to={createPageUrl(config.primaryAction.link)}>
              <Button
                size="lg"
                className={`bg-gradient-to-r ${config.primaryAction.gradient} hover:opacity-90 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-orange-500/30 transition-all hover:scale-105`}>

                {config.primaryAction.text}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to={createPageUrl(config.secondaryAction.link)}>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white px-8 py-6 text-lg font-medium rounded-full border border-white/30 hover:bg-white/10 backdrop-blur-sm">

                {config.secondaryAction.text}
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="text-white/70 mt-12 opacity-0 flex items-center gap-8">
            {config.stats.map((stat, idx) =>
            <React.Fragment key={idx}>
                {idx > 0 && <div className="w-px h-12 bg-white/20" />}
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm">{stat.label}</p>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </section>);

}