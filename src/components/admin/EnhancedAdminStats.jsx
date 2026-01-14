import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Building2, Calendar, DollarSign, TrendingUp, TrendingDown,
  UserCheck, Heart, Star, ArrowRight, Clock, CheckCircle2, AlertCircle,
  Activity, Eye, Flame, BarChart3
} from 'lucide-react';
import { format, subDays, subMonths, isToday, isThisWeek, isThisMonth, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

function StatCard({ icon: Icon, value, label, color, trend, trendValue, onClick }) {
  const isPositive = trendValue > 0;
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{trendValue > 0 ? '+' : ''}{trendValue}%</span>
                <span className="text-gray-400">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ icon: Icon, title, count, color, actionLabel, onClick }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{count} pending</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onClick}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function EnhancedAdminStats({ onNavigate }) {
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: temples, isLoading: loadingTemples } = useQuery({
    queryKey: ['admin-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }),
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => base44.entities.Booking.filter({ is_deleted: false }),
  });

  const { data: donations, isLoading: loadingDonations } = useQuery({
    queryKey: ['admin-donations'],
    queryFn: () => base44.entities.Donation.list(),
  });

  const { data: providers } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ is_deleted: false }),
  });

  const { data: poojas } = useQuery({
    queryKey: ['admin-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }),
  });

  const { data: campaigns } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => base44.entities.DonationCampaign.filter({ is_deleted: false }),
  });

  const isLoading = loadingUsers || loadingTemples || loadingBookings || loadingDonations;

  // Calculate metrics
  const totalRevenue = (bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) +
                       (donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0);
  const pendingVerifications = providers?.filter(p => !p.is_verified).length || 0;
  const activeBookings = bookings?.filter(b => ['pending', 'confirmed'].includes(b.status)).length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
  const verifiedProviders = providers?.filter(p => p.is_verified).length || 0;
  const todayBookings = bookings?.filter(b => b.created_date && isToday(new Date(b.created_date))).length || 0;
  const thisWeekBookings = bookings?.filter(b => b.created_date && isThisWeek(new Date(b.created_date))).length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0;

  // Calculate dynamic trends (this month vs last month)
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

  const thisMonthUsers = users?.filter(u => u.created_date && isWithinInterval(new Date(u.created_date), { start: thisMonthStart, end: thisMonthEnd })).length || 0;
  const lastMonthUsers = users?.filter(u => u.created_date && isWithinInterval(new Date(u.created_date), { start: lastMonthStart, end: lastMonthEnd })).length || 0;
  const userTrend = lastMonthUsers > 0 ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) : thisMonthUsers > 0 ? 100 : 0;

  const thisMonthRevenue = (bookings?.filter(b => b.created_date && isWithinInterval(new Date(b.created_date), { start: thisMonthStart, end: thisMonthEnd })).reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) +
                           (donations?.filter(d => d.created_date && isWithinInterval(new Date(d.created_date), { start: thisMonthStart, end: thisMonthEnd })).reduce((sum, d) => sum + (d.amount || 0), 0) || 0);
  const lastMonthRevenue = (bookings?.filter(b => b.created_date && isWithinInterval(new Date(b.created_date), { start: lastMonthStart, end: lastMonthEnd })).reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) +
                           (donations?.filter(d => d.created_date && isWithinInterval(new Date(d.created_date), { start: lastMonthStart, end: lastMonthEnd })).reduce((sum, d) => sum + (d.amount || 0), 0) || 0);
  const revenueTrend = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : thisMonthRevenue > 0 ? 100 : 0;

  // Chart data - real revenue calculation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBookings = bookings?.filter(b => 
      b.created_date && format(new Date(b.created_date), 'yyyy-MM-dd') === dateStr
    ) || [];
    const dayDonations = donations?.filter(d => 
      d.created_date && format(new Date(d.created_date), 'yyyy-MM-dd') === dateStr
    ) || [];
    
    return {
      name: format(date, 'EEE'),
      bookings: dayBookings.length,
      revenue: dayBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) + 
               dayDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    };
  });

  const bookingTypeData = [
    { name: 'Temple Visit', value: bookings?.filter(b => b.booking_type === 'temple_visit').length || 0 },
    { name: 'Pooja', value: bookings?.filter(b => b.booking_type === 'pooja').length || 0 },
    { name: 'Prasad', value: bookings?.filter(b => b.booking_type === 'prasad').length || 0 },
    { name: 'Consultation', value: bookings?.filter(b => b.booking_type === 'consultation').length || 0 },
  ].filter(d => d.value > 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome to Divine Admin Panel</h1>
              <p className="text-orange-100">Here's what's happening with your platform today.</p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-right">
              <div>
                <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-orange-100 text-sm">Total Revenue</p>
              </div>
              <div className="h-12 w-px bg-white/30" />
              <div>
                <p className="text-3xl font-bold">{todayBookings}</p>
                <p className="text-orange-100 text-sm">Bookings Today</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          value={users?.length || 0}
          label="Total Users"
          color="bg-blue-500"
          trend="vs last month"
          trendValue={userTrend}
          onClick={() => onNavigate?.('users')}
        />
        <StatCard
          icon={DollarSign}
          value={`₹${totalRevenue.toLocaleString()}`}
          label="Total Revenue"
          color="bg-green-500"
          trend="vs last month"
          trendValue={revenueTrend}
        />
        <StatCard
          icon={Heart}
          value={`${activeCampaigns} Active`}
          label="Donation Campaigns"
          color="bg-pink-500"
          onClick={() => onNavigate?.('donations')}
        />
        <StatCard
          icon={Flame}
          value={poojas?.length || 0}
          label="Poojas Listed"
          color="bg-orange-500"
          onClick={() => onNavigate?.('poojas')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          value={activeBookings}
          label="Active Bookings"
          color="bg-purple-500"
          onClick={() => onNavigate?.('bookings')}
        />
        <StatCard
          icon={UserCheck}
          value={verifiedProviders}
          label="Verified Providers"
          color="bg-indigo-500"
          onClick={() => onNavigate?.('providers')}
        />
        <StatCard
          icon={AlertCircle}
          value={pendingVerifications}
          label="Pending Verifications"
          color="bg-amber-500"
          onClick={() => onNavigate?.('providers')}
        />
        <StatCard
          icon={CheckCircle2}
          value={completedBookings}
          label="Completed Bookings"
          color="bg-teal-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          icon={UserCheck}
          title="Approve Providers"
          count={pendingVerifications}
          color="bg-orange-500"
          actionLabel="Review"
          onClick={() => onNavigate?.('providers')}
        />
        <QuickActionCard
          icon={Calendar}
          title="New Bookings"
          count={activeBookings}
          color="bg-blue-500"
          actionLabel="View"
          onClick={() => onNavigate?.('bookings')}
        />
        <QuickActionCard
          icon={Heart}
          title="Campaign Updates"
          count={activeCampaigns}
          color="bg-pink-500"
          actionLabel="Manage"
          onClick={() => onNavigate?.('donations')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Last 7 Days Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#f97316" 
                  fill="#fed7aa" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Booking Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              {bookingTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={bookingTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bookingTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No booking data yet
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {bookingTypeData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('bookings')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings?.slice(0, 6).map((booking, idx) => (
              <div key={booking.id || idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    booking.booking_type === 'temple_visit' ? 'bg-orange-100' :
                    booking.booking_type === 'pooja' ? 'bg-purple-100' :
                    booking.booking_type === 'prasad' ? 'bg-pink-100' : 'bg-blue-100'
                  }`}>
                    {booking.booking_type === 'temple_visit' ? <Building2 className="w-5 h-5 text-orange-600" /> :
                     booking.booking_type === 'pooja' ? <Flame className="w-5 h-5 text-purple-600" /> :
                     booking.booking_type === 'prasad' ? <Heart className="w-5 h-5 text-pink-600" /> :
                     <Calendar className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {booking.booking_type?.replace('_', ' ') || 'Booking'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.date} • ₹{booking.total_amount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <Badge className={
                  booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }>
                  {booking.status}
                </Badge>
              </div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}