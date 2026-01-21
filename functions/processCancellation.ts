import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Cancellation & Refund Logic
// Different rules for temple visits, poojas, and hotel bookings

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, cancellation_reason } = await req.json();

    // Get booking details
    const bookings = await base44.entities.Booking.filter({ id: booking_id });
    if (bookings.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[0];

    // Verify user owns this booking
    if (booking.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return Response.json({ error: 'Booking already cancelled' }, { status: 400 });
    }

    // Calculate hours until booking
    const bookingDateTime = new Date(`${booking.date}T${booking.time_slot || '00:00'}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    // Calculate refund based on booking type and timing
    let refundPercentage = 0;
    let refundAmount = 0;
    let cancellationFee = 0;
    let policyApplied = '';

    const bookingAmount = booking.total_amount || 0;

    // Apply cancellation policy based on booking type
    if (booking.booking_type === 'temple_visit') {
      // Temple Visit Policy
      if (hoursUntilBooking >= 24) {
        refundPercentage = 100;
        policyApplied = 'Full refund (24+ hours notice)';
      } else if (hoursUntilBooking >= 1) {
        refundPercentage = 50;
        policyApplied = '50% refund (within 24 hours)';
      } else {
        refundPercentage = 0;
        policyApplied = 'No refund (no show or <1 hour notice)';
      }
    } else if (booking.booking_type === 'pooja') {
      // Pooja Service Policy
      if (hoursUntilBooking >= 48) {
        refundPercentage = 100;
        policyApplied = 'Full refund (48+ hours notice)';
      } else if (hoursUntilBooking >= 24) {
        refundPercentage = 75;
        policyApplied = '75% refund (24-48 hours notice)';
      } else if (hoursUntilBooking >= 1) {
        refundPercentage = 50;
        policyApplied = '50% refund (within 24 hours)';
      } else {
        refundPercentage = 0;
        policyApplied = 'No refund (no show or <1 hour notice)';
      }

      // Deduct material costs if already purchased
      // Assuming 20% of pooja cost is materials
      if (hoursUntilBooking < 48) {
        const materialCost = bookingAmount * 0.20;
        refundPercentage = refundPercentage * 0.80; // Reduce refund by material cost percentage
        policyApplied += ' (material costs deducted)';
      }
    } else if (booking.booking_type === 'consultation') {
      // Consultation Policy (for astrology)
      if (hoursUntilBooking >= 24) {
        refundPercentage = 100;
        policyApplied = 'Full refund (24+ hours notice)';
      } else if (hoursUntilBooking >= 2) {
        refundPercentage = 50;
        policyApplied = '50% refund (2-24 hours notice)';
      } else {
        refundPercentage = 0;
        policyApplied = 'No refund (<2 hours notice)';
      }
    } else {
      // Default policy
      refundPercentage = 50;
      policyApplied = 'Default 50% refund';
    }

    // Calculate actual refund amount
    refundAmount = (bookingAmount * refundPercentage) / 100;
    cancellationFee = bookingAmount - refundAmount;

    // Update booking status
    await base44.entities.Booking.update(booking_id, {
      status: 'cancelled',
      special_requirements: `${booking.special_requirements || ''}\n\nCancelled on ${new Date().toISOString()}\nReason: ${cancellation_reason}\nRefund: ₹${refundAmount} (${refundPercentage}%)`
    });

    // Log the cancellation for audit
    await base44.asServiceRole.entities.AuditLog.create({
      user_id: user.id,
      user_email: user.email,
      action: 'cancel_booking',
      entity_type: 'Booking',
      entity_id: booking_id,
      details: {
        booking_type: booking.booking_type,
        original_amount: bookingAmount,
        refund_amount: refundAmount,
        refund_percentage: refundPercentage,
        cancellation_fee: cancellationFee,
        hours_until_booking: hoursUntilBooking,
        reason: cancellation_reason,
        policy_applied: policyApplied
      }
    });

    // TODO: Initiate actual refund via payment gateway
    // This would integrate with Razorpay/Stripe refund API

    // Notify provider
    if (booking.provider_id) {
      // TODO: Send notification to priest/hotel about cancellation
    }

    return Response.json({
      success: true,
      message: 'Booking cancelled successfully',
      refund_details: {
        original_amount: bookingAmount,
        refund_amount: refundAmount,
        refund_percentage: refundPercentage,
        cancellation_fee: cancellationFee,
        policy_applied: policyApplied,
        refund_processing_days: '5-7 business days'
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});