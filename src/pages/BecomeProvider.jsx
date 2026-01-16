import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  Upload,
  Users,
  Star,
  DollarSign,
  Clock,
  Loader2,
  Award,
  Building2,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BackButton from '../components/ui/BackButton';

export default function BecomeProvider() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    provider_type: '',
    display_name: '',
    bio: '',
    years_of_experience: '',
    languages: '',
    specializations: '',
    consultation_rate_chat: '',
    consultation_rate_voice: '',
    consultation_rate_video: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.ProviderProfile.create({
        ...data,
        user_id: user.id,
        languages: data.languages.split(',').map(l => l.trim()),
        specializations: data.specializations.split(',').map(s => s.trim()),
        years_of_experience: Number(data.years_of_experience),
        consultation_rate_chat: Number(data.consultation_rate_chat) || undefined,
        consultation_rate_voice: Number(data.consultation_rate_voice) || undefined,
        consultation_rate_video: Number(data.consultation_rate_video) || undefined,
        is_verified: false,
        is_available_now: false
      });
    },
    onSuccess: () => {
      toast.success('Application submitted! We will review and get back to you within 48 hours.');
      setStep(4);
    }
  });

  const handleSubmit = () => {
    if (!formData.display_name || !formData.provider_type || !formData.years_of_experience) {
      toast.error('Please fill all required fields');
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-6">
        <div className="container mx-auto">
          <BackButton label="Back to Home" className="text-white/80 hover:text-white mb-4" />
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Join Our Platform
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Share your services and help devotees on their spiritual journey
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${s < step ? 'bg-purple-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Provider Type */}
          {step === 1 && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-center mb-8">Choose Your Role</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                  className={`p-6 cursor-pointer transition-all ${
                    formData.provider_type === 'priest' 
                      ? 'border-2 border-orange-500 bg-orange-50' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setFormData({...formData, provider_type: 'priest'})}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                      <Flame className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Priest / Pandit</h3>
                    <p className="text-gray-600 text-sm">
                      Conduct virtual poojas, rituals, and provide spiritual guidance
                    </p>
                    {formData.provider_type === 'priest' && (
                      <CheckCircle className="w-6 h-6 text-orange-500 mx-auto mt-3" />
                    )}
                  </div>
                </Card>

                <Card 
                  className={`p-6 cursor-pointer transition-all ${
                    formData.provider_type === 'astrologer' 
                      ? 'border-2 border-purple-500 bg-purple-50' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setFormData({...formData, provider_type: 'astrologer'})}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Astrologer</h3>
                    <p className="text-gray-600 text-sm">
                      Offer consultations, kundli analysis, and astrological guidance
                    </p>
                    {formData.provider_type === 'astrologer' && (
                      <CheckCircle className="w-6 h-6 text-purple-500 mx-auto mt-3" />
                    )}
                  </div>
                </Card>

                <Link to={createPageUrl('HotelOnboarding')} className="block">
                  <Card className="p-6 cursor-pointer transition-all hover:shadow-lg hover:border-blue-300 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Hotel Partner</h3>
                      <p className="text-gray-600 text-sm">
                        List your hotel for temple pilgrims and devotees
                      </p>
                    </div>
                  </Card>
                </Link>
              </div>
              <Button 
                onClick={() => setStep(2)}
                disabled={!formData.provider_type}
                className="w-full mt-8 bg-purple-600 hover:bg-purple-700"
              >
                Continue
              </Button>
            </Card>
          )}

          {/* Step 2: Profile Details */}
          {step === 2 && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Profile Details</h2>
              <div className="space-y-6">
                <div>
                  <Label>Display Name *</Label>
                  <Input
                    placeholder="Your professional name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Bio</Label>
                  <Textarea
                    placeholder="Tell us about your experience and expertise..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Years of Experience *</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({...formData, years_of_experience: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Languages (comma separated) *</Label>
                  <Input
                    placeholder="Hindi, English, Sanskrit"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Specializations (comma separated) *</Label>
                  <Input
                    placeholder={formData.provider_type === 'priest' 
                      ? "Vedic Rituals, Havan, Marriage Ceremonies" 
                      : "Vedic Astrology, Kundli Analysis, Vastu"}
                    value={formData.specializations}
                    onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Continue
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Rates & Submit */}
          {step === 3 && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                {formData.provider_type === 'astrologer' ? 'Consultation Rates' : 'Review & Submit'}
              </h2>

              {formData.provider_type === 'astrologer' && (
                <div className="space-y-6">
                  <p className="text-gray-600 mb-6">Set your consultation rates (per minute in ₹)</p>
                  <div>
                    <Label>Chat Consultation Rate</Label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={formData.consultation_rate_chat}
                      onChange={(e) => setFormData({...formData, consultation_rate_chat: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Voice Call Rate</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={formData.consultation_rate_voice}
                      onChange={(e) => setFormData({...formData, consultation_rate_voice: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Video Call Rate</Label>
                    <Input
                      type="number"
                      placeholder="40"
                      value={formData.consultation_rate_video}
                      onChange={(e) => setFormData({...formData, consultation_rate_video: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4">What Happens Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Your application will be reviewed within 48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>We'll verify your credentials and experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Once approved, you'll get access to your provider dashboard</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Submit Application
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <Card className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Application Submitted!</h2>
              <p className="text-gray-600 mb-8">
                Thank you for applying. We'll review your application and contact you within 48 hours.
              </p>
              <Link to={createPageUrl('Home')}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Back to Home
                </Button>
              </Link>
            </Card>
          )}

          {/* Benefits Section */}
          {step < 4 && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-center mb-6">Why Join Divine?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Large User Base</h4>
                  <p className="text-sm text-gray-600">Connect with thousands of devotees</p>
                </Card>
                <Card className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Competitive Earnings</h4>
                  <p className="text-sm text-gray-600">Set your own rates and grow your income</p>
                </Card>
                <Card className="p-6 text-center">
                  <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Flexible Schedule</h4>
                  <p className="text-sm text-gray-600">Work on your own time</p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}