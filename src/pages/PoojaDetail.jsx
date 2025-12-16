import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
  Clock, 
  Package, 
  Video, 
  Calendar as CalendarIcon,
  CheckCircle,
  Loader2,
  Flame,
  Users,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';

export default function PoojaDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMuhurat, setSelectedMuhurat] = useState('');
  const [familyNames, setFamilyNames] = useState(['']);
  const [gotra, setGotra] = useState('');
  const [additionalRequests, setAdditionalRequests] = useState('');

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const services = await base44.entities.Service.filter({ id: serviceId });
      return services[0];
    },
    enabled: !!serviceId
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        service_id: serviceId,
        booking_type: 'pooja',
        status: 'pending',
        payment_status: 'completed',
        total_amount: service.price
      });
    },
    onSuccess: () => {
      toast.success('Pooja booked successfully! A pandit will be assigned shortly.');
      setShowBookingModal(false);
      queryClient.invalidateQueries(['bookings']);
    }
  });

  const handleBooking = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    const cleanedFamilyNames = familyNames.filter(name => name.trim());
    if (cleanedFamilyNames.length === 0) {
      toast.error('Please add at least one family member name');
      return;
    }
    
    bookingMutation.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedMuhurat || 'Let Pandit Decide',
      sankalp_details: {
        family_names: cleanedFamilyNames,
        gotra: gotra,
      },
      special_requirements: additionalRequests
    });
  };

  const addFamilyName = () => {
    setFamilyNames([...familyNames, '']);
  };

  const updateFamilyName = (index, value) => {
    const updated = [...familyNames];
    updated[index] = value;
    setFamilyNames(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h2>
        <Link to={createPageUrl('Poojas')}>
          <Button>Back to Poojas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-16 px-6">
        <div className="container mx-auto">
          <BackButton label="Back" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                {service.title}
              </h1>
              {service.is_virtual && (
                <Badge className="mt-2 bg-blue-500 text-white border-0">
                  <Video className="w-3 h-3 mr-1" />
                  Virtual Pooja
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">About This Pooja</h2>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </Card>

            {/* What's Included */}
            {service.materials_included?.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-orange-500" />
                  What's Included
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {service.materials_included.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Benefits */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Benefits</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Performed by experienced Vedic pandits with proper rituals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Live streaming of the entire ceremony</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Completion certificate with photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Prasad delivered to your doorstep</span>
                </li>
              </ul>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Rajesh Kumar</span>
                      <div className="flex">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Excellent service! The pandit was very knowledgeable and conducted the pooja with devotion.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-900">₹{service.price}</p>
                {service.duration_minutes && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration_minutes} minutes
                  </p>
                )}
              </div>

              <Button 
                onClick={() => navigate(createPageUrl(`PoojaBooking?id=${service.id}`))}
                className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg"
              >
                Book This Pooja
              </Button>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified Pandits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Live Streaming</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Prasad Delivery</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personalize Your Pooja</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-2 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-lg border"
              />
            </div>

            <div>
              <Label className="mb-2 block">Preferred Muhurat</Label>
              <Select value={selectedMuhurat} onValueChange={setSelectedMuhurat}>
                <SelectTrigger>
                  <SelectValue placeholder="Let Pandit Decide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (6 AM - 10 AM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 3 PM)</SelectItem>
                  <SelectItem value="evening">Evening (5 PM - 7 PM)</SelectItem>
                  <SelectItem value="pandit">Let Pandit Decide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Family Names for Sankalp</Label>
              {familyNames.map((name, index) => (
                <div key={index} className="mb-2">
                  <Input
                    placeholder={`Family member ${index + 1}`}
                    value={name}
                    onChange={(e) => updateFamilyName(index, e.target.value)}
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFamilyName} className="mt-2">
                + Add Another Name
              </Button>
            </div>

            <div>
              <Label className="mb-2 block">Your Gotra (Optional)</Label>
              <Input
                placeholder="Enter your gotra"
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 block">Additional Requests (Optional)</Label>
              <Textarea
                placeholder="Any special requirements or requests..."
                value={additionalRequests}
                onChange={(e) => setAdditionalRequests(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Total Amount:</strong> ₹{service.price}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                After booking, a verified pandit will be assigned to perform your pooja. 
                You'll receive the meeting link 1 hour before the scheduled time.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBooking}
              disabled={bookingMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {bookingMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Confirm & Pay ₹{service.price}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}