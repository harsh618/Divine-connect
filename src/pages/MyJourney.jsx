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
    queryFn: () => base44.entities.Booking.filter({ user_id: user.id, is_deleted: false }, '-created_date'),
    enabled: !!user?.id
  });

  const { data: donations } = useQuery({
    queryKey: ['user-journey-donations', user?.id],
    queryFn: () => base44.entities.Donation.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id
  });

  const { data: kundlis } = useQuery({
    queryKey: ['user-kundlis', user?.id],
    queryFn: () => base44.entities.Kundli.filter({ user_id: user.id, is_deleted: false }, '-created_date'),
    enabled: !!user?.id
  });

  const { data: favoriteTemples } = useQuery({
    queryKey: ['favorite-temples', user?.id],
    queryFn: () => base44.entities.FavoriteTemple.filter({ user_id: user.id }),
    enabled: !!user?.id
  });

  const { data: favoriteProviders } = useQuery({
    queryKey: ['favorite-providers', user?.id],
    queryFn: () => base44.entities.FavoriteProvider.filter({ user_id: user.id }),
    enabled: !!user?.id
  });

  const { data: poojas } = useQuery({
    queryKey: ['recommended-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false, is_popular: true }, '-total_bookings', 6),
  });

  const { data: temples } = useQuery({
    queryKey: ['recommended-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false, is_featured: true }, '-created_date', 6),
  });

  const { data: priests } = useQuery({
    queryKey: ['recommended-priests'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      provider_type: 'priest',
      is_deleted: false,
      profile_status: 'approved'
    }, '-rating_average', 6),
  });

  const totalDonated = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
  const upcomingBookings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'pending').length || 0;
  const consultationBookings = bookings?.filter(b => b.booking_type === 'consultation' && b.status === 'completed') || [];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="border-b border-border py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-wide">
              My Journey
            </h1>
          </div>
          <p className="text-muted-foreground text-base font-light">
            Welcome back, {user.full_name}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-8 py-16 max-w-7xl">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="p-8 bg-card border border-border hover:border-primary/30 transition-all">
            <div className="flex flex-col">
              <Calendar className="w-5 h-5 text-primary mb-4" />
              <p className="text-3xl font-light text-foreground mb-1">{upcomingBookings}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Upcoming</p>
            </div>
          </Card>
          <Card className="p-8 bg-card border border-border hover:border-primary/30 transition-all">
            <div className="flex flex-col">
              <Star className="w-5 h-5 text-primary mb-4" />
              <p className="text-3xl font-light text-foreground mb-1">{completedBookings}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
            </div>
          </Card>
          <Card className="p-8 bg-card border border-border hover:border-primary/30 transition-all">
            <div className="flex flex-col">
              <Heart className="w-5 h-5 text-primary mb-4" />
              <p className="text-3xl font-light text-foreground mb-1">₹{totalDonated.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Donated</p>
            </div>
          </Card>
          <Card className="p-8 bg-card border border-border hover:border-primary/30 transition-all">
            <div className="flex flex-col">
              <BookOpen className="w-5 h-5 text-primary mb-4" />
              <p className="text-3xl font-light text-foreground mb-1">{kundlis?.length || 0}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Kundlis</p>
            </div>
          </Card>
        </div>

        {/* Favorites Section */}
        {(favoriteTemples?.length > 0 || favoriteProviders?.length > 0) && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-foreground mb-8">Your Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {favoriteTemples?.length > 0 && (
                <Card className="p-8 border border-border">
                  <div className="flex items-center gap-2 mb-6">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-normal">Saved Temples</h3>
                  </div>
                  <div className="space-y-4">
                    {favoriteTemples.slice(0, 3).map((fav) => (
                      <Link key={fav.id} to={createPageUrl(`TempleDetail?id=${fav.temple_id}`)}>
                        <div className="p-4 border border-border hover:border-primary/30 transition-all cursor-pointer">
                          <p className="text-sm font-light">Temple saved</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {favoriteTemples.length > 3 && (
                    <Link to={createPageUrl('Profile')}>
                      <Button variant="ghost" className="w-full mt-4 text-xs uppercase tracking-wider">
                        View All
                      </Button>
                    </Link>
                  )}
                </Card>
              )}
              {favoriteProviders?.length > 0 && (
                <Card className="p-8 border border-border">
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-normal">Saved Priests</h3>
                  </div>
                  <div className="space-y-4">
                    {favoriteProviders.slice(0, 3).map((fav) => (
                      <div key={fav.id} className="p-4 border border-border">
                        <p className="text-sm font-light">Priest saved</p>
                      </div>
                    ))}
                  </div>
                  {favoriteProviders.length > 3 && (
                    <Link to={createPageUrl('Profile')}>
                      <Button variant="ghost" className="w-full mt-4 text-xs uppercase tracking-wider">
                        View All
                      </Button>
                    </Link>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="recommended" className="space-y-8">
          <TabsList className="bg-card border border-border p-1">
            <TabsTrigger value="recommended" className="text-xs uppercase tracking-wider">Recommended</TabsTrigger>
            <TabsTrigger value="history" className="text-xs uppercase tracking-wider">History</TabsTrigger>
            <TabsTrigger value="kundlis" className="text-xs uppercase tracking-wider">Kundlis</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs uppercase tracking-wider">Insights</TabsTrigger>
          </TabsList>

          {/* Recommended Tab */}
          <TabsContent value="recommended" className="space-y-12">
            <div>
              <h3 className="text-xl font-light mb-8">Popular Poojas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {poojas?.map(pooja => (
                  <Link key={pooja.id} to={createPageUrl(`PoojaDetail?id=${pooja.id}`)}>
                    <Card className="p-6 border border-border hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="flex items-start gap-4 mb-4">
                        <Flame className="w-5 h-5 text-primary mt-1" />
                        <div className="flex-1">
                          <h4 className="font-normal text-foreground mb-2 group-hover:text-primary transition-colors">{pooja.name}</h4>
                          <p className="text-sm text-muted-foreground font-light line-clamp-2">{pooja.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-primary">₹{pooja.base_price_virtual || pooja.base_price_temple}</p>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">View Details</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-light mb-8">Featured Temples</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {temples?.slice(0, 3).map(temple => (
                  <TempleCard key={temple.id} temple={temple} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-light mb-8">Experienced Priests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {priests?.map(priest => (
                  <Card key={priest.id} className="p-6 border border-border hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-normal">{priest.display_name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{priest.years_of_experience} years exp</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-xs">{priest.rating_average}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-light line-clamp-2 mb-4">{priest.bio}</p>
                    <Link to={createPageUrl(`PriestProfile?id=${priest.id}`)}>
                      <Button variant="outline" className="w-full text-xs uppercase tracking-wider">
                        View Profile
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>


          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-12">
            <div>
              <h3 className="text-xl font-light mb-8">Consultation History</h3>
              {consultationBookings.length > 0 ? (
                <div className="space-y-4">
                  {consultationBookings.map(booking => (
                    <Card key={booking.id} className="p-6 border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <Users className="w-5 h-5 text-primary mt-1" />
                          <div>
                            <p className="font-normal mb-1">Consultation</p>
                            <p className="text-sm text-muted-foreground font-light">{booking.date} • {booking.time_slot}</p>
                            <Badge className="mt-2 bg-primary/10 text-primary border-0 text-xs">
                              {booking.service_mode}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">₹{booking.total_amount}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 border border-border text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-normal mb-2">No Consultations Yet</h4>
                  <p className="text-muted-foreground font-light mb-6">Start your spiritual journey with expert guidance</p>
                  <Link to={createPageUrl('Astrology')}>
                    <Button className="bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                      Book Consultation
                    </Button>
                  </Link>
                </Card>
              )}
            </div>

            <div>
              <h3 className="text-xl font-light mb-8">Recent Activity</h3>
              {bookings?.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map(booking => (
                    <Card key={booking.id} className="p-6 border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {booking.booking_type === 'pooja' ? <Flame className="w-5 h-5 text-primary" /> : 
                             booking.booking_type === 'temple_visit' ? <Building2 className="w-5 h-5 text-primary" /> :
                             <Users className="w-5 h-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-normal mb-1 capitalize">{booking.booking_type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground font-light">{booking.date}</p>
                          </div>
                        </div>
                        <Badge variant={booking.status === 'completed' ? 'default' : 'outline'} className="text-xs uppercase tracking-wider">
                          {booking.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 border border-border text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-normal mb-2">No Bookings Yet</h4>
                  <p className="text-muted-foreground font-light">Start your journey by booking a pooja or temple visit</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Kundlis Tab */}
          <TabsContent value="kundlis">
            <Card className="p-8 border border-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-light">My Kundlis</h3>
                <Link to={createPageUrl('KundliGenerator')}>
                  <Button className="bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                    Generate New
                  </Button>
                </Link>
              </div>
              {kundlis?.length > 0 ? (
                <div className="space-y-4">
                  {kundlis.map(kundli => (
                    <Card key={kundli.id} className="p-6 border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <Star className="w-5 h-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-normal mb-1">{kundli.name}</h4>
                            <p className="text-sm text-muted-foreground font-light">
                              {kundli.birth_date} • {kundli.birth_place}
                            </p>
                            {kundli.rashi && (
                              <Badge className="mt-3 bg-primary/10 text-primary border-0 text-xs uppercase tracking-wider">
                                {kundli.rashi}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Link to={createPageUrl(`MyKundalis?id=${kundli.id}`)}>
                          <Button variant="outline" size="sm" className="text-xs uppercase tracking-wider">
                            View
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Star className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                  <h4 className="text-lg font-normal mb-2">No Kundlis Yet</h4>
                  <p className="text-muted-foreground font-light mb-8">Generate your first birth chart</p>
                  <Link to={createPageUrl('KundliGenerator')}>
                    <Button className="bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                      Generate Kundli
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card className="p-8 border border-border">
              <h3 className="text-xl font-light mb-8">Your Journey Insights</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 border border-border">
                  <TrendingUp className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-normal mb-2">Active Spiritual Seeker</h4>
                    <p className="text-sm text-muted-foreground font-light">
                      You've completed {completedBookings} spiritual services. Continue your journey!
                    </p>
                  </div>
                </div>
                {totalDonated > 0 && (
                  <div className="flex items-start gap-4 p-6 border border-border">
                    <Heart className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-normal mb-2">Generous Contributor</h4>
                      <p className="text-sm text-muted-foreground font-light">
                        Your donations of ₹{totalDonated.toLocaleString()} support sacred causes.
                      </p>
                    </div>
                  </div>
                )}
                {bookings?.length >= 5 && (
                  <div className="flex items-start gap-4 p-6 border border-border">
                    <Star className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-normal mb-2">Regular Practitioner</h4>
                      <p className="text-sm text-muted-foreground font-light">
                        You've engaged with {bookings.length} spiritual services. Your dedication inspires!
                      </p>
                    </div>
                  </div>
                )}
                {favoriteTemples?.length > 0 && (
                  <div className="flex items-start gap-4 p-6 border border-border">
                    <Building2 className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-normal mb-2">Temple Devotee</h4>
                      <p className="text-sm text-muted-foreground font-light">
                        You've saved {favoriteTemples.length} sacred temples for your spiritual path.
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