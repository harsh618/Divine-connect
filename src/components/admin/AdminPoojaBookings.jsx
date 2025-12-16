import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Search, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function AdminPoojaBookings() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-pooja-bookings'],
    queryFn: () => base44.entities.Booking.filter({ 
      booking_type: 'pooja',
      is_deleted: false 
    }, '-created_date'),
  });

  const { data: poojas } = useQuery({
    queryKey: ['admin-poojas-list'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }),
  });

  const { data: priests } = useQuery({
    queryKey: ['admin-priests-list'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      provider_type: 'priest',
      is_deleted: false 
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: () => {
      toast.success('Booking status updated');
      queryClient.invalidateQueries(['admin-pooja-bookings']);
      setSelectedBooking(null);
    }
  });

  const filteredBookings = bookings?.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      booking.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getPoojaName = (poojaId) => {
    return poojas?.find(p => p.id === poojaId)?.name || 'N/A';
  };

  const getPriestName = (priestId) => {
    return priests?.find(p => p.id === priestId)?.display_name || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pooja Bookings</h2>
          <p className="text-gray-500">Manage all pooja bookings</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
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
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pooja</TableHead>
              <TableHead>Priest</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredBookings?.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {getPoojaName(booking.pooja_id)}
                  </TableCell>
                  <TableCell>{getPriestName(booking.provider_id)}</TableCell>
                  <TableCell>
                    {booking.date ? format(new Date(booking.date), 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell>{booking.time_slot || 'N/A'}</TableCell>
                  <TableCell className="capitalize">
                    {booking.service_mode?.replace('_', ' ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[booking.status]}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{booking.total_amount || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {booking.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => updateStatusMutation.mutate({ 
                            id: booking.id, 
                            status: 'confirmed' 
                          })}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateStatusMutation.mutate({ 
                            id: booking.id, 
                            status: 'completed' 
                          })}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pooja</p>
                  <p className="font-medium">{getPoojaName(selectedBooking.pooja_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priest</p>
                  <p className="font-medium">{getPriestName(selectedBooking.provider_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {selectedBooking.date ? format(new Date(selectedBooking.date), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Slot</p>
                  <p className="font-medium">{selectedBooking.time_slot || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Mode</p>
                  <p className="font-medium capitalize">
                    {selectedBooking.service_mode?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={statusColors[selectedBooking.status]}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{selectedBooking.total_amount || 0}</p>
                </div>
              </div>

              {selectedBooking.location && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-sm">{selectedBooking.location}</p>
                </div>
              )}

              {selectedBooking.sankalp_details && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Sankalp Details</p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    {selectedBooking.sankalp_details.family_names && (
                      <p><strong>Family:</strong> {selectedBooking.sankalp_details.family_names.join(', ')}</p>
                    )}
                    {selectedBooking.sankalp_details.gotra && (
                      <p><strong>Gotra:</strong> {selectedBooking.sankalp_details.gotra}</p>
                    )}
                    {selectedBooking.sankalp_details.nakshatra && (
                      <p><strong>Nakshatra:</strong> {selectedBooking.sankalp_details.nakshatra}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.special_requirements && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Special Requirements</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedBooking.special_requirements}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {selectedBooking.status === 'pending' && (
                  <Button 
                    onClick={() => updateStatusMutation.mutate({ 
                      id: selectedBooking.id, 
                      status: 'confirmed' 
                    })}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Confirm Booking
                  </Button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button 
                    onClick={() => updateStatusMutation.mutate({ 
                      id: selectedBooking.id, 
                      status: 'completed' 
                    })}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Mark as Completed
                  </Button>
                )}
                {['pending', 'confirmed'].includes(selectedBooking.status) && (
                  <Button 
                    onClick={() => updateStatusMutation.mutate({ 
                      id: selectedBooking.id, 
                      status: 'cancelled' 
                    })}
                    variant="destructive"
                    className="flex-1"
                  >
                    Cancel Booking
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