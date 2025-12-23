import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingData = await req.json();
    const {
      poojaId,
      templeId,
      serviceMode,
      date,
      timeSlot,
      chosenPriestId,
      sankalpDetails,
      location,
      itemsArrangedBy,
      numDevotees,
      specialRequirements
    } = bookingData;

    // Validation
    if (!serviceMode || !date || !timeSlot) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1: Re-verify availability and assign priest
    let assignedPriestId = chosenPriestId;

    if (!assignedPriestId) {
      // Auto-assign: Find available priest for this slot
      const availabilityResponse = await base44.functions.invoke('getAvailablePoojaSlots', {
        poojaId,
        templeId,
        serviceMode,
        selectedDate: date
      });

      const availableSlots = availabilityResponse.data?.availableSlots || [];
      const matchingSlot = availableSlots.find(slot => slot.timeSlot === timeSlot);

      if (!matchingSlot || matchingSlot.priests.length === 0) {
        return Response.json({ error: 'No available priests for this slot' }, { status: 400 });
      }

      // Assign the top-ranked priest
      assignedPriestId = matchingSlot.priests[0].priestId;
    }

    // Step 2: Double-check priest isn't already booked for this exact slot
    const existingBooking = await base44.asServiceRole.entities.Booking.filter({
      provider_id: assignedPriestId,
      date: date,
      time_slot: timeSlot,
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      is_deleted: false
    });

    if (existingBooking.length > 0) {
      return Response.json({ error: 'This priest is no longer available for this slot' }, { status: 409 });
    }

    // Step 3: Get pooja details and calculate price
    let totalAmount = 0;
    let poojaName = '';

    if (poojaId) {
      const priestMapping = await base44.asServiceRole.entities.PriestPoojaMapping.filter({
        priest_id: assignedPriestId,
        pooja_id: poojaId,
        is_active: true
      });

      const pooja = await base44.asServiceRole.entities.Pooja.filter({ id: poojaId });

      if (pooja && pooja.length > 0) {
        poojaName = pooja[0].name;
        
        // Get price based on service mode
        if (priestMapping.length > 0) {
          totalAmount = serviceMode === 'virtual'
            ? priestMapping[0].price_override_virtual || pooja[0].base_price_virtual
            : serviceMode === 'in_person'
            ? priestMapping[0].price_override_in_person || pooja[0].base_price_in_person
            : priestMapping[0].price_override_temple || pooja[0].base_price_temple;
        } else {
          totalAmount = serviceMode === 'virtual'
            ? pooja[0].base_price_virtual
            : serviceMode === 'in_person'
            ? pooja[0].base_price_in_person
            : pooja[0].base_price_temple;
        }

        // Add items arrangement cost if applicable
        if (itemsArrangedBy === 'priest' && pooja[0].items_arrangement_cost) {
          totalAmount += pooja[0].items_arrangement_cost;
        }
      }
    }

    // Step 4: Create booking
    const booking = await base44.asServiceRole.entities.Booking.create({
      user_id: user.id,
      pooja_id: poojaId,
      temple_id: templeId,
      provider_id: assignedPriestId,
      booking_type: poojaId ? 'pooja' : 'temple_visit',
      service_mode: serviceMode,
      date: date,
      time_slot: timeSlot,
      status: 'confirmed',
      payment_status: 'completed',
      sankalp_details: sankalpDetails,
      location: location,
      items_arranged_by: itemsArrangedBy,
      num_devotees: numDevotees || 1,
      special_requirements: specialRequirements,
      total_amount: totalAmount
    });

    // Step 5: Update priest's screen time score (increment for engagement)
    const priest = await base44.asServiceRole.entities.ProviderProfile.filter({ id: assignedPriestId });
    if (priest && priest.length > 0) {
      await base44.asServiceRole.entities.ProviderProfile.update(assignedPriestId, {
        screen_time_score: (priest[0].screen_time_score || 0) + 1,
        total_consultations: (priest[0].total_consultations || 0) + 1
      });
    }

    return Response.json({ 
      success: true, 
      booking,
      message: `Booking confirmed with ${priest[0]?.display_name || 'priest'}`
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});