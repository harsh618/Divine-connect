import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-3xl font-serif font-bold text-orange-400 mb-4">Divine</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your spiritual journey, simplified
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Temple Visits</li>
                <li className="hover:text-white transition-colors cursor-pointer">Virtual Poojas</li>
                <li className="hover:text-white transition-colors cursor-pointer">Astrology</li>
                <li className="hover:text-white transition-colors cursor-pointer">Prasad Delivery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-white transition-colors cursor-pointer">FAQs</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Connect</h4>
              <p className="text-gray-400 text-sm">
                Follow us for spiritual updates
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © 2025 Divine. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}