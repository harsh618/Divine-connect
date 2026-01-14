import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Lock a booking slot for a priest
 * Creates a booking record and marks the slot as taken
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      priestId, 
      poojaId,
      templeId,
      selectedDate, 
      timeSlot,
      serviceMode,
      totalAmount,
      sankalpDetails,
      location,
      numDevotees,
      specialRequirements,
      itemsArrangedBy
    } = await req.json();

    if (!priestId || !selectedDate || !timeSlot) {
      return Response.json({ 
        error: 'Missing required fields: priestId, selectedDate, timeSlot' 
      }, { status: 400 });
    }

    // Double-check slot availability before locking
    const existingBooking = await base44.asServiceRole.entities.Booking.filter({
      provider_id: priestId,
      date: selectedDate,
      time_slot: timeSlot,
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      is_deleted: false
    });

    if (existingBooking.length > 0) {
      return Response.json({ 
        success: false,
        error: 'This slot has already been booked. Please select another time.',
        slotTaken: true
      }, { status: 409 });
    }

    // Get priest profile for meeting link generation (if virtual)
    const priestProfiles = await base44.asServiceRole.entities.ProviderProfile.filter({
      id: priestId,
      is_deleted: false
    });

    if (priestProfiles.length === 0) {
      return Response.json({ error: 'Priest not found' }, { status: 404 });
    }

    const priest = priestProfiles[0];

    // Generate meeting link for virtual bookings
    let meetingLink = null;
    if (serviceMode === 'virtual') {
      // Generate a unique meeting room ID
      const roomId = `divine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      meetingLink = `https://meet.divine.com/${roomId}`;
    }

    // Create the booking record (this locks the slot)
    const bookingData = {
      user_id: user.id,
      provider_id: priestId,
      pooja_id: poojaId || null,
      temple_id: templeId || null,
      booking_type: 'pooja',
      service_mode: serviceMode,
      date: selectedDate,
      time_slot: timeSlot,
      status: 'pending', // Will be confirmed by priest
      meeting_link: meetingLink,
      sankalp_details: sankalpDetails || null,
      location: location || null,
      items_arranged_by: itemsArrangedBy || 'user',
      num_devotees: numDevotees || 1,
      special_requirements: specialRequirements || null,
      payment_status: 'pending',
      total_amount: totalAmount || 0,
      is_deleted: false
    };

    const booking = await base44.asServiceRole.entities.Booking.create(bookingData);

    // Update priest's total bookings count
    await base44.asServiceRole.entities.ProviderProfile.update(priestId, {
      total_consultations: (priest.total_consultations || 0) + 1
    });

    // Update pooja total bookings if poojaId provided
    if (poojaId) {
      const poojas = await base44.asServiceRole.entities.Pooja.filter({ id: poojaId });
      if (poojas.length > 0) {
        await base44.asServiceRole.entities.Pooja.update(poojaId, {
          total_bookings: (poojas[0].total_bookings || 0) + 1
        });
      }

      // Update priest-pooja mapping stats
      const mappings = await base44.asServiceRole.entities.PriestPoojaMapping.filter({
        priest_id: priestId,
        pooja_id: poojaId,
        is_deleted: false
      });
      if (mappings.length > 0) {
        await base44.asServiceRole.entities.PriestPoojaMapping.update(mappings[0].id, {
          total_performed: (mappings[0].total_performed || 0) + 1
        });
      }
    }

    return Response.json({
      success: true,
      booking: {
        id: booking.id,
        date: booking.date,
        time_slot: booking.time_slot,
        status: booking.status,
        meeting_link: booking.meeting_link,
        priest: {
          id: priest.id,
          display_name: priest.display_name,
          avatar_url: priest.avatar_url
        }
      },
      message: 'Booking slot locked successfully. Awaiting priest confirmation.'
    });

  } catch (error) {
    console.error('Lock Slot Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});