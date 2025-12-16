import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Calendar, Clock, MapPin, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';

export default function KundliGenerator() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    chart_type: 'north_indian'
  });
  const [generatedKundli, setGeneratedKundli] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      // Generate predictions using LLM
      const predictions = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate detailed Vedic astrology predictions for a person with the following birth details:
        
Name: ${data.name}
Birth Date: ${data.birth_date}
Birth Time: ${data.birth_time}
Birth Place: ${data.birth_place}

Provide comprehensive predictions covering:
1. Personality traits and characteristics
2. Career and professional life
3. Health and wellness
4. Relationships and marriage
5. Financial prospects
6. Lucky colors, numbers, and gemstones
7. General life path and guidance

Make the predictions detailed, insightful, and based on Vedic astrology principles.`,
        response_json_schema: {
          type: "object",
          properties: {
            rashi: { type: "string" },
            nakshatra: { type: "string" },
            personality: { type: "string" },
            career: { type: "string" },
            health: { type: "string" },
            relationships: { type: "string" },
            finances: { type: "string" },
            lucky_colors: { type: "array", items: { type: "string" } },
            lucky_numbers: { type: "array", items: { type: "number" } },
            lucky_gemstones: { type: "array", items: { type: "string" } },
            general_guidance: { type: "string" }
          }
        }
      });

      // Create Kundli record
      const kundli = await base44.entities.Kundli.create({
        user_id: user.id,
        name: data.name,
        birth_date: data.birth_date,
        birth_time: data.birth_time,
        birth_place: data.birth_place,
        chart_type: data.chart_type,
        rashi: predictions.rashi,
        nakshatra: predictions.nakshatra,
        predictions_text: JSON.stringify(predictions)
      });

      return { kundli, predictions };
    },
    onSuccess: ({ kundli, predictions }) => {
      toast.success('Kundli generated successfully!');
      setGeneratedKundli({ ...kundli, predictions });
      queryClient.invalidateQueries(['kundlis']);
    },
    onError: () => {
      toast.error('Failed to generate Kundli. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birth_date || !formData.birth_time || !formData.birth_place) {
      toast.error('Please fill all required fields');
      return;
    }
    generateMutation.mutate(formData);
  };

  const handleDownload = () => {
    // Simple text-based download
    const content = `
KUNDLI REPORT
=============

Personal Details:
Name: ${generatedKundli.name}
Birth Date: ${generatedKundli.birth_date}
Birth Time: ${generatedKundli.birth_time}
Birth Place: ${generatedKundli.birth_place}

Astrological Details:
Rashi (Moon Sign): ${generatedKundli.predictions.rashi}
Nakshatra (Birth Star): ${generatedKundli.predictions.nakshatra}

PREDICTIONS:
============

Personality & Characteristics:
${generatedKundli.predictions.personality}

Career & Professional Life:
${generatedKundli.predictions.career}

Health & Wellness:
${generatedKundli.predictions.health}

Relationships & Marriage:
${generatedKundli.predictions.relationships}

Financial Prospects:
${generatedKundli.predictions.finances}

Lucky Colors: ${generatedKundli.predictions.lucky_colors?.join(', ')}
Lucky Numbers: ${generatedKundli.predictions.lucky_numbers?.join(', ')}
Lucky Gemstones: ${generatedKundli.predictions.lucky_gemstones?.join(', ')}

General Guidance:
${generatedKundli.predictions.general_guidance}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kundli-${generatedKundli.name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-16 px-6">
        <div className="container mx-auto">
          <BackButton label="Back" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                Generate Your Kundli
              </h1>
              <p className="text-white/80 mt-1">Get your personalized birth chart and predictions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <div className="max-w-4xl mx-auto">
          {!generatedKundli ? (
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="birth_date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Birth Date *
                    </Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birth_time" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Birth Time *
                    </Label>
                    <Input
                      id="birth_time"
                      type="time"
                      value={formData.birth_time}
                      onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="birth_place" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Birth Place *
                  </Label>
                  <Input
                    id="birth_place"
                    value={formData.birth_place}
                    onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                    placeholder="City, Country"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="chart_type">Chart Type</Label>
                  <Select value={formData.chart_type} onValueChange={(v) => setFormData({ ...formData, chart_type: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north_indian">North Indian</SelectItem>
                      <SelectItem value="south_indian">South Indian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-amber-500 hover:bg-amber-600 py-6 text-lg"
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Kundli...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Kundli
                    </>
                  )}
                </Button>
              </form>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Header Card */}
              <Card className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{generatedKundli.name}</h2>
                    <p className="text-white/80">
                      Born on {new Date(generatedKundli.birth_date).toLocaleDateString()} at {generatedKundli.birth_time}
                    </p>
                    <p className="text-white/80">{generatedKundli.birth_place}</p>
                  </div>
                  <Button variant="secondary" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>

              {/* Astrological Details */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Astrological Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600">Rashi (Moon Sign)</p>
                    <p className="text-lg font-semibold text-amber-700">{generatedKundli.predictions.rashi}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600">Nakshatra (Birth Star)</p>
                    <p className="text-lg font-semibold text-amber-700">{generatedKundli.predictions.nakshatra}</p>
                  </div>
                </div>
              </Card>

              {/* Predictions */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Personality & Characteristics</h3>
                <p className="text-gray-600 leading-relaxed">{generatedKundli.predictions.personality}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Career & Professional Life</h3>
                <p className="text-gray-600 leading-relaxed">{generatedKundli.predictions.career}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Health & Wellness</h3>
                <p className="text-gray-600 leading-relaxed">{generatedKundli.predictions.health}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Relationships & Marriage</h3>
                <p className="text-gray-600 leading-relaxed">{generatedKundli.predictions.relationships}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Financial Prospects</h3>
                <p className="text-gray-600 leading-relaxed">{generatedKundli.predictions.finances}</p>
              </Card>

              {/* Lucky Elements */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Lucky Elements</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Lucky Colors:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedKundli.predictions.lucky_colors?.map((color, idx) => (
                        <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Lucky Numbers:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedKundli.predictions.lucky_numbers?.map((num, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Lucky Gemstones:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {generatedKundli.predictions.lucky_gemstones?.map((gem, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {gem}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* General Guidance */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">General Guidance</h3>
                <p className="text-gray-600 leading-relaxed">{generatedKundli.predictions.general_guidance}</p>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setGeneratedKundli(null);
                    setFormData({ name: '', birth_date: '', birth_time: '', birth_place: '', chart_type: 'north_indian' });
                  }}
                >
                  Generate Another
                </Button>
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}