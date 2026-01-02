import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, Train, MapPin, Calendar, Clock, Star, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, addDays } from 'date-fns';

export default function ItineraryBooking() {
  const urlParams = new URLSearchParams(window.location.search);
  const templeId = urlParams.get('temple');
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [selectedTrains, setSelectedTrains] = useState([]);

  const { data: temple } = useQuery({
    queryKey: ['temple-for-booking', templeId],
    queryFn: async () => {
      const temples = await base44.entities.Temple.filter({ id: templeId });
      return temples[0];
    },
    enabled: !!templeId
  });

  const { data: hotels } = useQuery({
    queryKey: ['hotels-near', temple?.city],
    queryFn: () => base44.entities.Hotel.filter({ 
      city: temple.city,
      is_deleted: false, 
      is_hidden: false 
    }),
    enabled: !!temple?.city
  });

  // Mock train data
  const mockTrains = [
    { id: 1, name: 'Rajdhani Express', from: 'Delhi', to: temple?.city, departure: '10:00 AM', arrival: '6:00 PM', price: 1200, class: 'AC 2-Tier' },
    { id: 2, name: 'Shatabdi Express', from: 'Delhi', to: temple?.city, departure: '6:00 AM', arrival: '2:00 PM', price: 800, class: 'AC Chair Car' },
    { id: 3, name: 'Express Train', from: 'Mumbai', to: temple?.city, departure: '8:00 PM', arrival: '8:00 AM', price: 600, class: 'Sleeper' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24">
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <h1 className="text-4xl font-serif text-white mb-4">Complete Your Yatra</h1>
          <p className="text-white/90 text-lg">Book hotels and trains for {temple?.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-8 max-w-7xl py-12">
        <Tabs defaultValue="hotels" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="hotels">
              <Hotel className="w-4 h-4 mr-2" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="trains">
              <Train className="w-4 h-4 mr-2" />
              Trains
            </TabsTrigger>
          </TabsList>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-gray-900">Hotels near {temple?.name}</h2>
              <Badge variant="secondary">{hotels?.length || 0} available</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels?.map(hotel => (
                <Card key={hotel.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex gap-4">
                    <img
                      src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'}
                      alt={hotel.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{hotel.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array(hotel.star_rating || 3).fill(0).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-3 h-3" />
                        {hotel.city}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-amber-600">
                          ₹{hotel.room_types?.[0]?.price_per_night || 2000}/night
                        </span>
                        <Link to={createPageUrl(`HotelDetail?id=${hotel.id}`)}>
                          <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trains Tab */}
          <TabsContent value="trains" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-gray-900">Available Trains</h2>
              <Badge variant="secondary">{mockTrains.length} routes</Badge>
            </div>

            <div className="space-y-4">
              {mockTrains.map(train => (
                <Card key={train.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{train.name}</h3>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div>
                          <p className="font-semibold text-gray-900">{train.from}</p>
                          <p className="text-xs">{train.departure}</p>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                        <div>
                          <p className="font-semibold text-gray-900">{train.to}</p>
                          <p className="text-xs">{train.arrival}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mt-2">{train.class}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600 mb-2">₹{train.price}</p>
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-500">
                        Book Ticket
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Train className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Booking Information</h4>
                  <p className="text-sm text-blue-800">
                    Train bookings will redirect you to IRCTC for secure payment and confirmation. 
                    Make sure to book in advance during peak pilgrimage seasons.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Card */}
        {(selectedHotels.length > 0 || selectedTrains.length > 0) && (
          <Card className="fixed bottom-8 right-8 p-6 shadow-2xl max-w-md">
            <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
            <div className="space-y-2 mb-4">
              {selectedHotels.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hotels</span>
                  <span className="font-semibold">{selectedHotels.length} selected</span>
                </div>
              )}
              {selectedTrains.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trains</span>
                  <span className="font-semibold">{selectedTrains.length} selected</span>
                </div>
              )}
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
              <Check className="w-4 h-4 mr-2" />
              Confirm All Bookings
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}