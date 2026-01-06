import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  TrendingUp,
  Tag,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp
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
  const [isExportingLog, setIsExportingLog] = useState(false);
  const [showFullLog, setShowFullLog] = useState(false);
  const [logLimit, setLogLimit] = useState(50);
  const queryClient = useQueryClient();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['user-analytics', userId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getUserAnalytics', { userId });
      return response.data;
    },
    enabled: !!userId
  });

  const updateLabelsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('updateUserLabels', { userId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-analytics', userId]);
      toast.success('User labels updated!');
    },
    onError: () => {
      toast.error('Failed to update labels');
    }
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

  const handleExportActivityLog = async () => {
    setIsExportingLog(true);
    try {
      const response = await base44.functions.invoke('exportUserActivityLog', { userId });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_${userId}_activity_log_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Activity log exported successfully!');
    } catch (error) {
      toast.error('Failed to export activity log');
    } finally {
      setIsExportingLog(false);
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

  const labelColors = {
    high_value: 'bg-purple-500',
    medium_value: 'bg-purple-300',
    repeat_customer: 'bg-green-500',
    high_intent_new: 'bg-orange-500',
    engaged: 'bg-blue-500',
    power_user: 'bg-indigo-500',
    browser: 'bg-gray-400',
    at_risk: 'bg-red-500',
    inactive: 'bg-slate-400',
    quick_converter: 'bg-emerald-500',
    new_visitor: 'bg-cyan-400',
    window_shopper: 'bg-amber-400',
    deep_researcher: 'bg-teal-500',
    mobile_user: 'bg-pink-400',
    donation_focused: 'bg-rose-500',
    service_seeker: 'bg-violet-500'
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
          <div className="flex gap-3">
            <Button 
              onClick={() => updateLabelsMutation.mutate()}
              disabled={updateLabelsMutation.isPending}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              {updateLabelsMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Update Labels
            </Button>
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
              Export Data
            </Button>
          </div>
        </div>

        {/* User Labels */}
        {user.user_labels && user.user_labels.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-500" />
              User Intent Labels
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.user_labels.map((label, idx) => (
                <Badge 
                  key={idx} 
                  className={`${labelColors[label] || 'bg-gray-500'} text-white px-4 py-2 text-sm`}
                >
                  {label.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
            {user.last_label_update && (
              <p className="text-xs text-gray-500 mt-3">
                Last updated: {new Date(user.last_label_update).toLocaleString()}
              </p>
            )}
          </Card>
        )}

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

        {/* Complete Activity Log */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Complete Activity Log
              <Badge variant="outline" className="ml-2">
                {analytics.recentActivities?.length || 0} total events
              </Badge>
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFullLog(!showFullLog)}
                variant="outline"
                size="sm"
              >
                {showFullLog ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Expand All
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportActivityLog}
                disabled={isExportingLog}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isExportingLog ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export Log
              </Button>
            </div>
          </div>

          {analytics.recentActivities?.length > 0 ? (
            <>
              <div className="space-y-1 mb-4">
                {analytics.recentActivities.slice(0, showFullLog ? logLimit : 20).map((activity, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors border border-transparent hover:border-indigo-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge 
                        variant="outline" 
                        className={`capitalize shrink-0 ${
                          activity.event_type === 'page_view' ? 'border-blue-300 text-blue-700' :
                          activity.event_type === 'button_click' ? 'border-green-300 text-green-700' :
                          activity.event_type === 'service_booked' ? 'border-orange-300 text-orange-700' :
                          activity.event_type === 'donation_made' ? 'border-purple-300 text-purple-700' :
                          'border-gray-300 text-gray-700'
                        }`}
                      >
                        {activity.event_type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-gray-900 font-medium truncate">{activity.page_name}</span>
                      {activity.entity_name && (
                        <span className="text-gray-600 truncate">→ {activity.entity_name}</span>
                      )}
                      {activity.duration_seconds && (
                        <Badge variant="secondary" className="shrink-0">
                          {activity.duration_seconds}s
                        </Badge>
                      )}
                      {activity.device_type && (
                        <Badge variant="outline" className="shrink-0 capitalize">
                          {activity.device_type}
                        </Badge>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs shrink-0 ml-4">
                      {new Date(activity.created_date).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {showFullLog && analytics.recentActivities.length > logLimit && (
                <div className="text-center">
                  <Button
                    onClick={() => setLogLimit(prev => prev + 50)}
                    variant="outline"
                    size="sm"
                  >
                    Load More ({analytics.recentActivities.length - logLimit} remaining)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">No activity logs available</p>
              <p className="text-sm text-gray-400">Activity will appear here once the user interacts with the app</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}