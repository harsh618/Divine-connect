import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, Building2, Hotel, Utensils, MapPin, Clock, 
  Edit2, Check, X, ChevronDown, ChevronUp, Loader2, Sun, Moon
} from 'lucide-react';
import { format, addDays } from 'date-fns';

const GOLD = '#FF9933';

const INTERESTS = [
  { id: 'temples', label: 'Temple Visits', icon: '🛕' },
  { id: 'spiritual', label: 'Spiritual Activities', icon: '🕉️' },
  { id: 'relaxation', label: 'Relaxation', icon: '🧘' },
  { id: 'local_food', label: 'Local Cuisine', icon: '🍛' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'sightseeing', label: 'Sightseeing', icon: '📸' },
];

export default function AIItineraryGenerator({ 
  city, 
  dates, 
  temples, 
  hotels, 
  onItineraryGenerated 
}) {
  const [selectedInterests, setSelectedInterests] = useState(['temples', 'spiritual']);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [expandedDays, setExpandedDays] = useState({});

  const generateMutation = useMutation({
    mutationFn: async () => {
      const tripDays = dates.start && dates.end 
        ? Math.ceil((dates.end - dates.start) / (1000 * 60 * 60 * 24)) + 1 
        : 3;

      const templeNames = temples?.slice(0, 5).map(t => t.name).join(', ') || 'local temples';
      const hotelNames = hotels?.slice(0, 3).map(h => h.name).join(', ') || 'nearby hotels';
      
      const prompt = `Create a ${tripDays}-day pilgrimage itinerary for ${city}, India.

User interests: ${selectedInterests.join(', ')}

Available temples: ${templeNames}
Available hotels: ${hotelNames}

Create a detailed day-by-day itinerary with:
- Morning activities (temple darshan, yoga, meditation)
- Afternoon activities (sightseeing, local experiences)
- Evening activities (aarti, relaxation)
- Suggested meals and local food recommendations
- Hotel check-in/check-out details

Make it spiritual, practical, and enjoyable. Include timing recommendations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day_number: { type: "number" },
                  date: { type: "string" },
                  title: { type: "string" },
                  morning: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      activity: { type: "string" },
                      location: { type: "string" },
                      tips: { type: "string" }
                    }
                  },
                  afternoon: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      activity: { type: "string" },
                      location: { type: "string" },
                      tips: { type: "string" }
                    }
                  },
                  evening: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      activity: { type: "string" },
                      location: { type: "string" },
                      tips: { type: "string" }
                    }
                  },
                  meals: {
                    type: "array",
                    items: { type: "string" }
                  },
                  hotel_note: { type: "string" }
                }
              }
            },
            tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Add actual dates to the response
      if (response.days && dates.start) {
        response.days = response.days.map((day, idx) => ({
          ...day,
          date: format(addDays(dates.start, idx), 'EEE, MMM d')
        }));
      }

      return response;
    },
    onSuccess: (data) => {
      setGeneratedItinerary(data);
      // Expand first day by default
      setExpandedDays({ 1: true });
      if (onItineraryGenerated) onItineraryGenerated(data);
    }
  });

  const toggleInterest = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const startEditing = (dayNum, content) => {
    setEditingDay(dayNum);
    setEditedContent(JSON.stringify(content, null, 2));
  };

  const saveEdit = (dayNum) => {
    try {
      const parsed = JSON.parse(editedContent);
      setGeneratedItinerary(prev => ({
        ...prev,
        days: prev.days.map(d => d.day_number === dayNum ? { ...d, ...parsed } : d)
      }));
      setEditingDay(null);
    } catch {
      // Invalid JSON, don't save
    }
  };

  if (!city || !dates.start) {
    return (
      <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: GOLD }} />
          <h3 className="font-semibold text-gray-800 mb-2">AI Itinerary Generator</h3>
          <p className="text-sm text-gray-500">Select a city and dates to generate your personalized itinerary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interest Selection */}
      {!generatedItinerary && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: GOLD }}>
              <Sparkles className="w-5 h-5" />
              Generate AI Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Select your interests for a personalized trip:</p>
            
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedInterests.includes(interest.id)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  {interest.icon} {interest.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || selectedInterests.length === 0}
              className="w-full h-12 text-white font-semibold"
              style={{ backgroundColor: GOLD }}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating your itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {generateMutation.isPending && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {/* Generated Itinerary */}
      <AnimatePresence>
        {generatedItinerary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header */}
            <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">{generatedItinerary.title}</h2>
                <p className="opacity-90">{generatedItinerary.summary}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setGeneratedItinerary(null)}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Days */}
            {generatedItinerary.days?.map((day) => (
              <motion.div
                key={day.day_number}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: day.day_number * 0.1 }}
              >
                <Card className="overflow-hidden border-orange-100">
                  <button
                    onClick={() => toggleDay(day.day_number)}
                    className="w-full p-4 flex items-center justify-between bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: GOLD }}
                      >
                        {day.day_number}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800">{day.title}</h3>
                        <p className="text-sm text-gray-500">{day.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(day.day_number, day);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {expandedDays[day.day_number] ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedDays[day.day_number] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {editingDay === day.day_number ? (
                          <CardContent className="p-4 space-y-4">
                            <Textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="min-h-[200px] font-mono text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(day.day_number)}
                                style={{ backgroundColor: GOLD }}
                                className="text-white"
                              >
                                <Check className="w-4 h-4 mr-1" /> Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingDay(null)}
                              >
                                <X className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                            </div>
                          </CardContent>
                        ) : (
                          <CardContent className="p-4 space-y-4">
                            {/* Morning */}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <Sun className="w-5 h-5 text-yellow-600" />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-yellow-600">Morning</span>
                                  <Badge variant="outline" className="text-xs">{day.morning?.time}</Badge>
                                </div>
                                <p className="font-semibold text-gray-800">{day.morning?.activity}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" /> {day.morning?.location}
                                </p>
                                {day.morning?.tips && (
                                  <p className="text-xs text-orange-600 mt-1">💡 {day.morning.tips}</p>
                                )}
                              </div>
                            </div>

                            {/* Afternoon */}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                  <Sun className="w-5 h-5 text-orange-600" />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-orange-600">Afternoon</span>
                                  <Badge variant="outline" className="text-xs">{day.afternoon?.time}</Badge>
                                </div>
                                <p className="font-semibold text-gray-800">{day.afternoon?.activity}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" /> {day.afternoon?.location}
                                </p>
                                {day.afternoon?.tips && (
                                  <p className="text-xs text-orange-600 mt-1">💡 {day.afternoon.tips}</p>
                                )}
                              </div>
                            </div>

                            {/* Evening */}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Moon className="w-5 h-5 text-purple-600" />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-purple-600">Evening</span>
                                  <Badge variant="outline" className="text-xs">{day.evening?.time}</Badge>
                                </div>
                                <p className="font-semibold text-gray-800">{day.evening?.activity}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" /> {day.evening?.location}
                                </p>
                                {day.evening?.tips && (
                                  <p className="text-xs text-orange-600 mt-1">💡 {day.evening.tips}</p>
                                )}
                              </div>
                            </div>

                            {/* Meals */}
                            {day.meals?.length > 0 && (
                              <div className="bg-orange-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">🍽️ Meal Suggestions</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {day.meals.map((meal, idx) => (
                                    <li key={idx}>• {meal}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Hotel Note */}
                            {day.hotel_note && (
                              <div className="flex items-start gap-2 text-sm text-gray-600">
                                <Hotel className="w-4 h-4 mt-0.5" style={{ color: GOLD }} />
                                {day.hotel_note}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}

            {/* Tips */}
            {generatedItinerary.tips?.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">💡 Travel Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {generatedItinerary.tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}