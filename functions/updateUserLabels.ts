import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, updateAll } = await req.json();

    const analyzeUserBehavior = async (targetUserId) => {
      // Get user activities
      const activities = await base44.asServiceRole.entities.UserActivity.filter(
        { user_id: targetUserId },
        '-created_date'
      );

      // Get bookings and donations
      const bookings = await base44.asServiceRole.entities.Booking.filter(
        { user_id: targetUserId, is_deleted: false }
      );
      const donations = await base44.asServiceRole.entities.Donation.filter(
        { user_id: targetUserId }
      );

      const labels = [];

      // Calculate metrics
      const pageViews = activities.filter(a => a.event_type === 'page_view').length;
      const totalTimeSpent = activities
        .filter(a => a.duration_seconds)
        .reduce((sum, a) => sum + a.duration_seconds, 0);
      const avgSessionTime = pageViews > 0 ? totalTimeSpent / pageViews : 0;
      const totalTransactions = bookings.length + donations.length;
      const totalSpent = [
        ...bookings.map(b => b.total_amount || 0),
        ...donations.map(d => d.amount || 0)
      ].reduce((sum, val) => sum + val, 0);

      // Get user creation date
      const users = await base44.asServiceRole.entities.User.filter({ id: targetUserId });
      const targetUser = users[0];
      const accountAge = Date.now() - new Date(targetUser.created_date).getTime();
      const daysOld = accountAge / (1000 * 60 * 60 * 24);

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivities = activities.filter(
        a => new Date(a.created_date) > sevenDaysAgo
      );

      // Label Assignment Logic

      // 1. New Visitor
      if (daysOld < 7) {
        labels.push('new_visitor');
        
        // High intent new visitor
        if (pageViews > 10 || totalTimeSpent > 600 || totalTransactions > 0) {
          labels.push('high_intent_new');
        }
      }

      // 2. Repeat Customer
      if (totalTransactions >= 3) {
        labels.push('repeat_customer');
      }

      // 3. High Value Customer
      if (totalSpent > 5000) {
        labels.push('high_value');
      } else if (totalSpent > 1000) {
        labels.push('medium_value');
      }

      // 4. Browser (lots of views, no transactions)
      if (pageViews > 20 && totalTransactions === 0) {
        labels.push('browser');
      }

      // 5. Engaged User
      if (recentActivities.length > 15) {
        labels.push('engaged');
      }

      // 6. Inactive User
      if (recentActivities.length === 0 && daysOld > 30) {
        labels.push('inactive');
      }

      // 7. Power User
      if (pageViews > 100 || totalTransactions > 10) {
        labels.push('power_user');
      }

      // 8. Quick Converter (made transaction within first 3 days)
      if (totalTransactions > 0 && daysOld < 3) {
        labels.push('quick_converter');
      }

      // 9. Window Shopper (high page views, low session time)
      if (pageViews > 30 && avgSessionTime < 30) {
        labels.push('window_shopper');
      }

      // 10. Deep Researcher (long session times)
      if (avgSessionTime > 180) {
        labels.push('deep_researcher');
      }

      // 11. At Risk (had transactions but now inactive)
      if (totalTransactions > 0 && recentActivities.length === 0 && daysOld > 14) {
        labels.push('at_risk');
      }

      // 12. Mobile User
      const mobileActivities = activities.filter(a => a.device_type === 'mobile');
      if (mobileActivities.length / activities.length > 0.7) {
        labels.push('mobile_user');
      }

      // 13. Donation Focused
      if (donations.length > bookings.length && donations.length > 0) {
        labels.push('donation_focused');
      }

      // 14. Service Seeker
      if (bookings.length > donations.length && bookings.length > 0) {
        labels.push('service_seeker');
      }

      // Update user labels
      await base44.asServiceRole.entities.User.update(targetUserId, {
        user_labels: labels.length > 0 ? labels : ['visitor'],
        last_label_update: new Date().toISOString()
      });

      return { userId: targetUserId, labels };
    };

    if (updateAll) {
      // Update all users
      const allUsers = await base44.asServiceRole.entities.User.list();
      const results = [];

      for (const u of allUsers) {
        try {
          const result = await analyzeUserBehavior(u.id);
          results.push(result);
        } catch (error) {
          results.push({ userId: u.id, error: error.message });
        }
      }

      return Response.json({
        success: true,
        message: `Updated labels for ${results.length} users`,
        results
      });
    } else if (userId) {
      // Update single user
      const result = await analyzeUserBehavior(userId);
      return Response.json({
        success: true,
        message: 'User labels updated',
        ...result
      });
    } else {
      return Response.json({ error: 'userId or updateAll required' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});