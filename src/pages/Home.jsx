import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHero from '../components/shared/PageHero';
import ServiceCards from '../components/home/ServiceCards';
import FeaturedTemples from '../components/home/FeaturedTemples';

export default function Home() {
  const { data: temples, isLoading } = useQuery({
    queryKey: ['featured-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_featured: true }, '-created_date', 6),
  });

  const { data: allTemples, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }, '-created_date', 6),
  });

  const displayTemples = temples?.length > 0 ? temples : allTemples;

  return (
    <div className="min-h-screen bg-white">
      <PageHero page="home" />
      <ServiceCards />
      <FeaturedTemples temples={displayTemples} isLoading={isLoading && isLoadingAll} />
      
      {/* Live Darshan Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-orange-50/30 to-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Live Darshan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Experience divine blessings from temples across India through live streaming
          </p>
          <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-500">
            Live streams coming soon...
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-serif font-bold text-orange-400 mb-4">Divine</h3>
              <p className="text-gray-400 text-sm">
                Your spiritual journey, simplified. Connect with temples, priests, and astrologers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Temple Visits</li>
                <li>Virtual Poojas</li>
                <li>Astrology Consultations</li>
                <li>Prasad Delivery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Contact Us</li>
                <li>FAQs</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <p className="text-gray-400 text-sm">
                Follow us on social media for spiritual updates and offers.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 Divine. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}