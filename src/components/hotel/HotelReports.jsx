import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  BedDouble,
  Percent
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function HotelReports({ hotel, bookings = [] }) {
  const [period, setPeriod] = useState('this_month');

  // Filter bookings by period
  const getFilteredBookings = () => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'this_week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'this_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return bookings.filter(b => {
      if (!b.date || b.status === 'cancelled') return false;
      const bookingDate = new Date(b.date);
      return isWithinInterval(bookingDate, { start: startDate, end: endDate });
    });
  };

  const filteredBookings = getFilteredBookings();
  const completedBookings = filteredBookings.filter(b => b.status === 'completed' || b.status === 'in_progress');

  // Calculate metrics
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalBookings = filteredBookings.length;
  const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  // Occupancy calculation
  const totalRooms = hotel?.room_inventory?.reduce((sum, r) => sum + (r.total_rooms || 0), 0) || 1;
  const occupiedNights = completedBookings.reduce((sum, b) => {
    if (!b.date || !b.delivery_date) return sum + 1;
    const checkIn = new Date(b.date);
    const checkOut = new Date(b.delivery_date);
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    return sum + nights;
  }, 0);
  const daysInPeriod = period === 'today' ? 1 : period === 'this_week' ? 7 : 30;
  const maxOccupancy = totalRooms * daysInPeriod;
  const occupancyRate = maxOccupancy > 0 ? Math.round((occupiedNights / maxOccupancy) * 100) : 0;

  // Daily revenue data for chart
  const dailyRevenueData = useMemo(() => {
    const now = new Date();
    const days = period === 'this_week' ? 7 : period === 'today' ? 1 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayBookings = completedBookings.filter(b => 
        b.date && format(new Date(b.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      data.push({
        date: format(date, 'MMM d'),
        revenue: dayRevenue,
        bookings: dayBookings.length
      });
    }
    
    return data;
  }, [completedBookings, period]);

  // Guest demographics (mock data based on booking locations)
  const guestDemographics = useMemo(() => {
    const locationCounts = {};
    completedBookings.forEach(b => {
      const city = b.delivery_address?.city || 'Unknown';
      locationCounts[city] = (locationCounts[city] || 0) + 1;
    });
    
    return Object.entries(locationCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [completedBookings]);

  // Room type distribution
  const roomDistribution = useMemo(() => {
    return hotel?.room_inventory?.map(r => ({
      name: r.room_type,
      value: r.total_rooms - r.available_rooms,
      total: r.total_rooms
    })) || [];
  }, [hotel]);

  // Rating distribution (mock)
  const ratingData = [
    { rating: '5 Stars', count: 45, percentage: 60 },
    { rating: '4 Stars', count: 20, percentage: 27 },
    { rating: '3 Stars', count: 7, percentage: 9 },
    { rating: '2 Stars', count: 2, percentage: 3 },
    { rating: '1 Star', count: 1, percentage: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Reports & Analytics</h3>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <Badge className="bg-green-100 text-green-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </div>
          <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-5 h-5 text-blue-600" />
            <Badge className="bg-blue-100 text-blue-700">{occupancyRate}%</Badge>
          </div>
          <p className="text-2xl font-bold">{occupancyRate}%</p>
          <p className="text-sm text-gray-500">Occupancy Rate</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{totalBookings}</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold">₹{avgBookingValue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Avg Booking Value</p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Revenue Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guest Demographics */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Guest Demographics
          </h4>
          {guestDemographics.length > 0 ? (
            <div className="space-y-3">
              {guestDemographics.map((loc, idx) => (
                <div key={loc.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span>{loc.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{loc.value}</span>
                    <span className="text-gray-500 text-sm">guests</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>

        {/* Room Distribution */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            Room Occupancy
          </h4>
          {roomDistribution.length > 0 ? (
            <div className="space-y-4">
              {roomDistribution.map((room, idx) => {
                const percentage = room.total > 0 ? Math.round((room.value / room.total) * 100) : 0;
                return (
                  <div key={room.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{room.name}</span>
                      <span>{room.value}/{room.total} rooms ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No room data</p>
          )}
        </Card>
      </div>

      {/* Review Ratings */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Review Ratings
        </h4>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-500">{hotel?.rating_average || 4.5}</p>
            <div className="flex justify-center gap-1 my-2">
              {[1,2,3,4,5].map(i => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i <= (hotel?.rating_average || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">{hotel?.total_reviews || 75} reviews</p>
          </div>
          <div className="flex-1 space-y-2">
            {ratingData.map(item => (
              <div key={item.rating} className="flex items-center gap-3">
                <span className="text-sm w-16">{item.rating}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}