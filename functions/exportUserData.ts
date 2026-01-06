import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, exportType } = await req.json();

    if (exportType === 'all_users') {
      // Export all users summary
      const users = await base44.asServiceRole.entities.User.list();
      const activities = await base44.asServiceRole.entities.UserActivity.list();
      const bookings = await base44.asServiceRole.entities.Booking.filter({ is_deleted: false });
      const donations = await base44.asServiceRole.entities.Donation.list();

      // Build summary per user
      const userSummaries = users.map(u => {
        const userActivities = activities.filter(a => a.user_id === u.id);
        const userBookings = bookings.filter(b => b.user_id === u.id);
        const userDonations = donations.filter(d => d.user_id === u.id);
        
        const totalSpent = [
          ...userBookings.map(b => b.total_amount || 0),
          ...userDonations.map(d => d.amount || 0)
        ].reduce((sum, val) => sum + val, 0);

        const totalTime = userActivities
          .filter(a => a.duration_seconds)
          .reduce((sum, a) => sum + a.duration_seconds, 0);

        return {
          email: u.email,
          name: u.full_name,
          role: u.role,
          joined: u.created_date,
          total_page_views: userActivities.filter(a => a.event_type === 'page_view').length,
          total_time_minutes: Math.floor(totalTime / 60),
          total_bookings: userBookings.length,
          total_donations: userDonations.length,
          total_spent: totalSpent
        };
      });

      // Convert to CSV
      const headers = ['Email', 'Name', 'Role', 'Joined Date', 'Page Views', 'Time (min)', 'Bookings', 'Donations', 'Total Spent (₹)'];
      const rows = userSummaries.map(s => [
        s.email,
        s.name,
        s.role,
        s.joined,
        s.total_page_views,
        s.total_time_minutes,
        s.total_bookings,
        s.total_donations,
        s.total_spent
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="all_users_analytics_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (!userId) {
      return Response.json({ error: 'User ID required for single user export' }, { status: 400 });
    }

    // Export single user detailed data
    const activities = await base44.asServiceRole.entities.UserActivity.filter(
      { user_id: userId },
      '-created_date'
    );
    const bookings = await base44.asServiceRole.entities.Booking.filter(
      { user_id: userId, is_deleted: false },
      '-created_date'
    );
    const donations = await base44.asServiceRole.entities.Donation.filter(
      { user_id: userId },
      '-created_date'
    );

    // Activities CSV
    const activityHeaders = ['Date', 'Event Type', 'Page', 'Entity Type', 'Entity Name', 'Duration (sec)', 'Device'];
    const activityRows = activities.map(a => [
      a.created_date,
      a.event_type,
      a.page_name,
      a.entity_type || '',
      a.entity_name || '',
      a.duration_seconds || 0,
      a.device_type || ''
    ]);

    const activityCsv = [
      activityHeaders.join(','),
      ...activityRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Bookings CSV
    const bookingHeaders = ['Date', 'Type', 'Status', 'Amount', 'Payment Status'];
    const bookingRows = bookings.map(b => [
      b.date,
      b.booking_type,
      b.status,
      b.total_amount || 0,
      b.payment_status
    ]);

    const bookingCsv = [
      bookingHeaders.join(','),
      ...bookingRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Donations CSV
    const donationHeaders = ['Date', 'Amount', 'Campaign', 'Is Anonymous'];
    const donationRows = donations.map(d => [
      d.created_date,
      d.amount,
      d.campaign_id || 'Direct',
      d.is_anonymous ? 'Yes' : 'No'
    ]);

    const donationCsv = [
      donationHeaders.join(','),
      ...donationRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Combined export
    const combinedCsv = [
      '=== USER ACTIVITIES ===',
      activityCsv,
      '',
      '=== BOOKINGS ===',
      bookingCsv,
      '',
      '=== DONATIONS ===',
      donationCsv
    ].join('\n');

    return new Response(combinedCsv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="user_${userId}_data_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});