import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  RotateCcw, 
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTrash() {
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, entity: null, item: null });

  // Fetch deleted items
  const { data: deletedTemples, isLoading: loadingTemples } = useQuery({
    queryKey: ['admin-deleted-temples'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: true }),
  });

  const { data: deletedBookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['admin-deleted-bookings'],
    queryFn: () => base44.entities.Booking.filter({ is_deleted: true }),
  });

  const { data: deletedCampaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['admin-deleted-campaigns'],
    queryFn: () => base44.entities.DonationCampaign.filter({ is_deleted: true }),
  });

  // Restore mutations
  const restoreTempleMutation = useMutation({
    mutationFn: (id) => base44.entities.Temple.update(id, { is_deleted: false }),
    onSuccess: () => {
      toast.success('Temple restored successfully!');
      queryClient.invalidateQueries(['admin-deleted-temples']);
      queryClient.invalidateQueries(['admin-temples-list']);
    }
  });

  const restoreBookingMutation = useMutation({
    mutationFn: (id) => base44.entities.Booking.update(id, { is_deleted: false }),
    onSuccess: () => {
      toast.success('Booking restored successfully!');
      queryClient.invalidateQueries(['admin-deleted-bookings']);
      queryClient.invalidateQueries(['admin-bookings-list']);
    }
  });

  const restoreCampaignMutation = useMutation({
    mutationFn: (id) => base44.entities.DonationCampaign.update(id, { is_deleted: false }),
    onSuccess: () => {
      toast.success('Campaign restored successfully!');
      queryClient.invalidateQueries(['admin-deleted-campaigns']);
      queryClient.invalidateQueries(['admin-campaigns-list']);
    }
  });

  // Permanent delete mutations
  const deleteTempleMutation = useMutation({
    mutationFn: (id) => base44.entities.Temple.delete(id),
    onSuccess: () => {
      toast.success('Temple permanently deleted');
      queryClient.invalidateQueries(['admin-deleted-temples']);
      setDeleteDialog({ open: false, entity: null, item: null });
    }
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (id) => base44.entities.Booking.delete(id),
    onSuccess: () => {
      toast.success('Booking permanently deleted');
      queryClient.invalidateQueries(['admin-deleted-bookings']);
      setDeleteDialog({ open: false, entity: null, item: null });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => base44.entities.DonationCampaign.delete(id),
    onSuccess: () => {
      toast.success('Campaign permanently deleted');
      queryClient.invalidateQueries(['admin-deleted-campaigns']);
      setDeleteDialog({ open: false, entity: null, item: null });
    }
  });

  const handlePermanentDelete = () => {
    const { entity, item } = deleteDialog;
    if (entity === 'temple') {
      deleteTempleMutation.mutate(item.id);
    } else if (entity === 'booking') {
      deleteBookingMutation.mutate(item.id);
    } else if (entity === 'campaign') {
      deleteCampaignMutation.mutate(item.id);
    }
  };

  const isPending = deleteTempleMutation.isPending || deleteBookingMutation.isPending || deleteCampaignMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-yellow-800">Trash Bin</h4>
          <p className="text-sm text-yellow-700">
            Items here have been soft deleted. You can restore them or permanently delete them.
            Permanent deletion cannot be undone.
          </p>
        </div>
      </div>

      <Tabs defaultValue="temples">
        <TabsList>
          <TabsTrigger value="temples">
            Temples ({deletedTemples?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="bookings">
            Bookings ({deletedBookings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            Campaigns ({deletedCampaigns?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Temples */}
        <TabsContent value="temples">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Deity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTemples ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : deletedTemples?.length > 0 ? (
                  deletedTemples.map((temple) => (
                    <TableRow key={temple.id}>
                      <TableCell className="font-medium">{temple.name}</TableCell>
                      <TableCell>{temple.primary_deity}</TableCell>
                      <TableCell>{temple.city}, {temple.state}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreTempleMutation.mutate(temple.id)}
                            disabled={restoreTempleMutation.isPending}
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: true, entity: 'temple', item: temple })}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Forever
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No deleted temples
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Bookings */}
        <TabsContent value="bookings">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingBookings ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : deletedBookings?.length > 0 ? (
                  deletedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium capitalize">
                        {booking.booking_type?.replace('_', ' ')}
                      </TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{booking.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreBookingMutation.mutate(booking.id)}
                            disabled={restoreBookingMutation.isPending}
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: true, entity: 'booking', item: booking })}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Forever
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No deleted bookings
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead className="w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCampaigns ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : deletedCampaigns?.length > 0 ? (
                  deletedCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.title}</TableCell>
                      <TableCell>{campaign.category?.replace('_', ' ')}</TableCell>
                      <TableCell>₹{campaign.goal_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreCampaignMutation.mutate(campaign.id)}
                            disabled={restoreCampaignMutation.isPending}
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: true, entity: 'campaign', item: campaign })}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Forever
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No deleted campaigns
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Permanent Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {deleteDialog.entity} 
              and all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}