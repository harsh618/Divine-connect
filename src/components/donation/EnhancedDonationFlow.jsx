import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  Heart, 
  Building2, 
  Gift, 
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Download,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DONATION_TYPES = [
  { id: 'temple', name: 'Temple Donation', icon: Building2, description: 'Support temple maintenance and activities' },
  { id: 'campaign', name: 'Charity Campaign', icon: Heart, description: 'Contribute to specific seva projects' },
  { id: 'sponsor', name: 'Sponsor Event', icon: Calendar, description: 'Sponsor a temple event or festival' },
  { id: 'general', name: 'General Donation', icon: Gift, description: 'Support overall spiritual activities' }
];

const PRESET_AMOUNTS = [101, 251, 501, 1001, 2001, 5001, 11001];

export default function EnhancedDonationFlow({ open, onOpenChange, temple, campaign }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [donationType, setDonationType] = useState(campaign ? 'campaign' : temple ? 'temple' : null);
  const [amount, setAmount] = useState(501);
  const [customAmount, setCustomAmount] = useState('');
  const [dedication, setDedication] = useState({ type: 'wellbeing', name: '' });
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorDetails, setDonorDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [donationComplete, setDonationComplete] = useState(false);
  const [donationRecord, setDonationRecord] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setDonorDetails(prev => ({
            ...prev,
            name: userData.full_name || '',
            email: userData.email || ''
          }));
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  const finalAmount = customAmount ? parseInt(customAmount) : amount;

  const createDonationMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Donation.create({
        amount: finalAmount,
        temple_id: temple?.id,
        campaign_id: campaign?.id,
        is_anonymous: isAnonymous,
        donor_name: isAnonymous ? 'Anonymous' : donorDetails.name,
        donor_email: donorDetails.email
      });
    },
    onSuccess: (donation) => {
      setDonationRecord(donation);
      setDonationComplete(true);
      queryClient.invalidateQueries(['donations']);
      toast.success('Donation successful! Thank you for your generosity.');
    }
  });

  const handleDonate = () => {
    if (!donorDetails.email) {
      toast.error('Please provide your email address');
      return;
    }
    createDonationMutation.mutate();
  };

  const resetAndClose = () => {
    setStep(1);
    setAmount(501);
    setCustomAmount('');
    setDedication({ type: 'wellbeing', name: '' });
    setMessage('');
    setIsAnonymous(false);
    setDonationComplete(false);
    setDonationRecord(null);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return donationType !== null;
      case 2: return finalAmount >= 1;
      case 3: return donorDetails.email;
      default: return true;
    }
  };

  // Success Screen
  if (donationComplete) {
    return (
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your donation of ₹{finalAmount.toLocaleString()} has been received</p>

            <Card className="p-4 text-left mb-6 bg-orange-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold text-orange-600">₹{finalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Donation ID</span>
                  <span className="font-medium">{donationRecord?.id?.slice(0, 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{format(new Date(), 'PPP')}</span>
                </div>
                {(temple || campaign) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donated to</span>
                    <span className="font-medium">{temple?.name || campaign?.title}</span>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Receipt has been sent to your email. You can also download it below.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Receipt PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Tax Certificate
                </Button>
              </div>
              <Button onClick={resetAndClose} className="w-full bg-orange-500 hover:bg-orange-600">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make a Donation</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s < step ? 'bg-orange-500 text-white' :
                s === step ? 'bg-orange-100 text-orange-600 border-2 border-orange-500' :
                'bg-gray-100 text-gray-400'
              }`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Donation Type */}
        {step === 1 && !temple && !campaign && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Choose Donation Type</h3>
            <div className="grid grid-cols-2 gap-4">
              {DONATION_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Card 
                    key={type.id}
                    className={`p-4 cursor-pointer transition-all ${
                      donationType === type.id 
                        ? 'border-2 border-orange-500 bg-orange-50' 
                        : 'hover:border-orange-200'
                    }`}
                    onClick={() => setDonationType(type.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-3 rounded-full mb-3 ${
                        donationType === type.id ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          donationType === type.id ? 'text-orange-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <h4 className="font-semibold mb-1">{type.name}</h4>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1 (with temple/campaign) or Step 2: Amount */}
        {((step === 1 && (temple || campaign)) || (step === 2 && !temple && !campaign) || step === 2) && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {temple ? `Donate to ${temple.name}` : campaign ? `Donate to ${campaign.title}` : 'Choose Amount'}
            </h3>
            
            {/* Preset Amounts */}
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setAmount(preset); setCustomAmount(''); }}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    amount === preset && !customAmount
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 hover:bg-orange-100 text-gray-700'
                  }`}
                >
                  ₹{preset.toLocaleString()}
                </button>
              ))}
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Custom"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className={`h-full text-center font-semibold ${customAmount ? 'ring-2 ring-orange-500' : ''}`}
                />
              </div>
            </div>

            {/* Dedication */}
            <div className="space-y-3 pt-4 border-t">
              <Label>Dedication (Optional)</Label>
              <RadioGroup 
                value={dedication.type} 
                onValueChange={(v) => setDedication({ ...dedication, type: v })}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="wellbeing" id="wellbeing" />
                  <Label htmlFor="wellbeing" className="font-normal">For well-being of</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="memory" id="memory" />
                  <Label htmlFor="memory" className="font-normal">In memory of</Label>
                </div>
              </RadioGroup>
              <Input
                placeholder="Enter name"
                value={dedication.name}
                onChange={(e) => setDedication({ ...dedication, name: e.target.value })}
              />
            </div>

            {/* Message */}
            <div>
              <Label>Message to {temple?.name || 'recipient'} (Optional)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your blessings or message..."
                rows={2}
                className="mt-2"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isAnonymous ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                <div>
                  <p className="font-medium">Anonymous Donation</p>
                  <p className="text-xs text-gray-500">Your name won't be displayed publicly</p>
                </div>
              </div>
              <Checkbox
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
          </div>
        )}

        {/* Step 3: Donor Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Details</h3>
            <p className="text-sm text-gray-600">Required for receipt and tax benefits</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name {!isAnonymous && '*'}</Label>
                <Input
                  value={donorDetails.name}
                  onChange={(e) => setDonorDetails({ ...donorDetails, name: e.target.value })}
                  placeholder="Your full name"
                  disabled={isAnonymous}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={donorDetails.email}
                  onChange={(e) => setDonorDetails({ ...donorDetails, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={donorDetails.phone}
                  onChange={(e) => setDonorDetails({ ...donorDetails, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label>PAN Number (for tax receipt)</Label>
                <Input
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>

            <div>
              <Label>Address (for receipt)</Label>
              <Textarea
                value={donorDetails.address}
                onChange={(e) => setDonorDetails({ ...donorDetails, address: e.target.value })}
                placeholder="Street address, city, state, pincode"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review & Pay */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review & Confirm</h3>
            
            <Card className="p-4 bg-orange-50">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Donation Amount</span>
                  <span className="text-2xl font-bold text-orange-600">₹{finalAmount.toLocaleString()}</span>
                </div>
                {(temple || campaign) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donating to</span>
                    <span className="font-medium">{temple?.name || campaign?.title}</span>
                  </div>
                )}
                {dedication.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dedication</span>
                    <span className="font-medium">
                      {dedication.type === 'memory' ? 'In memory of' : 'For well-being of'} {dedication.name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Donor</span>
                  <span className="font-medium">{isAnonymous ? 'Anonymous' : donorDetails.name}</span>
                </div>
              </div>
            </Card>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Tax Benefits</h4>
              <p className="text-sm text-green-700">
                This donation is eligible for tax exemption under Section 80G of the Income Tax Act.
                You will receive a tax certificate via email.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Transparency</h4>
              <p className="text-sm text-blue-700">
                We'll share photos and updates showing how your donation is being used.
                {!isAnonymous && " Your name will appear on the donor wall (you can opt out)."}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {step < 4 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleDonate}
              disabled={createDonationMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createDonationMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              Donate ₹{finalAmount.toLocaleString()}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}