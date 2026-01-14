import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles,
  Mountain,
  Waves,
  TreePine,
  Loader2,
  Clock,
  Utensils,
  Check,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MOODS = [
  { value: 'peaceful', label: 'Peaceful & Meditative', icon: TreePine, color: 'bg-green-100 text-green-700' },
  { value: 'festive', label: 'Festive & Crowded', icon: Sparkles, color: 'bg-orange-100 text-orange-700' },
  { value: 'adventurous', label: 'Adventurous', icon: Mountain, color: 'bg-blue-100 text-blue-700' },
  { value: 'spiritual', label: 'Deeply Spiritual', icon: TreePine, color: 'bg-purple-100 text-purple-700' }
];

const THEMES = [
  { value: 'river_ghats', label: 'River & Ghats', description: 'Varanasi, Haridwar style' },
  { value: 'mountain', label: 'Mountain Temples', description: 'Char Dham, Himalayas' },
  { value: 'beach_nearby', label: 'Coastal Temples', description: 'Konark, Rameshwaram' },
  { value: 'pilgrimage', label: 'Traditional Circuit', description: 'Multiple temples' }
];

const INTERESTS = [
  { value: 'temples', label: 'Temple Darshans' },
  { value: 'ghats', label: 'Ghats & Rivers' },
  { value: 'aarti', label: 'Aarti Ceremonies' },
  { value: 'markets', label: 'Local Markets' },
  { value: 'food', label: 'Local Cuisine' },
  { value: 'meditation', label: 'Meditation' }
];

/**
 * AI Itinerary Planner Modal
 * Generates personalized spiritual trip itineraries
 */
export default function AIItineraryPlannerModal({ isOpen, onClose, defaultLocation = '' }) {
  const [step, setStep] = useState(1);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    num_days: 3,
    adults: 2,
    children: 0,
    mood: 'peaceful',
    theme: 'pilgrimage',
    base_location: defaultLocation,
    budget_level: 'moderate',
    start_date: '',
    interests: ['temples', 'aarti']
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('enhancedItineraryPlanner', formData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.itinerary) {
        setGeneratedItinerary(data.itinerary);
        setStep(3);
      } else {
        toast.error('Failed to generate itinerary');
      }
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    }
  });

  const handleGenerate = () => {
    if (!formData.base_location) {
      toast.error('Please enter your destination');
      return;
    }
    if (!formData.num_days || formData.num_days < 1) {
      toast.error('Please enter valid number of days');
      return;
    }
    generateMutation.mutate();
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label className="font-semibold mb-3 block">Where are you going?</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="e.g., Varanasi, Ayodhya, Tirupati"
            value={formData.base_location}
            onChange={(e) => setFormData(prev => ({ ...prev, base_location: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-semibold mb-3 block">Number of Days</Label>
          <Select 
            value={String(formData.num_days)} 
            onValueChange={(val) => setFormData(prev => ({ ...prev, num_days: Number(val) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 10, 14].map(d => (
                <SelectItem key={d} value={String(d)}>{d} day{d > 1 ? 's' : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-semibold mb-3 block">Start Date (Optional)</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label className="font-semibold mb-3 block">Group Size</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-gray-500 mb-1 block">Adults</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={formData.adults}
              onChange={(e) => setFormData(prev => ({ ...prev, adults: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label className="text-sm text-gray-500 mb-1 block">Children</Label>
            <Input
              type="number"
              min="0"
              max="10"
              value={formData.children}
              onChange={(e) => setFormData(prev => ({ ...prev, children: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="font-semibold mb-3 block">What's Your Mood?</Label>
        <div className="grid grid-cols-2 gap-3">
          {MOODS.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.value}
                onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.mood === mood.value 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5 text-amber-600" />
                  <span className="font-medium">{mood.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="font-semibold mb-3 block">Preferred Theme</Label>
        <div className="space-y-2">
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              onClick={() => setFormData(prev => ({ ...prev, theme: theme.value }))}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                formData.theme === theme.value 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <span className="font-medium">{theme.label}</span>
              <p className="text-sm text-gray-500">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="font-semibold mb-3 block">What interests you?</Label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <button
              key={interest.value}
              onClick={() => toggleInterest(interest.value)}
              className={`px-4 py-2 rounded-full border transition-all ${
                formData.interests.includes(interest.value)
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white border-gray-200 hover:border-amber-300'
              }`}
            >
              {interest.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="font-semibold mb-3 block">Budget Level</Label>
        <Select 
          value={formData.budget_level} 
          onValueChange={(val) => setFormData(prev => ({ ...prev, budget_level: val }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget">Budget-Friendly</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderItinerary = () => {
    if (!generatedItinerary) return null;
    
    const itinerary = generatedItinerary;
    
    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Overview */}
        {itinerary.overview && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2">Trip Overview</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-600">Destination:</span> <span className="font-medium">{itinerary.overview.destination}</span></div>
              <div><span className="text-gray-600">Duration:</span> <span className="font-medium">{itinerary.overview.duration}</span></div>
              <div><span className="text-gray-600">Best Time:</span> <span className="font-medium">{itinerary.overview.best_time_to_visit}</span></div>
              <div><span className="text-gray-600">Budget:</span> <span className="font-medium">{itinerary.overview.estimated_budget}</span></div>
            </div>
            {itinerary.overview.highlights && (
              <div className="mt-3">
                <span className="text-sm text-gray-600">Highlights: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {itinerary.overview.highlights.map((h, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{h}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Daily Itinerary */}
        {itinerary.days?.map((day, dayIdx) => (
          <Card key={dayIdx} className="p-4 border">
            <h4 className="font-semibold text-lg mb-3">{day.title}</h4>
            {day.theme && <p className="text-sm text-gray-500 mb-4">{day.theme}</p>}
            
            <div className="space-y-3">
              {day.activities?.map((activity, actIdx) => (
                <div key={actIdx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 text-center">
                    <Clock className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                    <span className="text-xs text-gray-600">{activity.time}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{activity.name}</h5>
                      {activity.category && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.tips && (
                      <p className="text-xs text-amber-600 mt-1">💡 {activity.tips}</p>
                    )}
                    {activity.location && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {activity.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {day.meals && (
              <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600">B:</span> {day.meals.breakfast}
                </div>
              </div>
            )}
          </Card>
        ))}

        {/* Packing List */}
        {itinerary.packing_list && (
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Packing List</h4>
            <div className="flex flex-wrap gap-2">
              {itinerary.packing_list.map((item, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">{item}</span>
              ))}
            </div>
          </Card>
        )}

        {/* Tips */}
        {itinerary.important_tips && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Important Tips</h4>
            <ul className="space-y-1">
              {itinerary.important_tips.map((tip, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            {step === 3 ? 'Your Itinerary' : 'AI Trip Planner'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Tell us about your trip'}
            {step === 2 && 'Customize your experience'}
            {step === 3 && `${formData.num_days}-day itinerary for ${formData.base_location}`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        {step < 3 && (
          <div className="flex gap-2 mb-4">
            {[1, 2].map((s) => (
              <div 
                key={s}
                className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-amber-500' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderItinerary()}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          {step > 1 && step < 3 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step === 3 ? (
            <>
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Start Over
              </Button>
              <Button onClick={onClose} className="flex-1 bg-amber-600 hover:bg-amber-700">
                Done
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => step === 2 ? handleGenerate() : setStep(step + 1)}
              disabled={generateMutation.isPending}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : step === 2 ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Itinerary
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}