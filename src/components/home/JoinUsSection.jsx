import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Stars, Users, ArrowRight, CheckCircle, Building2 } from 'lucide-react';

export default function JoinUsSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-orange-100 text-orange-700 mb-4">Join Our Community</Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Share Your Sacred Knowledge
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community of priests and astrologers serving devotees across India
          </p>
        </div>



        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Priest Card */}
          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-48 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10" />
              <Flame className="w-20 h-20 text-white relative z-10" />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Join as a Pandit</h3>
              <p className="text-gray-600 mb-6">
                Connect with devotees seeking sacred rituals and ceremonies. Perform poojas, havans, and spiritual services.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Flexible scheduling - work on your terms</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Virtual and in-person pooja options</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Earn ₹20,000 - ₹1,00,000 per month</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Marketing and booking support</span>
                </div>
              </div>

              <Link to={createPageUrl('OnboardPriest')}>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg group">
                  Register as Pandit
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Astrologer Card */}
          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-48 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10" />
              <Stars className="w-20 h-20 text-white relative z-10" />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Join as an Astrologer</h3>
              <p className="text-gray-600 mb-6">
                Guide seekers with your astrological expertise. Offer consultations, kundali readings, and remedies.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Chat, voice, and video consultations</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Build your reputation with ratings</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Earn ₹30,000 - ₹2,00,000 per month</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Access to nationwide client base</span>
                </div>
              </div>

              <Link to={createPageUrl('OnboardAstrologer')}>
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 text-lg group">
                  Register as Astrologer
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Hotel Partner Card */}
          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10" />
              <Building2 className="w-20 h-20 text-white relative z-10" />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Join as Hotel Partner</h3>
              <p className="text-gray-600 mb-6">
                List your property for temple pilgrims and devotees. Connect with travelers on their spiritual journeys.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Access to spiritual travelers</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Easy booking management dashboard</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Promote your property near temples</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Seasonal promotions and offers</span>
                </div>
              </div>

              <Link to={createPageUrl('HotelOnboarding')}>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg group">
                  Register Your Hotel
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Have questions? <a href="mailto:partners@mandirsutra.com" className="text-orange-600 hover:text-orange-700 font-medium">Contact our partnership team</a>
          </p>
        </div>
      </div>
    </section>
  );
}