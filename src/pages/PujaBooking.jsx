import React from 'react';
import { Flame } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import PujaBookingForm from '@/components/booking/PujaBookingForm';

export default function PujaBooking() {
  const urlParams = new URLSearchParams(window.location.search);
  const templeId = urlParams.get('templeId');

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <BackButton label="Back" />
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Book a Puja</h1>
              <p className="text-white/80 text-sm">Complete your sacred booking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="container mx-auto max-w-4xl px-6 py-8">
        <PujaBookingForm templeId={templeId} />
      </div>
    </div>
  );
}