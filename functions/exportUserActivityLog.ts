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

    // Get ALL activities for this user
    const activities = await base44.asServiceRole.entities.UserActivity.filter(
      { user_id: userId },
      '-created_date'
    );

    // Create CSV
    const headers = [
      'Timestamp',
      'Event Type',
      'Page Name',
      'Entity Type',
      'Entity Name',
      'Duration (seconds)',
      'Device Type',
      'Session ID',
      'Metadata'
    ];

    const rows = activities.map(activity => [
      new Date(activity.created_date).toLocaleString(),
      activity.event_type || '',
      activity.page_name || '',
      activity.entity_type || '',
      activity.entity_name || '',
      activity.duration_seconds || '',
      activity.device_type || '',
      activity.session_id || '',
      JSON.stringify(activity.metadata || {})
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="user_${userId}_activity_log_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});