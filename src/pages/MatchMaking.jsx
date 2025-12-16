import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, Clock, MapPin, Loader2, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';

export default function MatchMaking() {
  const [formData, setFormData] = useState({
    person1_name: '',
    person1_birth_date: '',
    person1_birth_time: '',
    person1_birth_place: '',
    person2_name: '',
    person2_birth_date: '',
    person2_birth_time: '',
    person2_birth_place: ''
  });
  const [matchResult, setMatchResult] = useState(null);

  const matchMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform a detailed Vedic astrology Kundli matching (Gun Milan) analysis for marriage compatibility between:

Person 1:
Name: ${data.person1_name}
Birth Date: ${data.person1_birth_date}
Birth Time: ${data.person1_birth_time}
Birth Place: ${data.person1_birth_place}

Person 2:
Name: ${data.person2_name}
Birth Date: ${data.person2_birth_date}
Birth Time: ${data.person2_birth_time}
Birth Place: ${data.person2_birth_place}

Provide a comprehensive compatibility analysis including:
1. Overall compatibility score (0-36 Gunas)
2. Varna (Spiritual compatibility)
3. Vashya (Mutual attraction)
4. Tara (Birth star compatibility)
5. Yoni (Nature and temperament)
6. Graha Maitri (Mental compatibility)
7. Gana (Behavior and temperament)
8. Bhakoot (Love and emotional compatibility)
9. Nadi (Health and progeny)
10. Strengths of the match
11. Challenges to be aware of
12. Remedies and suggestions
13. Overall recommendation

Be detailed, accurate, and based on authentic Vedic astrology principles.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            total_possible: { type: "number" },
            compatibility_percentage: { type: "number" },
            person1_rashi: { type: "string" },
            person1_nakshatra: { type: "string" },
            person2_rashi: { type: "string" },
            person2_nakshatra: { type: "string" },
            varna: { type: "object", properties: { score: { type: "number" }, analysis: { type: "string" } } },
            vashya: { type: "object", properties: { score: { type: "number" }, analysis: { type: "string" } } },
            tara: { type: "object", properties: { score: { type: "number" }, analysis: { type: "string" } } },
            yoni: { type: "object", properties: { score: { type: "number" }, analysis: { type: "string" } } },
            graha_maitri: { type: "object", properties: { score: { type: "number" }, analysis: { type: "string" } } },
            gana: { type: "object", properties: { score: { type: "number" }, analysis: { type: "string" } } },
            bhakoot: { type: "object", properties: { score: { type: "number" }, analysis: { type: "string" } } },
            nadi: { type: "object", properties: { score: { type: "number" }, analysis: { type: "string" } } },
            strengths: { type: "array", items: { type: "string" } },
            challenges: { type: "array", items: { type: "string" } },
            remedies: { type: "array", items: { type: "string" } },
            overall_assessment: { type: "string" },
            recommendation: { type: "string" }
          }
        }
      });

      return result;
    },
    onSuccess: (result) => {
      setMatchResult(result);
      toast.success('Compatibility analysis completed!');
    },
    onError: () => {
      toast.error('Failed to analyze compatibility. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = [
      'person1_name', 'person1_birth_date', 'person1_birth_time', 'person1_birth_place',
      'person2_name', 'person2_birth_date', 'person2_birth_time', 'person2_birth_place'
    ];
    
    const missingFields = requiredFields.some(field => !formData[field]);
    if (missingFields) {
      toast.error('Please fill all required fields for both persons');
      return;
    }
    
    matchMutation.mutate(formData);
  };

  const getCompatibilityLevel = (percentage) => {
    if (percentage >= 75) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 60) return { label: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 50) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percentage >= 36) return { label: 'Average', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Below Average', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const handleDownload = () => {
    const content = `
KUNDLI MATCHING REPORT
======================

${formData.person1_name} & ${formData.person2_name}

COMPATIBILITY SCORE: ${matchResult.overall_score}/${matchResult.total_possible} (${matchResult.compatibility_percentage}%)

ASTROLOGICAL DETAILS:
${formData.person1_name}: ${matchResult.person1_rashi} (${matchResult.person1_nakshatra})
${formData.person2_name}: ${matchResult.person2_rashi} (${matchResult.person2_nakshatra})

DETAILED ANALYSIS:

Varna (${matchResult.varna.score}/1): ${matchResult.varna.analysis}

Vashya (${matchResult.vashya.score}/2): ${matchResult.vashya.analysis}

Tara (${matchResult.tara.score}/3): ${matchResult.tara.analysis}

Yoni (${matchResult.yoni.score}/4): ${matchResult.yoni.analysis}

Graha Maitri (${matchResult.graha_maitri.score}/5): ${matchResult.graha_maitri.analysis}

Gana (${matchResult.gana.score}/6): ${matchResult.gana.analysis}

Bhakoot (${matchResult.bhakoot.score}/7): ${matchResult.bhakoot.analysis}

Nadi (${matchResult.nadi.score}/8): ${matchResult.nadi.analysis}

STRENGTHS:
${matchResult.strengths?.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CHALLENGES:
${matchResult.challenges?.map((c, i) => `${i + 1}. ${c}`).join('\n')}

REMEDIES:
${matchResult.remedies?.map((r, i) => `${i + 1}. ${r}`).join('\n')}

OVERALL ASSESSMENT:
${matchResult.overall_assessment}

RECOMMENDATION:
${matchResult.recommendation}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kundli-matching-${formData.person1_name}-${formData.person2_name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-16 px-6">
        <div className="container mx-auto">
          <BackButton label="Back" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                Kundli Matching
              </h1>
              <p className="text-white/80 mt-1">Check marriage compatibility based on Vedic astrology</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <div className="max-w-5xl mx-auto">
          {!matchResult ? (
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Person 1 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">1</span>
                    First Person's Details
                  </h3>
                  <div className="space-y-4 pl-10">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.person1_name}
                        onChange={(e) => setFormData({ ...formData, person1_name: e.target.value })}
                        placeholder="Enter full name"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Birth Date *
                        </Label>
                        <Input
                          type="date"
                          value={formData.person1_birth_date}
                          onChange={(e) => setFormData({ ...formData, person1_birth_date: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Birth Time *
                        </Label>
                        <Input
                          type="time"
                          value={formData.person1_birth_time}
                          onChange={(e) => setFormData({ ...formData, person1_birth_time: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Birth Place *
                        </Label>
                        <Input
                          value={formData.person1_birth_place}
                          onChange={(e) => setFormData({ ...formData, person1_birth_place: e.target.value })}
                          placeholder="City, Country"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">2</span>
                    Second Person's Details
                  </h3>
                  <div className="space-y-4 pl-10">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.person2_name}
                        onChange={(e) => setFormData({ ...formData, person2_name: e.target.value })}
                        placeholder="Enter full name"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Birth Date *
                        </Label>
                        <Input
                          type="date"
                          value={formData.person2_birth_date}
                          onChange={(e) => setFormData({ ...formData, person2_birth_date: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Birth Time *
                        </Label>
                        <Input
                          type="time"
                          value={formData.person2_birth_time}
                          onChange={(e) => setFormData({ ...formData, person2_birth_time: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Birth Place *
                        </Label>
                        <Input
                          value={formData.person2_birth_place}
                          onChange={(e) => setFormData({ ...formData, person2_birth_place: e.target.value })}
                          placeholder="City, Country"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-pink-500 hover:bg-pink-600 py-6 text-lg"
                  disabled={matchMutation.isPending}
                >
                  {matchMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Compatibility...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Check Compatibility
                    </>
                  )}
                </Button>
              </form>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className={`p-8 ${getCompatibilityLevel(matchResult.compatibility_percentage).bg}`}>
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">{formData.person1_name} & {formData.person2_name}</h2>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">{matchResult.person1_rashi}</p>
                      <p className="text-xs text-gray-500">{matchResult.person1_nakshatra}</p>
                    </div>
                    <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                    <div>
                      <p className="text-sm text-gray-600">{matchResult.person2_rashi}</p>
                      <p className="text-xs text-gray-500">{matchResult.person2_nakshatra}</p>
                    </div>
                  </div>
                  <div className={`text-5xl font-bold mb-2 ${getCompatibilityLevel(matchResult.compatibility_percentage).color}`}>
                    {matchResult.overall_score}/{matchResult.total_possible}
                  </div>
                  <p className={`text-xl font-semibold mb-4 ${getCompatibilityLevel(matchResult.compatibility_percentage).color}`}>
                    {getCompatibilityLevel(matchResult.compatibility_percentage).label} Match
                  </p>
                  <Progress value={matchResult.compatibility_percentage} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">{matchResult.compatibility_percentage}% Compatible</p>
                </div>
              </Card>

              {/* Gun Milan Analysis */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Detailed Gun Milan Analysis</h3>
                <div className="space-y-4">
                  {['varna', 'vashya', 'tara', 'yoni', 'graha_maitri', 'gana', 'bhakoot', 'nadi'].map((guna) => (
                    <div key={guna} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">{guna.replace('_', ' ')}</h4>
                        <span className="text-lg font-bold text-pink-600">
                          {matchResult[guna].score}/{guna === 'varna' ? 1 : guna === 'vashya' ? 2 : guna === 'tara' ? 3 : guna === 'yoni' ? 4 : guna === 'graha_maitri' ? 5 : guna === 'gana' ? 6 : guna === 'bhakoot' ? 7 : 8}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{matchResult[guna].analysis}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Strengths */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-600">Strengths of This Match</h3>
                <ul className="space-y-2">
                  {matchResult.strengths?.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Challenges */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-orange-600">Challenges to Be Aware Of</h3>
                <ul className="space-y-2">
                  {matchResult.challenges?.map((challenge, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">!</span>
                      <span className="text-gray-700">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Remedies */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-600">Suggested Remedies</h3>
                <ul className="space-y-2">
                  {matchResult.remedies?.map((remedy, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">◆</span>
                      <span className="text-gray-700">{remedy}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Overall Assessment */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Overall Assessment</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{matchResult.overall_assessment}</p>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="font-semibold text-pink-700 mb-2">Recommendation:</p>
                  <p className="text-gray-700">{matchResult.recommendation}</p>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setMatchResult(null);
                    setFormData({
                      person1_name: '', person1_birth_date: '', person1_birth_time: '', person1_birth_place: '',
                      person2_name: '', person2_birth_date: '', person2_birth_time: '', person2_birth_place: ''
                    });
                  }}
                >
                  Check Another Match
                </Button>
                <Button className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={handleDownload}>
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