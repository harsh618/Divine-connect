import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Search, 
  MoreVertical, 
  Eye,
  Shield,
  UserX,
  Loader2,
  Calendar,
  Heart,
  Activity,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => base44.entities.User.list(),
  });

  // Fetch user-related data for details modal
  const { data: userBookings = [] } = useQuery({
    queryKey: ['user-bookings', selectedUser?.id],
    queryFn: () => base44.entities.Booking.filter({ user_id: selectedUser?.id, is_deleted: false }),
    enabled: !!selectedUser?.id && showViewModal,
  });

  const { data: userDonations = [] } = useQuery({
    queryKey: ['user-donations', selectedUser?.id],
    queryFn: () => base44.entities.Donation.filter({ user_id: selectedUser?.id }),
    enabled: !!selectedUser?.id && showViewModal,
  });

  const { data: userActivities = [] } = useQuery({
    queryKey: ['user-activities', selectedUser?.id],
    queryFn: () => base44.entities.UserActivity.filter({ user_id: selectedUser?.id }, '-created_date', 20),
    enabled: !!selectedUser?.id && showViewModal,
  });

  const filteredUsers = users?.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => base44.asServiceRole.entities.User.update(userId, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user role');
    }
  });

  const handleView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleToggleAdmin = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    updateRoleMutation.mutate({ userId: user.id, newRole });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredUsers?.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }>
                      {user.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_date ? format(new Date(user.created_date), 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleAdmin(user)}>
                          <Shield className="w-4 h-4 mr-2" />
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Modal with Tabs */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="profile" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="bookings">Bookings ({userBookings.length})</TabsTrigger>
                <TabsTrigger value="donations">Donations ({userDonations.length})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedUser.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <Badge className={
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }>
                      {selectedUser.role || 'user'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">
                      {selectedUser.created_date ? format(new Date(selectedUser.created_date), 'PPP') : 'N/A'}
                    </p>
                  </div>
                  {selectedUser.gotra && (
                    <div>
                      <p className="text-sm text-gray-500">Gotra</p>
                      <p className="font-medium">{selectedUser.gotra}</p>
                    </div>
                  )}
                  {selectedUser.favorite_deity && (
                    <div>
                      <p className="text-sm text-gray-500">Favorite Deity</p>
                      <p className="font-medium">{selectedUser.favorite_deity}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <Card className="p-4 text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{userBookings.length}</p>
                    <p className="text-xs text-gray-500">Total Bookings</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Heart className="w-5 h-5 mx-auto mb-2 text-pink-500" />
                    <p className="text-2xl font-bold">₹{userDonations.reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total Donated</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Activity className="w-5 h-5 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{userActivities.length}</p>
                    <p className="text-xs text-gray-500">Activities</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="py-4">
                {userBookings.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {userBookings.map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{booking.booking_type?.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-500">{booking.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{booking.total_amount?.toLocaleString() || 0}</p>
                          <Badge className={
                            booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No bookings found</p>
                )}
              </TabsContent>

              <TabsContent value="donations" className="py-4">
                {userDonations.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {userDonations.map(donation => (
                      <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-medium">Donation</p>
                            <p className="text-xs text-gray-500">
                              {donation.created_date ? format(new Date(donation.created_date), 'PP') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">₹{donation.amount?.toLocaleString()}</p>
                          {donation.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No donations found</p>
                )}
              </TabsContent>

              <TabsContent value="activity" className="py-4">
                {userActivities.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {userActivities.map(activity => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.action || activity.activity_type}</p>
                          <p className="text-xs text-gray-500">
                            {activity.created_date ? format(new Date(activity.created_date), 'PPp') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No activity recorded</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}