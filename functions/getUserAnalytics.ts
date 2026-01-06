import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user details
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    const targetUser = users[0];

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all activities
    const activities = await base44.asServiceRole.entities.UserActivity.filter(
      { user_id: userId },
      '-created_date'
    );

    // Get bookings
    const bookings = await base44.asServiceRole.entities.Booking.filter(
      { user_id: userId, is_deleted: false },
      '-created_date'
    );

    // Get donations
    const donations = await base44.asServiceRole.entities.Donation.filter(
      { user_id: userId },
      '-created_date'
    );

    // Calculate analytics
    const pageViews = activities.filter(a => a.event_type === 'page_view');
    const totalTimeSpent = pageViews.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
    
    const pageVisits = {};
    pageViews.forEach(a => {
      pageVisits[a.page_name] = (pageVisits[a.page_name] || 0) + 1;
    });

    const entityInteractions = {};
    activities.forEach(a => {
      if (a.entity_type && a.entity_name) {
        const key = `${a.entity_type}_${a.entity_id}`;
        if (!entityInteractions[key]) {
          entityInteractions[key] = {
            type: a.entity_type,
            name: a.entity_name,
            count: 0
          };
        }
        entityInteractions[key].count++;
      }
    });

    const totalSpent = [
      ...bookings.map(b => b.total_amount || 0),
      ...donations.map(d => d.amount || 0)
    ].reduce((sum, val) => sum + val, 0);

    const deviceBreakdown = {};
    activities.forEach(a => {
      if (a.device_type) {
        deviceBreakdown[a.device_type] = (deviceBreakdown[a.device_type] || 0) + 1;
      }
    });

    return Response.json({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name,
        role: targetUser.role,
        created_date: targetUser.created_date
      },
      analytics: {
        totalPageViews: pageViews.length,
        totalTimeSpent: totalTimeSpent,
        averageSessionTime: pageViews.length > 0 ? Math.floor(totalTimeSpent / pageViews.length) : 0,
        pageVisits,
        mostVisitedPages: Object.entries(pageVisits)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([page, count]) => ({ page, count })),
        entityInteractions: Object.values(entityInteractions)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        deviceBreakdown,
        totalBookings: bookings.length,
        totalDonations: donations.length,
        totalSpent,
        recentActivities: activities.slice(0, 50)
      },
      bookings,
      donations
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});