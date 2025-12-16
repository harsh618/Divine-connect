import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Stars, 
  Calendar, 
  Clock, 
  MessageSquare,
  Phone,
  Video,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AstrologerDashboard() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['astrologer-profile', user?.id],
    queryFn: async () => {
      const profiles = await base44.entities.ProviderProfile.filter({ 
        user_id: user.id, 
        provider_type: 'astrologer',
        is_deleted: false 
      });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: consultations } = useQuery({
    queryKey: ['astrologer-consultations', profile?.id],
    queryFn: () => base44.entities.Booking.filter({ 
      provider_id: profile.id,
      booking_type: 'consultation',
      is_deleted: false 
    }, '-created_date'),
    enabled: !!profile
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: (isAvailable) => 
      base44.entities.ProviderProfile.update(profile.id, { is_available_now: isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries(['astrologer-profile']);
      toast.success('Availability updated');
    }
  });

  const upcomingConsultations = consultations?.filter(c => 
    c.status === 'confirmed' || c.status === 'pending'
  ) || [];

  const completedConsultations = consultations?.filter(c => c.status === 'completed') || [];
  const totalEarnings = completedConsultations.reduce((sum, c) => sum + (c.total_amount || 0), 0);

  const getModeIcon = (mode) => {
    switch(mode) {
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'voice': return <Phone className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Stars className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-1">
                  Welcome, {profile?.display_name || 'Astrologer'}
                </h1>
                <p className="text-white/90">Manage your consultations and services</p>
              </div>
            </div>
            <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center gap-3">
                <Label className="text-white">Available Now</Label>
                <Switch
                  checked={profile?.is_available_now || false}
                  onCheckedChange={(checked) => updateAvailabilityMutation.mutate(checked)}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 -mt-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingConsultations.length}</p>
                <p className="text-sm text-gray-500">Upcoming</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedConsultations.length}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{profile?.rating_average || 4.9}</p>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-100">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Earnings</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Consultations */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming Consultations</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingConsultations.length > 0 ? (
                  upcomingConsultations.map((consultation) => (
                    <Card key={consultation.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Consultation</h3>
                          <p className="text-sm text-gray-500">ID: {consultation.id.slice(0, 8)}</p>
                        </div>
                        <Badge className={
                          consultation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {consultation.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{consultation.date ? format(new Date(consultation.date), 'PPP') : 'Date TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{consultation.time_slot || 'Time TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          {getModeIcon(consultation.service_mode)}
                          <span className="capitalize">{consultation.service_mode || 'chat'} consultation</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="font-semibold text-purple-600">₹{consultation.total_amount}</p>
                        </div>
                      </div>
                      {consultation.meeting_link && (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
                          Join Consultation
                        </Button>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No upcoming consultations</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedConsultations.length > 0 ? (
                  completedConsultations.slice(0, 10).map((consultation) => (
                    <Card key={consultation.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">Consultation</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <span>{consultation.date ? format(new Date(consultation.date), 'PP') : '-'}</span>
                            <span>•</span>
                            <span>₹{consultation.total_amount}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No completed consultations yet</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Services Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Your Services</h3>
              {profile?.astrology_services?.length > 0 ? (
                <div className="space-y-3">
                  {profile.astrology_services.map((service, idx) => (
                    <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium">{service.service_name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {service.mode?.map(m => (
                          <Badge key={m} variant="secondary" className="text-xs">
                            {m}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-purple-600 mt-2">₹{service.price}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No services added yet</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Consultations</span>
                  <span className="font-semibold">{profile?.total_consultations || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold">{upcomingConsultations.length + completedConsultations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Stars className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {profile?.rating_average || 4.9}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}