import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar as CalendarIcon,
  Hotel,
  Route,
  Plus,
  Trash2,
  Loader2,
  Save,
  Building2,
  Clock,
  Navigation,
  Check,
  Sparkles
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function YatraPlanner() {
  const [step, setStep] = useState(1);
  const [selectedTemples, setSelectedTemples] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedHotels, setSelectedHotels] = useState({});
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [itineraryName, setItineraryName] = useState('');

  const { data: temples } = useQuery({
    queryKey: ['all-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_hidden: false })
  });

  const { data: hotels } = useQuery({
    queryKey: ['all-hotels'],
    queryFn: () => base44.entities.Hotel.filter({ is_deleted: false, is_hidden: false })
  });

  const generateItineraryMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateMultiDestinationItinerary', data);
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedItinerary(data);
      setStep(3);
      toast.success('Itinerary generated successfully!');
    }
  });

  const saveItineraryMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.SavedItinerary.create({
        user_id: user.id,
        temple_name: data.name,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        itinerary_data: data.itinerary,
        preferences: data.preferences
      });
    },
    onSuccess: () => {
      toast.success('Itinerary saved successfully!');
    }
  });

  const toggleTemple = (temple) => {
    if (selectedTemples.find(t => t.id === temple.id)) {
      setSelectedTemples(selectedTemples.filter(t => t.id !== temple.id));
    } else {
      setSelectedTemples([...selectedTemples, temple]);
    }
  };

  const handleGenerateItinerary = () => {
    if (!startDate || !endDate || selectedTemples.length === 0) {
      toast.error('Please select dates and at least one destination');
      return;
    }

    generateItineraryMutation.mutate({
      temples: selectedTemples.map(t => ({
        name: t.name,
        city: t.city,
        state: t.state,
        deity: t.primary_deity
      })),
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      hotels: Object.values(selectedHotels)
    });
  };

  const getHotelsForCity = (city) => {
    return hotels?.filter(h => h.city === city) || [];
  };

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24">
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-20">
        <div className="container mx-auto px-8 max-w-7xl text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4">
            <Sparkles className="w-3 h-3 mr-2" />
            AI-Powered Planning
          </Badge>
          <h1 className="text-5xl font-serif text-white mb-4">Plan Your Sacred Journey</h1>
          <p className="text-white/90 text-lg">Create custom multi-destination yatra itineraries with smart recommendations</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-8 max-w-5xl -mt-8">
        <Card className="p-6 bg-white shadow-xl">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Destinations' },
              { num: 2, label: 'Hotels & Dates' },
              { num: 3, label: 'Review Itinerary' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className={`flex items-center gap-3 ${idx < 2 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    step > s.num ? 'bg-amber-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="container mx-auto px-8 max-w-5xl py-12">
        
        {/* Step 1: Select Destinations */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-serif text-gray-900 mb-4">Select Your Destinations</h2>
              <p className="text-gray-600 mb-6">Choose the temples you want to visit on your yatra</p>

              <div className="mb-4">
                <Badge variant="secondary">
                  {selectedTemples.length} temple{selectedTemples.length !== 1 ? 's' : ''} selected
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {temples?.map(temple => {
                  const isSelected = selectedTemples.find(t => t.id === temple.id);
                  return (
                    <Card
                      key={temple.id}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-2 border-amber-500 bg-amber-50' : 'hover:border-gray-300'
                      }`}
                      onClick={() => toggleTemple(temple)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{temple.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            {temple.city}, {temple.state}
                          </div>
                          <Badge variant="secondary" className="mt-2">
                            {temple.primary_deity}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={selectedTemples.length === 0}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Continue to Dates & Hotels
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Dates & Hotels */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Select Travel Dates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Label className="mb-2 block">Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-lg border"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">End Date</Label>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date <= (startDate || new Date())}
                    className="rounded-lg border"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="bg-amber-50 p-4 rounded-lg mb-6">
                  <p className="text-amber-900">
                    <CalendarIcon className="w-4 h-4 inline mr-2" />
                    <strong>{totalDays} day{totalDays !== 1 ? 's' : ''}</strong> journey from {format(startDate, 'MMM d')} to {format(endDate, 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Select Accommodations (Optional)</h2>
              
              <Tabs defaultValue={selectedTemples[0]?.city}>
                <TabsList className="mb-4">
                  {selectedTemples.map(temple => (
                    <TabsTrigger key={temple.id} value={temple.city}>
                      {temple.city}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {selectedTemples.map(temple => (
                  <TabsContent key={temple.id} value={temple.city}>
                    <div className="space-y-4">
                      {getHotelsForCity(temple.city).length > 0 ? (
                        getHotelsForCity(temple.city).map(hotel => {
                          const isSelected = selectedHotels[temple.city]?.id === hotel.id;
                          return (
                            <Card
                              key={hotel.id}
                              className={`p-4 cursor-pointer transition-all ${
                                isSelected ? 'border-2 border-amber-500 bg-amber-50' : 'hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedHotels({ ...selectedHotels, [temple.city]: hotel })}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold">{hotel.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{hotel.address}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="secondary">
                                      ⭐ {hotel.star_rating} Star
                                    </Badge>
                                    {hotel.room_types?.[0] && (
                                      <span className="text-amber-600 font-semibold">
                                        ₹{hotel.room_types[0].price_per_night}/night
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 text-center py-8">No hotels available in {temple.city}</p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleGenerateItinerary}
                disabled={generateItineraryMutation.isPending || !startDate || !endDate}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {generateItineraryMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Itinerary
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review Itinerary */}
        {step === 3 && generatedItinerary && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif text-gray-900">Your Sacred Journey</h2>
                  <p className="text-gray-600">
                    {selectedTemples.length} destinations • {totalDays} days
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              </div>

              <div className="mb-6">
                <Label>Itinerary Name (Optional)</Label>
                <Input
                  placeholder="e.g., North India Spiritual Tour"
                  value={itineraryName}
                  onChange={(e) => setItineraryName(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Route Overview */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Route className="w-4 h-4" />
                  Suggested Route
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {generatedItinerary.route?.map((city, idx) => (
                    <React.Fragment key={idx}>
                      <span className="font-medium text-blue-900">{city}</span>
                      {idx < generatedItinerary.route.length - 1 && (
                        <Navigation className="w-4 h-4 text-blue-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {generatedItinerary.total_distance && (
                  <p className="text-sm text-blue-700 mt-2">
                    Estimated total distance: {generatedItinerary.total_distance}
                  </p>
                )}
              </div>

              {/* Day by Day Plan */}
              <div className="space-y-6">
                {generatedItinerary.days?.map((day, dayIdx) => (
                  <div key={dayIdx} className="border-l-4 border-amber-500 pl-6">
                    <div className="bg-amber-50 -ml-[1.75rem] pl-[1.75rem] py-3 mb-4">
                      <h3 className="font-semibold text-lg">
                        Day {dayIdx + 1}: {day.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {day.location && `${day.location} • `}
                        {format(addDays(startDate, dayIdx), 'EEEE, MMM d')}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {day.activities?.map((activity, actIdx) => (
                        <Card key={actIdx} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{activity.name}</h4>
                                <span className="text-sm text-gray-500">{activity.time}</span>
                              </div>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                              {activity.location && (
                                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {activity.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Hotel for the day */}
                    {day.accommodation && (
                      <Card className="p-4 bg-blue-50 border-blue-200 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Hotel className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-blue-900">Accommodation</h4>
                        </div>
                        <p className="text-sm text-blue-800">{day.accommodation}</p>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back to Edit
              </Button>
              <Button
                onClick={() => saveItineraryMutation.mutate({
                  name: itineraryName || `Yatra to ${selectedTemples[0]?.name}`,
                  itinerary: generatedItinerary,
                  preferences: { temples: selectedTemples.map(t => t.name) }
                })}
                disabled={saveItineraryMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                {saveItineraryMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Itinerary
              </Button>
              <Link to={createPageUrl('ItineraryBooking')} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
                  Book Hotels & Travel
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}