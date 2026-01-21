import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Weekly Provider Payout System
// Runs every Monday to pay all providers for completed services

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins or automated system can trigger payouts
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get date range for last week
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7);
    lastMonday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    const lastMondayStr = lastMonday.toISOString().split('T')[0];
    const lastSundayStr = lastSunday.toISOString().split('T')[0];

    // Get all completed bookings from last week
    const completedBookings = await base44.asServiceRole.entities.Booking.filter({
      status: 'completed',
      payment_status: 'completed'
    });

    // Filter bookings by date range
    const lastWeekBookings = completedBookings.filter(b => {
      const bookingDate = new Date(b.updated_date); // Use updated_date as completion date
      return bookingDate >= lastMonday && bookingDate <= lastSunday;
    });

    // Group bookings by provider
    const providerEarnings = {};

    for (const booking of lastWeekBookings) {
      if (!booking.provider_id) continue;

      const providerId = booking.provider_id;
      const bookingAmount = booking.total_amount || 0;

      // Calculate platform commission (15% default)
      const platformCommission = bookingAmount * 0.15;
      const providerEarning = bookingAmount - platformCommission;

      if (!providerEarnings[providerId]) {
        providerEarnings[providerId] = {
          provider_id: providerId,
          total_bookings: 0,
          total_revenue: 0,
          platform_commission: 0,
          net_payout: 0,
          bookings: []
        };
      }

      providerEarnings[providerId].total_bookings += 1;
      providerEarnings[providerId].total_revenue += bookingAmount;
      providerEarnings[providerId].platform_commission += platformCommission;
      providerEarnings[providerId].net_payout += providerEarning;
      providerEarnings[providerId].bookings.push({
        booking_id: booking.id,
        amount: bookingAmount,
        date: booking.date,
        type: booking.booking_type
      });
    }

    // Get provider details and prepare payout list
    const payoutList = [];

    for (const [providerId, earnings] of Object.entries(providerEarnings)) {
      const provider = await base44.asServiceRole.entities.ProviderProfile.filter({ id: providerId });
      
      if (provider.length === 0) continue;

      const providerData = provider[0];

      payoutList.push({
        provider_id: providerId,
        provider_name: providerData.display_name,
        provider_email: providerData.email,
        provider_mobile: providerData.mobile,
        provider_type: providerData.provider_type,
        week_start: lastMondayStr,
        week_end: lastSundayStr,
        ...earnings,
        payout_status: 'pending',
        payout_date: today.toISOString()
      });

      // Log payout in audit log
      await base44.asServiceRole.entities.AuditLog.create({
        user_id: providerId,
        user_email: providerData.email,
        action: 'provider_payout',
        entity_type: 'ProviderProfile',
        entity_id: providerId,
        details: {
          week: `${lastMondayStr} to ${lastSundayStr}`,
          total_bookings: earnings.total_bookings,
          total_revenue: earnings.total_revenue,
          platform_commission: earnings.platform_commission,
          net_payout: earnings.net_payout
        }
      });
    }

    // TODO: Integrate with bank transfer API (UPI/NEFT/IMPS)
    // For now, returning the payout list for manual processing

    return Response.json({
      success: true,
      message: 'Weekly payout calculated successfully',
      week: `${lastMondayStr} to ${lastSundayStr}`,
      total_providers: payoutList.length,
      total_payout_amount: payoutList.reduce((sum, p) => sum + p.net_payout, 0),
      total_platform_commission: payoutList.reduce((sum, p) => sum + p.platform_commission, 0),
      payout_list: payoutList
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});