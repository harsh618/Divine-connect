import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Building2, 
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  Heart,
  Star
} from 'lucide-react';

function StatCard({ icon: Icon, value, label, color, trend }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminStats() {
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

  const totalRevenue = (bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) +
                       (donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0);
  const pendingVerifications = providers?.filter(p => !p.is_verified).length || 0;
  const activeBookings = bookings?.filter(b => ['pending', 'confirmed'].includes(b.status)).length || 0;

  const isLoading = loadingUsers || loadingTemples || loadingBookings || loadingDonations;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          value={users?.length || 0}
          label="Total Users"
          color="bg-blue-500"
          trend="+12% this month"
        />
        <StatCard
          icon={DollarSign}
          value={`₹${totalRevenue.toLocaleString()}`}
          label="Total Revenue"
          color="bg-green-500"
          trend="+8% this month"
        />
        <StatCard
          icon={Calendar}
          value={activeBookings}
          label="Active Bookings"
          color="bg-purple-500"
        />
        <StatCard
          icon={UserCheck}
          value={pendingVerifications}
          label="Pending Verifications"
          color="bg-orange-500"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          value={temples?.length || 0}
          label="Temples"
          color="bg-amber-500"
        />
        <StatCard
          icon={Heart}
          value={donations?.length || 0}
          label="Donations"
          color="bg-pink-500"
        />
        <StatCard
          icon={Star}
          value={providers?.filter(p => p.is_verified).length || 0}
          label="Verified Providers"
          color="bg-indigo-500"
        />
        <StatCard
          icon={Calendar}
          value={bookings?.filter(b => b.status === 'completed').length || 0}
          label="Completed Bookings"
          color="bg-teal-500"
        />
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {bookings?.slice(0, 5).map((booking, idx) => (
            <div key={booking.id || idx} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  booking.status === 'completed' ? 'bg-green-500' :
                  booking.status === 'confirmed' ? 'bg-blue-500' :
                  booking.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                <div>
                  <p className="font-medium text-sm capitalize">{booking.booking_type?.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{booking.date}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {booking.status}
              </span>
            </div>
          ))}
          {(!bookings || bookings.length === 0) && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
}