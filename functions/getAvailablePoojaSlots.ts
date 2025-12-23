import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { poojaId, templeId, serviceMode, selectedDate } = await req.json();

    if (!selectedDate || !serviceMode) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get day of week from selectedDate
    const date = new Date(selectedDate);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Step 1: Find PriestPoojaMapping entries
    let priestPoojaFilters = { is_active: true, is_deleted: false };
    if (poojaId) {
      priestPoojaFilters.pooja_id = poojaId;
    }

    const priestPoojaList = await base44.asServiceRole.entities.PriestPoojaMapping.filter(priestPoojaFilters);

    // Filter by available_days matching selectedDate
    const availableOnDay = priestPoojaList.filter(mapping => 
      mapping.available_days && mapping.available_days.includes(dayOfWeek)
    );

    if (availableOnDay.length === 0) {
      return Response.json({ availableSlots: [] });
    }

    // Step 2: Get priest profiles
    const priestIds = [...new Set(availableOnDay.map(m => m.priest_id))];
    const priests = await base44.asServiceRole.entities.ProviderProfile.filter({
      id: { $in: priestIds },
      provider_type: 'priest',
      profile_status: 'approved',
      is_deleted: false
    });

    // Step 3: Filter by service mode and temple association
    let eligiblePriests = [];

    if (serviceMode === 'temple' || serviceMode === 'in_person') {
      // For onsite: must be associated with the temple and available offline
      if (!templeId) {
        return Response.json({ error: 'Temple ID required for onsite bookings' }, { status: 400 });
      }

      const temple = await base44.asServiceRole.entities.Temple.filter({ id: templeId });
      if (!temple || temple.length === 0) {
        return Response.json({ error: 'Temple not found' }, { status: 404 });
      }

      eligiblePriests = priests.filter(priest => {
        if (!priest.is_available_offline) return false;
        
        const hasTempleAssociation = priest.associated_temples?.some(
          t => t.temple_id === templeId
        );
        return hasTempleAssociation;
      });
    } else if (serviceMode === 'virtual') {
      // For online: any priest available online
      eligiblePriests = priests.filter(priest => priest.is_available_online);
    }

    if (eligiblePriests.length === 0) {
      return Response.json({ availableSlots: [] });
    }

    // Step 4: Check for existing bookings on selectedDate
    const existingBookings = await base44.asServiceRole.entities.Booking.filter({
      date: selectedDate,
      provider_id: { $in: eligiblePriests.map(p => p.id) },
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      is_deleted: false
    });

    // Step 5: Build available slots
    const availableSlots = [];
    const slotMap = new Map();

    for (const mapping of availableOnDay) {
      const priest = eligiblePriests.find(p => p.id === mapping.priest_id);
      if (!priest) continue;

      const timeSlots = mapping.available_time_slots || [];

      for (const timeSlot of timeSlots) {
        // Check if this priest is already booked for this time slot
        const isBooked = existingBookings.some(
          b => b.provider_id === priest.id && b.time_slot === timeSlot
        );

        if (!isBooked) {
          if (!slotMap.has(timeSlot)) {
            slotMap.set(timeSlot, []);
          }
          slotMap.get(timeSlot).push({
            priestId: priest.id,
            priestName: priest.display_name,
            priestAvatar: priest.avatar_url,
            yearsExperience: mapping.years_experience || priest.years_of_experience,
            screenTimeScore: priest.screen_time_score || 0,
            price: serviceMode === 'virtual' 
              ? mapping.price_override_virtual 
              : serviceMode === 'in_person'
              ? mapping.price_override_in_person
              : mapping.price_override_temple,
            rating: priest.rating_average
          });
        }
      }
    }

    // Sort priests within each slot by screen_time_score (for online) or experience
    for (const [timeSlot, priestsList] of slotMap.entries()) {
      priestsList.sort((a, b) => {
        if (serviceMode === 'virtual') {
          return b.screenTimeScore - a.screenTimeScore;
        }
        return b.yearsExperience - a.yearsExperience;
      });

      availableSlots.push({
        timeSlot,
        priests: priestsList
      });
    }

    // Sort slots by time
    availableSlots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    return Response.json({ availableSlots });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});