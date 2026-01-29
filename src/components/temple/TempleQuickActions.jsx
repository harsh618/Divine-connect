import React from 'react';
import { 
  CalendarDays, 
  Heart, 
  MapPin, 
  Package
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function TempleQuickActions({ 
  temple, 
  onBookDarshan, 
  onDonate, 
  onPlanTrip, 
  onOrderPrasad,
  hasPrasad 
}) {
  if (!temple) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 p-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
      <Button
        onClick={onBookDarshan}
        disabled={!temple.visit_booking_enabled}
        className="rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 h-12"
      >
        <CalendarDays className="w-4 h-4 mr-2" />
        Book Darshan
      </Button>
      
      <Button
        variant="ghost"
        onClick={onDonate}
        className="rounded-full text-white border border-white/20 hover:bg-white/10 px-6 h-12"
      >
        <Heart className="w-4 h-4 mr-2" />
        Donate
      </Button>
      
      <Button
        variant="ghost"
        onClick={onPlanTrip}
        className="rounded-full text-white hover:text-amber-400 hover:bg-white/5 px-4 h-12"
      >
        <MapPin className="w-4 h-4 mr-2" />
        Plan Trip
      </Button>
      
      {hasPrasad && (
        <>
          <div className="h-8 w-[1px] bg-white/20 mx-1" />
          <Button
            variant="ghost"
            onClick={onOrderPrasad}
            size="icon"
            className="rounded-full text-white hover:bg-white/10 h-12 w-12"
            title="Order Prasad"
          >
            <Package className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
}