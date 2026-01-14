import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Send booking notifications to priests
 * - Immediate notification on new booking
 * - 24-hour reminder before scheduled time
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function can be called:
    // 1. Directly after booking creation (notificationType: 'new_booking')
    // 2. By scheduled task for reminders (notificationType: 'reminder_24h')
    
    const { notificationType, bookingId } = await req.json();

    if (notificationType === 'new_booking' && bookingId) {
      // Send immediate notification for new booking
      const bookings = await base44.asServiceRole.entities.Booking.filter({ 
        id: bookingId,
        is_deleted: false 
      });
      
      if (bookings.length === 0) {
        return Response.json({ error: 'Booking not found' }, { status: 404 });
      }

      const booking = bookings[0];

      // Get priest details
      const priests = await base44.asServiceRole.entities.ProviderProfile.filter({
        id: booking.provider_id,
        is_deleted: false
      });

      if (priests.length === 0) {
        return Response.json({ error: 'Priest not found' }, { status: 404 });
      }

      const priest = priests[0];

      // Get priest's user record for email
      const users = await base44.asServiceRole.entities.User.filter({
        id: priest.user_id
      });

      if (users.length === 0 || !users[0].email) {
        return Response.json({ error: 'Priest email not found' }, { status: 404 });
      }

      const priestEmail = users[0].email;

      // Get pooja details if available
      let poojaName = 'Pooja Service';
      if (booking.pooja_id) {
        const poojas = await base44.asServiceRole.entities.Pooja.filter({
          id: booking.pooja_id
        });
        if (poojas.length > 0) {
          poojaName = poojas[0].name;
        }
      }

      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: priestEmail,
        subject: `🕉️ New Booking Request - ${poojaName}`,
        body: `
Namaste ${priest.display_name},

You have received a new booking request!

📅 Date: ${booking.date}
⏰ Time: ${booking.time_slot}
🙏 Service: ${poojaName}
📍 Mode: ${booking.service_mode === 'virtual' ? 'Online/Virtual' : booking.service_mode === 'in_person' ? 'At Devotee Location' : 'At Temple'}

${booking.location ? `Location: ${booking.location}` : ''}
${booking.num_devotees ? `Number of Devotees: ${booking.num_devotees}` : ''}
${booking.special_requirements ? `Special Requirements: ${booking.special_requirements}` : ''}

Please log in to your Divine dashboard to confirm or manage this booking.

Amount: ₹${booking.total_amount || 'TBD'}

Om Namah Shivaya 🙏
Divine Connect Platform
        `.trim()
      });

      return Response.json({ 
        success: true, 
        message: 'New booking notification sent to priest',
        sentTo: priestEmail
      });

    } else if (notificationType === 'reminder_24h') {
      // Find all bookings scheduled for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];

      const upcomingBookings = await base44.asServiceRole.entities.Booking.filter({
        date: tomorrowDate,
        status: 'confirmed',
        is_deleted: false
      });

      if (upcomingBookings.length === 0) {
        return Response.json({ 
          success: true, 
          message: 'No bookings for tomorrow',
          notificationsSent: 0
        });
      }

      let sentCount = 0;
      const errors = [];

      for (const booking of upcomingBookings) {
        try {
          // Get priest
          const priests = await base44.asServiceRole.entities.ProviderProfile.filter({
            id: booking.provider_id,
            is_deleted: false
          });

          if (priests.length === 0) continue;
          const priest = priests[0];

          // Get priest's email
          const users = await base44.asServiceRole.entities.User.filter({
            id: priest.user_id
          });

          if (users.length === 0 || !users[0].email) continue;
          const priestEmail = users[0].email;

          // Get pooja name
          let poojaName = 'Pooja Service';
          if (booking.pooja_id) {
            const poojas = await base44.asServiceRole.entities.Pooja.filter({
              id: booking.pooja_id
            });
            if (poojas.length > 0) {
              poojaName = poojas[0].name;
            }
          }

          // Send reminder email
          await base44.integrations.Core.SendEmail({
            to: priestEmail,
            subject: `⏰ Reminder: ${poojaName} Tomorrow at ${booking.time_slot}`,
            body: `
Namaste ${priest.display_name},

This is a reminder for your upcoming booking tomorrow.

📅 Date: ${booking.date}
⏰ Time: ${booking.time_slot}
🙏 Service: ${poojaName}
📍 Mode: ${booking.service_mode === 'virtual' ? 'Online/Virtual' : booking.service_mode === 'in_person' ? 'At Devotee Location' : 'At Temple'}

${booking.meeting_link ? `Meeting Link: ${booking.meeting_link}` : ''}
${booking.location ? `Location: ${booking.location}` : ''}

Please ensure you are prepared and available for this service.

Amount: ₹${booking.total_amount || 'TBD'}

Om Namah Shivaya 🙏
Divine Connect Platform
            `.trim()
          });

          sentCount++;
        } catch (err) {
          errors.push({ bookingId: booking.id, error: err.message });
        }
      }

      return Response.json({ 
        success: true, 
        message: `24-hour reminders sent`,
        notificationsSent: sentCount,
        totalBookings: upcomingBookings.length,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    return Response.json({ 
      error: 'Invalid notificationType. Use "new_booking" or "reminder_24h"' 
    }, { status: 400 });

  } catch (error) {
    console.error('Notification Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});