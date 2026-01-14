import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Calendar, Building2,
  Heart, Star, MapPin, Clock, BarChart3, PieChart, LineChart,
  Download, Filter, ArrowUpRight, Target
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart as RechartsLine, Line, Legend
} from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

function MetricCard({ title, value, change, icon: Icon, color, subValue }) {
  const isPositive = change >= 0;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? '+' : ''}{change}%</span>
                <span className="text-gray-400">vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('revenue');

  const { data: bookings = [] } = useQuery({
    queryKey: ['analytics-bookings'],
    queryFn: () => base44.entities.Booking.filter({ is_deleted: false }),
  });

  const { data: donations = [] } = useQuery({
    queryKey: ['analytics-donations'],
    queryFn: () => base44.entities.Donation.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['analytics-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['analytics-providers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ is_deleted: false }),
  });

  const { data: temples = [] } = useQuery({
    queryKey: ['analytics-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }),
  });

  // Calculate metrics
  const totalBookingRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalDonationRevenue = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalRevenue = totalBookingRevenue + totalDonationRevenue;
  const avgBookingValue = bookings.length > 0 ? Math.round(totalBookingRevenue / bookings.length) : 0;
  
  // Generate chart data based on time range
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const chartData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBookings = bookings.filter(b => 
      b.created_date && format(new Date(b.created_date), 'yyyy-MM-dd') === dateStr
    );
    const dayDonations = donations.filter(d => 
      d.created_date && format(new Date(d.created_date), 'yyyy-MM-dd') === dateStr
    );
    
    return {
      name: format(date, 'MMM d'),
      bookings: dayBookings.length,
      revenue: dayBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
      donations: dayDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
      users: users.filter(u => u.created_date && format(new Date(u.created_date), 'yyyy-MM-dd') === dateStr).length
    };
  });

  // Booking type distribution
  const bookingTypeData = [
    { name: 'Temple Visit', value: bookings.filter(b => b.booking_type === 'temple_visit').length, color: '#f97316' },
    { name: 'Pooja', value: bookings.filter(b => b.booking_type === 'pooja').length, color: '#8b5cf6' },
    { name: 'Prasad', value: bookings.filter(b => b.booking_type === 'prasad').length, color: '#ec4899' },
    { name: 'Consultation', value: bookings.filter(b => b.booking_type === 'consultation').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Provider performance
  const providerPerformance = providers
    .map(p => ({
      name: p.display_name || 'Unknown',
      bookings: bookings.filter(b => b.provider_id === p.id).length,
      revenue: bookings.filter(b => b.provider_id === p.id).reduce((sum, b) => sum + (b.total_amount || 0), 0),
      rating: p.rating_average || 0
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  // Geographic distribution (placeholder)
  const geoData = [
    { name: 'Maharashtra', value: 35 },
    { name: 'Uttar Pradesh', value: 25 },
    { name: 'Karnataka', value: 15 },
    { name: 'Tamil Nadu', value: 12 },
    { name: 'Others', value: 13 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          change={12}
          icon={DollarSign}
          color="bg-green-500"
          subValue={`₹${avgBookingValue.toLocaleString()} avg booking`}
        />
        <MetricCard
          title="Total Bookings"
          value={bookings.length}
          change={8}
          icon={Calendar}
          color="bg-blue-500"
          subValue={`${bookings.filter(b => b.status === 'completed').length} completed`}
        />
        <MetricCard
          title="Total Users"
          value={users.length}
          change={15}
          icon={Users}
          color="bg-purple-500"
        />
        <MetricCard
          title="Donation Revenue"
          value={`₹${totalDonationRevenue.toLocaleString()}`}
          change={20}
          icon={Heart}
          color="bg-pink-500"
          subValue={`${donations.length} donations`}
        />
      </div>

      {/* Tabs for Different Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6 mt-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-green-500" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Bookings" stroke="#3b82f6" fill="#93c5fd" />
                  <Area type="monotone" dataKey="donations" name="Donations" stroke="#ec4899" fill="#fbcfe8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Temple Bookings', value: bookings.filter(b => b.booking_type === 'temple_visit').reduce((s, b) => s + (b.total_amount || 0), 0), color: 'bg-orange-500' },
                    { name: 'Pooja Services', value: bookings.filter(b => b.booking_type === 'pooja').reduce((s, b) => s + (b.total_amount || 0), 0), color: 'bg-purple-500' },
                    { name: 'Donations', value: totalDonationRevenue, color: 'bg-pink-500' },
                    { name: 'Astrology', value: bookings.filter(b => b.booking_type === 'consultation').reduce((s, b) => s + (b.total_amount || 0), 0), color: 'bg-blue-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={geoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {geoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {geoData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="users" name="New Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={bookingTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {bookingTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-400">
                    No booking data
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => {
                    const count = bookings.filter(b => b.status === status).length;
                    const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-gray-600">{status.replace('_', ' ')}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              status === 'completed' ? 'bg-green-500' :
                              status === 'confirmed' ? 'bg-blue-500' :
                              status === 'pending' ? 'bg-yellow-500' :
                              status === 'in_progress' ? 'bg-purple-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerPerformance.length > 0 ? providerPerformance.map((provider, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{provider.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{provider.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{provider.bookings} bookings</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">No provider data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}