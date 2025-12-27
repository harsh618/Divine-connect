import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, MapPin, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const categories = [
  { id: 'ghats', label: 'Ghats & River Sites', icon: '🌊' },
  { id: 'aarti', label: 'Aarti Spots', icon: '🪔' },
  { id: 'markets', label: 'Local Markets', icon: '🛍️' },
  { id: 'ashrams', label: 'Ashrams & Spiritual Centers', icon: '🕉️' },
  { id: 'temples', label: 'Other Temples', icon: '🏛️' },
  { id: 'museums', label: 'Museums & Heritage', icon: '🏺' },
  { id: 'food', label: 'Local Cuisine', icon: '🍽️' },
  { id: 'nature', label: 'Parks & Nature', icon: '🌳' }
];

export default function ItineraryPlannerModal({ isOpen, onClose, temple }) {
  const [step, setStep] = useState(1);
  const [numDays, setNumDays] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
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
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    planItineraryMutation.mutate({
      temple_name: temple.name,
      temple_location: `${temple.city}, ${temple.state}`,
      num_days: numDays,
      start_date: format(startDate, 'yyyy-MM-dd'),
      categories: selectedCategories
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
    setNumDays(1);
    setStartDate(null);
    setSelectedCategories([]);
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
              <Label className="mb-2 block">Number of Days</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((day) => (
                  <Button
                    key={day}
                    variant={numDays === day ? 'default' : 'outline'}
                    onClick={() => setNumDays(day)}
                    className="flex-1"
                  >
                    {day} {day === 1 ? 'Day' : 'Days'}
                  </Button>
                ))}
              </div>
            </div>

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

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setStep(2)}>
                Next: Select Categories
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-4 block">Select Categories of Interest</Label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedCategories.includes(category.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleGenerateItinerary}
                disabled={planItineraryMutation.isPending}
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
          <div className="space-y-6 py-4">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{itinerary}</ReactMarkdown>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
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