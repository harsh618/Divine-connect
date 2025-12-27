import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Heart, 
  Star, 
  Building2,
  TrendingUp,
  BookOpen,
  Users,
  Flame,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TempleCard from '@/components/temple/TempleCard';

export default function MyJourney() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: bookings } = useQuery({
    queryKey: ['user-journey-bookings', user?.id],
    queryFn: () => base44.entities.Booking.filter({ user_id: user.id, is_deleted: false }),
    enabled: !!user?.id
  });

  const { data: donations } = useQuery({
    queryKey: ['user-journey-donations', user?.id],
    queryFn: () => base44.entities.Donation.filter({ user_id: user.id }),
    enabled: !!user?.id
  });

  const { data: kundlis } = useQuery({
    queryKey: ['user-kundlis', user?.id],
    queryFn: () => base44.entities.Kundli.filter({ user_id: user.id, is_deleted: false }),
    enabled: !!user?.id
  });

  const { data: services } = useQuery({
    queryKey: ['recommended-services'],
    queryFn: () => base44.entities.Service.filter({ category: 'pooja', is_deleted: false }, '-created_date', 6),
  });

  const { data: temples } = useQuery({
    queryKey: ['recommended-temples'],
    queryFn: () => base44.entities.Temple.filter({ 
      is_deleted: false,
      primary_deity: user?.favorite_deity 
    }, '-created_date', 3),
    enabled: !!user?.favorite_deity
  });

  const { data: allTemples } = useQuery({
    queryKey: ['all-temples-journey'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }, '-created_date', 3),
    enabled: !user?.favorite_deity
  });

  const totalDonated = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

  const recommendedTemples = temples?.length > 0 ? temples : allTemples;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">
              My Spiritual Journey
            </h1>
          </div>
          <p className="text-white/80 text-lg">
            Welcome back, {user.full_name}! Continue your path to enlightenment.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-orange-100 mb-2">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{bookings?.length || 0}</p>
              <p className="text-sm text-gray-500">Bookings</p>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-green-100 mb-2">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{completedBookings}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-pink-100 mb-2">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{totalDonated.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Donated</p>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-purple-100 mb-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{kundlis?.length || 0}</p>
              <p className="text-sm text-gray-500">Kundlis</p>
            </div>
          </Card>
        </div>

        {/* Personalized Recommendations */}
        {user.favorite_deity && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Recommended for Devotees of {user.favorite_deity}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedTemples?.slice(0, 3).map(temple => (
                <TempleCard key={temple.id} temple={temple} />
              ))}
            </div>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="recommended" className="space-y-6">
          <TabsList className="bg-white rounded-xl p-1">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="kundlis">My Kundlis</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Recommended Tab */}
          <TabsContent value="recommended" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Suggested Poojas for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services?.map(service => (
                  <Link key={service.id} to={createPageUrl(`PoojaDetail?id=${service.id}`)}>
                    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <Flame className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{service.title}</h4>
                          <p className="text-sm text-orange-600 font-medium">₹{service.price}</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                        Book Now
                      </Button>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Continue Your Journey</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to={createPageUrl('KundliGenerator')}>
                  <Card className="p-4 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-purple-100">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Generate Kundli</h4>
                        <p className="text-sm text-gray-600">Get your birth chart</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link to={createPageUrl('Astrology')}>
                  <Card className="p-4 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-blue-100">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Consult Astrologer</h4>
                        <p className="text-sm text-gray-600">Get guidance</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </Card>
          </TabsContent>

          {/* Kundlis Tab */}
          <TabsContent value="kundlis">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">My Kundlis</h3>
                <Link to={createPageUrl('KundliGenerator')}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Generate New Kundli
                  </Button>
                </Link>
              </div>
              {kundlis?.length > 0 ? (
                <div className="space-y-4">
                  {kundlis.map(kundli => (
                    <Card key={kundli.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{kundli.name}</h4>
                          <p className="text-sm text-gray-500">
                            {kundli.birth_date} • {kundli.birth_place}
                          </p>
                          {kundli.rashi && (
                            <Badge className="mt-2 bg-purple-100 text-purple-700">
                              Rashi: {kundli.rashi}
                            </Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <Star className="w-10 h-10 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Kundlis Yet</h4>
                  <p className="text-gray-500 mb-4">Generate your first birth chart to begin</p>
                  <Link to={createPageUrl('KundliGenerator')}>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Generate Kundli
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Your Spiritual Insights</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Active Spiritual Seeker</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      You've completed {completedBookings} spiritual services. Keep up the devotion!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Generous Donor</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Your contributions of ₹{totalDonated.toLocaleString()} are making a difference.
                    </p>
                  </div>
                </div>
                {user.favorite_deity && (
                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Devotee of {user.favorite_deity}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Explore temples and services dedicated to {user.favorite_deity}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}