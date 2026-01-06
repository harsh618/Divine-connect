import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Download, 
  Clock,
  Eye,
  MousePointer,
  Calendar,
  DollarSign,
  Smartphone,
  Monitor,
  Tablet,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function AdminUserDetail() {
  const userId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
  }, []);

  const [isExporting, setIsExporting] = useState(false);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['user-analytics', userId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getUserAnalytics', { userId });
      return response.data;
    },
    enabled: !!userId
  });

  const handleExportUser = async () => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('exportUserData', { userId });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_${userId}_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('User data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const { user, analytics, bookings, donations } = analyticsData;

  const deviceIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminUserAnalytics')}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.full_name || 'User'}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
          </div>
          <Button 
            onClick={handleExportUser}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export User Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Page Views</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalPageViews}</p>
              </div>
              <Eye className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Time Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.floor(analytics.totalTimeSpent / 60)}m
                </p>
              </div>
              <Clock className="w-10 h-10 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</p>
              </div>
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{analytics.totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Visited Pages */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Most Visited Pages
            </h2>
            <div className="space-y-3">
              {analytics.mostVisitedPages?.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{page.page}</span>
                  <Badge variant="secondary">{page.count} visits</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Device Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-purple-500" />
              Device Usage
            </h2>
            <div className="space-y-3">
              {Object.entries(analytics.deviceBreakdown || {}).map(([device, count]) => {
                const Icon = deviceIcons[device] || Monitor;
                return (
                  <div key={device} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900 capitalize">{device}</span>
                    </div>
                    <Badge variant="secondary">{count} sessions</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Top Interactions */}
        {analytics.entityInteractions?.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Top Interactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.entityInteractions.map((entity, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <Badge className="mb-2 capitalize">{entity.type}</Badge>
                  <p className="font-medium text-gray-900 mb-1">{entity.name}</p>
                  <p className="text-sm text-gray-600">{entity.count} interactions</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Activities */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {analytics.recentActivities?.slice(0, 20).map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">{activity.event_type}</Badge>
                  <span className="text-gray-900">{activity.page_name}</span>
                  {activity.entity_name && (
                    <span className="text-gray-600">→ {activity.entity_name}</span>
                  )}
                </div>
                <span className="text-gray-500">
                  {new Date(activity.created_date).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings History */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Booking History</h2>
            <div className="space-y-3">
              {bookings?.slice(0, 10).map((booking) => (
                <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="capitalize">{booking.booking_type}</Badge>
                    <span className="font-bold text-gray-900">₹{booking.total_amount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                    <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {bookings?.length === 0 && (
                <p className="text-gray-500 text-center py-4">No bookings yet</p>
              )}
            </div>
          </Card>

          {/* Donations History */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Donation History</h2>
            <div className="space-y-3">
              {donations?.slice(0, 10).map((donation) => (
                <div key={donation.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {donation.campaign_id ? 'Campaign' : 'Direct'}
                    </span>
                    <span className="font-bold text-gray-900">₹{donation.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{new Date(donation.created_date).toLocaleDateString()}</span>
                    {donation.is_anonymous && (
                      <Badge variant="outline" className="text-xs">Anonymous</Badge>
                    )}
                  </div>
                </div>
              ))}
              {donations?.length === 0 && (
                <p className="text-gray-500 text-center py-4">No donations yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}