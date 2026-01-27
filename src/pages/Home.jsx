import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import MinimalHero from '../components/home/MinimalHero';
import FeaturedTemplesMinimal from '../components/home/FeaturedTemplesMinimal';
import AuspiciousTimeline from '../components/home/AuspiciousTimeline';
import UpcomingEvents from '../components/home/UpcomingEvents';
import DonationCampaignsMinimal from '../components/home/DonationCampaignsMinimal';
import JoinUsSection from '../components/home/JoinUsSection';
import ArticlesSection from '../components/articles/ArticlesSection';
import FeaturedProvidersCarousel from '../components/home/FeaturedProvidersCarousel';
import FeaturedPoojasCarousel from '../components/home/FeaturedPoojasCarousel';
import { useTranslation } from '../components/TranslationProvider';

export default function Home() {
  const { t } = useTranslation();
  
  const { data: temples, isLoading } = useQuery({
    queryKey: ['featured-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_featured: true, is_hidden: false }, '-created_date', 8),
  });

  const { data: allTemples, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_hidden: false }, '-created_date', 8),
  });

  const displayTemples = temples?.length > 0 ? temples : allTemples;

  return (
    <>
      <SEO 
        title="MandirSutra - Find Your Inner Peace | Sacred Temples & Spiritual Services"
        description="Discover 100+ sacred temples, book authentic poojas, connect with verified priests and astrologers, plan spiritual yatras, and support noble causes. Your complete spiritual companion."
      />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <MinimalHero />
      <FeaturedTemplesMinimal temples={displayTemples} isLoading={isLoading && isLoadingAll} />
      <FeaturedPoojasCarousel />
      <FeaturedProvidersCarousel />
      <div className="bg-muted/30">
        <AuspiciousTimeline />
      </div>
      <UpcomingEvents />
      <div className="bg-muted/30">
        <DonationCampaignsMinimal />
      </div>
      <ArticlesSection />
      <JoinUsSection />
      
      {/* Footer */}
      <footer className="bg-[#5D3A1A] text-[#F5F0E8] py-12 md:py-20 px-4 md:px-6 mt-16 md:mt-32">
        <div className="container mx-auto max-w-7xl">
          {/* Brand Block */}
          <div className="mb-8 md:mb-16 pb-8 md:pb-12 border-b border-[#F5F0E8]/10">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                <path d="M16 4c0 4-4 8-4 12s4 8 4 8 4-4 4-8-4-8-4-12z" fill="#D4A84B" opacity="0.9"/>
                <path d="M8 10c2 3 2 8 4 10s4 4 4 4-2-4-2-8-4-6-6-6z" fill="#C17B54" opacity="0.8"/>
                <path d="M24 10c-2 3-2 8-4 10s-4 4-4 4 2-4 2-8 4-6 6-6z" fill="#C17B54" opacity="0.8"/>
              </svg>
              <h3 className="text-xl md:text-2xl font-serif tracking-wider">Mandir<span className="text-[#D4A84B]">Sutra</span></h3>
            </div>
            <p className="text-[#F5F0E8]/70 text-sm md:text-base mb-2 md:mb-3 max-w-md font-light">
              Discover temples, book poojas and astrologers, and donate to trusted causes across India
            </p>
            <p className="text-[#F5F0E8]/50 text-xs md:text-sm font-light">
              2025 · Built with devotion in India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-normal mb-6 text-[#D4A84B] text-xs uppercase tracking-widest">Services</h4>
              <ul className="space-y-3">
                <li>
                  <Link to={createPageUrl('Temples')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Mandir
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Poojas')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Poojas
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Astrology')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Jyotish
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Priests')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Pandit
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal mb-6 text-[#D4A84B] text-xs uppercase tracking-widest">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:support@mandirsutra.com" className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Contact
                  </a>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal mb-6 text-[#D4A84B] text-xs uppercase tracking-widest">Community</h4>
              <ul className="space-y-3">
                <li>
                  <Link to={createPageUrl('Donate')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Daan
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-[#F5F0E8]/60 hover:text-[#D4A84B] transition-colors text-sm font-light">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal mb-6 text-[#D4A84B] text-xs uppercase tracking-widest">Connect</h4>
              <p className="text-[#F5F0E8]/60 text-sm mb-6 font-light">
                Follow us for daily spiritual content and updates
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#F5F0E8]/10 hover:bg-[#C17B54] flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">FB</span>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#F5F0E8]/10 hover:bg-[#C17B54] flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">TW</span>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#F5F0E8]/10 hover:bg-[#C17B54] flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">IG</span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#F5F0E8]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#F5F0E8]/50 text-sm text-center md:text-left font-light">
              © 2025 MandirSutra. All rights reserved.
            </p>
            <div className="flex gap-8 text-[#F5F0E8]/50 text-sm">
              <Link to={createPageUrl('Home')} className="hover:text-[#D4A84B] transition-colors font-light">
                Sitemap
              </Link>
              <Link to={createPageUrl('Home')} className="hover:text-[#D4A84B] transition-colors font-light">
                Accessibility
              </Link>
              <Link to={createPageUrl('Home')} className="hover:text-[#D4A84B] transition-colors font-light">
                Cookies
              </Link>
            </div>
          </div>
          </div>
          </footer>
      </div>
    </>
  );
}