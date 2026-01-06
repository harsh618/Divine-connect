import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Hotel, Train, Plus, Trash2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function YatraItineraryBuilder({ isOpen, onClose, preselectedTemple }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [itinerary, setItinerary] = useState({
    title: '',
    start_date: '',
    end_date: '',
    temples: preselectedTemple ? [{
      temple_id: preselectedTemple.id,
      temple_name: preselectedTemple.name,
      visit_date: ''
    }] : [],
    hotels: [],
    trains: [],
    total_estimated_cost: 0
  });

  const createItineraryMutation = useMutation({
    mutationFn: (data) => base44.entities.YatraItinerary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yatraItineraries'] });
      toast.success('Yatra itinerary created!');
      onClose();
    }
  });

  const addHotel = () => {
    setItinerary(prev => ({
      ...prev,
      hotels: [...prev.hotels, {
        hotel_name: '',
        check_in: '',
        check_out: '',
        booking_status: 'planned'
      }]
    }));
  };

  const addTrain = () => {
    setItinerary(prev => ({
      ...prev,
      trains: [...prev.trains, {
        train_name: '',
        train_number: '',
        from_city: '',
        to_city: '',
        departure_date: '',
        departure_time: '',
        booking_status: 'planned'
      }]
    }));
  };

  const handleSubmit = () => {
    createItineraryMutation.mutate(itinerary);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            Plan Your Divine Yatra
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {['Basic Info', 'Hotels', 'Travel', 'Review'].map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > idx + 1 ? 'bg-green-500 text-white' :
                step === idx + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              {idx < 3 && <div className={`w-20 h-1 ${step > idx + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Yatra Title</Label>
              <Input
                placeholder="e.g., Char Dham Yatra 2026"
                value={itinerary.title}
                onChange={(e) => setItinerary(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={itinerary.start_date}
                  onChange={(e) => setItinerary(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={itinerary.end_date}
                  onChange={(e) => setItinerary(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            {preselectedTemple && (
              <Card className="p-3 bg-orange-50 border-orange-200">
                <p className="text-sm text-gray-700">
                  ✨ <strong>{preselectedTemple.name}</strong> added to your itinerary
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Hotels */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Accommodation</h3>
              <Button onClick={addHotel} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Hotel
              </Button>
            </div>
            {itinerary.hotels.map((hotel, idx) => (
              <Card key={idx} className="p-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Hotel Name"
                    value={hotel.hotel_name}
                    onChange={(e) => {
                      const newHotels = [...itinerary.hotels];
                      newHotels[idx].hotel_name = e.target.value;
                      setItinerary(prev => ({ ...prev, hotels: newHotels }));
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      placeholder="Check-in"
                      value={hotel.check_in}
                      onChange={(e) => {
                        const newHotels = [...itinerary.hotels];
                        newHotels[idx].check_in = e.target.value;
                        setItinerary(prev => ({ ...prev, hotels: newHotels }));
                      }}
                    />
                    <Input
                      type="date"
                      placeholder="Check-out"
                      value={hotel.check_out}
                      onChange={(e) => {
                        const newHotels = [...itinerary.hotels];
                        newHotels[idx].check_out = e.target.value;
                        setItinerary(prev => ({ ...prev, hotels: newHotels }));
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
            {itinerary.hotels.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No hotels added yet. Click "Add Hotel" to start.</p>
            )}
          </div>
        )}

        {/* Step 3: Travel */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Train Bookings</h3>
              <Button onClick={addTrain} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Train
              </Button>
            </div>
            {itinerary.trains.map((train, idx) => (
              <Card key={idx} className="p-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Train Name"
                      value={train.train_name}
                      onChange={(e) => {
                        const newTrains = [...itinerary.trains];
                        newTrains[idx].train_name = e.target.value;
                        setItinerary(prev => ({ ...prev, trains: newTrains }));
                      }}
                    />
                    <Input
                      placeholder="Train Number"
                      value={train.train_number}
                      onChange={(e) => {
                        const newTrains = [...itinerary.trains];
                        newTrains[idx].train_number = e.target.value;
                        setItinerary(prev => ({ ...prev, trains: newTrains }));
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="From City"
                      value={train.from_city}
                      onChange={(e) => {
                        const newTrains = [...itinerary.trains];
                        newTrains[idx].from_city = e.target.value;
                        setItinerary(prev => ({ ...prev, trains: newTrains }));
                      }}
                    />
                    <Input
                      placeholder="To City"
                      value={train.to_city}
                      onChange={(e) => {
                        const newTrains = [...itinerary.trains];
                        newTrains[idx].to_city = e.target.value;
                        setItinerary(prev => ({ ...prev, trains: newTrains }));
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={train.departure_date}
                      onChange={(e) => {
                        const newTrains = [...itinerary.trains];
                        newTrains[idx].departure_date = e.target.value;
                        setItinerary(prev => ({ ...prev, trains: newTrains }));
                      }}
                    />
                    <Input
                      type="time"
                      value={train.departure_time}
                      onChange={(e) => {
                        const newTrains = [...itinerary.trains];
                        newTrains[idx].departure_time = e.target.value;
                        setItinerary(prev => ({ ...prev, trains: newTrains }));
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
            {itinerary.trains.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No trains added yet. Click "Add Train" to start.</p>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50">
              <h3 className="font-semibold text-lg mb-2">{itinerary.title}</h3>
              <p className="text-sm text-gray-600">
                {itinerary.start_date} to {itinerary.end_date}
              </p>
            </Card>
            <div>
              <h4 className="font-medium mb-2">Temples: {itinerary.temples.length}</h4>
              <h4 className="font-medium mb-2">Hotels: {itinerary.hotels.length}</h4>
              <h4 className="font-medium mb-2">Trains: {itinerary.trains.length}</h4>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
            className="bg-gradient-to-r from-orange-500 to-amber-600"
            disabled={step === 1 && (!itinerary.title || !itinerary.start_date || !itinerary.end_date)}
          >
            {step === 4 ? 'Create Itinerary' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}