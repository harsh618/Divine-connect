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
import { 
  Sparkles, 
  Loader2,
  CheckCircle,
  Download,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

const rashis = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)', 
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

const nakshatras = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 
  'Uttara Bhadrapada', 'Revati'
];

export default function KundliGenerator() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
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
      // Simulate calculation
      const randomRashi = rashis[Math.floor(Math.random() * rashis.length)];
      const randomNakshatra = nakshatras[Math.floor(Math.random() * nakshatras.length)];
      
      const kundliData = {
        ...data,
        user_id: user.id,
        rashi: randomRashi,
        nakshatra: randomNakshatra,
        predictions_text: `Birth Chart Analysis for ${data.name}:\n\nYour Rashi (Moon Sign) is ${randomRashi}, which indicates a balanced and harmonious personality. Your Nakshatra is ${randomNakshatra}, suggesting strong intuition and spiritual inclinations.\n\nKey Strengths: Leadership, creativity, compassion\nAreas for Growth: Patience, financial planning\n\nRecommendations: Wear gemstones associated with your Rashi for enhanced prosperity. Perform regular prayers to your family deity.`
      };
      
      const created = await base44.entities.Kundli.create(kundliData);
      return { ...created, ...kundliData };
    },
    onSuccess: (data) => {
      setGeneratedKundli(data);
      setStep(2);
      queryClient.invalidateQueries(['user-kundlis']);
      toast.success('Kundli generated successfully!');
    }
  });

  const handleGenerate = () => {
    if (!formData.name || !formData.birth_date || !formData.birth_time || !formData.birth_place) {
      toast.error('Please fill all required fields');
      return;
    }
    generateMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-16 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-white" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
              Generate Your Kundli
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Get your personalized Vedic birth chart with detailed predictions
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <div className="max-w-2xl mx-auto">
          {step === 1 ? (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Birth Details</h2>
              
              <div className="space-y-6">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Time of Birth *</Label>
                    <Input
                      type="time"
                      value={formData.birth_time}
                      onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Place of Birth *</Label>
                  <Input
                    placeholder="City, State"
                    value={formData.birth_place}
                    onChange={(e) => setFormData({...formData, birth_place: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Chart Style</Label>
                  <Select 
                    value={formData.chart_type} 
                    onValueChange={(value) => setFormData({...formData, chart_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north_indian">North Indian Style</SelectItem>
                      <SelectItem value="south_indian">South Indian Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Price:</strong> ₹299
                    <br />
                    <strong>Includes:</strong> Complete birth chart, Rashi, Nakshatra, Dasha periods, and basic predictions
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full mt-8 bg-orange-500 hover:bg-orange-600 py-6 text-lg"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                Generate Kundli - ₹299
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Your Kundli is Ready!</h2>
                <p className="text-gray-600">Birth chart for {generatedKundli?.name}</p>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-6">Basic Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Rashi (Moon Sign)</p>
                    <p className="font-semibold text-lg">{generatedKundli?.rashi}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nakshatra</p>
                    <p className="font-semibold text-lg">{generatedKundli?.nakshatra}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Birth Date</p>
                    <p className="font-semibold">{generatedKundli?.birth_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Birth Time</p>
                    <p className="font-semibold">{generatedKundli?.birth_time}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-6">Predictions & Analysis</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {generatedKundli?.predictions_text}
                  </p>
                </div>
              </Card>

              <Card className="p-8 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-blue-600" />
                  Want Detailed Analysis?
                </h3>
                <p className="text-gray-600 mb-4">
                  Book a personalized consultation with our expert astrologers for in-depth reading 
                  of your kundli, career guidance, and remedies.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Book Consultation
                </Button>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  onClick={() => {
                    setStep(1);
                    setGeneratedKundli(null);
                    setFormData({
                      name: '',
                      birth_date: '',
                      birth_time: '',
                      birth_place: '',
                      chart_type: 'north_indian'
                    });
                  }}
                  variant="outline" 
                  className="flex-1"
                >
                  Generate Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}