import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MoreVertical, 
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  User,
  Building2,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import logAuditAction from './useAuditLog';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings-list'],
    queryFn: () => base44.entities.Booking.filter({ is_deleted: false }, '-created_date'),
  });

  const { data: temples } = useQuery({
    queryKey: ['admin-temples-for-bookings'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }),
  });

  const { data: providers } = useQuery({
    queryKey: ['admin-providers-for-bookings'],
    queryFn: () => base44.entities.ProviderProfile.filter({ is_deleted: false }),
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users-for-bookings'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: poojas } = useQuery({
    queryKey: ['admin-poojas-for-bookings'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.Booking.update(id, { status });
      const user = await base44.auth.me();
      await logAuditAction(user, 'update', 'Booking', id, { status });
    },
    onSuccess: () => {
      toast.success('Booking status updated');
      queryClient.invalidateQueries(['admin-bookings-list']);
    }
  });

  const filteredBookings = bookings?.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesStatus;
  });

  const getTempleName = (templeId) => {
    const temple = temples?.find(t => t.id === templeId);
    return temple?.name || 'N/A';
  };

  const getProviderName = (providerId) => {
    const provider = providers?.find(p => p.id === providerId);
    return provider?.display_name || 'N/A';
  };

  const getUserName = (userId) => {
    const user = users?.find(u => u.id === userId);
    return user?.full_name || user?.email || 'N/A';
  };

  const getPoojaName = (poojaId) => {
    const pooja = poojas?.find(p => p.id === poojaId);
    return pooja?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Temple/Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredBookings?.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium capitalize">
                    {booking.booking_type?.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{getTempleName(booking.temple_id)}</TableCell>
                  <TableCell>
                    {booking.date ? format(new Date(booking.date), 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[booking.status]}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      booking.payment_status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }>
                      {booking.payment_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}>
                          <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                          Mark Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'completed' })}>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}>
                          <XCircle className="w-4 h-4 mr-2 text-red-500" />
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[selectedBooking.status]}>
                  {selectedBooking.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  ID: {selectedBooking.id?.slice(0, 8)}...
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">User Details</span>
                  </div>
                  <p className="text-sm">{getUserName(selectedBooking.user_id)}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold">Service</span>
                  </div>
                  <p className="text-sm capitalize">{selectedBooking.booking_type?.replace('_', ' ')}</p>
                  {selectedBooking.pooja_id && <p className="text-xs text-gray-500">{getPoojaName(selectedBooking.pooja_id)}</p>}
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold">Schedule</span>
                  </div>
                  <p className="text-sm">{selectedBooking.date ? format(new Date(selectedBooking.date), 'PPP') : 'N/A'}</p>
                  {selectedBooking.time_slot && <p className="text-xs text-gray-500">{selectedBooking.time_slot}</p>}
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">Payment</span>
                  </div>
                  <p className="text-sm font-bold">₹{selectedBooking.total_amount?.toLocaleString() || 0}</p>
                  <Badge className={
                    selectedBooking.payment_status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }>
                    {selectedBooking.payment_status || 'pending'}
                  </Badge>
                </Card>
              </div>

              {selectedBooking.provider_id && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-1">Assigned Provider</p>
                  <p className="text-sm">{getProviderName(selectedBooking.provider_id)}</p>
                </div>
              )}

              {selectedBooking.temple_id && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-1">Temple</p>
                  <p className="text-sm">{getTempleName(selectedBooking.temple_id)}</p>
                </div>
              )}

              {selectedBooking.special_requirements && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-1">Special Requirements</p>
                  <p className="text-sm">{selectedBooking.special_requirements}</p>
                </div>
              )}

              {selectedBooking.sankalp_details && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-1">Sankalp Details</p>
                  <div className="text-sm space-y-1">
                    {selectedBooking.sankalp_details.gotra && <p>Gotra: {selectedBooking.sankalp_details.gotra}</p>}
                    {selectedBooking.sankalp_details.nakshatra && <p>Nakshatra: {selectedBooking.sankalp_details.nakshatra}</p>}
                    {selectedBooking.sankalp_details.family_names?.length > 0 && (
                      <p>Family: {selectedBooking.sankalp_details.family_names.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
                {selectedBooking.status === 'pending' && (
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedBooking.id, status: 'confirmed' });
                      setSelectedBooking(null);
                    }}
                  >
                    Confirm Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}