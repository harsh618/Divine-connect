import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Download, 
  TrendingUp, 
  Calendar,
  Eye,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function AdminUserAnalytics() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date')
  });

  const { data: activities } = useQuery({
    queryKey: ['all-activities'],
    queryFn: () => base44.entities.UserActivity.list('-created_date')
  });

  const { data: bookings } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => base44.entities.Booking.filter({ is_deleted: false })
  });

  const { data: donations } = useQuery({
    queryKey: ['all-donations'],
    queryFn: () => base44.entities.Donation.list()
  });

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('exportUserData', {
        exportType: 'all_users'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_users_analytics_${new Date().toISOString().split('T')[0]}.csv`;
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

  const filteredUsers = users?.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate user stats
  const getUserStats = (userId) => {
    const userActivities = activities?.filter(a => a.user_id === userId) || [];
    const userBookings = bookings?.filter(b => b.user_id === userId) || [];
    const userDonations = donations?.filter(d => d.user_id === userId) || [];
    
    const totalSpent = [
      ...userBookings.map(b => b.total_amount || 0),
      ...userDonations.map(d => d.amount || 0)
    ].reduce((sum, val) => sum + val, 0);

    const pageViews = userActivities.filter(a => a.event_type === 'page_view').length;

    return {
      pageViews,
      bookings: userBookings.length,
      donations: userDonations.length,
      totalSpent
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Analytics</h1>
            <p className="text-gray-600">Track user behavior, engagement, and transactions</p>
          </div>
          <Button 
            onClick={handleExportAll}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export All Users CSV
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users?.length || 0}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Page Views</p>
                <p className="text-3xl font-bold text-gray-900">
                  {activities?.filter(a => a.event_type === 'page_view').length || 0}
                </p>
              </div>
              <Eye className="w-10 h-10 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings?.length || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{([
                    ...(bookings || []).map(b => b.total_amount || 0),
                    ...(donations || []).map(d => d.amount || 0)
                  ].reduce((sum, val) => sum + val, 0)).toLocaleString('en-IN')}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search users by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Page Views</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bookings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Donations</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Spent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers?.map((user) => {
                  const stats = getUserStats(user.id);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{stats.pageViews}</td>
                      <td className="px-6 py-4 text-gray-900">{stats.bookings}</td>
                      <td className="px-6 py-4 text-gray-900">{stats.donations}</td>
                      <td className="px-6 py-4 text-gray-900">
                        ₹{stats.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(user.created_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link to={createPageUrl('AdminUserDetail') + `?userId=${user.id}`}>
                          <Button variant="outline" size="sm">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}