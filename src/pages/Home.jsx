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
import JoinUsSection from '../components/home/JoinUsSection';
import ArticlesSection from '../components/articles/ArticlesSection';

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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MinimalHero />
      <FeaturedTemplesMinimal temples={displayTemples} isLoading={isLoading && isLoadingAll} />
      <div className="bg-muted/30">
        <AuspiciousTimeline />
      </div>
      <UpcomingEvents />
      <div className="bg-muted/30">
        <DonationCampaignsMinimal />
      </div>
      <PriestsMinimal />
      <ArticlesSection />
      <JoinUsSection />
      
      {/* Footer */}
      <footer className="bg-foreground text-background py-20 px-6 mt-32">
        <div className="container mx-auto max-w-7xl">
          {/* Brand Block */}
          <div className="mb-16 pb-12 border-b border-background/10">
            <h3 className="text-2xl font-normal tracking-wider mb-4">DIVINE</h3>
            <p className="text-background/70 text-base mb-3 max-w-md font-light">
              Discover temples, book poojas and astrologers, and donate to trusted causes across India
            </p>
            <p className="text-background/50 text-sm font-light">
              2025 · Built with devotion in India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-normal mb-6 text-background text-xs uppercase tracking-widest">Services</h4>
              <ul className="space-y-3">
                <li>
                  <Link to={createPageUrl('Temples')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Temples
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Poojas')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Poojas
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Astrology')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Astrology
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Priests')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Priests
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal mb-6 text-background text-xs uppercase tracking-widest">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:support@divine.com" className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Contact
                  </a>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal mb-6 text-background text-xs uppercase tracking-widest">Community</h4>
              <ul className="space-y-3">
                <li>
                  <Link to={createPageUrl('Donate')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Home')} className="text-background/60 hover:text-background transition-colors text-sm font-light">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-normal mb-6 text-background text-xs uppercase tracking-widest">Connect</h4>
              <p className="text-background/60 text-sm mb-6 font-light">
                Follow us for daily spiritual content and updates
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">FB</span>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">TW</span>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <span className="text-xs">IG</span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/50 text-sm text-center md:text-left font-light">
              © 2025 Divine. All rights reserved.
            </p>
            <div className="flex gap-8 text-background/50 text-sm">
              <Link to={createPageUrl('Home')} className="hover:text-background transition-colors font-light">
                Sitemap
              </Link>
              <Link to={createPageUrl('Home')} className="hover:text-background transition-colors font-light">
                Accessibility
              </Link>
              <Link to={createPageUrl('Home')} className="hover:text-background transition-colors font-light">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}