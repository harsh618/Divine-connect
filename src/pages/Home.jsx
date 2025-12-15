import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MinimalHero from '../components/home/MinimalHero';
import FeaturedTemplesMinimal from '../components/home/FeaturedTemplesMinimal';
import AuspiciousTimeline from '../components/home/AuspiciousTimeline';
import UpcomingEvents from '../components/home/UpcomingEvents';
import DonationCampaignsMinimal from '../components/home/DonationCampaignsMinimal';
import PriestsMinimal from '../components/home/PriestsMinimal';

export default function Home() {
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
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <MinimalHero />
      <FeaturedTemplesMinimal temples={displayTemples} isLoading={isLoading && isLoadingAll} />
      <AuspiciousTimeline />
      <UpcomingEvents />
      <DonationCampaignsMinimal />
      <PriestsMinimal />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6 mt-24">
        <div className="container mx-auto max-w-7xl">
          {/* Brand Block */}
          <div className="mb-12 pb-12 border-b border-gray-800">
            <h3 className="text-3xl font-serif font-bold text-orange-400 mb-3">Divine</h3>
            <p className="text-gray-300 text-base mb-2">
              Discover temples, book poojas and astrologers, and donate to trusted causes across India
            </p>
            <p className="text-gray-500 text-sm">
              2025 · Built with devotion in India 🇮🇳
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-3">
                <li>
                  <Link to={createPageUrl('Temples')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Temples
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Poojas')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Poojas
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Astrology')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Astrology
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Priests')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Priests
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:support@divine.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact
                  </a>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Community</h4>
              <ul className="space-y-3">
                <li>
                  <Link to={createPageUrl('Donate')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-gray-400 hover:text-white transition-colors text-sm">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Connect</h4>
              <p className="text-gray-400 text-sm mb-4">
                Follow us for daily spiritual content and updates
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">FB</span>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">TW</span>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">IG</span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2025 Divine. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-500 text-sm">
              <Link to={createPageUrl('Home')} className="hover:text-white transition-colors">
                Sitemap
              </Link>
              <Link to={createPageUrl('Home')} className="hover:text-white transition-colors">
                Accessibility
              </Link>
              <Link to={createPageUrl('Home')} className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}