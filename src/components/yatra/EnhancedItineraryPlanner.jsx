import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Map, 
  Users, 
  Calendar,
  Wallet,
  Compass,
  Building2,
  Clock,
  Star,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  GripVertical,
  Plus,
  X,
  Download,
  Edit,
  Coffee,
  Utensils,
  BedDouble,
  Camera
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

const DURATION_OPTIONS = [
  { value: '2', label: '2 Days' },
  { value: '3', label: '3 Days' },
  { value: '5', label: '5 Days' },
  { value: '7', label: '7 Days (1 Week)' },
  { value: '10', label: '10 Days' },
  { value: '14', label: '14 Days (2 Weeks)' }
];

const BUDGET_OPTIONS = [
  { value: 'economy', label: 'Economy', perDay: 2000, description: 'Basic hotels, public transport' },
  { value: 'standard', label: 'Standard', perDay: 5000, description: 'Good hotels, comfortable travel' },
  { value: 'luxury', label: 'Luxury', perDay: 10000, description: 'Premium stays, private transport' }
];

const THEME_OPTIONS = [
  { value: 'spiritual', label: 'Spiritual Only', description: 'Focus on temples and religious activities' },
  { value: 'spiritual_sightseeing', label: 'Spiritual + Sightseeing', description: 'Mix of temples and local attractions' },
  { value: 'family', label: 'Family Pilgrimage', description: 'Kid-friendly activities included' },
  { value: 'solo', label: 'Solo Spiritual Journey', description: 'Meditation and personal reflection time' }
];

const POPULAR_CIRCUITS = [
  'Char Dham Yatra',
  'Varanasi - Gaya - Prayagraj',
  'Tirupati - Srisailam - Ahobilam',
  'Golden Triangle Temples',
  'South India Temple Tour',
  'Shirdi - Nashik - Pandharpur'
];

export default function EnhancedItineraryPlanner({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    duration: '5',
    adults: 2,
    children: 0,
    seniors: 0,
    specialNeeds: [],
    budget: 'standard',
    theme: 'spiritual_sightseeing',
    mustVisit: [],
    customPlaces: '',
    startDate: null
  });
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const totalTravelers = formData.adults + formData.children + formData.seniors;
  const estimatedBudget = BUDGET_OPTIONS.find(b => b.value === formData.budget)?.perDay * parseInt(formData.duration) * totalTravelers;

  const generateItineraryMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed ${formData.duration}-day pilgrimage itinerary for ${totalTravelers} travelers (${formData.adults} adults, ${formData.children} children, ${formData.seniors} seniors).
        
Budget: ${formData.budget} (₹${BUDGET_OPTIONS.find(b => b.value === formData.budget)?.perDay}/day per person)
Theme: ${THEME_OPTIONS.find(t => t.value === formData.theme)?.label}
Must Visit: ${formData.mustVisit.length > 0 ? formData.mustVisit.join(', ') : formData.customPlaces || 'Popular temples in India'}
Special Needs: ${formData.specialNeeds.join(', ') || 'None'}

Create a day-by-day schedule with:
- Morning, afternoon, evening activities
- Specific timings (6 AM start)
- Temple visits with duration
- Meal recommendations
- Hotel suggestions
- Cultural programs if applicable

Return as JSON with structure: { days: [{ day: 1, activities: [{ time: "6:00 AM", activity: "...", type: "temple|meal|hotel|transport|sightseeing", duration: "2 hours", notes: "..." }] }], totalEstimate: number, hotels: [{ name, pricePerNight }], highlights: ["..."] }`,
        response_json_schema: {
          type: "object",
          properties: {
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  activities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        time: { type: "string" },
                        activity: { type: "string" },
                        type: { type: "string" },
                        duration: { type: "string" },
                        notes: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            totalEstimate: { type: "number" },
            hotels: { type: "array", items: { type: "object", properties: { name: { type: "string" }, pricePerNight: { type: "number" } } } },
            highlights: { type: "array", items: { type: "string" } }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedItinerary(data);
      setStep(4);
    },
    onError: () => {
      toast.error('Failed to generate itinerary. Please try again.');
    }
  });

  const handleGenerate = () => {
    generateItineraryMutation.mutate();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'temple': return <Building2 className="w-4 h-4 text-orange-600" />;
      case 'meal': return <Utensils className="w-4 h-4 text-green-600" />;
      case 'hotel': return <BedDouble className="w-4 h-4 text-blue-600" />;
      case 'sightseeing': return <Camera className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setGeneratedItinerary(null);
    setFormData({
      duration: '5',
      adults: 2,
      children: 0,
      seniors: 0,
      specialNeeds: [],
      budget: 'standard',
      theme: 'spiritual_sightseeing',
      mustVisit: [],
      customPlaces: '',
      startDate: null
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-600" />
            Plan My Pilgrimage
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s < step ? 'bg-orange-500 text-white' :
                  s === step ? 'bg-orange-100 text-orange-600 border-2 border-orange-500' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-orange-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Trip Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">How many days?</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, duration: opt.value })}
                    className={`p-3 rounded-lg text-center transition-all ${
                      formData.duration === opt.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 hover:bg-orange-100'
                    }`}
                  >
                    <p className="font-semibold">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Who is traveling?</Label>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Adults</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setFormData({ ...formData, adults: Math.max(1, formData.adults - 1) })}
                    >-</Button>
                    <span className="text-xl font-bold w-8 text-center">{formData.adults}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setFormData({ ...formData, adults: formData.adults + 1 })}
                    >+</Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Children</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setFormData({ ...formData, children: Math.max(0, formData.children - 1) })}
                    >-</Button>
                    <span className="text-xl font-bold w-8 text-center">{formData.children}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setFormData({ ...formData, children: formData.children + 1 })}
                    >+</Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Seniors (60+)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setFormData({ ...formData, seniors: Math.max(0, formData.seniors - 1) })}
                    >-</Button>
                    <span className="text-xl font-bold w-8 text-center">{formData.seniors}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setFormData({ ...formData, seniors: formData.seniors + 1 })}
                    >+</Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Any special needs?</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Wheelchair Access', 'Vegetarian Only', 'Jain Food', 'No Stairs', 'Medical Support'].map((need) => (
                  <button
                    key={need}
                    onClick={() => {
                      const needs = formData.specialNeeds.includes(need)
                        ? formData.specialNeeds.filter(n => n !== need)
                        : [...formData.specialNeeds, need];
                      setFormData({ ...formData, specialNeeds: needs });
                    }}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      formData.specialNeeds.includes(need)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 hover:bg-orange-100'
                    }`}
                  >
                    {need}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Theme */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Budget Range (per person per day)</Label>
              <div className="grid grid-cols-3 gap-4 mt-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <Card 
                    key={opt.value}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.budget === opt.value
                        ? 'border-2 border-orange-500 bg-orange-50'
                        : 'hover:border-orange-200'
                    }`}
                    onClick={() => setFormData({ ...formData, budget: opt.value })}
                  >
                    <h4 className="font-semibold">{opt.label}</h4>
                    <p className="text-2xl font-bold text-orange-600">₹{opt.perDay.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Travel Theme</Label>
              <RadioGroup 
                value={formData.theme} 
                onValueChange={(v) => setFormData({ ...formData, theme: v })}
                className="mt-3 space-y-3"
              >
                {THEME_OPTIONS.map((opt) => (
                  <div 
                    key={opt.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer ${
                      formData.theme === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                    onClick={() => setFormData({ ...formData, theme: opt.value })}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <div>
                      <Label htmlFor={opt.value} className="font-semibold cursor-pointer">{opt.label}</Label>
                      <p className="text-sm text-gray-500">{opt.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Card className="p-4 bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated Total Budget</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{estimatedBudget?.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                For {totalTravelers} travelers × {formData.duration} days
              </p>
            </Card>
          </div>
        )}

        {/* Step 3: Places */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Must-visit places</Label>
              <p className="text-sm text-gray-500 mb-3">Choose from popular circuits or add your own</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {POPULAR_CIRCUITS.map((circuit) => (
                  <button
                    key={circuit}
                    onClick={() => {
                      const places = formData.mustVisit.includes(circuit)
                        ? formData.mustVisit.filter(p => p !== circuit)
                        : [...formData.mustVisit, circuit];
                      setFormData({ ...formData, mustVisit: places });
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.mustVisit.includes(circuit)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 hover:bg-orange-100'
                    }`}
                  >
                    {circuit}
                  </button>
                ))}
              </div>

              <div>
                <Label>Or type specific temples/places</Label>
                <Textarea
                  value={formData.customPlaces}
                  onChange={(e) => setFormData({ ...formData, customPlaces: e.target.value })}
                  placeholder="e.g., Tirupati, Shirdi, Varanasi Kashi Vishwanath..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>

            <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="font-semibold">AI-Powered Planning</h4>
                  <p className="text-sm text-gray-600">
                    Our AI will create a personalized day-by-day itinerary with optimal timing, 
                    hotel suggestions, and local recommendations.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Generated Itinerary */}
        {step === 4 && generatedItinerary && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Your {formData.duration}-Day Itinerary</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="w-4 h-4 mr-1" />
                  {isEditing ? 'Done' : 'Customize'}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Highlights */}
            {generatedItinerary.highlights && (
              <div className="flex flex-wrap gap-2">
                {generatedItinerary.highlights.map((h, i) => (
                  <Badge key={i} className="bg-orange-100 text-orange-700">{h}</Badge>
                ))}
              </div>
            )}

            {/* Day-by-Day */}
            <div className="space-y-4">
              {generatedItinerary.days?.map((day) => (
                <Card key={day.day} className="p-4">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Day {day.day}
                  </h4>
                  <div className="space-y-2">
                    {day.activities?.map((activity, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-3 p-2 rounded-lg ${
                          isEditing ? 'bg-gray-50 cursor-move' : ''
                        }`}
                      >
                        {isEditing && <GripVertical className="w-4 h-4 text-gray-400 mt-1" />}
                        <div className="w-16 text-sm text-gray-500 font-medium">{activity.time}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type)}
                            <span className="font-medium">{activity.activity}</span>
                            <Badge variant="outline" className="text-xs">{activity.duration}</Badge>
                          </div>
                          {activity.notes && (
                            <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                          )}
                        </div>
                        {isEditing && (
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button variant="ghost" className="w-full text-orange-600">
                        <Plus className="w-4 h-4 mr-1" /> Add Activity
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Booking Summary */}
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <h4 className="font-semibold mb-3">Book Everything Together</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temples & Activities</span>
                  <span className="font-medium">₹{Math.round(estimatedBudget * 0.3).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hotels ({formData.duration} nights)</span>
                  <span className="font-medium">₹{Math.round(estimatedBudget * 0.5).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transport & Misc</span>
                  <span className="font-medium">₹{Math.round(estimatedBudget * 0.2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Estimate</span>
                  <span className="text-xl text-green-600">₹{estimatedBudget?.toLocaleString()}</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                Book All & Get Consolidated Itinerary PDF
              </Button>
            </Card>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={generateItineraryMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
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
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Modify Preferences
            </Button>
            <Button onClick={resetAndClose} className="bg-orange-500 hover:bg-orange-600">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}