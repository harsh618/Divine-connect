import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Clock, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const categories = [
  { id: 'sacred_walks', label: 'Sacred Walks', icon: '🚶', color: 'bg-purple-100 text-purple-700' },
  { id: 'ghats', label: 'Ghats', icon: '🌊', color: 'bg-blue-100 text-blue-700' },
  { id: 'aarti', label: 'Aarti', icon: '🪔', color: 'bg-orange-100 text-orange-700' },
  { id: 'markets', label: 'Local Markets', icon: '🛍️', color: 'bg-green-100 text-green-700' }
];

const vibes = [
  { id: 'adventurous', label: 'Adventurous', icon: '⛰️', color: 'bg-red-100 text-red-700' },
  { id: 'peaceful', label: 'Peace/Meditation', icon: '🧘', color: 'bg-blue-100 text-blue-700' },
  { id: 'festive', label: 'Occasion/Festival', icon: '🎉', color: 'bg-pink-100 text-pink-700' }
];

export default function ItineraryPlannerModal({ isOpen, onClose, temple }) {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [itinerary, setItinerary] = useState(null);

  const planItineraryMutation = useMutation({
    mutationFn: async (data) => {
      return base44.functions.invoke('generateItinerary', data);
    },
    onSuccess: (response) => {
      setItinerary(response.data.itinerary);
      setStep(3);
    },
    onError: () => {
      toast.error('Failed to generate itinerary. Please try again.');
    }
  });

  const handleGenerateItinerary = () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    const numDays = differenceInDays(endDate, startDate) + 1;

    planItineraryMutation.mutate({
      temple_name: temple.name,
      temple_location: `${temple.city}, ${temple.state}`,
      num_days: numDays,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      categories: selectedCategories,
      vibe: selectedVibe
    });
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleReset = () => {
    setStep(1);
    setStartDate(null);
    setEndDate(null);
    setSelectedCategories([]);
    setSelectedVibe(null);
    setItinerary(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Plan Your Trip to {temple.name}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-3 block text-base font-normal">Select Your Travel Dates</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-lg border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">End Date</Label>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date < startDate}
                    className="rounded-lg border"
                  />
                </div>
              </div>
              {startDate && endDate && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  {differenceInDays(endDate, startDate) + 1} day{differenceInDays(endDate, startDate) !== 0 ? 's' : ''} trip
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!startDate || !endDate}>
                Next: Select Preferences
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 py-4">
            <div>
              <Label className="mb-4 block text-base font-normal">Select Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-4 py-2.5 cursor-pointer text-sm font-light transition-all ${
                      selectedCategories.includes(category.id)
                        ? category.color + ' border-2 border-current'
                        : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-4 block text-base font-normal">Select Your Vibe</Label>
              <div className="flex flex-wrap gap-2">
                {vibes.map((vibe) => (
                  <Badge
                    key={vibe.id}
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={`px-4 py-2.5 cursor-pointer text-sm font-light transition-all ${
                      selectedVibe === vibe.id
                        ? vibe.color + ' border-2 border-current'
                        : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                    }`}
                  >
                    <span className="mr-2">{vibe.icon}</span>
                    {vibe.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleGenerateItinerary}
                disabled={planItineraryMutation.isPending || selectedCategories.length === 0}
              >
                {planItineraryMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Itinerary'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && itinerary && (
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
            {itinerary.days?.map((day, dayIdx) => (
              <div key={dayIdx} className="space-y-4">
                <div className="sticky top-0 bg-primary/10 backdrop-blur-sm px-4 py-3 -mx-4 z-10">
                  <h3 className="font-normal text-lg tracking-wide">
                    {day.title}
                  </h3>
                </div>
                <div className="space-y-3 relative pl-8 border-l-2 border-border ml-2">
                  {day.activities?.map((activity, actIdx) => (
                    <div key={actIdx} className="relative">
                      <div className="absolute -left-[2.3rem] top-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Clock className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <Card className="p-4 hover:border-primary/50 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-light mb-1">
                              {activity.time}
                            </p>
                            <h4 className="font-normal text-base">{activity.name}</h4>
                          </div>
                          {activity.category && (
                            <Badge variant="secondary" className="text-xs font-light">
                              {activity.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                          {activity.description}
                        </p>
                        {activity.location && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </div>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-background">
              <Button variant="outline" onClick={handleReset}>
                Plan Another Trip
              </Button>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}