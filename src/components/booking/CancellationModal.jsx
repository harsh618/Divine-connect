import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CancellationModal({ isOpen, onClose, booking }) {
  const queryClient = useQueryClient();
  const [cancellationReason, setCancellationReason] = useState('');
  const [refundDetails, setRefundDetails] = useState(null);

  const cancellationMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('processCancellation', {
        booking_id: booking.id,
        cancellation_reason: cancellationReason
      });
      return response.data;
    },
    onSuccess: (data) => {
      setRefundDetails(data.refund_details);
      queryClient.invalidateQueries(['bookings']);
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error('Cancellation failed: ' + error.message);
    }
  });

  const handleCancel = () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    cancellationMutation.mutate();
  };

  if (refundDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Cancelled</h2>
            <p className="text-gray-600 mb-6">Your refund has been processed</p>
            
            <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original Amount</span>
                <span className="font-semibold">₹{refundDetails.original_amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cancellation Fee</span>
                <span className="font-semibold text-red-600">-₹{refundDetails.cancellation_fee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Refund Amount</span>
                <span className="text-green-600">₹{refundDetails.refund_amount}</span>
              </div>
              <div className="text-xs text-gray-500 border-t pt-3">
                <p className="mb-1">Policy Applied: {refundDetails.policy_applied}</p>
                <p>Refund will be credited in {refundDetails.refund_processing_days}</p>
              </div>
            </div>
            
            <Button onClick={onClose} className="w-full mt-6 bg-green-600 hover:bg-green-700">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const bookingDateTime = new Date(`${booking.date}T${booking.time_slot || '00:00'}`);
  const now = new Date();
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

  // Estimate refund percentage
  let estimatedRefund = 0;
  if (booking.booking_type === 'temple_visit') {
    estimatedRefund = hoursUntilBooking >= 24 ? 100 : hoursUntilBooking >= 1 ? 50 : 0;
  } else if (booking.booking_type === 'pooja') {
    estimatedRefund = hoursUntilBooking >= 48 ? 100 : hoursUntilBooking >= 24 ? 75 : hoursUntilBooking >= 1 ? 50 : 0;
  } else {
    estimatedRefund = hoursUntilBooking >= 24 ? 100 : 50;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Refund Information</p>
                <p>Based on our cancellation policy, you'll receive approximately <span className="font-bold">{estimatedRefund}%</span> refund ({`₹${Math.round((booking.total_amount || 0) * estimatedRefund / 100)}`})</p>
                {hoursUntilBooking < 24 && (
                  <p className="mt-2 text-xs">⚠️ Cancelling within 24 hours incurs higher fees</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="font-semibold">Reason for Cancellation</Label>
            <Textarea
              placeholder="Please tell us why you're cancelling..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="font-semibold mb-2">Booking Details:</p>
            <div className="space-y-1 text-gray-600">
              <p>Date: {booking.date}</p>
              <p>Time: {booking.time_slot}</p>
              <p>Amount: ₹{booking.total_amount}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={cancellationMutation.isPending}
            >
              Keep Booking
            </Button>
            <Button 
              onClick={handleCancel}
              disabled={cancellationMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {cancellationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}